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

/* ── Bill number helper ──────────────────────────────────────────── */
function getNextBillNumber() {
  const last = parseInt(localStorage.getItem('imsd_lastBillNo') || '1000', 10);
  const next  = last + 1;
  localStorage.setItem('imsd_lastBillNo', String(next));
  return next;
}

/* ── WhatsApp / SMS message builder ─────────────────────────────── */
function buildReceiptText(billData, settings, rich = false) {
  const b  = rich ? '*' : '';
  const nl = '\n';
  const div = settings.showDividers ? '─'.repeat(28) + nl : '';

  const shopName = settings.storeName || 'Billing Deep';

  // Line items: name (qty × price) = subtotal
  const itemLines = billData.items.map(item => {
    const sub = (item.quantity * item.price).toFixed(2);
    return `${item.name} (${item.quantity} × ₹${item.price.toFixed(2)}) = ₹${sub}`;
  }).join(nl);

  const subtotal = billData.items.reduce((s, i) => s + i.quantity * i.price, 0);

  return [
    `🧾 ${b}${shopName}${b}`,
    settings.address ? settings.address : null,
    settings.phone   ? `Ph: ${settings.phone}` : null,
    div,
    settings.showBillNumber ? `Bill No: #${billData.billNo}` : null,
    `Date: ${new Date(billData.date).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}`,
    `Payment: ${billData.paymentMethod}`,
    div,
    `${b}Items:${b}`,
    itemLines,
    div,
    settings.showSubtotal ? `Subtotal: ₹${subtotal.toFixed(2)}` : null,
    `${b}Total: ₹${billData.totalAmount.toFixed(2)}${b}`,
    settings.tagline ? nl + settings.tagline : null,
  ].filter(l => l !== null).join(nl);
}

