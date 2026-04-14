import React, { useState, useEffect } from 'react';
import {
  Container, Typography, TextField, Button, Paper, Box,
  IconButton, Alert, Divider, Switch, FormControlLabel, Stack,
} from '@mui/material';
import ArrowBackIcon   from '@mui/icons-material/ArrowBack';
import SettingsIcon    from '@mui/icons-material/Settings';
import StoreIcon       from '@mui/icons-material/Store';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import SaveIcon        from '@mui/icons-material/Save';
import { useNavigate } from 'react-router-dom';

/* ──────────────────────────────────────────────────────────────────── */
const DEFAULTS = {
  storeName:      '',
  phone:          '',
  address:        '',
  gstin:          '',
  tagline:        'Thank you for shopping with us! 😊',
  showBillNumber: true,
  showSubtotal:   true,
  showDividers:   true,
};

function BillCustomization() {
  const navigate = useNavigate();
  const [successMsg, setSuccessMsg] = useState('');
  const [form, setForm] = useState(DEFAULTS);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('billSettings');
      if (saved) setForm({ ...DEFAULTS, ...JSON.parse(saved) });
    } catch (_) {}
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(f => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSave = () => {
    localStorage.setItem('billSettings', JSON.stringify(form));
    setSuccessMsg('Settings saved!');
    setTimeout(() => setSuccessMsg(''), 2500);
  };

  /* ── Bill preview (live) ────────────────────────────────────────── */
  const divider = form.showDividers ? '─'.repeat(28) : '';

  return (
    <Container maxWidth="sm" sx={{ mt: 2, pb: 14, px: { xs: 1.5, sm: 2 } }}>

      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <IconButton onClick={() => navigate(-1)} sx={{ mr: 1, bgcolor: '#f5f5f5' }}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h5" sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
          <SettingsIcon /> Bill Customization
        </Typography>
      </Box>

      {successMsg && <Alert severity="success" sx={{ mb: 2, borderRadius: 2 }}>{successMsg}</Alert>}

      {/* ── Section 1: Shop Details ───────────────────────────────── */}
      <Paper sx={{ p: 2.5, borderRadius: 2.5, border: '1px solid #ebebeb', boxShadow: '0 4px 12px rgba(0,0,0,0.04)', mb: 2 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2, display: 'flex', alignItems: 'center', gap: 0.8 }}>
          <StoreIcon fontSize="small" /> Shop Details
        </Typography>
        <Stack spacing={2}>
          <TextField label="Shop / Store Name" name="storeName" value={form.storeName} onChange={handleChange}
            size="small" fullWidth placeholder="E.g., Deepmala Store" />
          <TextField label="Phone Number" name="phone" value={form.phone} onChange={handleChange}
            size="small" fullWidth placeholder="E.g., 9876543210" />
          <TextField label="Address" name="address" value={form.address} onChange={handleChange}
            size="small" fullWidth multiline rows={2} placeholder="E.g., 123 Market St, Pune" />
          <TextField label="GSTIN (optional)" name="gstin" value={form.gstin} onChange={handleChange}
            size="small" fullWidth />
        </Stack>
      </Paper>

      {/* ── Section 2: Receipt Options ────────────────────────────── */}
      <Paper sx={{ p: 2.5, borderRadius: 2.5, border: '1px solid #ebebeb', boxShadow: '0 4px 12px rgba(0,0,0,0.04)', mb: 2 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1.5, display: 'flex', alignItems: 'center', gap: 0.8 }}>
          <ReceiptLongIcon fontSize="small" /> Receipt Options
        </Typography>
        <Stack spacing={0.5}>
          <FormControlLabel
            control={<Switch checked={!!form.showBillNumber} name="showBillNumber" onChange={handleChange} color="primary" />}
            label={<Typography variant="body2" sx={{ fontWeight: 500 }}>Show Bill Number (#1001, #1002…)</Typography>}
          />
          <FormControlLabel
            control={<Switch checked={!!form.showSubtotal} name="showSubtotal" onChange={handleChange} color="primary" />}
            label={<Typography variant="body2" sx={{ fontWeight: 500 }}>Show Subtotal</Typography>}
          />
          <FormControlLabel
            control={<Switch checked={!!form.showDividers} name="showDividers" onChange={handleChange} color="primary" />}
            label={<Typography variant="body2" sx={{ fontWeight: 500 }}>Show Divider Lines</Typography>}
          />
        </Stack>
        <TextField label="Thank You / Footer Message" name="tagline" value={form.tagline} onChange={handleChange}
          size="small" fullWidth multiline rows={2} sx={{ mt: 2 }}
          placeholder="E.g., Thank you for shopping with us! 😊" />
      </Paper>

      {/* ── Live Preview ─────────────────────────────────────────── */}
      <Paper sx={{ p: 2.5, borderRadius: 2.5, border: '1px dashed #c8e6c9', bgcolor: '#f9fff9', mb: 2 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5, color: '#388e3c' }}>
          📄 Live Preview
        </Typography>
        <Box sx={{ fontFamily: 'monospace', fontSize: 13, color: '#222', lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>
          <Typography align="center" sx={{ fontWeight: 700, fontFamily: 'monospace', fontSize: 14 }}>
            {form.storeName || 'Your Store Name'}
          </Typography>
          {form.address && <Typography align="center" sx={{ fontFamily: 'monospace', fontSize: 12, color: '#555' }}>{form.address}</Typography>}
          {form.phone   && <Typography align="center" sx={{ fontFamily: 'monospace', fontSize: 12, color: '#555' }}>Ph: {form.phone}</Typography>}
          {form.gstin   && <Typography align="center" sx={{ fontFamily: 'monospace', fontSize: 12, color: '#555' }}>GSTIN: {form.gstin}</Typography>}
          {form.showDividers && <Typography align="center" sx={{ fontFamily: 'monospace', color: '#bbb', letterSpacing: 2 }}>{divider}</Typography>}
          {form.showBillNumber && <Typography sx={{ fontFamily: 'monospace', fontSize: 12, color: '#444' }}>Bill No: #1001 &nbsp;&nbsp; Date: 14/4/2025</Typography>}
          {form.showDividers && <Typography align="center" sx={{ fontFamily: 'monospace', color: '#bbb' }}>{divider}</Typography>}
          <Typography sx={{ fontFamily: 'monospace', fontSize: 12 }}>Milk (2 × ₹50) = ₹100</Typography>
          <Typography sx={{ fontFamily: 'monospace', fontSize: 12 }}>Rice (1 × ₹250) = ₹250</Typography>
          {form.showDividers && <Typography align="center" sx={{ fontFamily: 'monospace', color: '#bbb' }}>{divider}</Typography>}
          {form.showSubtotal && <Typography sx={{ fontFamily: 'monospace', fontSize: 12 }}>Subtotal: ₹350</Typography>}
          <Typography sx={{ fontFamily: 'monospace', fontSize: 13, fontWeight: 700 }}>Total:    ₹350</Typography>
          <Typography sx={{ fontFamily: 'monospace', fontSize: 12, color: '#555' }}>Payment: Cash</Typography>
          {form.showDividers && <Typography align="center" sx={{ fontFamily: 'monospace', color: '#bbb' }}>{divider}</Typography>}
          {form.tagline && <Typography align="center" sx={{ fontFamily: 'monospace', fontSize: 11, fontStyle: 'italic', color: '#666' }}>{form.tagline}</Typography>}
        </Box>
      </Paper>

      {/* Save button */}
      <Button variant="contained" onClick={handleSave} startIcon={<SaveIcon />} fullWidth
        sx={{ py: 1.4, textTransform: 'none', fontWeight: 700, borderRadius: 2, fontSize: 16,
          bgcolor: '#005745', '&:hover': { bgcolor: '#004035' } }}>
        Save Settings
      </Button>
    </Container>
  );
}

export default BillCustomization;
