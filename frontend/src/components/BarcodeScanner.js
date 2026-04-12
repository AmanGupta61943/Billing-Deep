import React, { useEffect, useRef } from 'react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import './BarcodeScanner.css';

/**
 * WHY QR IS FASTER THAN BARCODE:
 * ────────────────────────────────────────────────────────────────────
 * Barcode:  Scan → API call → DB lookup → response → addItemToBill
 *           Delay: 300ms–2s depending on network + Render cold-start
 *
 * QR:       Scan → JSON.parse(qrText) → addItemToBill
 *           Delay: ~0ms  (zero network round-trips)
 *
 * How it mimics PhonePe / Paytm:
 *   Those apps embed all payment data inside the QR code itself.
 *   The app never hits the network — it just reads the QR locally.
 *   We do the same: embed product data in the QR, parse it instantly.
 *
 * Fallback for plain barcodes:
 *   If the scanned text is NOT valid JSON → treat as a barcode →
 *   call the backend API as before. This keeps legacy stock compatible.
 * ────────────────────────────────────────────────────────────────────
 *
 * QR DATA FORMAT (generated at stock add/edit time):
 * {
 *   "_id": "mongo-object-id",
 *   "id":   "mongo-object-id",   // alias
 *   "name": "Product Name",
 *   "cost": 80,                  // selling price shown on bill
 *   "price": 100,                // MRP (optional)
 *   "barcode": "123456789"       // optional
 * }
 */

const SCANNER_ID = 'bill-barcode-scanner';

// Only scan QR codes + the two most common 1D barcode formats.
// Restricting formats makes the decoder significantly faster.
const FORMATS = [
  Html5QrcodeSupportedFormats.QR_CODE,
  Html5QrcodeSupportedFormats.EAN_13,
  Html5QrcodeSupportedFormats.EAN_8,
  Html5QrcodeSupportedFormats.CODE_128,
  Html5QrcodeSupportedFormats.UPC_A,
  Html5QrcodeSupportedFormats.UPC_E,
];

function BarcodeScanner({ onScan, onClose }) {
  const html5QrRef = useRef(null);
  const lastScanRef = useRef({ text: '', time: 0 });
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;

    const timer = setTimeout(async () => {
      if (!document.getElementById(SCANNER_ID)) return;

      const scanner = new Html5Qrcode(SCANNER_ID, {
        formatsToSupport: FORMATS,
        verbose: false,
      });
      html5QrRef.current = scanner;

      try {
        await scanner.start(
          { facingMode: 'environment' },
          {
            fps: 15,
            qrbox: { width: 220, height: 80 },
            aspectRatio: 2.5,
            disableFlip: false,
          },
          (decodedText) => {
            if (!isMountedRef.current) return;
            const now = Date.now();
            const { text, time } = lastScanRef.current;
            if (decodedText === text && now - time < 2000) return; // debounce
            lastScanRef.current = { text: decodedText, time: now };
            console.log('[Scanner] decoded:', decodedText);
            onScan(decodedText);
          },
          () => {} // suppress per-frame parse errors
        );
      } catch (err) {
        console.error('[Scanner] start() failed:', err);
      }
    }, 120);

    return () => {
      clearTimeout(timer);
      isMountedRef.current = false;
      const scanner = html5QrRef.current;
      if (scanner) {
        (scanner.isScanning
          ? scanner.stop().then(() => scanner.clear())
          : Promise.resolve()
        ).catch(() => {});
        html5QrRef.current = null;
      }
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="bs-wrapper">
      <div id={SCANNER_ID} className="bs-viewport" />

      {/* Scan-line overlay */}
      <div className="bs-overlay" aria-hidden="true">
        <div className="bs-scanline" />
      </div>

      <div className="bs-hint">Align QR / barcode inside the box</div>

      <button
        className="bs-close"
        onClick={onClose}
        aria-label="Close scanner"
      >
        ✕
      </button>
    </div>
  );
}

export default BarcodeScanner;
