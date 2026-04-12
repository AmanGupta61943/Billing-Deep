import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Divider,
  IconButton,
  useTheme,
  useMediaQuery
} from '@mui/material';
import PrintIcon from '@mui/icons-material/Print';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import SmsIcon from '@mui/icons-material/Sms';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useReactToPrint } from 'react-to-print';

function BillPreviewDialog({ open, onClose, billData }) {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const printRef = React.useRef();
  const [settings, setSettings] = React.useState({});

  React.useEffect(() => {
    if (open) {
      const savedConf = localStorage.getItem('billSettings');
      if (savedConf) {
        try {
          setSettings(JSON.parse(savedConf));
        } catch(e) {}
      }
    }
  }, [open]);

  const handlePrint = useReactToPrint({
    content: () => printRef.current,
  });

  const handleWhatsApp = () => {
    // Format bill details for WhatsApp
    const message = `*Bill Details*\n\n` +
      `Date: ${new Date(billData.date).toLocaleString()}\n` +
      `Payment Method: ${billData.paymentMethod}\n\n` +
      `*Items:*\n` +
      billData.items.map(item => 
        `${item.name}\n` +
        `Quantity: ${item.quantity}\n` +
        `Price: ₹${item.price.toFixed(2)}\n` +
        `Subtotal: ₹${(item.quantity * item.price).toFixed(2)}\n`
      ).join('\n') +
      `\n*Total Amount: ₹${billData.totalAmount.toFixed(2)}*`;

    // Create WhatsApp URL
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleSMS = () => {
    // Format bill details for SMS
    const message = `Bill Details\n\n` +
      `Date: ${new Date(billData.date).toLocaleString()}\n` +
      `Payment: ${billData.paymentMethod}\n\n` +
      `Items:\n` +
      billData.items.map(item => 
        `${item.name} x${item.quantity} = ₹${(item.quantity * item.price).toFixed(2)}`
      ).join('\n') +
      `\nTotal: ₹${billData.totalAmount.toFixed(2)}`;

    // Create SMS URL
    const smsUrl = `sms:?body=${encodeURIComponent(message)}`;
    window.open(smsUrl, '_blank');
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullScreen={fullScreen}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle sx={{ position: 'relative' }}>
        <IconButton
          onClick={onClose}
          sx={{
            position: 'absolute',
            left: 8,
            top: '50%',
            transform: 'translateY(-50%)'
          }}
        >
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h6" align="center">
          Bill Receipt
        </Typography>
      </DialogTitle>
      <DialogContent>
        <Box ref={printRef} sx={{ p: 2 }}>
          {/* Header */}
          <Box sx={{ textAlign: 'center', mb: 2 }}>
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
              {settings.storeName || 'Billing Deep'}
            </Typography>
            {settings.address && (
              <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', color: '#555', lineHeight: 1.2 }}>
                {settings.address}
              </Typography>
            )}
            {settings.phone && (
              <Typography variant="body2" sx={{ color: '#555', mt: 0.5 }}>
                Ph: {settings.phone}
              </Typography>
            )}
            {settings.gstin && (
              <Typography variant="body2" sx={{ color: '#555' }}>
                GSTIN: {settings.gstin}
              </Typography>
            )}
            <Typography variant="body2" sx={{ mt: 1, fontWeight: 600 }}>
              Date: {new Date(billData.date).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
            </Typography>
          </Box>

          <Divider sx={{ my: 2 }} />

          {/* Items */}
          <Box sx={{ mb: 2 }}>
            {billData.items.map((item, index) => (
              <Box key={index} sx={{ mb: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body1">
                    {item.name}
                  </Typography>
                  <Typography variant="body1">
                    ₹{item.price.toFixed(2)}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', ml: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    {item.quantity} x ₹{item.price.toFixed(2)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    ₹{(item.quantity * item.price).toFixed(2)}
                  </Typography>
                </Box>
              </Box>
            ))}
          </Box>

          <Divider sx={{ my: 2 }} />

          {/* Total */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h6">Total Amount</Typography>
            <Typography variant="h6">₹{billData.totalAmount.toFixed(2)}</Typography>
          </Box>

          {/* Payment Method */}
          <Box sx={{ textAlign: 'center', mt: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Payment Method: {billData.paymentMethod}
            </Typography>
          </Box>
          {settings.tagline && (
            <Box sx={{ textAlign: 'center', mt: 2 }}>
              <Typography variant="body2" sx={{ fontStyle: 'italic', color: '#666' }}>
                {settings.tagline}
              </Typography>
            </Box>
          )}
        </Box>
      </DialogContent>
      <DialogActions sx={{ justifyContent: 'center', p: 2 }}>
        <IconButton onClick={handlePrint} color="primary" title="Print">
          <PrintIcon />
        </IconButton>
        <IconButton onClick={handleWhatsApp} color="success" title="Share on WhatsApp">
          <WhatsAppIcon />
        </IconButton>
        <IconButton onClick={handleSMS} color="info" title="Send SMS">
          <SmsIcon />
        </IconButton>
      </DialogActions>
    </Dialog>
  );
}

export default BillPreviewDialog; 