import React from 'react';
import './ErrorBoundary.css';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorCount: 0
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    this.setState(prevState => ({
      error,
      errorInfo,
      errorCount: prevState.errorCount + 1
    }));
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <div className="error-boundary-content">
            <div className="error-icon">⚠️</div>
            <h2>Oops! Une erreur s'est produite</h2>
            <p>L'application a rencontré un problème inattendu.</p>

            {this.state.errorCount > 2 && (
              <div className="error-warning">
                <p>Vous avez rencontré plusieurs erreurs. Veuillez rafraîchir la page.</p>
              </div>
            )}

            {process.env.REACT_APP_ENV === 'development' && this.state.error && (
              <details style={{ whiteSpace: 'pre-wrap', marginTop: '1rem' }}>
                <summary style={{ cursor: 'pointer', color: '#666' }}>
                  Détails de l'erreur (Développeur)
                </summary>
                <div className="error-details">
                  <p><strong>Erreur:</strong> {this.state.error.toString()}</p>
                  {this.state.errorInfo && (
                    <p><strong>Stack:</strong> {this.state.errorInfo.componentStack}</p>
                  )}
                </div>
              </details>
            )}

            <div className="error-actions">
              <button className="btn-reset" onClick={this.handleReset}>
                ↻ Réessayer
              </button>
              <button
                className="btn-home"
                onClick={() => {
                  window.location.href = '/';
                }}
              >
                🏠 Retour à l'accueil
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
