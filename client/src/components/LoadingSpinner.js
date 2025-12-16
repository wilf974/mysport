import React from 'react';
import './LoadingSpinner.css';

/**
 * Composant de chargement avec spinner animé
 * Utilisé dans les Suspense boundaries pour le code splitting
 */
function LoadingSpinner({ message = 'Chargement...' }) {
  return (
    <div className="loading-spinner-container">
      <div className="loading-spinner">
        <div className="spinner-ring"></div>
        <div className="spinner-ring"></div>
        <div className="spinner-ring"></div>
        <div className="spinner-ring"></div>
      </div>
      <p className="spinner-message">{message}</p>
    </div>
  );
}

export default LoadingSpinner;
