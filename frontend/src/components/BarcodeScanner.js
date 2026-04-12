import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import './BarcodeScanner.css';

const SCANNER_ID = 'bill-qr-scanner';

// Programmatic beep using Web Audio API (no audio file needed)
function playBeep() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc  = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'sine';
    osc.frequency.value = 1046; // C6 — crisp POS beep
    gain.gain.setValueAtTime(0.35, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.18);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.18);
  } catch (_) {}
}

/**
 * QR Scanner — modal overlay mode (like PhonePe scanner).
 * Opens on demand, auto-closes after successful scan with beep + green flash.
 *
 * Config rationale:
 *   formatsToSupport: [QR_CODE]     → fastest decode (1 format only)
 *   fps: 20                         → 20 frame checks/second
 *   qrbox: { 240, 240 }             → square matches QR code shape
 *   aspectRatio: 1.0                → portrait/square video (not landscape)
 */
function BarcodeScanner({ onScan, onClose }) {
  const scannerRef  = useRef(null);
  const lastScanRef = useRef({ text: '', time: 0 });
  const mountedRef  = useRef(true);
  const [scanStatus, setScanStatus] = useState('idle'); // idle | success

  useEffect(() => {
    mountedRef.current = true;

    const timer = setTimeout(async () => {
      const el = document.getElementById(SCANNER_ID);
      if (!el) return;

      const scanner = new Html5Qrcode(SCANNER_ID, {
        formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE],
        verbose: false,
      });
      scannerRef.current = scanner;

      try {
        await scanner.start(
          { facingMode: 'environment' },
          {
            fps: 20,
            qrbox: { width: 240, height: 240 },
            aspectRatio: 1.0,
            disableFlip: false,
          },
          (decodedText) => {
            if (!mountedRef.current) return;
            const now  = Date.now();
            const last = lastScanRef.current;
            if (decodedText === last.text && now - last.time < 2000) return;
            lastScanRef.current = { text: decodedText, time: now };

            // Success feedback: beep + green flash → auto-close
            playBeep();
            setScanStatus('success');
            setTimeout(() => {
              onScan(decodedText);
              onClose();
            }, 600); // show green 600ms then close
          },
          () => {}
        );
      } catch (err) {
        console.error('[QR] start() failed:', err);
      }
    }, 150);

    return () => {
      clearTimeout(timer);
      mountedRef.current = false;
      const s = scannerRef.current;
      if (s) {
        (s.isScanning ? s.stop().then(() => s.clear()) : Promise.resolve()).catch(() => {});
        scannerRef.current = null;
      }
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="bs-modal-backdrop" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="bs-modal-card">

        {/* Top bar */}
        <div className="bs-modal-header">
          <span className="bs-modal-title">📷 Scan QR Code</span>
          <button className="bs-modal-close" onClick={onClose}>✕</button>
        </div>

        {/* Camera viewport */}
        <div className="bs-viewport-wrap">
          <div id={SCANNER_ID} className="bs-viewport" />

          {/* Scan-guide overlay */}
          <div className="bs-overlay" aria-hidden="true">
            <div className={`bs-qrbox ${scanStatus === 'success' ? 'bs-qrbox--success' : ''}`}>
              <span className="bs-corner bs-tl" />
              <span className="bs-corner bs-tr" />
              <span className="bs-corner bs-bl" />
              <span className="bs-corner bs-br" />
              {/* Scan line animation */}
              {scanStatus !== 'success' && <div className="bs-scanline-anim" />}
              {/* Success checkmark */}
              {scanStatus === 'success' && <div className="bs-success-icon">✓</div>}
            </div>
          </div>
        </div>

        {/* Hint */}
        <p className="bs-modal-hint">
          {scanStatus === 'success' ? '✅ QR detected!' : 'Point camera at product QR code'}
        </p>
      </div>
    </div>
  );
}

export default BarcodeScanner;
