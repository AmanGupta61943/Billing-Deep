import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Container,
  TextField,
  Button,
  Typography,
  Paper,
  Grid,
  Checkbox,
  FormControlLabel,
  // Import other necessary MUI components if needed
} from '@mui/material';
import axiosClient from '../api/axiosClient';
import { v4 as uuidv4 } from 'uuid';

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
    retail: '', // Mapping to 'cost' in backend
    minimumQuantity: ''
  });

  const [addToStock, setAddToStock] = useState(true);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCheckboxChange = (event) => {
    setAddToStock(event.target.checked);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validate form data
    let missingFields = [];
    if (!formData.name) missingFields.push('Name');
    if (formData.quantity === '') missingFields.push('Quantity'); // quantity can be 0, so check for empty string
    if (!formData.retail) missingFields.push('Retail Price');

    if (addToStock) {
      if (!formData.barcode) missingFields.push('Barcode');
      if (!formData.purchasePrice) missingFields.push('Purchase Price');
    }

    if (missingFields.length > 0) {
      setError(`Please fill in all required fields: ${missingFields.join(', ')}.`);
      return;
    }

    const productData = {
      name: formData.name,
      barcode: formData.barcode || '',
      quantity: Number(formData.quantity),
      purchasePrice: Number(formData.purchasePrice),
      cost: Number(formData.retail), // Mapping Retail Price to cost
      minimumQuantity: Number(formData.minimumQuantity) || 0
    };

    try {
      if (addToStock) {
        console.log('Submitting product data to stock:', productData); // Debug log
        const response = await axiosClient.post('/api/products', productData);
        console.log('Product added to stock successfully:', response.data); // Debug log
        addItemToBill(response.data); // Add item from backend response to bill (includes _id)
      } else {
        console.log('Adding product only to scanned items:', productData); // Debug log
        // Create a temporary product object with a client-side ID and include retail price as 'price'
        const tempProduct = { 
          ...productData, 
          _id: uuidv4(),
          price: Number(formData.retail) // Add retail price as 'price' for temporary items
        };
        console.log('Adding temporary product to bill (before addItemToBill):', tempProduct); // Added log
        addItemToBill(tempProduct); // Add temporary item to bill
      }

      navigate('/new-bill'); // Navigate back to the new bill page

    } catch (err) {
      console.error('Error adding product:', err);
      console.error('Error response:', err.response?.data); // Debug log
      setError(err.response?.data?.message || 'Error adding product. Please try again.');
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 2, mb: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          Add New Product
        </Typography>

        {error && (
          <Typography color="error" sx={{ mb: 2 }}>
            {error}
          </Typography>
        )}

        <form onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12} sx={{ mb: 2 }}>
              <TextField
                fullWidth
                label="Product Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </Grid>

            {/* Barcode Section based on image */}
            <Grid item xs={12} sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                   {/* Scan Icon - Placeholder */}
                   {/* <IconButton size="large" sx={{ mr: 1 }}>
                      <QrCodeScannerIcon />
                    </IconButton> */}
                  <TextField
                    name="barcode"
                    label="Barcode"
                    type="text"
                    fullWidth
                    variant="outlined"
                    value={formData.barcode}
                    onChange={handleChange}
                    required={addToStock}
                    sx={{ flexGrow: 1 }}
                    InputProps={{
                      // No end adornment here
                    }}
                  />
                   {/* Add button next to barcode - functionality to be confirmed */}
                   {/* <Button variant="contained" size="small" sx={{ ml: 1 }}>Add</Button> */}
                </Box>
                 {/* Display entered barcode below input */}
                 {formData.barcode && (
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 0, p: 1, backgroundColor: '#f0f0f0', borderRadius: '4px' }}>
                    <Typography variant="body1" sx={{ flexGrow: 1, fontWeight: 'bold' }}>{formData.barcode}</Typography>
                    {/* Three-dots icon - functionality to be confirmed */}
                    {/* <MoreVertIcon /> */}
                  </Box>
                 )}
                 {/* Auto Generate Buttons */}
                <Box sx={{ display: 'flex', justifyContent: 'space-around', mt: 1, mb: 0 }}>
                  {/* These functions are not in AddProduct.js, might need to pass them or implement here */}
                  {/* <Button onClick={handleAutoGenerateBarcode} variant="outlined" sx={{ flexGrow: 1, mr: 1 }}>Auto Generate Barcode</Button> */}
                  {/* <Button onClick={handleAutoGenerate4Digit} variant="outlined" sx={{ flexGrow: 1, ml: 1 }}>Auto Generate 4 Digit Code</Button> */}
                </Box>
            </Grid>
            {/* End Barcode Section */}

            <Grid item xs={12} sm={6} sx={{ mb: 2 }}>
              <TextField
                fullWidth
                label="Quantity"
                name="quantity"
                type="number"
                value={formData.quantity}
                onChange={handleChange}
                required
              />
            </Grid>

            {/* Retail Price field - always visible */}
            <Grid item xs={12} sm={6} sx={{ mb: 2 }}>
              <TextField
                fullWidth
                label="Retail Price (₹)" // Mapping to cost in backend
                name="retail"
                type="number"
                value={formData.retail}
                onChange={handleChange}
                required
              />
            </Grid>

            {/* Conditional fields for Add to Stock */}
            {addToStock && (
              <>
                <Grid item xs={12} sm={6} sx={{ mb: 2 }}>
                  <TextField
                    fullWidth
                    label="Purchase Price (₹)"
                    name="purchasePrice"
                    type="number"
                    value={formData.purchasePrice}
                    onChange={handleChange}
                    required
                  />
                </Grid>

                <Grid item xs={12} sm={6} sx={{ mb: 2 }}>
                  <TextField
                    fullWidth
                    label="Minimum Quantity"
                    name="minimumQuantity"
                    type="number"
                    value={formData.minimumQuantity}
                    onChange={handleChange}
                  />
                </Grid>
              </>
            )}

            <Grid item xs={12} sx={{ mb: 2 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={addToStock}
                    onChange={handleCheckboxChange}
                    name="addToStock"
                    color="primary"
                  />
                }
                label="Add to Stock Management"
              />
            </Grid>

            <Grid item xs={12}>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                <Button
                  variant="outlined"
                  onClick={() => navigate('/new-bill')}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                >
                  Add Product
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Container>
  );
}

export default AddProduct;