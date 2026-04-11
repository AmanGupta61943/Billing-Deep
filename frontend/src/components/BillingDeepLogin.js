import React from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import PaymentIcon from '@mui/icons-material/Payment';

const BillingDeepLogin = () => {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        position: 'fixed',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        p: { xs: 2, sm: 4, md: 6 },
        // Cinematic full-viewport black + gold gradient
        backgroundImage:
          'radial-gradient(140% 140% at 50% 40%, rgba(245,197,66,0.65) 0%, rgba(245,197,66,0.45) 18%, rgba(12,8,2,1) 40%, #000000 78%),' +
          'radial-gradient(120% 120% at 12% 0%, rgba(245,197,66,0.55) 0%, rgba(26,20,5,0.9) 35%, transparent 70%),' +
          'radial-gradient(120% 120% at 100% 100%, rgba(245,197,66,0.55) 0%, rgba(26,20,5,0.95) 32%, transparent 72%),' +
          'linear-gradient(145deg, #000000 0%, #050505 35%, #020202 100%)',
        backgroundRepeat: 'no-repeat',
        backgroundSize: '100% 100%',
        '&::before': {
          content: '""',
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(circle at 50% 0%, rgba(255,255,255,0.06), transparent 60%),' +
            'radial-gradient(circle at 0% 100%, rgba(245,197,66,0.12), transparent 65%),' +
            'radial-gradient(circle at 100% 0%, rgba(245,197,66,0.10), transparent 65%)',
          mixBlendMode: 'screen',
          pointerEvents: 'none',
        },
      }}
    >
      {/* Background glow blobs */}
      <Box
        sx={{
          position: 'absolute',
          width: 280,
          height: 280,
          borderRadius: '50%',
          top: -120,
          left: -90,
          background:
            'radial-gradient(circle at 30% 30%, rgba(245,197,66,0.45), rgba(245,197,66,0.08) 55%, transparent 70%)',
          filter: 'blur(12px)',
          pointerEvents: 'none',
          animation: 'billingDeepGlow1 7s ease-in-out infinite',
          '@keyframes billingDeepGlow1': {
            '0%': { transform: 'translate(0px, 0px) scale(1)' },
            '50%': { transform: 'translate(18px, 12px) scale(1.05)' },
            '100%': { transform: 'translate(0px, 0px) scale(1)' },
          },
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          width: 320,
          height: 320,
          borderRadius: '50%',
          bottom: -150,
          right: -120,
          background:
            'radial-gradient(circle at 60% 60%, rgba(255,255,255,0.12), rgba(245,197,66,0.10) 50%, transparent 72%)',
          filter: 'blur(14px)',
          pointerEvents: 'none',
          animation: 'billingDeepGlow2 9s ease-in-out infinite',
          '@keyframes billingDeepGlow2': {
            '0%': { transform: 'translate(0px, 0px) scale(1)' },
            '50%': { transform: 'translate(-14px, -10px) scale(1.06)' },
            '100%': { transform: 'translate(0px, 0px) scale(1)' },
          },
        }}
      />

      <Paper
        elevation={0}
        className="fade-page"
        sx={{
          width: { xs: '100%', sm: 420 },
          maxWidth: 420,
          maxHeight: { xs: '92vh', sm: '86vh' },
          overflowY: { xs: 'auto', sm: 'visible' },
          borderRadius: 6,
          p: { xs: 3, sm: 4.5 },
          textAlign: 'center',
          background:
            'linear-gradient(145deg, rgba(10,10,10,0.88), rgba(5,5,5,0.94))',
          border: '1px solid rgba(245,197,66,0.22)',
          backdropFilter: 'blur(22px)',
          boxShadow:
            '0 28px 80px rgba(0,0,0,0.9), 0 0 0 1px rgba(245,197,66,0.18)',
          position: 'relative',
          zIndex: 1,
        }}
      >
        {/* Glowing logo card */}
        <Box
          sx={{
            width: { xs: 72, sm: 86 },
            height: { xs: 72, sm: 86 },
            borderRadius: 3,
            margin: '0 auto 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background:
              'radial-gradient(circle at 30% 30%, rgba(245,197,66,0.75), rgba(245,197,66,0.18) 60%, rgba(15,15,15,0.35) 100%)',
            boxShadow:
              '0 0 0 1px rgba(245,197,66,0.30), 0 0 34px rgba(245,197,66,0.35)',
          }}
        >
          <Box
            sx={{
              width: { xs: 48, sm: 54 },
              height: { xs: 48, sm: 54 },
              borderRadius: 2,
              background:
                'linear-gradient(135deg, rgba(245,197,66,0.28), rgba(255,255,255,0.05))',
              border: '1px solid rgba(245,197,66,0.35)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#f5c542',
              fontWeight: 800,
              letterSpacing: 0.5,
            }}
          >
            BD
          </Box>
        </Box>

        <Typography
          variant="h4"
          sx={{
            fontFamily: '"Poppins", "Inter", system-ui, -apple-system, sans-serif',
            fontWeight: 900,
            color: '#ffffff',
            mb: 0.6,
            letterSpacing: 0.2,
            fontSize: { xs: 30, sm: 36 },
          }}
        >
          Billing Deep
        </Typography>
        <Typography
          variant="body2"
          sx={{ color: 'rgba(255,255,255,0.65)', mb: 2.5 }}
        >
          Paying bills made easy
        </Typography>

        {/* Icon row */}
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1.2, mb: 3 }}>
          <IconButton
            aria-label="wallet"
            sx={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(245,197,66,0.22)',
              color: '#f5c542',
              boxShadow: '0 0 18px rgba(245,197,66,0.20)',
              '&:hover': { background: 'rgba(255,255,255,0.07)' },
            }}
          >
            <AccountBalanceWalletIcon fontSize="small" />
          </IconButton>
          <IconButton
            aria-label="payment"
            sx={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(245,197,66,0.22)',
              color: '#f5c542',
              boxShadow: '0 0 18px rgba(245,197,66,0.20)',
              '&:hover': { background: 'rgba(255,255,255,0.07)' },
            }}
          >
            <PaymentIcon fontSize="small" />
          </IconButton>
          <IconButton
            aria-label="qr"
            sx={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(245,197,66,0.22)',
              color: '#f5c542',
              boxShadow: '0 0 18px rgba(245,197,66,0.20)',
              '&:hover': { background: 'rgba(255,255,255,0.07)' },
            }}
          >
            <QrCodeScannerIcon fontSize="small" />
          </IconButton>
        </Box>

        <Button
          fullWidth
          onClick={() => navigate('/signin')}
          sx={{
            mb: 1.6,
            borderRadius: 999,
            py: 1.3,
            textTransform: 'none',
            fontWeight: 700,
            fontSize: 16,
            color: '#f5c542',
            background:
              'linear-gradient(180deg, rgba(15,15,15,1) 0%, rgba(5,5,5,1) 100%)',
            border: '1px solid rgba(245,197,66,0.35)',
            boxShadow:
              '0 16px 40px rgba(0,0,0,0.75), 0 0 26px rgba(245,197,66,0.25)',
            transition: 'transform 160ms ease, box-shadow 160ms ease, filter 160ms ease',
            '&:hover': {
              transform: 'translateY(-1px)',
              boxShadow:
                '0 22px 55px rgba(0,0,0,0.85), 0 0 34px rgba(245,197,66,0.38)',
              filter: 'brightness(1.06)',
            },
            '&:active': { transform: 'translateY(0px) scale(0.99)' },
          }}
          variant="contained"
        >
          Sign In
        </Button>

        <Button
          fullWidth
          onClick={() => navigate('/signup')}
          variant="outlined"
          sx={{
            borderRadius: 999,
            py: 1.2,
            textTransform: 'none',
            fontWeight: 650,
            fontSize: 15,
            border: '1px solid rgba(245,197,66,0.55)',
            color: '#f5c542',
            background: 'rgba(245,197,66,0.08)',
            boxShadow: '0 10px 26px rgba(0,0,0,0.35)',
            transition: 'transform 160ms ease, background 160ms ease, box-shadow 160ms ease',
            '&:hover': {
              background: 'rgba(245,197,66,0.14)',
              transform: 'translateY(-1px)',
            },
            '&:active': { transform: 'translateY(0px) scale(0.99)' },
          }}
        >
          Create a new account
        </Button>
      </Paper>
    </Box>
  );
};

export default BillingDeepLogin;

