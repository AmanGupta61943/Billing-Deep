import React, { useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import './BarcodeScanner.css';

/**
 * WHY THE FULLSCREEN HAPPENED:
 * html5-qrcode injects a <video> element and wrapper <div>s with their own
 * inline width/height styles (e.g. width: 640px) that overflow any parent
 * container. Without `overflow: hidden` + explicit height on the parent,
 * the browser lets the video expand to its natural camera resolution.
 *
 * HOW THIS FIX PREVENTS IT:
 * 1. The outer wrapper has a fixed height (150px) + overflow: hidden → hard clips
 * 2. BarcodeScanner.css overrides the library's injected inline styles
 * 3. aspectRatio: 2.5 + qrbox makes the library request a wide-short video frame
 */

const SCANNER_ID = 'bill-barcode-scanner';

function BarcodeScanner({ onScan, onClose }) {
  const html5QrRef = useRef(null);
  const lastScanRef = useRef({ text: '', time: 0 });
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;

    // Small delay to ensure the div is committed to DOM
    const timer = setTimeout(async () => {
      if (!document.getElementById(SCANNER_ID)) return;

      const scanner = new Html5Qrcode(SCANNER_ID, { verbose: false });
      html5QrRef.current = scanner;

      try {
        await scanner.start(
          { facingMode: 'environment' },
          {
            fps: 12,
            // Wide rectangle — optimised for 1D barcodes
            qrbox: { width: 220, height: 80 },
            aspectRatio: 2.5,
            disableFlip: false,
          },
          (decodedText) => {
            if (!isMountedRef.current) return;
            const now = Date.now();
            const { text, time } = lastScanRef.current;
            // Debounce: same code within 2 s is ignored
            if (decodedText === text && now - time < 2000) return;
            lastScanRef.current = { text: decodedText, time: now };
            console.log('[BarcodeScanner] ✓ decoded:', decodedText);
            onScan(decodedText);
          },
          () => {
            // Frame-level parse errors are normal (no barcode in frame yet) — suppress
          }
        );
      } catch (err) {
        console.error('[BarcodeScanner] start() failed:', err);
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
      {/* The library mounts the <video> inside this div */}
      <div id={SCANNER_ID} className="bs-viewport" />

      {/* Yellow scan-line guide overlay */}
      <div className="bs-overlay" aria-hidden="true">
        <div className="bs-scanline" />
      </div>

      {/* Hint */}
      <div className="bs-hint">Align barcode in the box</div>

      {/* Close button */}
      <button
        className="bs-close"
        onClick={onClose}
        aria-label="Close scanner"
        title="Close scanner"
      >
        ✕
      </button>
    </div>
  );
}

export default BarcodeScanner;
