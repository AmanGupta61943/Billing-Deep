import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Container,
  TextField,
  Button,
  Typography,
  Paper,
  Checkbox,
  FormControlLabel,
  Stack,
} from '@mui/material';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import QrCode2Icon from '@mui/icons-material/QrCode2';
import PrintIcon from '@mui/icons-material/Print';
import axiosClient from '../api/axiosClient';
import { v4 as uuidv4 } from 'uuid';
import { QRCodeSVG } from 'qrcode.react';

function generateRandomBarcode() {
  let s = '';
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    const buf = new Uint8Array(8);
    crypto.getRandomValues(buf);
    for (let i = 0; i < buf.length; i++) {
      s += (buf[i] % 10).toString();
    }
  }
  while (s.length < 12) {
    s += Math.floor(Math.random() * 10).toString();
  }
  return s.slice(0, 12);
}

function AddProduct({ addItemToBill }) {
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const initialBarcode = searchParams.get('barcode') || '';

  const [formData, setFormData] = useState({
    name: '',
    barcode: initialBarcode,
    quantity: '',
    purchasePrice: '',
    retail: '',
    minimumQuantity: '',
  });

  const [addToStock, setAddToStock] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [savedProduct, setSavedProduct] = useState(null); // holds saved product for QR display
  const qrPrintRef = React.useRef();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleApplyGeneratedBarcode = () => {
    setFormData((prev) => ({ ...prev, barcode: generateRandomBarcode() }));
    setError('');
  };

  const handleCheckboxChange = (event) => {
    setAddToStock(event.target.checked);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const missingFields = [];
    if (!formData.name?.trim()) missingFields.push('Name');
    if (formData.quantity === '' || formData.quantity === null) missingFields.push('Quantity');
    if (!formData.retail && formData.retail !== 0) missingFields.push('Retail Price');

    if (addToStock) {
      if (!formData.barcode?.trim()) missingFields.push('Barcode');
      if (formData.purchasePrice === '' || formData.purchasePrice === null) missingFields.push('Purchase Price');
    }

    if (missingFields.length > 0) {
      setError(`Please fill in all required fields: ${missingFields.join(', ')}.`);
      return;
    }

    const productData = {
      name: formData.name.trim(),
      barcode: formData.barcode?.trim() || '',
      quantity: Number(formData.quantity),
      purchasePrice: Number(formData.purchasePrice),
      cost: Number(formData.retail),
      minimumQuantity: Number(formData.minimumQuantity) || 0,
    };

    setSubmitting(true);
    try {
      if (addToStock) {
        const response = await axiosClient.post('/api/products', productData);
        const saved = response.data;
        setSavedProduct(saved); // show QR
        if (typeof addItemToBill === 'function') {
          addItemToBill(saved);
        }
        // Don't navigate away — let user see and print the QR first
      } else {
        const tempProduct = {
          ...productData,
          _id: uuidv4(),
          price: Number(formData.retail),
        };
        if (typeof addItemToBill === 'function') {
          addItemToBill(tempProduct);
        }
        if (location.state?.fromNewBill) {
          navigate('/new-bill');
        } else {
          navigate(-1);
        }
      }
    } catch (err) {
      const status = err.response?.status;
      const msg = err.response?.data?.message;
      if (status === 401) {
        setError('Session expired or not signed in. Please sign in again.');
      } else if (status === 409) {
        setError(msg || 'This barcode is already used. Generate a new one or change the barcode.');
      } else if (err.code === 'ERR_NETWORK') {
        setError('Cannot reach the server. Start the backend (port 5000) or check REACT_APP_API_URL.');
      } else {
        setError(msg || 'Error adding product. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Container
      maxWidth="sm"
      disableGutters
      sx={{
        px: { xs: 1.5, sm: 2 },
        pt: 1,
        pb: 22,
      }}
    >
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2, sm: 3 },
          borderRadius: 3,
          border: '1px solid #ebebeb',
          boxShadow: '0 8px 28px rgba(0,0,0,0.06)',
        }}
      >
        <Typography
          variant="h5"
          sx={{
            fontWeight: 700,
            mb: 0.5,
            fontFamily: '"Poppins", "Inter", system-ui, sans-serif',
          }}
        >
          Add New Product
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Fill details below. Use generate for a unique numeric barcode.
        </Typography>

        {error && (
          <Typography
            color="error"
            sx={{
              mb: 2,
              p: 1.25,
              borderRadius: 1.5,
              bgcolor: 'rgba(211, 47, 47, 0.08)',
              fontSize: 14,
            }}
          >
            {error}
          </Typography>
        )}

        <form onSubmit={handleSubmit}>
          <Stack spacing={2.25}>
            <TextField
              fullWidth
              label="Product Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              size="small"
            />

            <Box>
              <TextField
                name="barcode"
                label="Barcode"
                type="text"
                fullWidth
                size="small"
                value={formData.barcode}
                onChange={handleChange}
                required={addToStock}
              />
              <Button
                type="button"
                variant="outlined"
                fullWidth
                size="small"
                onClick={handleApplyGeneratedBarcode}
                startIcon={<AutorenewIcon sx={{ fontSize: 18 }} />}
                sx={{
                  mt: 1,
                  textTransform: 'none',
                  borderColor: '#5d4037',
                  color: '#5d4037',
                  py: 0.75,
                  '&:hover': { borderColor: '#4e342e', bgcolor: 'rgba(93,64,55,0.06)' },
                }}
              >
                Random generate barcode
              </Button>
              {formData.barcode ? (
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.75 }}>
                  Preview: <strong>{formData.barcode}</strong>
                </Typography>
              ) : null}
            </Box>

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                fullWidth
                label="Quantity"
                name="quantity"
                type="number"
                size="small"
                inputProps={{ min: 0 }}
                value={formData.quantity}
                onChange={handleChange}
                required
              />
              <TextField
                fullWidth
                label="Retail Price (₹)"
                name="retail"
                type="number"
                size="small"
                inputProps={{ min: 0, step: '0.01' }}
                value={formData.retail}
                onChange={handleChange}
                required
              />
            </Stack>

            {addToStock && (
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <TextField
                  fullWidth
                  label="Purchase Price (₹)"
                  name="purchasePrice"
                  type="number"
                  size="small"
                  inputProps={{ min: 0, step: '0.01' }}
                  value={formData.purchasePrice}
                  onChange={handleChange}
                  required
                />
                <TextField
                  fullWidth
                  label="Minimum Quantity"
                  name="minimumQuantity"
                  type="number"
                  size="small"
                  inputProps={{ min: 0 }}
                  value={formData.minimumQuantity}
                  onChange={handleChange}
                />
              </Stack>
            )}

            <FormControlLabel
              control={
                <Checkbox checked={addToStock} onChange={handleCheckboxChange} name="addToStock" color="primary" />
              }
              label="Add to Stock Management"
            />

            <Stack direction="row" spacing={1.5} justifyContent="flex-end" sx={{ pt: 1 }}>
              <Button variant="outlined" onClick={() => navigate(-1)} disabled={submitting} sx={{ textTransform: 'none' }}>
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={submitting}
                sx={{
                  textTransform: 'none',
                  fontWeight: 600,
                  px: 2.5,
                  bgcolor: '#5d4037',
                  '&:hover': { bgcolor: '#4e342e' },
                }}
              >
                {submitting ? 'Saving…' : 'Add Product'}
              </Button>
            </Stack>
          </Stack>
        </form>
      </Paper>

      {/* ── QR Code Card — shown after product is saved ───────────────── */}
      {savedProduct && (
        <Paper
          elevation={0}
          sx={{
            mt: 2,
            p: { xs: 2, sm: 3 },
            borderRadius: 3,
            border: '2px solid #4caf50',
            boxShadow: '0 8px 28px rgba(76,175,80,0.12)',
            textAlign: 'center',
          }}
        >
          <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#2e7d32', mb: 0.5, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.8 }}>
            <QrCode2Icon /> Product saved! QR Code ready
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Print this QR and stick it on the product. Scanning it instantly adds it to any bill — no internet needed.
          </Typography>

          {/* Printable QR area */}
          <Box
            ref={qrPrintRef}
            sx={{
              display: 'inline-flex',
              flexDirection: 'column',
              alignItems: 'center',
              p: 2,
              bgcolor: '#fff',
              border: '1px solid #e0e0e0',
              borderRadius: 2,
            }}
          >
            <QRCodeSVG
              value={JSON.stringify({
                _id:     savedProduct._id,
                id:      savedProduct._id,
                name:    savedProduct.name,
                cost:    savedProduct.cost,
                price:   savedProduct.price ?? savedProduct.cost,
                barcode: savedProduct.barcode || '',
              })}
              size={180}
              level="M"
              includeMargin={false}
            />
            <Typography variant="caption" sx={{ mt: 1, fontWeight: 600 }}>
              {savedProduct.name}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              ₹{savedProduct.cost} &nbsp;|&nbsp; {savedProduct.barcode || 'No barcode'}
            </Typography>
          </Box>

          <Stack direction="row" spacing={1.5} justifyContent="center" sx={{ mt: 2 }}>
            <Button
              variant="outlined"
              startIcon={<PrintIcon />}
              onClick={() => window.print()}
              sx={{ textTransform: 'none', borderColor: '#4caf50', color: '#2e7d32' }}
            >
              Print QR
            </Button>
            <Button
              variant="contained"
              sx={{ textTransform: 'none', bgcolor: '#5d4037', '&:hover': { bgcolor: '#4e342e' } }}
              onClick={() => {
                if (location.state?.fromNewBill) navigate('/new-bill');
                else navigate(-1);
              }}
            >
              Done
            </Button>
          </Stack>
        </Paper>
      )}
    </Container>
  );
}

export default AddProduct;
