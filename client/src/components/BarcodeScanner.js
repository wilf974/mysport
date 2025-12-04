import React, { useEffect, useRef, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import './BarcodeScanner.css';

function BarcodeScanner({ onBarcodeDetected, onCancel }) {
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState('');
  const [lastDetected, setLastDetected] = useState('');
  const scannerRef = useRef(null);
  const callbackRef = useRef(onBarcodeDetected);

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
        scanner = new Html5QrcodeScanner('barcode-scanner', {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
          showTorchButtonIfSupported: true
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

        scanner.render(onScanSuccess, onScanError);
      } catch (err) {
        if (isMounted) {
          setError('Erreur lors de l\'initialisation du scanner.');
          console.error('Scanner initialization error:', err);
          setIsScanning(false);
        }
      }
    };

    initializeScanner();

    return () => {
      isMounted = false;
      if (scanner) {
        try {
          scanner.clear().catch((err) => {
            // Suppress "Cannot clear while scan is ongoing" error during cleanup
            if (!err.message.includes('Cannot clear while scan is ongoing')) {
              console.error('Error clearing scanner:', err);
            }
          });
        } catch (err) {
          // Suppress synchronous errors during cleanup
          console.debug('Error during scanner cleanup:', err);
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
          {error && <div className="scanner-error">{error}</div>}
          <div className="scanner-info">
            Pointez votre caméra sur le code-barres
          </div>
          <button
            className="btn-stop-scanner"
            onClick={stopScanning}
          >
            ✕ Arrêter le scan
          </button>
        </div>
      )}
    </div>
  );
}

export default BarcodeScanner;
