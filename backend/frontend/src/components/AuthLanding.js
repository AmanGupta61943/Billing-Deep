import React from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';

const AuthLanding = () => {
  const navigate = useNavigate();

  return (
    <Box className="fullscreen-card-container fade-page">
      <Box className="billing-deep-card" sx={{ alignItems: 'stretch' }}>
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 1, textAlign: 'left' }}>
          Billing Deep
          <span className="billing-deep-dot" />
        </Typography>

        <Box
          sx={{
            flexGrow: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            my: 3,
          }}
        >
          <Box
            sx={{
              width: 140,
              height: 200,
              borderRadius: '24px',
              background:
                'linear-gradient(145deg, rgba(0,0,0,0.85), rgba(0,0,0,0.6))',
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'center',
              color: '#ffc93c',
              fontWeight: 600,
              fontSize: 18,
              boxShadow: '0 12px 30px rgba(0,0,0,0.45)',
            }}
          >
            <Box sx={{ mb: 3 }}>Billings</Box>
          </Box>
        </Box>

        <Typography
          variant="subtitle1"
          sx={{ mb: 3, textAlign: 'center', fontWeight: 500 }}
        >
          Paying bills made easy.
        </Typography>

        <Button
          fullWidth
          variant="contained"
          onClick={() => navigate('/signin')}
          sx={{
            mb: 1.5,
            backgroundColor: '#111111',
            color: '#ffffff',
            borderRadius: 999,
            py: 1.2,
            textTransform: 'none',
            fontWeight: 600,
            fontSize: 16,
            boxShadow: '0 8px 18px rgba(0,0,0,0.35)',
            '&:hover': {
              backgroundColor: '#000000',
            },
          }}
        >
          Sign In
        </Button>

        <Button
          fullWidth
          variant="outlined"
          onClick={() => navigate('/signup')}
          sx={{
            borderRadius: 999,
            py: 1.1,
            textTransform: 'none',
            fontWeight: 600,
            fontSize: 15,
            borderColor: '#111111',
            color: '#111111',
            backgroundColor: '#fff8d7',
            '&:hover': {
              backgroundColor: '#ffefb3',
              borderColor: '#111111',
            },
          }}
        >
          Create a new account
        </Button>
      </Box>
    </Box>
  );
};

export default AuthLanding;

