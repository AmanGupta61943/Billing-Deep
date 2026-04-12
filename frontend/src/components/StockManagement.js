import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Box,
  Alert,
  IconButton,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner';
import DeleteIcon from '@mui/icons-material/Delete';
import axiosClient from '../api/axiosClient';
import { QrReader } from 'react-qr-reader';
import Barcode from 'react-barcode';
import { useReactToPrint } from 'react-to-print';

function StockManagement() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [addEditDialogOpen, setAddEditDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showScanner, setShowScanner] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    barcode: '',
    quantity: '',
    purchasePrice: '',
    retail: '',
    minimumQuantity: ''
  });
  const [showBarcodeDialog, setShowBarcodeDialog] = useState(false);
  const [newlyAddedProduct, setNewlyAddedProduct] = useState(null);
  const [sortBy, setSortBy] = useState('lastUpdated_desc');

  const barcodePrintRef = React.useRef();

  const handlePrintNewlyAddedBarcode = useReactToPrint({
    content: () => barcodePrintRef.current,
    documentTitle: `Barcode_${newlyAddedProduct?.barcode}`,
    onAfterPrint: () => setShowBarcodeDialog(false),
  });

  useEffect(() => {
    fetchProducts(sortBy);
  }, [sortBy]);

  const fetchProducts = async (sortOption) => {
    try {
      const apiUrl = `/api/products?sortBy=${sortOption}`;
      const response = await axiosClient.get(apiUrl, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      console.log('Fetched products data:', response.data);
      setProducts(response.data);
    } catch (error) {
      if (error.code === 'ERR_NETWORK') {
        setError('Cannot connect to server. Please make sure the backend server is running at http://localhost:5000');
      } else if (error.response) {
        setError(`Server error: ${error.response.data.message || error.message}`);
      } else if (error.request) {
        setError('No response from server. Please check if the server is running.');
      } else {
        setError(`Error: ${error.message}`);
      }
    }
  };

  const handleSortChange = (event) => {
    setSortBy(event.target.value);
  };

  const handleRowClick = (productId) => {
    return (event) => {
      if (!event.target.closest('button')) {
        navigate(`/stock/edit/${productId}`);
      }
    };
  };

  const handleOpenAddEditDialog = (product = null) => {
    if (product) {
      setSelectedProduct(product);
      setFormData({
        name: product.name || '',
        barcode: product.barcode || '',
        quantity: product.quantity || '',
        purchasePrice: product.purchasePrice || '',
        retail: product.cost || '',
        minimumQuantity: product.minimumQuantity || ''
      });
    } else {
      setSelectedProduct(null);
      setFormData({
        name: '',
        barcode: '',
        quantity: '',
        purchasePrice: '',
        retail: '',
        minimumQuantity: ''
      });
    }
    setAddEditDialogOpen(true);
  };

  const handleCloseAddEditDialog = () => {
    setAddEditDialogOpen(false);
    setSelectedProduct(null);
    setError('');
    setShowScanner(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleAutoGenerateBarcode = () => {
    const randomBarcode = Math.random().toString().slice(2, 14);
    setFormData({ ...formData, barcode: randomBarcode });
  };
  const handleAutoGenerate4Digit = () => {
    const random4Digit = Math.floor(1000 + Math.random() * 9000).toString();
    setFormData({ ...formData, barcode: random4Digit });
  };
  const handleScan = (result, error) => {
    if (!!result) {
      const scannedText = result?.text;
      if (scannedText) {
        setFormData({ ...formData, barcode: scannedText });
        setShowScanner(false);
      }
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await axiosClient.delete(`/api/products/${id}`);
        setSuccess('Product deleted successfully');
        fetchProducts(sortBy);
      } catch (error) {
        setError(error.response?.data?.message || 'Failed to delete product.');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!formData.name || formData.quantity === '' || !formData.purchasePrice || !formData.retail) {
      setError('Please fill in all required fields: Name, Quantity, Purchase Price, Retail Price');
      return;
    }
    try {
      const payload = {
        name: formData.name,
        barcode: formData.barcode || '',
        quantity: Number(formData.quantity),
        purchasePrice: Number(formData.purchasePrice),
        cost: Number(formData.retail),
        minimumQuantity: Number(formData.minimumQuantity) || 0
      };
      console.log('Sending payload to backend:', payload);
      if (selectedProduct) {
        await axiosClient.patch(`/api/products/${selectedProduct._id}`, payload);
        setSuccess('Product updated successfully');
      } else {
        const response = await axiosClient.post('/api/products', payload);
        setSuccess('Product added successfully');
        setNewlyAddedProduct(response.data);
        setShowBarcodeDialog(true);
      }
      fetchProducts(sortBy);
      handleCloseAddEditDialog();
    } catch (error) {
      console.error('Error saving product:', error.response?.data || error.message);
      setError(error.response?.data?.message || 'Failed to save product. Please try again.');
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 0, mb: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5" sx={{ fontWeight: 'bold' }}>Stock Management</Typography>
        </Box>
        {/* Sort By Dropdown */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
          <FormControl size="small" sx={{ width: '150px' }}>
            <InputLabel>Sort By</InputLabel>
            <Select
              value={sortBy}
              label="Sort By"
              onChange={handleSortChange}
            >
              <MenuItem value="name_asc">Name (A-Z)</MenuItem>
              <MenuItem value="quantity_asc">Quantity (Low to High)</MenuItem>
              <MenuItem value="quantity_desc">Quantity (High to Low)</MenuItem>
              <MenuItem value="lastUpdated_desc">Date Modified (Latest)</MenuItem>
              <MenuItem value="lastUpdated_asc">Date Modified (Oldest)</MenuItem>
            </Select>
          </FormControl>
        </Box>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Barcode</TableCell>
                <TableCell>Quantity</TableCell>
                <TableCell>Purchase Price</TableCell>
                <TableCell>Retail Price</TableCell>
                <TableCell>Profit/Piece</TableCell>
                <TableCell>Total Profit</TableCell>
                <TableCell>Min Quantity</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {products.map((product) => {
                const profitPerPiece = (product.cost || 0) - (product.purchasePrice || 0);
                const totalProfit = profitPerPiece * (product.quantity || 0);
                const minQty = product.minimumQuantity != null ? product.minimumQuantity : 0;
                const isLowStock = (product.quantity || 0) < minQty;
                console.log(`Product: ${product.name}, Quantity: ${product.quantity}, MinQty: ${product.minimumQuantity}, isLowStock: ${isLowStock}`);
                return (
                  <TableRow 
                    key={product._id}
                    onClick={() => handleOpenAddEditDialog(product)}
                    sx={{
                      cursor: 'pointer',
                      backgroundColor: isLowStock ? '#ffebee' : 'inherit'
                    }}
                  >
                    <TableCell>{product.name}</TableCell>
                    <TableCell>{product.barcode}</TableCell>
                    <TableCell>{product.quantity}</TableCell>
                    <TableCell>₹{product.purchasePrice?.toFixed(2)}</TableCell>
                    <TableCell>₹{product.cost?.toFixed(2)}</TableCell>
                    <TableCell sx={{ color: profitPerPiece >= 0 ? 'success.main' : 'error.main' }}>
                      ₹{profitPerPiece?.toFixed(2)}
                    </TableCell>
                    <TableCell sx={{ color: totalProfit >= 0 ? 'success.main' : 'error.main' }}>
                      ₹{totalProfit?.toFixed(2)}
                    </TableCell>
                    <TableCell>{product.minimumQuantity != null ? product.minimumQuantity : 'N/A'}</TableCell>
                    <TableCell>
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(product._id);
                        }}
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
      <Dialog open={addEditDialogOpen} onClose={handleCloseAddEditDialog}>
        <DialogTitle>{selectedProduct ? 'Edit Product' : 'Add Product'}</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
          )}
          <TextField
            autoFocus
            margin="dense"
            name="name"
            label="Product Name"
            type="text"
            fullWidth
            variant="outlined"
            value={formData.name}
            onChange={handleChange}
            required
            sx={{ mb: 2 }}
          />
          <Typography variant="subtitle1" gutterBottom>Enter Barcode Number</Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
             <IconButton onClick={() => setShowScanner(!showScanner)} size="large" sx={{ mr: 1 }}>
                <QrCodeScannerIcon />
              </IconButton>
            <TextField
              margin="dense"
              name="barcode"
              label="Barcode"
              type="text"
              fullWidth
              variant="outlined"
              value={formData.barcode}
              onChange={handleChange}
              sx={{ flexGrow: 1 }}
               InputProps={{
                // No end adornment here, auto-generate buttons are moved below
               }}
            />
             {/* Add button next to barcode - functionality to be confirmed */}
             {/* <Button variant="contained" size="small" sx={{ ml: 1 }}>Add</Button> */}
          </Box>
           {/* Display entered barcode below input */}
           {formData.barcode && (
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, p: 1, backgroundColor: '#f0f0f0', borderRadius: '4px' }}>
              <Typography variant="body1" sx={{ flexGrow: 1, fontWeight: 'bold' }}>{formData.barcode}</Typography>
              {/* Three-dots icon - functionality to be confirmed */}
              {/* <MoreVertIcon /> */}
            </Box>
           )}

          {showScanner && (
            <Box sx={{ mt: 2, mb: 2, width: '100%' }}>
              <QrReader
                onResult={handleScan}
                constraints={{ facingMode: 'environment' }}
                style={{ width: '100%' }}
              />
            </Box>
          )}

           <Box sx={{ display: 'flex', justifyContent: 'space-around', mb: 2 }}>
              <Button onClick={handleAutoGenerateBarcode} variant="outlined" sx={{ flexGrow: 1, mr: 1 }}>Auto Generate Barcode</Button>
              <Button onClick={handleAutoGenerate4Digit} variant="outlined" sx={{ flexGrow: 1, ml: 1 }}>Auto Generate 4 Digit Code</Button>
            </Box>


          <TextField
            margin="dense"
            name="quantity"
            label="Quantity"
            type="number"
            fullWidth
            variant="outlined"
            value={formData.quantity}
            onChange={handleChange}
            required
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            name="purchasePrice"
            label="Purchase Price (₹)"
            type="number"
            fullWidth
            variant="outlined"
            value={formData.purchasePrice}
            onChange={handleChange}
            required
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            name="retail"
            label="Retail Price (₹)"
            type="number"
            fullWidth
            variant="outlined"
            value={formData.retail}
            onChange={handleChange}
            required
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            name="minimumQuantity"
            label="Minimum Quantity"
            type="number"
            fullWidth
            variant="outlined"
            value={formData.minimumQuantity}
            onChange={handleChange}
            sx={{ mb: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseAddEditDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">{selectedProduct ? 'Update' : 'Add'}</Button>
        </DialogActions>
      </Dialog>
      <Dialog open={showBarcodeDialog} onClose={() => setShowBarcodeDialog(false)}>
        <DialogTitle>Newly Added Product Barcode</DialogTitle>
        <DialogContent>
          {newlyAddedProduct?.barcode && (
            <Box ref={barcodePrintRef} sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="h6" gutterBottom>{newlyAddedProduct.name}</Typography>
              <Barcode value={newlyAddedProduct.barcode} />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowBarcodeDialog(false)}>Close</Button>
          {newlyAddedProduct?.barcode && (
            <Button onClick={handlePrintNewlyAddedBarcode} variant="contained">Print Barcode</Button>
          )}
        </DialogActions>
      </Dialog>
      <Box sx={{
        position: 'fixed',
        bottom: 16,
        right: 16,
        zIndex: 1000,
      }}>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenAddEditDialog()}
          size="large"
        >
          Add Product
        </Button>
      </Box>
    </Container>
  );
}

export default StockManagement; 