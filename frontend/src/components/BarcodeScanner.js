import React, { useEffect, useRef } from 'react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import './BarcodeScanner.css';

/**
 * QR-ONLY scanner — optimised for instant product adding.
 *
 * WHY QR IS FASTER:
 *  • Restricted to ONE format (QR_CODE) → decoder skips all barcode checks
 *  • QR data contains full product JSON → zero API calls
 *  • fps:20 → checks 20 frames/second for the QR pattern
 *
 * WHY THE OLD SCANNER FAILED FOR QR:
 *  • qrbox was wide & short (220×80) — great for barcodes, terrible for QR
 *  • aspectRatio:2.5 made the video landscape, pushing the square QR
 *    code outside the (too small) detection region
 *  • Multiple formats (EAN, CODE128) = slower per-frame processing
 *
 * FIX:
 *  • Square qrbox  (230×230) matches a QR code's shape
 *  • aspectRatio:1  → video is square/portrait, QR fills the scan region
 *  • formatsToSupport: [QR_CODE] only
 */

const SCANNER_ID = 'bill-qr-scanner';

function BarcodeScanner({ onScan, onClose }) {
  const scannerRef   = useRef(null);
  const lastScanRef  = useRef({ text: '', time: 0 });
  const mountedRef   = useRef(true);

  useEffect(() => {
    mountedRef.current = true;

    const timer = setTimeout(async () => {
      if (!document.getElementById(SCANNER_ID)) return;

      const scanner = new Html5Qrcode(SCANNER_ID, {
        formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE], // QR only
        verbose: false,
      });
      scannerRef.current = scanner;

      try {
        await scanner.start(
          { facingMode: 'environment' }, // rear camera
          {
            fps: 20,                         // high frame-rate
            qrbox: { width: 230, height: 230 }, // SQUARE — matches QR shape
            aspectRatio: 1.0,               // portrait/square video
            disableFlip: false,
          },
          (decodedText) => {
            if (!mountedRef.current) return;

            const now  = Date.now();
            const last = lastScanRef.current;
            // Debounce: same QR within 2 s is ignored
            if (decodedText === last.text && now - last.time < 2000) return;
            lastScanRef.current = { text: decodedText, time: now };

            console.log('[QR Scanner] decoded:', decodedText);
            onScan(decodedText);
          },
          () => {} // suppress per-frame parse errors (normal when no QR visible)
        );
      } catch (err) {
        console.error('[QR Scanner] start() failed:', err);
      }
    }, 120); // small delay ensures DOM element exists

    return () => {
      clearTimeout(timer);
      mountedRef.current = false;
      const s = scannerRef.current;
      if (s) {
        (s.isScanning ? s.stop().then(() => s.clear()) : Promise.resolve())
          .catch(() => {});
        scannerRef.current = null;
      }
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="bs-wrapper">
      {/* html5-qrcode mounts the <video> inside this div */}
      <div id={SCANNER_ID} className="bs-viewport" />

      {/* Square scan-guide overlay — matches QR shape */}
      <div className="bs-overlay" aria-hidden="true">
        <div className="bs-qrbox">
          {/* Corner brackets */}
          <span className="bs-corner bs-tl" />
          <span className="bs-corner bs-tr" />
          <span className="bs-corner bs-bl" />
          <span className="bs-corner bs-br" />
        </div>
      </div>

      {/* Hint */}
      <div className="bs-hint">Point camera at QR code</div>

      {/* Close button */}
      <button className="bs-close" onClick={onClose} aria-label="Close scanner">✕</button>
    </div>
  );
}

export default BarcodeScanner;
