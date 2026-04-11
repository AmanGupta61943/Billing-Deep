import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

const SplashScreen = () => {
  const navigate = useNavigate();
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    const startFadeTimeout = setTimeout(() => {
      setIsFadingOut(true);
    }, 1400);

    const navigateTimeout = setTimeout(() => {
      navigate('/auth');
    }, 2000);

    return () => {
      clearTimeout(startFadeTimeout);
      clearTimeout(navigateTimeout);
    };
  }, [navigate]);

  return (
    <Box className="fullscreen-card-container">
      <Box className={`billing-deep-card ${isFadingOut ? 'fade-out' : ''}`}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 700, mb: 1 }}>
          Billing Deep
          <span className="billing-deep-dot" />
        </Typography>
        <Typography variant="subtitle1" sx={{ opacity: 0.8 }}>
          Smart billing & inventory in one place.
        </Typography>
      </Box>
    </Box>
  );
};

export default SplashScreen;

