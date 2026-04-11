import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Alert,
  IconButton,
  InputAdornment
} from '@mui/material';
import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner';
import axiosClient from '../api/axiosClient';
import { QrReader } from 'react-qr-reader';
import Barcode from 'react-barcode';
import { useReactToPrint } from 'react-to-print';

function EditProduct() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showScanner, setShowScanner] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    barcode: '',
    mrp: '',
    retail: '',
    discount: '',
    quantity: ''
  });
  const [displayBarcodeValue, setDisplayBarcodeValue] = useState('');

  const barcodeRef = React.useRef();

  const handlePrintBarcode = useReactToPrint({
    content: () => barcodeRef.current,
    documentTitle: `Barcode_${displayBarcodeValue}`,
  });

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await axiosClient.get('/api/products/' + id);
        const productData = response.data;
        setFormData({
          name: productData.name || '',
          barcode: productData.barcode || '',
          mrp: productData.price || '',
          retail: productData.cost || '',
          discount: productData.discount || '',
          quantity: productData.quantity || ''
        });
        setDisplayBarcodeValue(productData.barcode || '');
      } catch (error) {
        setError('Failed to fetch product data.');
        console.error('Error fetching product:', error);
      }
    };
    fetchProduct();
  }, [id]);

  const handleMRPChange = (e) => {
    const mrp = Number(e.target.value);
    let retail = Number(formData.retail);
    let discount = Number(formData.discount);
    if (!isNaN(mrp)) {
      if (!isNaN(discount) && discount !== 0) {
        retail = mrp - (mrp * discount / 100);
        retail = retail.toFixed(2);
      } else if (!isNaN(retail) && retail !== 0) {
         discount = mrp ? (((mrp - retail) / mrp) * 100) : '';
         discount = discount !== '' ? discount.toFixed(2) : '';
      }
    }
    setFormData({ ...formData, mrp, retail, discount });
  };
  const handleRetailChange = (e) => {
    const retail = Number(e.target.value);
    const mrp = Number(formData.mrp);
    let discount = '';
    if (!isNaN(retail) && !isNaN(mrp) && mrp !== 0) {
      discount = ((mrp - retail) / mrp * 100);
      discount = discount.toFixed(2);
    }
    setFormData({ ...formData, retail, discount });
  };
  const handleDiscountChange = (e) => {
    const discount = Number(e.target.value);
    const mrp = Number(formData.mrp);
    let retail = '';
    if (!isNaN(discount) && !isNaN(mrp)) {
      retail = (mrp - (mrp * discount / 100));
      retail = retail.toFixed(2);
    }
    setFormData({ ...formData, discount, retail });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'mrp') return handleMRPChange(e);
    if (name === 'retail') return handleRetailChange(e);
    if (name === 'discount') return handleDiscountChange(e);
    setFormData({ ...formData, [name]: value });
    if (name === 'barcode') {
        setDisplayBarcodeValue('');
    }
  };

  const handleAutoGenerateBarcode = () => {
    const randomBarcode = Math.random().toString().slice(2, 14);
    setFormData({ ...formData, barcode: randomBarcode });
    setDisplayBarcodeValue(randomBarcode);
  };
  const handleAutoGenerate4Digit = () => {
    const random4Digit = Math.floor(1000 + Math.random() * 9000).toString();
    setFormData({ ...formData, barcode: random4Digit });
    setDisplayBarcodeValue(random4Digit);
  };
  const handleScan = (result) => {
    if (result) {
      setFormData({ ...formData, barcode: result });
      setDisplayBarcodeValue(result);
      setShowScanner(false);
    }
  };
  const handleError = (err) => {
    setError('QR/Barcode scan error: ' + err);
    setShowScanner(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!formData.name || !formData.mrp || !formData.retail || !formData.quantity) {
      setError('Please fill in all required fields');
      return;
    }
    try {
      const payload = {
        name: formData.name,
        barcode: formData.barcode,
        price: Number(formData.mrp),
        cost: Number(formData.retail),
        discount: Number(formData.discount),
        quantity: Number(formData.quantity)
      };
      await axiosClient.patch('/api/products/' + id, payload);
      setSuccess('Product updated successfully');
      setTimeout(() => navigate('/stock'), 2000);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to update product. Please try again.');
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Edit Product
        </Typography>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
        )}
        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>
        )}
        <Box sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          gap: 2,
          alignItems: 'center',
          mb: 2,
        }}>
          <Box sx={{ flexGrow: 1, width: { xs: '100%', sm: 'auto' } }}>
            <Box sx={{
              border: '1px solid #ccc',
              borderRadius: 2,
              p: 2,
              display: 'flex',
              alignItems: 'center',
              gap: 2,
              background: '#fafbfc'
            }}>
              <QrCodeScannerIcon sx={{ fontSize: 40, color: 'primary.main' }} />
              <TextField
                label="Enter Barcode Number"
                name="barcode"
                value={formData.barcode}
                onChange={handleChange}
                fullWidth
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowScanner(true)} edge="end" aria-label="scan barcode">
                        <QrCodeScannerIcon />
                      </IconButton>
                    </InputAdornment>
                  )
                }}
                sx={{ flex: 1 }}
              />
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: { xs: 'stretch', sm: 'flex-start' }, gap: 1, mt: 2 }}>
              <Button variant="outlined" onClick={handleAutoGenerateBarcode} sx={{ width: { xs: '100%', sm: 'auto' } }}>
                Auto Generate Barcode
              </Button>
              <Button variant="outlined" onClick={handleAutoGenerate4Digit} sx={{ width: { xs: '100%', sm: 'auto' } }}>
                Auto Generate 4 Digit Code
              </Button>
            </Box>
          </Box>
          {displayBarcodeValue && (
            <Paper
              elevation={3}
              ref={barcodeRef}
              onClick={handlePrintBarcode}
              sx={{
                p: 2,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minWidth: 150,
                mt: { xs: 2, sm: 0 },
                textAlign: 'center',
                cursor: 'pointer',
              }}
            >
              <Barcode value={displayBarcodeValue} width={1.5} height={50} fontSize={12} />
              <Typography variant="caption" mt={1}>
                {displayBarcodeValue}
              </Typography>
            </Paper>
          )}
        </Box>
        {showScanner && (
          <Box sx={{ mb: 2 }}>
            <QrReader
              delay={300}
              onError={handleError}
              onScan={handleScan}
              style={{ width: '100%' }}
            />
          </Box>
        )}
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
          <TextField
            fullWidth
            label="Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label="Quantity"
            name="quantity"
            type="number"
            value={formData.quantity}
            onChange={handleChange}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label="MRP"
            name="mrp"
            type="number"
            value={formData.mrp}
            onChange={handleChange}
            margin="normal"
            required
            InputProps={{ startAdornment: <InputAdornment position="start">₹</InputAdornment> }}
          />
          <TextField
            fullWidth
            label="Retail"
            name="retail"
            type="number"
            value={formData.retail}
            onChange={handleChange}
            margin="normal"
            required
            InputProps={{ startAdornment: <InputAdornment position="start">₹</InputAdornment> }}
          />
          <TextField
            fullWidth
            label="Discount (%)"
            name="discount"
            type="number"
            value={formData.discount}
            onChange={handleChange}
            margin="normal"
          />
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3, gap: 2 }}>
          <Button variant="outlined" onClick={() => navigate('/stock')}>
            Cancel
          </Button>
          <Button variant="contained" onClick={handleSubmit}>
            Update Product
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}

export default EditProduct; 