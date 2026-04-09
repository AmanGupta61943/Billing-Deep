import React from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import {
  Box,
  Typography,
  IconButton,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

function Header() {
  const location = useLocation(); // Get current location
  const navigate = useNavigate(); // Get navigate function

  const handleGoBack = () => {
    navigate(-1); // Go back one step in history
  };

  // Determine if the back button should be visible
  const showBackButton = location.pathname !== '/';

  return (
    <Box
      component="header"
      sx={{
        background: 'linear-gradient(135deg, #56431c 0%, #7a5f2b 100%)',
        color: '#f3e7c0',
        px: 2,
        height: '60px',
        textAlign: 'center',
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: (theme) => theme.zIndex.appBar,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        boxShadow: '0 4px 14px rgba(0,0,0,0.12)',
      }}
    >
      {showBackButton && (
        <IconButton
          onClick={handleGoBack}
          color="inherit"
          sx={{
            position: 'absolute',
            left: 16,
            top: '50%',
            transform: 'translateY(-50%)',
            color: '#f3e7c0',
          }}
        >
          <ArrowBackIcon />
        </IconButton>
      )}
      <Link to="/" style={{ textDecoration: 'none' }}>
        <Typography 
          variant="h4" 
          component="h1" 
          sx={{
            color: '#f7f1df',
            fontFamily: '"Poppins", "Inter", system-ui, -apple-system, sans-serif',
            fontWeight: 700,
            letterSpacing: '0.3px',
            lineHeight: 1.2,
            fontSize: { xs: 22, sm: 24 },
          }}
        >
          Billing Deep
        </Typography>
      </Link>
    </Box>
  );
}

export default Header; 