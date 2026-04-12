import React from 'react';
import { Container, Typography, Paper, Box, IconButton, Button } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ContactSupportIcon from '@mui/icons-material/ContactSupport';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import BusinessIcon from '@mui/icons-material/Business';
import { useNavigate } from 'react-router-dom';

function ContactUs() {
  const navigate = useNavigate();

  return (
    <Container maxWidth="sm" sx={{ mt: 2, pb: 13, px: { xs: 1.5, sm: 2 } }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <IconButton onClick={() => navigate(-1)} sx={{ mr: 1, bgcolor: '#f5f5f5' }}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h5" sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
          <ContactSupportIcon />
          Contact Us
        </Typography>
      </Box>

      <Paper sx={{ p: 4, borderRadius: 3, border: '1px solid #ebebeb', boxShadow: '0 8px 24px rgba(0,0,0,0.04)' }}>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>
          Get in Touch
        </Typography>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
            <Box sx={{ p: 1, bgcolor: '#e3f2fd', borderRadius: '50%', color: '#1976d2', display: 'flex' }}>
              <PhoneIcon />
            </Box>
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#333' }}>Phone Support</Typography>
              <Typography variant="body2" sx={{ color: '#666' }}>+91 9876543210</Typography>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
            <Box sx={{ p: 1, bgcolor: '#e8f5e9', borderRadius: '50%', color: '#388e3c', display: 'flex' }}>
              <EmailIcon />
            </Box>
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#333' }}>Email Us</Typography>
              <Typography variant="body2" sx={{ color: '#666' }}>support@billingdeep.com</Typography>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
            <Box sx={{ p: 1, bgcolor: '#fff3e0', borderRadius: '50%', color: '#f57c00', display: 'flex' }}>
              <BusinessIcon />
            </Box>
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#333' }}>Office Address</Typography>
              <Typography variant="body2" sx={{ color: '#666' }}>
                123 Deep Tech Park, Level 4<br />
                Bangalore, Karnataka 560001
              </Typography>
            </Box>
          </Box>
        </Box>

        <Button 
          variant="outlined" 
          fullWidth 
          sx={{ mt: 5, py: 1.5, borderRadius: 2, fontWeight: 600, textTransform: 'none' }}
          onClick={() => window.location.href = "mailto:support@billingdeep.com"}
        >
          Send an Email
        </Button>
      </Paper>
    </Container>
  );
}

export default ContactUs;
