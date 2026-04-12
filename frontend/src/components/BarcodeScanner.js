import React, { useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Box, IconButton, Typography } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

const SCANNER_ID = 'bill-barcode-scanner';

function BarcodeScanner({ onScan, onClose }) {
  const html5QrCodeRef = useRef(null);
  const lastScanRef = useRef({ text: '', time: 0 });

  useEffect(() => {
    // Wait one tick for the div to be in the DOM
    const timerId = setTimeout(() => {
      const el = document.getElementById(SCANNER_ID);
      if (!el) {
        console.error('[BarcodeScanner] Container div not found in DOM');
        return;
      }

      const scanner = new Html5Qrcode(SCANNER_ID);
      html5QrCodeRef.current = scanner;

      scanner.start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: { width: 250, height: 100 },  // wide box for 1D barcodes
          aspectRatio: 2.25,
        },
        (decodedText) => {
          const now = Date.now();
          const last = lastScanRef.current;

          // Debounce: ignore same barcode scanned within 2 seconds
          if (decodedText === last.text && now - last.time < 2000) return;

          lastScanRef.current = { text: decodedText, time: now };
          console.log('[BarcodeScanner] Scanned:', decodedText);
          onScan(decodedText);
        },
        () => {
          // Suppress frame-level decode errors — these are normal when no barcode is in frame
        }
      ).catch((err) => {
        console.error('[BarcodeScanner] Failed to start scanner:', err);
      });
    }, 100);

    return () => {
      clearTimeout(timerId);
      const scanner = html5QrCodeRef.current;
      if (scanner) {
        scanner.isScanning &&
          scanner.stop()
            .then(() => scanner.clear())
            .catch((e) => console.warn('[BarcodeScanner] Stop error:', e));
        html5QrCodeRef.current = null;
      }
    };
  }, []); // runs once on mount

  return (
    <Box
      sx={{
        position: 'relative',
        width: '100%',
        bgcolor: '#111',
        borderRadius: 2,
        overflow: 'hidden',
      }}
    >
      {/* Scanner viewport */}
      <div
        id={SCANNER_ID}
        style={{ width: '100%' }}
      />

      {/* Scan guide overlay */}
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '72%',
          height: 56,
          border: '2px solid #ffeb3b',
          borderRadius: 1,
          pointerEvents: 'none',
          zIndex: 10,
          '&::before, &::after': {
            content: '""',
            position: 'absolute',
            width: 18,
            height: 18,
            border: '3px solid #ffeb3b',
          },
          '&::before': { top: -3, left: -3, borderRight: 'none', borderBottom: 'none' },
          '&::after': { bottom: -3, right: -3, borderLeft: 'none', borderTop: 'none' },
        }}
      />

      {/* Hint text */}
      <Box
        sx={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          bgcolor: 'rgba(0,0,0,0.55)',
          py: 0.5,
          textAlign: 'center',
          zIndex: 10,
        }}
      >
        <Typography variant="caption" sx={{ color: '#ffe', letterSpacing: 0.4 }}>
          Align barcode inside the box
        </Typography>
      </Box>

      {/* Close button */}
      <IconButton
        size="small"
        onClick={onClose}
        sx={{
          position: 'absolute',
          top: 6,
          right: 6,
          zIndex: 20,
          bgcolor: 'rgba(255,255,255,0.75)',
          '&:hover': { bgcolor: 'rgba(255,255,255,0.95)' },
        }}
      >
        <CloseIcon fontSize="small" />
      </IconButton>
    </Box>
  );
}

export default BarcodeScanner;
