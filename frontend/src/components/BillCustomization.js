import React, { useState, useEffect } from 'react';
import { Container, Typography, TextField, Button, Paper, Box, IconButton, Alert } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SettingsIcon from '@mui/icons-material/Settings';
import { useNavigate } from 'react-router-dom';

function BillCustomization() {
  const navigate = useNavigate();
  const [successMsg, setSuccessMsg] = useState('');
  const [formData, setFormData] = useState({
    storeName: '',
    phone: '',
    address: '',
    gstin: '',
    tagline: ''
  });

  useEffect(() => {
    const savedConf = localStorage.getItem('billSettings');
    if (savedConf) {
      try {
        setFormData(JSON.parse(savedConf));
      } catch(e) {}
    }
  }, []);

  const handleChange = (e) => {
    setFormData({...formData, [e.target.name]: e.target.value});
  };

  const handleSave = () => {
    localStorage.setItem('billSettings', JSON.stringify(formData));
    setSuccessMsg('Settings saved successfully!');
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 2, pb: 13, px: { xs: 1.5, sm: 2 } }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <IconButton onClick={() => navigate(-1)} sx={{ mr: 1, bgcolor: '#f5f5f5' }}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h5" sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
          <SettingsIcon />
          Bill Customization
        </Typography>
      </Box>

      {successMsg && <Alert severity="success" sx={{ mb: 2, borderRadius: 2 }}>{successMsg}</Alert>}

      <Paper sx={{ p: 3, borderRadius: 2, border: '1px solid #ebebeb', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
        <Typography variant="body2" sx={{ mb: 3, color: '#666' }}>
          Update the settings below to customize the receipt generated for your customers. Leave fields blank to exclude them from the printed bill.
        </Typography>

        <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 2.2 }}>
          <TextField 
            label="Shop Name" 
            name="storeName" 
            value={formData.storeName} 
            onChange={handleChange}
            size="small" fullWidth 
            placeholder="E.g., SuperMart"
          />
          <TextField 
            label="Contact Number" 
            name="phone" 
            value={formData.phone} 
            onChange={handleChange}
            size="small" fullWidth 
          />
          <TextField 
            label="Address" 
            name="address" 
            value={formData.address} 
            onChange={handleChange}
            size="small" fullWidth multiline rows={2}
          />
          <TextField 
            label="GSTIN (Optional)" 
            name="gstin" 
            value={formData.gstin} 
            onChange={handleChange}
            size="small" fullWidth 
          />
          <TextField 
            label="Tagline / Footer Note" 
            name="tagline" 
            value={formData.tagline} 
            onChange={handleChange}
            size="small" fullWidth placeholder="E.g., Thank you for shopping with us!"
          />
          <Button variant="contained" onClick={handleSave} sx={{ mt: 1, py: 1.2, textTransform: 'none', fontWeight: 600, borderRadius: 2 }}>
            Save Customization
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}

export default BillCustomization;
