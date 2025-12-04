import React, { useEffect, useRef, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import './BarcodeScanner.css';

function BarcodeScanner({ onBarcodeDetected, onCancel }) {
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState('');
  const [lastDetected, setLastDetected] = useState('');
  const scannerRef = useRef(null);

  useEffect(() => {
    if (!isScanning) return;

    const scanner = new Html5QrcodeScanner('barcode-scanner', {
      fps: 10,
      qrbox: { width: 250, height: 250 },
      aspectRatio: 1.0,
      showTorchButtonIfSupported: true,
      supportedScanTypes: [
        // Barcode types
        'UPC_A',
        'UPC_E',
        'EAN_13',
        'EAN_8',
        'CODE_128',
        'CODE_39',
        'ITF',
        'CODABAR',
        // QR codes
        'QR_CODE'
      ]
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
          onBarcodeDetected(barcode);
          stopScanning();
        } else if (decodedText.length >= 8) {
          // If it's already numeric enough
          onBarcodeDetected(decodedText);
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

    scanner
      .render(onScanSuccess, onScanError)
      .catch((err) => {
        setError('Impossible d\'accéder à la caméra. Vérifiez les permissions.');
        console.error('Scanner error:', err);
        setIsScanning(false);
      });

    return () => {
      if (scannerRef.current) {
        scannerRef.current
          .clear()
          .catch((err) => console.error('Error clearing scanner:', err));
      }
    };
  }, [isScanning, lastDetected, onBarcodeDetected]);

  const stopScanning = () => {
    setIsScanning(false);
    if (scannerRef.current) {
      scannerRef.current
        .clear()
        .catch((err) => console.error('Error clearing scanner:', err));
    }
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
