import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import Alert from '@mui/material/Alert';
import { saveAuth, getStoredAuth } from '../utils/auth';

const SignInPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // If user already logged in, send them to stock
  useEffect(() => {
    const existingAuth = getStoredAuth();
    if (existingAuth.token) {
      navigate('/dashboard');
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await axiosClient.post('/auth/signup', { name, email, password });
      const { token, user } = response.data;

      saveAuth({ token, user, remember: rememberMe });

      navigate('/dashboard');
    } catch (err) {
      const message =
        err.response?.data?.message || 'Unable to sign in. Please try again.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        position: 'fixed',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        p: { xs: 2.5, sm: 4 },
        backgroundImage:
          'radial-gradient(135% 145% at 50% 0%, rgba(245,197,66,0.42) 0%, rgba(15,11,3,1) 42%, #000000 85%),' +
          'radial-gradient(120% 120% at 0% 100%, rgba(245,197,66,0.22) 0%, transparent 65%),' +
          'radial-gradient(120% 120% at 100% 100%, rgba(245,197,66,0.18) 0%, transparent 70%),' +
          'linear-gradient(150deg, #000000 0%, #050505 40%, #020202 100%)',
        backgroundRepeat: 'no-repeat',
        backgroundSize: '100% 100%',
      }}
    >
      <Box
        className="fade-page"
        sx={{
          width: { xs: '100%', sm: 420 },
          maxWidth: 420,
          maxHeight: { xs: '92vh', sm: '86vh' },
          overflowY: { xs: 'auto', sm: 'visible' },
          borderRadius: 16,
          p: { xs: 3, sm: 4 },
          background:
            'linear-gradient(150deg, rgba(10,10,10,0.55), rgba(6,6,6,0.7))',
          backdropFilter: 'blur(22px)',
          WebkitBackdropFilter: 'blur(22px)',
          border: '1px solid rgba(245,197,66,0.22)',
          boxShadow:
            '0 24px 60px rgba(0,0,0,0.9), 0 0 0 1px rgba(245,197,66,0.12)',
          color: '#ffffff',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            mb: 3,
            gap: 1,
          }}
        >
          <IconButton
            size="small"
            onClick={() => navigate(-1)}
            sx={{ color: 'rgba(255,255,255,0.8)' }}
          >
            <ArrowBackIosNewIcon fontSize="small" />
          </IconButton>
          <Typography
            variant="subtitle2"
            sx={{ fontWeight: 500, color: 'rgba(255,255,255,0.7)' }}
          >
            Sign In
          </Typography>
        </Box>

        <Typography
          variant="h5"
          sx={{
            fontWeight: 800,
            mb: 0.5,
            textAlign: 'center',
            fontFamily: '"Poppins", "Inter", system-ui, -apple-system, sans-serif',
          }}
        >
          Billing Deep
        </Typography>
        <Typography
          variant="body2"
          sx={{
            mb: 3,
            textAlign: 'center',
            color: 'rgba(255,255,255,0.55)',
          }}
        >
          Sign in to access your billing dashboard.
        </Typography>

        {error && (
          <Alert
            severity="error"
            sx={{
              mb: 2,
              borderRadius: 2,
              backgroundColor: 'rgba(127,29,29,0.14)',
              color: '#fecaca',
            }}
          >
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit} sx={{ mb: 2 }}>
          <TextField
            fullWidth
            margin="dense"
            label="Enter Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                backgroundColor: 'rgba(15,15,15,0.42)',
                '& fieldset': {
                  borderColor: 'rgba(245,197,66,0.18)',
                },
                '&:hover fieldset': {
                  borderColor: 'rgba(245,197,66,0.35)',
                },
                '&.Mui-focused fieldset': {
                  borderColor: 'rgba(245,197,66,0.65)',
                  boxShadow: '0 0 0 4px rgba(245,197,66,0.12)',
                },
              },
              '& input': {
                color: '#f5f5f5',
              },
            }}
            InputProps={{
              sx: {
                input: { color: '#f5f5f5' },
              },
            }}
            InputLabelProps={{
              sx: { color: 'rgba(255,255,255,0.6)' },
            }}
          />
          <TextField
            fullWidth
            margin="dense"
            label="Enter Password"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                backgroundColor: 'rgba(15,15,15,0.42)',
                '& fieldset': {
                  borderColor: 'rgba(245,197,66,0.18)',
                },
                '&:hover fieldset': {
                  borderColor: 'rgba(245,197,66,0.35)',
                },
                '&.Mui-focused fieldset': {
                  borderColor: 'rgba(245,197,66,0.65)',
                  boxShadow: '0 0 0 4px rgba(245,197,66,0.12)',
                },
              },
              '& input': {
                color: '#f5f5f5',
              },
            }}
            InputProps={{
              sx: {
                input: { color: '#f5f5f5' },
              },
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    edge="end"
                    onClick={() => setShowPassword((prev) => !prev)}
                    size="small"
                  >
                    {showPassword ? (
                      <VisibilityOff fontSize="small" />
                    ) : (
                      <Visibility fontSize="small" />
                    )}
                  </IconButton>
                </InputAdornment>
              ),
            }}
            InputLabelProps={{
              sx: { color: 'rgba(255,255,255,0.6)' },
            }}
          />

          <FormControlLabel
            control={
              <Checkbox
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                size="small"
              />
            }
            label="Remember Me"
            sx={{
              mt: 0.5,
              '& .MuiTypography-root': {
                color: 'rgba(255,255,255,0.75)',
              },
            }}
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            disabled={loading}
            sx={{
              mt: 1.5,
              mb: 1.5,
              background:
                'linear-gradient(140deg, #111111 0%, #050505 45%, #111111 100%)',
              color: '#f5c542',
              borderRadius: 999,
              py: 1.1,
              textTransform: 'none',
              fontWeight: 600,
              fontSize: 16,
              boxShadow:
                '0 14px 32px rgba(0,0,0,0.85), 0 0 18px rgba(245,197,66,0.32)',
              '&:hover': {
                background:
                  'linear-gradient(140deg, #101010 0%, #050505 45%, #101010 100%)',
              },
            }}
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </Button>
        </Box>

        <Button
          fullWidth
          variant="text"
          onClick={() => navigate('/signup')}
          sx={{
            py: 1.1,
            textTransform: 'none',
            fontWeight: 500,
            fontSize: 14,
            color: 'rgba(255,255,255,0.7)',
          }}
        >
          Create a new account
        </Button>

        <Typography
          variant="caption"
          sx={{
            mt: 2,
            textAlign: 'center',
            display: 'block',
            opacity: 0.8,
            color: 'rgba(255,255,255,0.6)',
          }}
        >
          Forgot password?
        </Typography>
      </Box>
    </Box>
  );
};

export default SignInPage;

