import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Container, Typography, FormControl, Select, MenuItem,
  Paper, Button, InputBase, IconButton, Snackbar, Alert,
  Popper, Grow, MenuList,
} from '@mui/material';
import AddIcon          from '@mui/icons-material/Add';
import RemoveIcon       from '@mui/icons-material/Remove';
import SearchIcon       from '@mui/icons-material/Search';
import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner';
import MicIcon          from '@mui/icons-material/Mic';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { MenuItem as MuiMenuItem } from '@mui/material';
import { ClickAwayListener } from '@mui/base/ClickAwayListener';

import BarcodeScanner from './BarcodeScanner';
import VoiceInput     from './VoiceInput';
import BillPreviewDialog from './BillPreviewDialog';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../api/axiosClient';

function NewBill({ scannedItems, addItemToBill: addItemToBillProp, increaseItemQuantity, decreaseItemQuantity, clearScannedItems }) {
  const navigate = useNavigate();

  // ── State ─────────────────────────────────────────────────────────────
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [totalAmount, setTotalAmount]     = useState(0);
  const [searchTerm, setSearchTerm]       = useState('');
  const [suggestions, setSuggestions]     = useState([]);
  const [openSuggestions, setOpenSuggestions] = useState(false);
  const [showScanner, setShowScanner]     = useState(false);
  const [showVoice, setShowVoice]         = useState(false);
  const [billPreviewOpen, setBillPreviewOpen] = useState(false);
  const [createdBill, setCreatedBill]     = useState(null);
  const [toast, setToast]                 = useState({ open: false, message: '', severity: 'success' });

  const searchRef = React.useRef(null);
  const currentDate = new Date().toLocaleDateString('en-IN');
  const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  // ── Helpers ───────────────────────────────────────────────────────────
  const showToast = useCallback((message, severity = 'success') => {
    setToast({ open: true, message, severity });
  }, []);

  const addItemToBill = useCallback((product, qty = 1) => {
    for (let i = 0; i < qty; i++) addItemToBillProp(product);
    showToast(`✅ ${qty > 1 ? qty + ' × ' : ''}${product.name} added`);
  }, [addItemToBillProp, showToast]);

  // ── Totals ────────────────────────────────────────────────────────────
  useEffect(() => {
    const total = scannedItems.reduce((sum, item) => {
      const p = item.cost != null ? item.cost : (item.price ?? 0);
      return sum + p * (item.quantity || 0);
    }, 0);
    setTotalAmount(total);
  }, [scannedItems]);

  // ── Search ────────────────────────────────────────────────────────────
  useEffect(() => {
    const t = setTimeout(async () => {
      if (searchTerm.length > 1) {
        try {
          const res = await axiosClient.get('/api/products/search?q=' + encodeURIComponent(searchTerm));
          setSuggestions(res.data);
          setOpenSuggestions(true);
        } catch { setSuggestions([]); setOpenSuggestions(false); }
      } else {
        setSuggestions([]); setOpenSuggestions(false);
      }
    }, 280);
    return () => clearTimeout(t);
  }, [searchTerm]);

  // ── QR Scan result ────────────────────────────────────────────────────
  const handleScanResult = async (decodedText) => {
    try {
      const data = JSON.parse(decodedText);
      const id   = data._id || data.id;
      const name = data.name;
      const cost = data.cost ?? data.price;
      if (id && name && cost != null) {
        addItemToBill({ _id: id, name, cost: Number(cost), price: Number(data.price ?? cost) });
        return;
      }
    } catch (_) {}
    // barcode fallback
    try {
      const { data: product } = await axiosClient.get('/api/products/barcode/' + decodedText);
      addItemToBill(product);
    } catch (err) {
      const status = err.response?.status;
      if (status === 404) navigate(`/stock/add?barcode=${decodedText}`, { state: { fromNewBill: true } });
      else showToast('Could not find product. Check connection.', 'error');
    }
  };

  // ── Voice result ──────────────────────────────────────────────────────
  const handleVoiceProduct = (product, qty) => {
    addItemToBill(product, qty);
  };

  // ── Bill creation ─────────────────────────────────────────────────────
  const handleCreateBill = async () => {
    try {
      for (const item of scannedItems) {
        if (item._id && /^[0-9a-fA-F]{24}$/.test(item._id)) {
          try {
            const cur = await axiosClient.get('/api/products/' + item._id);
            await axiosClient.patch('/api/products/' + item._id, { quantity: cur.data.quantity - item.quantity });
          } catch {}
        }
      }
      const billData = {
        items: scannedItems.map(i => ({
          product: i._id, name: i.name, barcode: i.barcode || '',
          quantity: i.quantity, price: i.cost ?? i.price ?? 0,
        })),
        totalAmount, paymentMethod, date: new Date(),
      };
      const res = await axiosClient.post('/api/bills', billData);
      setCreatedBill(res.data);
      setBillPreviewOpen(true);
      clearScannedItems();
    } catch {
      showToast('Error creating bill. Please try again.', 'error');
    }
  };

  // ─────────────────────────────────────────────────────────────────────
  return (
    <Container maxWidth="sm" sx={{ mt: 0, px: { xs: 1.5, sm: 2 }, pb: 26 }}>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>

        {/* ── Header: payment + total ──────────────────────────────────── */}
        <Paper elevation={0} sx={{ p: 1.2, borderRadius: 2.5, border: '1px solid #ececec', boxShadow: '0 4px 16px rgba(0,0,0,0.06)' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 1 }}>
            <FormControl size="small" sx={{ flexGrow: 1, mr: 0.5 }}>
              <Select value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)} sx={{ borderRadius: 1.5, '& .MuiSelect-select': { py: 1.05 } }}>
                <MenuItem value="Cash">Cash</MenuItem>
                <MenuItem value="UPI">UPI</MenuItem>
                <MenuItem value="Cash+UPI">Cash + UPI</MenuItem>
              </Select>
            </FormControl>
            <Box sx={{ minWidth: 132, textAlign: 'center', bgcolor: '#005745', color: '#fff', px: 1.2, py: 0.8, borderRadius: 1.8, boxShadow: '0 6px 16px rgba(0,87,69,0.24)' }}>
              <Typography variant="caption" sx={{ opacity: 0.9, lineHeight: 1 }}>Total (₹)</Typography>
              <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.1 }}>₹{totalAmount.toFixed(2)}</Typography>
            </Box>
          </Box>
        </Paper>

        {/* ── Date bar ────────────────────────────────────────────────── */}
        <Box sx={{ textAlign: 'center', bgcolor: '#ffeb3b', border: '2px solid #000', borderRadius: 2, py: 0.9, px: 1.5 }}>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>Date: {currentDate} {currentTime}</Typography>
        </Box>


        {/* ── Scanned items ─────────────────────────────────────────────── */}
        <Paper elevation={0} sx={{ p: 1.5, borderRadius: 2.5, border: '1px solid #ececec', boxShadow: '0 4px 16px rgba(0,0,0,0.05)', minHeight: 160 }}>
          <Typography variant="h6" sx={{ fontSize: 22, fontWeight: 700, mb: 1, color: '#1a1a2e' }}>
            Scanned Items
          </Typography>

          {scannedItems.length > 0 ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.8, maxHeight: '38vh', overflowY: 'auto', pr: 0.4 }}>
              {scannedItems.map((item) => {
                const price = item.cost != null ? item.cost : (item.price ?? 0);
                return (
                  <Box key={item._id} sx={{ display: 'flex', alignItems: 'center', gap: 0.8, borderRadius: 1.5, px: 1, py: 0.8, bgcolor: '#fafafa', border: '1px solid #f0f0f0' }}>
                    <Typography variant="body2" sx={{ flexGrow: 1, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {item.name}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', flexShrink: 0, width: 88, justifyContent: 'space-between' }}>
                      <IconButton size="small" onClick={() => decreaseItemQuantity(item._id)} disabled={item.quantity === 1} sx={{ p: '3px', border: '1px solid #e2e2e2', bgcolor: '#fff' }}>
                        <RemoveIcon sx={{ fontSize: 17 }} />
                      </IconButton>
                      <Typography variant="body2" sx={{ mx: 0.25, minWidth: 20, textAlign: 'center', fontWeight: 700 }}>{item.quantity}</Typography>
                      <IconButton size="small" onClick={() => increaseItemQuantity(item._id)} sx={{ p: '3px', border: '1px solid #e2e2e2', bgcolor: '#fff' }}>
                        <AddIcon sx={{ fontSize: 17 }} />
                      </IconButton>
                    </Box>
                    <Typography variant="body2" sx={{ flexShrink: 0, fontWeight: 700, width: 80, textAlign: 'right', color: '#005745' }}>
                      ₹{(price * item.quantity).toFixed(2)}
                    </Typography>
                  </Box>
                );
              })}
            </Box>
          ) : (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography sx={{ fontSize: 32 }}>🛒</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                No items yet. Tap Scan QR or Voice to add.
              </Typography>
            </Box>
          )}
        </Paper>
      </Box>

      {/* ── Fixed bottom action bar (replaces system nav) ─────────────── */}
      <Box sx={{
        position: 'fixed', left: 0, right: 0, bottom: 0, zIndex: 1110,
        bgcolor: '#ffffff', borderTop: '1px solid #e8e8e8',
        boxShadow: '0 -6px 24px rgba(0,0,0,0.1)',
        px: { xs: 1.5, sm: 2 }, pt: 1, pb: 'env(safe-area-inset-bottom, 12px)',
        display: 'flex', flexDirection: 'column', gap: 0.8,
      }}>
        {/* Row 1: Voice + Scan QR */}
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            fullWidth variant="outlined"
            startIcon={<MicIcon />}
            onClick={() => setShowVoice(true)}
            sx={{ py: 1.3, borderRadius: 2, fontWeight: 700, fontSize: 14,
              borderColor: '#1976d2', color: '#1976d2',
              '&:hover': { bgcolor: '#e3f2fd' } }}
          >
            Voice
          </Button>
          <Button
            fullWidth variant="contained"
            startIcon={<QrCodeScannerIcon />}
            onClick={() => setShowScanner(true)}
            sx={{ py: 1.3, borderRadius: 2, fontWeight: 700, fontSize: 14,
              bgcolor: '#005745', '&:hover': { bgcolor: '#004035' },
              boxShadow: '0 4px 12px rgba(0,87,69,0.3)' }}
          >
            Scan QR
          </Button>
        </Box>

        {/* Row 2: Search bar */}
        <ClickAwayListener onClickAway={() => setOpenSuggestions(false)}>
          <Paper ref={searchRef} sx={{ p: '3px 8px', display: 'flex', alignItems: 'center', borderRadius: 2, border: '1px solid #e7e7e7', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <InputBase sx={{ ml: 1, flex: 1, fontSize: 14 }} placeholder="Search by name…" value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)} inputProps={{ 'aria-label': 'search products' }} />
            <IconButton sx={{ p: '6px' }}><SearchIcon fontSize="small" /></IconButton>

            <Popper open={openSuggestions && suggestions.length > 0} anchorEl={searchRef.current} role={undefined} transition disablePortal placement="top-start"
              style={{ zIndex: 1112, width: searchRef.current?.clientWidth, marginBottom: 6 }}>
              {({ TransitionProps }) => (
                <Grow {...TransitionProps} style={{ transformOrigin: 'left bottom' }}>
                  <Paper sx={{ borderRadius: 1.8, overflow: 'hidden' }}>
                    <MenuList>
                      {suggestions.map(p => (
                        <MuiMenuItem key={p._id} onClick={() => { addItemToBill(p); setSearchTerm(''); setOpenSuggestions(false); }}>
                          <Typography variant="body2">{p.name} — ₹{p.cost?.toFixed(2)}</Typography>
                        </MuiMenuItem>
                      ))}
                    </MenuList>
                  </Paper>
                </Grow>
              )}
            </Popper>
          </Paper>
        </ClickAwayListener>

        {/* Row 3: Quick Add + Create Bill */}
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button variant="contained"
            sx={{ flex: 1, borderRadius: 1.6, bgcolor: '#8d6e63', textTransform: 'uppercase', fontWeight: 600, py: 1.1, '&:hover': { bgcolor: '#6d4c41' } }}
            onClick={() => navigate('/stock/add', { state: { fromNewBill: true } })}>
            Quick Add
          </Button>
          <Button variant="contained" endIcon={<ArrowForwardIcon />}
            sx={{ flex: 1, borderRadius: 1.6, bgcolor: '#4caf50', textTransform: 'uppercase', fontWeight: 600, py: 1.1, '&:hover': { bgcolor: '#388e3c' } }}
            onClick={handleCreateBill} disabled={scannedItems.length === 0}>
            Create Bill
          </Button>
        </Box>
      </Box>

      {/* ── QR Scanner modal ─────────────────────────────────────────── */}
      {showScanner && (
        <BarcodeScanner
          onScan={handleScanResult}
          onClose={() => setShowScanner(false)}
        />
      )}

      {/* ── Voice input overlay ───────────────────────────────────────── */}
      {showVoice && (
        <VoiceInput
          axiosClient={axiosClient}
          onProductFound={handleVoiceProduct}
          onClose={() => setShowVoice(false)}
        />
      )}

      {/* ── Bill preview ──────────────────────────────────────────────── */}
      {createdBill && (
        <BillPreviewDialog open={billPreviewOpen} onClose={() => { setBillPreviewOpen(false); setCreatedBill(null); }} billData={createdBill} />
      )}

      {/* ── Toast notification ────────────────────────────────────────── */}
      <Snackbar
        open={toast.open}
        autoHideDuration={2000}
        onClose={() => setToast(t => ({ ...t, open: false }))}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert severity={toast.severity} variant="filled" sx={{ fontWeight: 600, borderRadius: 2 }}>
          {toast.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}

export default NewBill;