import React, { useState, useEffect } from 'react';
import { Box, Container, Typography, FormControl, Select, MenuItem, Paper, Button, InputBase, IconButton } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import RemoveIcon from '@mui/icons-material/Remove';
import CloseIcon from '@mui/icons-material/Close';
import { Html5Qrcode } from 'html5-qrcode';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import Popper from '@mui/material/Popper';
import Grow from '@mui/material/Grow';
import { ClickAwayListener } from '@mui/base/ClickAwayListener';
import MenuList from '@mui/material/MenuList';
import BillPreviewDialog from './BillPreviewDialog';

// Accept props: scannedItems, addItemToBill, increaseItemQuantity, decreaseItemQuantity, clearScannedItems
function NewBill({ scannedItems, addItemToBill, increaseItemQuantity, decreaseItemQuantity, clearScannedItems }) {
  const navigate = useNavigate();
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [totalAmount, setTotalAmount] = useState(0);
  const currentDate = new Date().toLocaleDateString();
  const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  // Log scannedItems prop when component renders
  console.log('NewBill.js - scannedItems prop:', scannedItems, 'length:', scannedItems.length);

  // State for search functionality
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [openSuggestions, setOpenSuggestions] = useState(false);
  const searchAnchorRef = React.useRef(null);

  const [billPreviewOpen, setBillPreviewOpen] = useState(false);
  const [createdBill, setCreatedBill] = useState(null);
  
  const [isScanning, setIsScanning] = useState(true);
  const [lastScan, setLastScan] = useState({ text: '', time: 0 });

  const handleScanRef = React.useRef();

  handleScanRef.current = async (scannedText) => {
    const now = Date.now();
    if (scannedText && (scannedText !== lastScan.text || now - lastScan.time > 2000)) {
      setLastScan({ text: scannedText, time: now });
      await handleBarcodeScan(scannedText);
    }
  };

  useEffect(() => {
    let html5QrCode;
    if (isScanning) {
      html5QrCode = new Html5Qrcode("scanner-container");
      html5QrCode.start(
        { facingMode: "environment" },
        { fps: 15 },
        (decodedText) => {
          if (handleScanRef.current) {
            handleScanRef.current(decodedText);
          }
        },
        () => {} // ignores parsing errors
      ).catch(err => console.log("Scanner start failed:", err));
    }
    return () => {
      if (html5QrCode && html5QrCode.isScanning) {
        html5QrCode.stop().then(() => html5QrCode.clear()).catch(console.error);
      }
    };
  }, [isScanning]);

  const handlePaymentMethodChange = (event) => {
    setPaymentMethod(event.target.value);
  };

  const handleTestScan = async () => {
    const testBarcode = '1234567890';
    console.log('Test scan:', testBarcode);
    await handleBarcodeScan(testBarcode);
  };

  const handleBarcodeScan = async (barcode) => {
    try {
      const response = await axiosClient.get('/api/products/barcode/' + barcode);
      const product = response.data;

      if (product) {
        // Use the prop function to add item (will default quantity to 1)
        addItemToBill(product);
      } else {
        navigate(`/stock/add?barcode=${barcode}`, { state: { fromNewBill: true } });
      }
    } catch (error) {
      console.error('Error checking product:', error);
      if (error.response && error.response.status === 404) {
         navigate(`/stock/add?barcode=${barcode}`, { state: { fromNewBill: true } });
      } else {
        alert('Error scanning product. Please try again.');
      }
    }
  };

  // Recalculate total whenever scannedItems changes
  useEffect(() => {
    const total = scannedItems.reduce((sum, item) => {
      // Use cost if available, otherwise use price
      const itemPrice = item.cost != null ? item.cost : (item.price != null ? item.price : 0);
      return sum + (itemPrice * (item.quantity || 0));
    }, 0);
    setTotalAmount(total);
  }, [scannedItems]);

  // Handle search input change and fetch suggestions
  useEffect(() => {
    console.log('useEffect triggered for searchTerm:', searchTerm);
    const delayDebounceFn = setTimeout(async () => {
      if (searchTerm.length > 1) {
        console.log('Fetching suggestions for:', searchTerm);
        try {
          const response = await axiosClient.get('/api/products/search?q=' + encodeURIComponent(searchTerm));
          console.log('Search suggestions response:', response.data);
          setSuggestions(response.data);
          setOpenSuggestions(true);
        } catch (error) {
          console.error('Error fetching search suggestions:', error);
          setSuggestions([]);
          setOpenSuggestions(false);
        }
      } else {
        console.log('Search term too short or cleared, clearing suggestions.');
        setSuggestions([]);
        setOpenSuggestions(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  const handleSearchInputChange = (event) => {
    setSearchTerm(event.target.value);
    console.log('Search term changed to:', event.target.value);
  };

  const handleSuggestionClick = (product) => {
    // Use the prop function to add to scanned items (will default quantity to 1)
    addItemToBill(product);
    setSearchTerm('');
    setSuggestions([]);
    setOpenSuggestions(false);
  };

  const handleCloseSuggestions = (event) => {
    if (searchAnchorRef.current && searchAnchorRef.current.contains(event.target)) {
      return;
    }
    setOpenSuggestions(false);
  };

  const handleCreateBill = async () => {
    try {
      // Update stock quantities only for items that exist in the database
      for (const item of scannedItems) {
        // Check if the item._id is a valid MongoDB ObjectId
        if (item._id && /^[0-9a-fA-F]{24}$/.test(item._id)) {
          try {
            const currentProduct = await axiosClient.get('/api/products/' + item._id);
            const updatedQuantity = currentProduct.data.quantity - item.quantity;

            await axiosClient.patch('/api/products/' + item._id, {
              quantity: updatedQuantity
            });
          } catch (error) {
            console.error(`Error updating stock for product ${item._id}:`, error);
            // Continue with bill creation even if stock update fails
          }
        } else {
          console.log(`Skipping stock update for temporary item with ID: ${item._id}`);
        }
      }

      // Create bill record
      const billData = {
        items: scannedItems.map(item => ({
            product: item._id,
            name: item.name,
            barcode: item.barcode || '',
            quantity: item.quantity,
            price: item.cost != null ? item.cost : (item.price || 0)
        })),
        totalAmount,
        paymentMethod,
        date: new Date()
      };

      const response = await axiosClient.post('/api/bills', billData);
      
      // Store the created bill and show preview
      setCreatedBill(response.data);
      setBillPreviewOpen(true);

      // Clear scanned items using the prop function
      clearScannedItems();
    } catch (error) {
      console.error('Error creating bill:', error);
      alert('Error creating bill. Please try again.');
    }
  };

  const handleCloseBillPreview = () => {
    setBillPreviewOpen(false);
    setCreatedBill(null);
  };

  return (
    <Container maxWidth="sm" sx={{ mt: -1, mb: 0, position: 'relative', px: { xs: 1.5, sm: 2 }, pb: 24 }}>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        <Paper
          elevation={0}
          sx={{
            p: 1.2,
            borderRadius: 2.5,
            border: '1px solid #ececec',
            boxShadow: '0 5px 20px rgba(0,0,0,0.06)',
            bgcolor: '#ffffff',
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 1 }}>
            <Box sx={{ flexGrow: 1, mr: 0.5 }}>
              <FormControl fullWidth size="small">
                <Select
                  value={paymentMethod}
                  onChange={handlePaymentMethodChange}
                  displayEmpty
                  inputProps={{ 'aria-label': 'Payment method' }}
                  sx={{
                    borderRadius: 1.5,
                    '& .MuiSelect-select': { py: 1.05 },
                  }}
                >
                  <MenuItem value="Cash">Cash</MenuItem>
                  <MenuItem value="UPI">UPI</MenuItem>
                  <MenuItem value="Cash+UPI">Cash + UPI</MenuItem>
                </Select>
              </FormControl>
            </Box>

            <Box
              sx={{
                minWidth: 132,
                textAlign: 'center',
                backgroundColor: '#005745',
                color: 'white',
                px: 1.2,
                py: 0.8,
                borderRadius: 1.8,
                boxShadow: '0 6px 16px rgba(0,87,69,0.24)',
              }}
            >
              <Typography variant="caption" sx={{ opacity: 0.9, lineHeight: 1 }}>
                Total (₹)
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.1 }}>
                ₹{totalAmount.toFixed(2)}
              </Typography>
            </Box>
          </Box>
        </Paper>

        <Box
          sx={{
            textAlign: 'center',
            backgroundColor: '#ffeb3b',
            border: '2px solid #000000',
            borderRadius: 2,
            py: 1,
            px: 1.5,
          }}
        >
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            Date: {currentDate} {currentTime}
          </Typography>
        </Box>

        <Paper
          elevation={0}
          sx={{
            p: 1.2,
            borderRadius: 2.5,
            border: '1px solid #ececec',
            boxShadow: '0 5px 20px rgba(0,0,0,0.06)',
          }}
        >
          {isScanning ? (
            <Box sx={{ position: 'relative', width: '100%', height: 160, bgcolor: '#000', borderRadius: 1.8, overflow: 'hidden' }}>
              <div
                id="scanner-container"
                style={{ width: '100%', height: '100%', overflow: 'hidden' }}
              />
              <IconButton
                size="small"
                onClick={() => setIsScanning(false)}
                sx={{ position: 'absolute', top: 6, right: 6, zIndex: 10, bgcolor: 'rgba(255,255,255,0.7)', '&:hover': { bgcolor: 'rgba(255,255,255,0.9)' } }}
              >
                <CloseIcon fontSize="small" />
              </IconButton>
            </Box>
          ) : (
            <Box
              sx={{
                height: 70,
                bgcolor: '#eeeeee',
                borderRadius: 1.8,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                px: 1.2,
                cursor: 'pointer'
              }}
              onClick={() => setIsScanning(true)}
            >
              <Box sx={{ flex: 1, display: 'flex', justifyContent: 'center', color: '#7b7b7b' }}>
                <CameraAltIcon sx={{ fontSize: 34 }} />
              </Box>
              <Button
                variant="contained"
                size="small"
                onClick={(e) => { e.stopPropagation(); setIsScanning(true); }}
                sx={{
                  borderRadius: 1.4,
                  textTransform: 'uppercase',
                  fontSize: 12,
                  px: 1.5,
                  backgroundColor: '#4caf50',
                  '&:hover': { backgroundColor: '#43a047' },
                }}
              >
                Scan Barcode
              </Button>
            </Box>
          )}
        </Paper>

        <Paper
          elevation={0}
          sx={{
            p: 1.5,
            borderRadius: 2.5,
            border: '1px solid #ececec',
            boxShadow: '0 5px 20px rgba(0,0,0,0.06)',
            minHeight: 180,
          }}
        >
          <Typography variant="h6" sx={{ fontSize: 33, fontWeight: 600, mb: 1 }}>
            Scanned Items:
          </Typography>
          {scannedItems.length > 0 ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, maxHeight: '34vh', overflowY: 'auto', pr: 0.4 }}>
              {scannedItems.map((item) => (
                <Box
                  key={item._id}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.8,
                    width: '100%',
                    borderRadius: 1.5,
                    px: 1,
                    py: 0.7,
                    bgcolor: '#fafafa',
                    border: '1px solid #f0f0f0',
                  }}
                >
                  <Typography
                    variant="body2"
                    sx={{
                      flexGrow: 1,
                      mr: 0.5,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      fontWeight: 500,
                    }}
                  >
                    {item.name}
                  </Typography>

                  <Box sx={{ display: 'flex', alignItems: 'center', flexShrink: 0, width: 88, justifyContent: 'space-between' }}>
                    <IconButton
                      size="small"
                      onClick={() => decreaseItemQuantity(item._id)}
                      disabled={item.quantity === 1}
                      sx={{ p: '3px', border: '1px solid #e2e2e2', bgcolor: '#fff' }}
                    >
                      <RemoveIcon sx={{ fontSize: 17 }} />
                    </IconButton>
                    <Typography variant="body2" sx={{ mx: 0.25, minWidth: 20, textAlign: 'center', fontWeight: 600 }}>
                      {item.quantity}
                    </Typography>
                    <IconButton
                      size="small"
                      onClick={() => increaseItemQuantity(item._id)}
                      sx={{ p: '3px', border: '1px solid #e2e2e2', bgcolor: '#fff' }}
                    >
                      <AddIcon sx={{ fontSize: 17 }} />
                    </IconButton>
                  </Box>

                  <Typography variant="body2" sx={{ flexShrink: 0, fontWeight: 700, width: 86, textAlign: 'right' }}>
                    ₹{((item.cost != null ? item.cost : (item.price != null ? item.price : 0)) * (item.quantity || 0)).toFixed(2)}
                  </Typography>
                </Box>
              ))}
            </Box>
          ) : (
            <Typography variant="body2" sx={{ color: '#5d5d5d' }}>
              No items scanned yet.
            </Typography>
          )}
        </Paper>
      </Box>

      <Box
        sx={{
          position: 'fixed',
          left: '50%',
          transform: 'translateX(-50%)',
          bottom: 86,
          width: '100%',
          maxWidth: '600px',
          zIndex: 1110,
          px: { xs: 1.5, sm: 2 },
        }}
      >
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            p: 1.2,
            borderRadius: 2,
            border: '1px solid #e8e8e8',
            boxShadow: '0 8px 20px rgba(0,0,0,0.10)',
            bgcolor: 'rgba(255,255,255,0.96)',
            backdropFilter: 'blur(8px)',
            gap: 1,
          }}
        >
          <Button
            variant="contained"
            sx={{ flex: 1, borderRadius: 1.4, backgroundColor: '#8d6e63', textTransform: 'uppercase', fontWeight: 600 }}
            onClick={() => navigate('/stock/add', { state: { fromNewBill: true } })}
          >
            Quick Add
          </Button>

          <Button
            variant="contained"
            endIcon={<ArrowForwardIcon />}
            sx={{ flex: 1, borderRadius: 1.4, backgroundColor: '#4caf50', textTransform: 'uppercase', fontWeight: 600 }}
            onClick={handleCreateBill}
            disabled={scannedItems.length === 0}
          >
            Create Bill
          </Button>
        </Box>
      </Box>

      <ClickAwayListener onClickAway={handleCloseSuggestions}>
        <Paper
          component="form"
          sx={{
            p: '4px 8px',
            display: 'flex',
            alignItems: 'center',
            position: 'fixed',
            left: '50%',
            transform: 'translateX(-50%)',
            bottom: 158,
            width: 'calc(100% - 24px)',
            maxWidth: '576px',
            zIndex: 1111,
            borderRadius: 2,
            border: '1px solid #e7e7e7',
            boxShadow: '0 8px 20px rgba(0,0,0,0.10)',
          }}
          ref={searchAnchorRef}
        >
          <InputBase
            sx={{ ml: 1, flex: 1, fontSize: 14 }}
            placeholder="Search by name or barcode"
            inputProps={{ 'aria-label': 'search by name or barcode' }}
            value={searchTerm}
            onChange={handleSearchInputChange}
          />
          <IconButton type="button" sx={{ p: '9px' }} aria-label="search">
            <SearchIcon fontSize="small" />
          </IconButton>
          <Box sx={{ height: 24, borderLeft: '1px solid #d7d7d7', mx: 0.7 }} />
          <IconButton color="primary" sx={{ px: 1.1, py: 0.9, fontSize: 12 }} aria-label="scan">
            Scan
          </IconButton>
          <Popper
            open={openSuggestions && suggestions.length > 0}
            anchorEl={searchAnchorRef.current}
            role={undefined}
            transition
            disablePortal
            placement="top-start"
            style={{ zIndex: 1112, width: searchAnchorRef.current ? searchAnchorRef.current.clientWidth : undefined, marginBottom: '6px' }}
          >
            {({ TransitionProps, placement }) => (
              <Grow
                {...TransitionProps}
                style={{ transformOrigin: placement === 'bottom-start' ? 'left top' : 'left bottom' }}
              >
                <Paper sx={{ borderRadius: 1.8, overflow: 'hidden' }}>
                  <MenuList autoFocusItem={openSuggestions}>
                    {suggestions.map((product) => (
                      <MenuItem key={product._id} onClick={() => handleSuggestionClick(product)}>
                        <Typography variant="body2">
                          {product.name} ({product.barcode}) - ₹{product.cost.toFixed(2)}
                        </Typography>
                      </MenuItem>
                    ))}
                  </MenuList>
                </Paper>
              </Grow>
            )}
          </Popper>
        </Paper>
      </ClickAwayListener>

      {/* Add BillPreviewDialog */}
      {createdBill && (
        <BillPreviewDialog
          open={billPreviewOpen}
          onClose={handleCloseBillPreview}
          billData={createdBill}
        />
      )}
    </Container>
  );
}

export default NewBill;