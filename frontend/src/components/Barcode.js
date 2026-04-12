import React, { useState, useRef } from 'react';
import {
  Container, Paper, TextField, Button, Typography, Box, Stack, Divider, Alert
} from '@mui/material';
import QrCode2Icon from '@mui/icons-material/QrCode2';
import PrintIcon from '@mui/icons-material/Print';
import { QRCodeSVG } from 'qrcode.react';

/**
 * QR Code Generator page (replaces plain Barcode Generator).
 *
 * Generates QR codes with embedded product JSON so they can be scanned
 * instantly in NewBill without any API call — same as PhonePe / Paytm UX.
 *
 * QR format:
 *   { "_id": "...", "name": "...", "cost": 80, "price": 100, "barcode": "..." }
 */
function BarcodeGenerator() {
  const [form, setForm] = useState({
    id:      '',
    name:    '',
    cost:    '',
    price:   '',
    barcode: '',
  });
  const [qrValue, setQrValue] = useState('');
  const [error, setError]     = useState('');
  const printRef = useRef();

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleGenerate = () => {
    if (!form.name.trim()) { setError('Product name is required.'); return; }
    if (!form.cost)        { setError('Cost / selling price is required.'); return; }

    const data = {
      _id:     form.id.trim()   || 'manual-' + Date.now(),
      id:      form.id.trim()   || 'manual-' + Date.now(),
      name:    form.name.trim(),
      cost:    Number(form.cost),
      price:   Number(form.price || form.cost),
      barcode: form.barcode.trim() || '',
    };
    setQrValue(JSON.stringify(data));
  };

  const handlePrint = () => window.print();

  return (
    <Container maxWidth="sm" sx={{ mt: 2, pb: 14, px: { xs: 1.5, sm: 2 } }}>

      {/* ── Input card ───────────────────────────────────────────────── */}
      <Paper elevation={0} sx={{ p: { xs: 2, sm: 3 }, borderRadius: 3, border: '1px solid #ebebeb', boxShadow: '0 8px 28px rgba(0,0,0,0.06)' }}>
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5, display: 'flex', alignItems: 'center', gap: 1 }}>
          <QrCode2Icon color="primary" /> QR Code Generator
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
          Generate a QR code containing product data. Scanning it in the billing screen instantly adds the product — no internet needed.
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <Stack spacing={2}>
          <TextField
            name="name" label="Product Name *" size="small" fullWidth
            value={form.name} onChange={handleChange}
          />
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField
              name="cost" label="Selling Price / Cost (₹) *" size="small" fullWidth type="number"
              value={form.cost} onChange={handleChange}
              inputProps={{ min: 0, step: '0.01' }}
            />
            <TextField
              name="price" label="MRP (₹) — optional" size="small" fullWidth type="number"
              value={form.price} onChange={handleChange}
              inputProps={{ min: 0, step: '0.01' }}
            />
          </Stack>
          <TextField
            name="barcode" label="Barcode (optional)" size="small" fullWidth
            value={form.barcode} onChange={handleChange}
          />
          <TextField
            name="id" label="Product ID (leave blank to auto-generate)" size="small" fullWidth
            value={form.id} onChange={handleChange}
            helperText="Paste the MongoDB _id if you want to link to stock. Leave blank for standalone QR."
          />

          <Button
            variant="contained"
            startIcon={<QrCode2Icon />}
            onClick={handleGenerate}
            fullWidth
            sx={{ fontWeight: 600, textTransform: 'none', bgcolor: '#005745', '&:hover': { bgcolor: '#004035' }, py: 1.2 }}
          >
            Generate QR Code
          </Button>
        </Stack>
      </Paper>

      {/* ── QR Result ────────────────────────────────────────────────── */}
      {qrValue && (
        <Paper
          elevation={0}
          sx={{ mt: 2, p: { xs: 2, sm: 3 }, borderRadius: 3, border: '2px solid #005745', boxShadow: '0 8px 28px rgba(0,87,69,0.10)', textAlign: 'center' }}
        >
          <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1.5, color: '#005745' }}>
            ✅ QR Code Generated
          </Typography>

          <Box
            ref={printRef}
            sx={{
              display: 'inline-flex', flexDirection: 'column', alignItems: 'center',
              p: 2.5, bgcolor: '#fff', border: '1px solid #e0e0e0', borderRadius: 2,
            }}
          >
            <QRCodeSVG
              value={qrValue}
              size={200}
              level="M"
              includeMargin={false}
            />
            <Divider sx={{ width: '100%', my: 1.5 }} />
            <Typography variant="body2" sx={{ fontWeight: 700 }}>
              {JSON.parse(qrValue).name}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              ₹{JSON.parse(qrValue).cost}
              {JSON.parse(qrValue).barcode ? `  |  ${JSON.parse(qrValue).barcode}` : ''}
            </Typography>
          </Box>

          <Box sx={{ mt: 2 }}>
            <Button
              variant="outlined" startIcon={<PrintIcon />} onClick={handlePrint}
              sx={{ textTransform: 'none', borderColor: '#005745', color: '#005745' }}
            >
              Print QR
            </Button>
          </Box>

          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1.5 }}>
            Scan in billing → product added instantly (no API call)
          </Typography>
        </Paper>
      )}
    </Container>
  );
}

export default BarcodeGenerator;