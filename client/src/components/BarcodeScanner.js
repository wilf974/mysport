import React, { useEffect, useRef, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import './BarcodeScanner.css';

function BarcodeScanner({ onBarcodeDetected, onCancel }) {
  const [isScanning, setIsScanning] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const [error, setError] = useState('');
  const [lastDetected, setLastDetected] = useState('');
  const scannerRef = useRef(null);
  const callbackRef = useRef(onBarcodeDetected);

  // Handle unhandled promise rejections for media stream errors
  useEffect(() => {
    const handleUnhandledRejection = (event) => {
      const reason = event.reason;
      const msg = reason?.message || String(reason) || '';

      // Suppress media stream abort errors
      if (reason instanceof DOMException ||
          msg.includes('aborted') ||
          msg.includes('NotAllowedError') ||
          msg.includes('NotFoundError') ||
          msg.includes('NotReadableError')) {
        event.preventDefault();
      }
    };

    const handleError = (event) => {
      const msg = event?.message || String(event) || '';
      if (msg.includes('aborted') || msg.includes('media')) {
        event.preventDefault();
      }
    };

    // Add listeners to catch media stream errors at different phases
    window.addEventListener('unhandledrejection', handleUnhandledRejection, true);
    window.addEventListener('error', handleError, true);

    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection, true);
      window.removeEventListener('error', handleError, true);
    };
  }, []);

  // Update callback ref when prop changes
  useEffect(() => {
    callbackRef.current = onBarcodeDetected;
  }, [onBarcodeDetected]);

  useEffect(() => {
    if (!isScanning) return;

    let isMounted = true;
    let scanner = null;

    const initializeScanner = async () => {
      try {
        if (isMounted) setIsInitializing(true);

        // Verify container element exists
        const container = document.getElementById('barcode-scanner');
        if (!container) {
          throw new Error('Scanner container not found');
        }

        scanner = new Html5QrcodeScanner('barcode-scanner', {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
          showTorchButtonIfSupported: true,
          rememberLastUsedCamera: false
        }, false);

        scannerRef.current = scanner;

        const onScanSuccess = (decodedText, decodedResult) => {
          // Filter out duplicate rapid detections
          if (decodedText !== lastDetected) {
            setLastDetected(decodedText);
            setError('');

            // Extract only numbers for barcode processing
            const barcodeMatch = decodedText.match(/\d{8,}/);
            if (barcodeMatch) {
              const barcode = barcodeMatch[0];
              if (callbackRef.current) {
                callbackRef.current(barcode);
              }
              stopScanning();
            } else if (decodedText.length >= 8) {
              // If it's already numeric enough
              if (callbackRef.current) {
                callbackRef.current(decodedText);
              }
              stopScanning();
            }
          }
        };

        const onScanError = (errorMessage) => {
          // Don't show continuous error messages during scanning
          if (errorMessage && !errorMessage.includes('NotFoundException')) {
            console.debug('Scan error:', errorMessage);
          }
        };

        try {
          const renderResult = scanner.render(onScanSuccess, onScanError);

          // If render returns a promise, handle any rejections
          if (renderResult && typeof renderResult.catch === 'function') {
            renderResult.catch((err) => {
              if (isMounted) {
                const msg = err?.message || String(err) || '';
                // Suppress expected media stream errors by returning a resolved promise
                if (msg.includes('aborted') || msg.includes('NotAllowedError') ||
                    msg.includes('NotReadableError') || msg.includes('NotFoundError')) {
                  console.debug('Media stream closed normally:', msg);
                  return Promise.resolve(); // Suppress the error
                }
                setError(`Erreur lors du scan: ${msg}`);
                console.error('Scanner render promise error:', err);
              }
              return Promise.resolve(); // Always resolve to prevent propagation
            });
          }

          console.log('Scanner rendering started');
        } catch (renderErr) {
          console.error('Scanner render error:', renderErr);
          throw new Error(`Failed to start camera: ${renderErr?.message || 'Unknown error'}`);
        }

        if (isMounted) setIsInitializing(false);
      } catch (err) {
        if (isMounted) {
          const errorMsg = err?.message || 'Impossible d\'initialiser le scanner';
          setError(`${errorMsg}. Vérifiez que vous avez donné les permissions d'accès à la caméra.`);
          console.error('Scanner initialization error:', err);
          setIsScanning(false);
          setIsInitializing(false);
        }
      }
    };

    initializeScanner();

    return () => {
      isMounted = false;
      if (scanner) {
        try {
          // Give scanner time to finish any pending operations before clearing
          scanner.clear()
            .catch((err) => {
              // Suppress expected errors during cleanup
              if (err instanceof DOMException) {
                // Media stream abort is expected when stopping
                return;
              }
              const errorMessage = err?.message || String(err) || '';
              if (!errorMessage.includes('Cannot clear while scan is ongoing') &&
                  !errorMessage.includes('aborted')) {
                console.debug('Scanner cleanup:', errorMessage);
              }
            });
        } catch (syncErr) {
          // Suppress synchronous errors during cleanup
          if (!(syncErr instanceof DOMException)) {
            console.debug('Cleanup error:', syncErr);
          }
        }
      }
    };
  }, [isScanning, lastDetected]);

  const stopScanning = () => {
    setIsScanning(false);
    // No need to clear here - the cleanup function will handle it
  };

  return (
    <div className="barcode-scanner-wrapper">
      {!isScanning ? (
        <div className="scanner-controls">
          <button
            className="btn-start-scanner"
            onClick={() => {
              setIsScanning(true);
              setError('');
              setLastDetected('');
            }}
          >
            📷 Activer le scanner
          </button>
          <p className="scanner-help">
            Cliquez pour ouvrir votre caméra et scanner un code-barres
          </p>
        </div>
      ) : (
        <div className="scanner-active">
          <div id="barcode-scanner" className="scanner-container"></div>
          {isInitializing && (
            <div className="scanner-info">
              ⏳ Initialisation du scanner...
            </div>
          )}
          {error && <div className="scanner-error">{error}</div>}
          {!error && !isInitializing && (
            <div className="scanner-info">
              Pointez votre caméra sur le code-barres
            </div>
          )}
          <button
            className="btn-stop-scanner"
            onClick={stopScanning}
            disabled={isInitializing}
          >
            ✕ Arrêter le scan
          </button>
        </div>
      )}
    </div>
  );
}

export default BarcodeScanner;
