import React, { useState } from 'react';
import { Container, Typography, Paper, Box, IconButton, Button, Alert } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PrintIcon from '@mui/icons-material/Print';
import BluetoothIcon from '@mui/icons-material/Bluetooth';
import BluetoothConnectedIcon from '@mui/icons-material/BluetoothConnected';
import BluetoothDisabledIcon from '@mui/icons-material/BluetoothDisabled';
import { useNavigate } from 'react-router-dom';

function PrinterConnection() {
  const navigate = useNavigate();
  const [device, setDevice] = useState(null);
  const [error, setError] = useState('');
  const [status, setStatus] = useState('Disconnected');

  const connectBluetoothPrinter = async () => {
    if (!navigator.bluetooth) {
      setError("Web Bluetooth API is not available on this browser or your app is not over HTTPS.");
      return;
    }
    setError('');
    setStatus('Scanning...');
    try {
      const selectedDevice = await navigator.bluetooth.requestDevice({
        acceptAllDevices: true,
        optionalServices: ['000018f0-0000-1000-8000-00805f9b34fb'] // Common dummy generic serial/printer service
      });
      
      setDevice(selectedDevice);
      setStatus('Connecting...');

      const server = await selectedDevice.gatt.connect();
      setStatus(`Connected to ${selectedDevice.name || 'Unknown Printer'}`);
      
      // Keep track of disconnects
      selectedDevice.addEventListener('gattserverdisconnected', () => {
        setDevice(null);
        setStatus('Disconnected');
        setError('Device disconnected.');
      });

    } catch (err) {
      console.error(err);
      setStatus('Disconnected');
      setError('Bluetooth connection failed: ' + err.message);
    }
  };

  const disconnectPrinter = () => {
    if (device && device.gatt.connected) {
      device.gatt.disconnect();
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 2, pb: 13, px: { xs: 1.5, sm: 2 } }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <IconButton onClick={() => navigate(-1)} sx={{ mr: 1, bgcolor: '#f5f5f5' }}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h5" sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
          <PrintIcon />
          Printer Connection
        </Typography>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{error}</Alert>}

      <Paper sx={{ p: 4, borderRadius: 3, border: '1px solid #ebebeb', boxShadow: '0 8px 24px rgba(0,0,0,0.04)', textAlign: 'center' }}>
        <Box sx={{ mb: 3 }}>
           {status === 'Disconnected' ? (
             <BluetoothDisabledIcon sx={{ fontSize: 80, color: '#ccc' }} />
           ) : (
             <BluetoothConnectedIcon sx={{ fontSize: 80, color: '#4caf50' }} />
           )}
        </Box>
        
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
          Status: {status}
        </Typography>
        
        <Typography variant="body2" sx={{ color: '#666', mb: 4, px: 2 }}>
          Pair a wireless Bluetooth receipt printer directly to your browser to print bills on the go.
        </Typography>

        {device ? (
          <Button 
            variant="outlined" 
            color="error" 
            fullWidth 
            onClick={disconnectPrinter}
            sx={{ py: 1.5, borderRadius: 2, fontWeight: 700, textTransform: 'none', fontSize: 16 }}
          >
            Disconnect Printer
          </Button>
        ) : (
          <Button 
            variant="contained" 
            fullWidth 
            onClick={connectBluetoothPrinter}
            startIcon={<BluetoothIcon />}
            sx={{ py: 1.5, borderRadius: 2, fontWeight: 700, textTransform: 'none', fontSize: 16 }}
          >
            Connect Bluetooth Printer
          </Button>
        )}
      </Paper>
    </Container>
  );
}

export default PrinterConnection;
