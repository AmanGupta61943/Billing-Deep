import React from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, Typography, Box, Divider, IconButton,
  useTheme, useMediaQuery, TextField,
} from '@mui/material';
import PrintIcon     from '@mui/icons-material/Print';
import WhatsAppIcon  from '@mui/icons-material/WhatsApp';
import SmsIcon       from '@mui/icons-material/Sms';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SendIcon      from '@mui/icons-material/Send';
import { useReactToPrint } from 'react-to-print';

// Build the receipt text shared via WhatsApp / SMS
function buildReceiptText(billData, settings, rich = false) {
  const b  = rich ? '*' : '';   // bold in WhatsApp markdown
  const nl = '\n';

  const header = settings.storeName
    ? `${b}${settings.storeName}${b}${nl}`
    : `${b}Billing Deep${b}${nl}`;

  const items = billData.items.map(item =>
    `${item.name} x${item.quantity}  ₹${(item.quantity * item.price).toFixed(2)}`
  ).join(nl);

  return (
    header +
    `Date: ${new Date(billData.date).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}${nl}` +
    `Payment: ${billData.paymentMethod}${nl}` +
    `${nl}${b}Items:${b}${nl}` +
    `${items}${nl}` +
    `${nl}${b}Total: ₹${billData.totalAmount.toFixed(2)}${b}` +
    (settings.tagline ? `${nl}${nl}${settings.tagline}` : '')
  );
}

function BillPreviewDialog({ open, onClose, billData }) {
  const theme       = useTheme();
  const fullScreen  = useMediaQuery(theme.breakpoints.down('sm'));
  const printRef    = React.useRef();
  const [settings, setSettings]       = React.useState({});

  // Share popup state
  const [shareDialog, setShareDialog] = React.useState({ open: false, mode: null }); // mode: 'whatsapp' | 'sms'
  const [phone, setPhone]             = React.useState('');
  const [phoneError, setPhoneError]   = React.useState('');

  React.useEffect(() => {
    if (open) {
      const saved = localStorage.getItem('billSettings');
      if (saved) {
        try { setSettings(JSON.parse(saved)); } catch (_) {}
      }
    }
  }, [open]);

  const handlePrint = useReactToPrint({ content: () => printRef.current });

  // Open popup and remember which channel was chosen
  const openShareDialog = (mode) => {
    setPhone('');
    setPhoneError('');
    setShareDialog({ open: true, mode });
  };

  const closeShareDialog = () => setShareDialog({ open: false, mode: null });

  const handleSend = () => {
    // Validate 10-digit Indian mobile number
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length !== 10) {
      setPhoneError('Enter a valid 10-digit mobile number');
      return;
    }
    const full = `91${cleaned}`;

    if (shareDialog.mode === 'whatsapp') {
      const msg = buildReceiptText(billData, settings, true);
      window.open(`https://wa.me/${full}?text=${encodeURIComponent(msg)}`, '_blank');
    } else {
      const msg = buildReceiptText(billData, settings, false);
      window.open(`sms:+${full}?body=${encodeURIComponent(msg)}`, '_blank');
    }

    closeShareDialog();
  };

  // ─────────────────────────────────────────────────────────────────────
  return (
    <>
      {/* ── Main bill preview dialog ───────────────────────────────── */}
      <Dialog open={open} onClose={onClose} fullScreen={fullScreen} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ position: 'relative' }}>
          <IconButton onClick={onClose} sx={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)' }}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h6" align="center">Bill Receipt</Typography>
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
                <Typography variant="body2" sx={{ color: '#555', mt: 0.5 }}>Ph: {settings.phone}</Typography>
              )}
              {settings.gstin && (
                <Typography variant="body2" sx={{ color: '#555' }}>GSTIN: {settings.gstin}</Typography>
              )}
              <Typography variant="body2" sx={{ mt: 1, fontWeight: 600 }}>
                Date: {new Date(billData.date).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
              </Typography>
            </Box>

            <Divider sx={{ my: 2 }} />

            {/* Items */}
            <Box sx={{ mb: 2 }}>
              {billData.items.map((item, i) => (
                <Box key={i} sx={{ mb: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body1">{item.name}</Typography>
                    <Typography variant="body1">₹{item.price.toFixed(2)}</Typography>
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

            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="h6">Total Amount</Typography>
              <Typography variant="h6">₹{billData.totalAmount.toFixed(2)}</Typography>
            </Box>

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

        <DialogActions sx={{ justifyContent: 'center', p: 2, gap: 1 }}>
          <IconButton onClick={handlePrint} color="primary" title="Print">
            <PrintIcon />
          </IconButton>
          <IconButton onClick={() => openShareDialog('whatsapp')} sx={{ color: '#25D366' }} title="Share on WhatsApp">
            <WhatsAppIcon />
          </IconButton>
          <IconButton onClick={() => openShareDialog('sms')} color="info" title="Send SMS">
            <SmsIcon />
          </IconButton>
        </DialogActions>
      </Dialog>

      {/* ── Phone number popup ─────────────────────────────────────── */}
      <Dialog
        open={shareDialog.open}
        onClose={closeShareDialog}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3, p: 0.5 } }}
      >
        <DialogTitle sx={{ pb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
          {shareDialog.mode === 'whatsapp'
            ? <><WhatsAppIcon sx={{ color: '#25D366' }} /> Share via WhatsApp</>
            : <><SmsIcon color="info" /> Send via SMS</>
          }
        </DialogTitle>

        <DialogContent sx={{ pt: 0.5 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Enter the customer's mobile number to send the bill receipt.
          </Typography>
          <TextField
            fullWidth
            autoFocus
            label="Mobile Number"
            placeholder="e.g. 9876543210"
            value={phone}
            onChange={(e) => {
              setPhone(e.target.value.replace(/\D/g, '').slice(0, 10));
              setPhoneError('');
            }}
            error={!!phoneError}
            helperText={phoneError || '+91 prefix will be added automatically'}
            inputProps={{
              inputMode: 'numeric',
              pattern: '[0-9]*',
              maxLength: 10,
              style: { fontSize: 16, letterSpacing: 2 },
            }}
            InputProps={{
              startAdornment: (
                <Typography sx={{ mr: 0.5, color: '#555', fontSize: 15, userSelect: 'none' }}>+91</Typography>
              ),
            }}
          />
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
          <Button onClick={closeShareDialog} variant="outlined" sx={{ flex: 1, borderRadius: 2, textTransform: 'none' }}>
            Cancel
          </Button>
          <Button
            onClick={handleSend}
            variant="contained"
            endIcon={<SendIcon />}
            sx={{
              flex: 1, borderRadius: 2, textTransform: 'none', fontWeight: 700,
              bgcolor: shareDialog.mode === 'whatsapp' ? '#25D366' : '#1976d2',
              '&:hover': { bgcolor: shareDialog.mode === 'whatsapp' ? '#1ebe5d' : '#1565c0' },
            }}
          >
            Send
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default BillPreviewDialog;