/* ─────────────────────────────────────────────────────────────────── */
function BillPreviewDialog({ open, onClose, billData }) {
  const theme      = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const printRef   = React.useRef();

  const [settings, setSettings]       = React.useState({});
  const [billNo, setBillNo]           = React.useState(null);
  const [shareDialog, setShareDialog] = React.useState({ open: false, mode: null });
  const [phone, setPhone]             = React.useState('');
  const [phoneError, setPhoneError]   = React.useState('');

  React.useEffect(() => {
    if (!open) return;
    // Load settings
    try {
      const s = localStorage.getItem('billSettings');
      setSettings(s ? { showBillNumber: true, showSubtotal: true, showDividers: true, ...JSON.parse(s) } : { showBillNumber: true, showSubtotal: true, showDividers: true });
    } catch (_) {
      setSettings({ showBillNumber: true, showSubtotal: true, showDividers: true });
    }
    // Assign bill number once when dialog opens
    setBillNo(prev => prev ?? getNextBillNumber());
  }, [open]);

  const handlePrint = useReactToPrint({ content: () => printRef.current });

  const openShareDialog = (mode) => { setPhone(''); setPhoneError(''); setShareDialog({ open: true, mode }); };
  const closeShareDialog = () => setShareDialog({ open: false, mode: null });

  const handleSend = () => {
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length !== 10) { setPhoneError('Enter a valid 10-digit mobile number'); return; }
    const full = `91${cleaned}`;
    const enrichedBill = { ...billData, billNo: billNo ?? '—' };
    try { localStorage.setItem('imsd_lastBill', JSON.stringify(enrichedBill)); } catch (_) {}
    const msg = buildReceiptText(enrichedBill, settings, shareDialog.mode === 'whatsapp');
    if (shareDialog.mode === 'whatsapp') {
      window.location.href = `https://wa.me/${full}?text=${encodeURIComponent(msg)}`;
    } else {
      window.location.href = `sms:+${full}?body=${encodeURIComponent(msg)}`;
    }
    closeShareDialog();
  };

  if (!billData) return null;

  // Derived values
  const subtotal = billData.items.reduce((s, i) => s + i.quantity * i.price, 0);
  const dividerLine = settings.showDividers
    ? <Box sx={{ borderTop: '1px dashed #ccc', my: 1.5 }} />
    : null;

  /* ─────────────────────────────────────────────────────────────── */
  return (
    <>
      {/* ── Main receipt dialog ─────────────────────────────────── */}
      <Dialog open={open} onClose={onClose} fullScreen={fullScreen} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ position: 'relative', pb: 1 }}>
          <IconButton onClick={onClose} sx={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)' }}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h6" align="center" sx={{ fontWeight: 700 }}>
            🧾 Bill Receipt
          </Typography>
        </DialogTitle>

        <DialogContent sx={{ p: 0 }}>
          {/* Printable area */}
          <Box ref={printRef} sx={{ p: { xs: 2, sm: 3 }, fontFamily: "'Courier New', monospace" }}>

            {/* Shop header */}
            <Box sx={{ textAlign: 'center', mb: 1.5 }}>
              <Typography sx={{ fontWeight: 800, fontSize: 20, fontFamily: 'inherit', letterSpacing: 0.5 }}>
                {settings.storeName || 'Billing Deep'}
              </Typography>
              {settings.address && (
                <Typography sx={{ fontSize: 12, color: '#555', whiteSpace: 'pre-wrap', lineHeight: 1.4, fontFamily: 'inherit' }}>
                  {settings.address}
                </Typography>
              )}
              {settings.phone && (
                <Typography sx={{ fontSize: 12, color: '#555', fontFamily: 'inherit' }}>Ph: {settings.phone}</Typography>
              )}
              {settings.gstin && (
                <Typography sx={{ fontSize: 11, color: '#777', fontFamily: 'inherit' }}>GSTIN: {settings.gstin}</Typography>
              )}
            </Box>

            {settings.showDividers && <Divider sx={{ borderStyle: 'dashed', mb: 1.5 }} />}

            {/* Bill meta */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', mb: 1 }}>
              {settings.showBillNumber && billNo && (
                <Typography sx={{ fontWeight: 700, fontSize: 13, fontFamily: 'inherit' }}>
                  Bill No: <span style={{ color: '#005745' }}>#{billNo}</span>
                </Typography>
              )}
              <Typography sx={{ fontSize: 12, color: '#555', fontFamily: 'inherit', ml: 'auto' }}>
                {new Date(billData.date).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
              </Typography>
            </Box>

            {settings.showDividers && <Divider sx={{ borderStyle: 'dashed', mb: 1.5 }} />}

            {/* Column headers */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
              <Typography sx={{ fontSize: 11, fontWeight: 700, color: '#777', fontFamily: 'inherit', flex: 2 }}>ITEM</Typography>
              <Typography sx={{ fontSize: 11, fontWeight: 700, color: '#777', fontFamily: 'inherit', textAlign: 'right', flex: 1 }}>TOTAL</Typography>
            </Box>

            {/* Items */}
            {billData.items.map((item, i) => {
              const lineTotal = (item.quantity * item.price).toFixed(2);
              return (
                <Box key={i} sx={{ mb: 0.8 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <Typography sx={{ fontSize: 14, fontWeight: 600, fontFamily: 'inherit', flex: 2 }}>{item.name}</Typography>
                    <Typography sx={{ fontSize: 14, fontWeight: 700, fontFamily: 'inherit', color: '#005745', textAlign: 'right', flex: 1 }}>
                      ₹{lineTotal}
                    </Typography>
                  </Box>
                  <Typography sx={{ fontSize: 11, color: '#777', fontFamily: 'inherit', ml: 0.5 }}>
                    {item.quantity} × ₹{item.price.toFixed(2)}
                  </Typography>
                </Box>
              );
            })}

            {settings.showDividers && <Divider sx={{ borderStyle: 'dashed', mt: 1.5, mb: 1.5 }} />}

            {/* Subtotal + Total */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.4 }}>
              {settings.showSubtotal && (
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography sx={{ fontSize: 13, color: '#555', fontFamily: 'inherit' }}>Subtotal</Typography>
                  <Typography sx={{ fontSize: 13, color: '#555', fontFamily: 'inherit' }}>₹{subtotal.toFixed(2)}</Typography>
                </Box>
              )}
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography sx={{ fontSize: 16, fontWeight: 800, fontFamily: 'inherit' }}>TOTAL</Typography>
                <Typography sx={{ fontSize: 16, fontWeight: 800, fontFamily: 'inherit', color: '#005745' }}>
                  ₹{billData.totalAmount.toFixed(2)}
                </Typography>
              </Box>
            </Box>

            {/* Payment method */}
            <Box sx={{ mt: 1.5 }}>
              <Typography sx={{ fontSize: 12, color: '#666', fontFamily: 'inherit', textAlign: 'center' }}>
                Payment: {billData.paymentMethod}
              </Typography>
            </Box>

            {settings.showDividers && <Divider sx={{ borderStyle: 'dashed', mt: 1.5, mb: 1.5 }} />}

            {/* Tagline */}
            {settings.tagline && (
              <Typography sx={{ fontSize: 12, fontStyle: 'italic', color: '#666', fontFamily: 'inherit', textAlign: 'center' }}>
                {settings.tagline}
              </Typography>
            )}
          </Box>
        </DialogContent>

        <DialogActions sx={{ justifyContent: 'center', px: 2, pb: 2, gap: 1 }}>
          <IconButton onClick={handlePrint} color="primary" title="Print" sx={{ border: '1px solid #e0e0e0', borderRadius: 1.5 }}>
            <PrintIcon />
          </IconButton>
          <IconButton onClick={() => openShareDialog('whatsapp')} sx={{ color: '#25D366', border: '1px solid #e0e0e0', borderRadius: 1.5 }} title="Share on WhatsApp">
            <WhatsAppIcon />
          </IconButton>
          <IconButton onClick={() => openShareDialog('sms')} color="info" title="Send SMS" sx={{ border: '1px solid #e0e0e0', borderRadius: 1.5 }}>
            <SmsIcon />
          </IconButton>
        </DialogActions>
      </Dialog>

      {/* ── Phone number popup ──────────────────────────────────── */}
      <Dialog open={shareDialog.open} onClose={closeShareDialog} maxWidth="xs" fullWidth
        PaperProps={{ sx: { borderRadius: 3, p: 0.5 } }}>
        <DialogTitle sx={{ pb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
          {shareDialog.mode === 'whatsapp'
            ? <><WhatsAppIcon sx={{ color: '#25D366' }} /> Share via WhatsApp</>
            : <><SmsIcon color="info" /> Send via SMS</>}
        </DialogTitle>
        <DialogContent sx={{ pt: 0.5 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Enter the customer's mobile number to send the bill receipt.
          </Typography>
          <TextField
            fullWidth autoFocus label="Mobile Number" placeholder="e.g. 9876543210"
            value={phone}
            onChange={(e) => { setPhone(e.target.value.replace(/\D/g, '').slice(0, 10)); setPhoneError(''); }}
            error={!!phoneError}
            helperText={phoneError || '+91 prefix added automatically'}
            inputProps={{ inputMode: 'numeric', maxLength: 10, style: { fontSize: 16, letterSpacing: 2 } }}
            InputProps={{
              startAdornment: <Typography sx={{ mr: 0.5, color: '#555', fontSize: 15, userSelect: 'none' }}>+91</Typography>,
            }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
          <Button onClick={closeShareDialog} variant="outlined" sx={{ flex: 1, borderRadius: 2, textTransform: 'none' }}>
            Cancel
          </Button>
          <Button onClick={handleSend} variant="contained" endIcon={<SendIcon />}
            sx={{ flex: 1, borderRadius: 2, textTransform: 'none', fontWeight: 700,
              bgcolor: shareDialog.mode === 'whatsapp' ? '#25D366' : '#1976d2',
              '&:hover': { bgcolor: shareDialog.mode === 'whatsapp' ? '#1ebe5d' : '#1565c0' },
            }}>
            Send
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default BillPreviewDialog;