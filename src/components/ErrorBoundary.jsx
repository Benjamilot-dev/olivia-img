import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#0d0f12',
          color: '#fff',
          padding: '20px',
          textAlign: 'center'
        }}>
          <div style={{
            maxWidth: '460px',
            background: '#1c212a',
            padding: '36px 28px',
            borderRadius: '16px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            boxShadow: '0 16px 40px rgba(0, 0, 0, 0.6)'
          }}>
            <AlertCircle size={48} color="#f59e0b" style={{ margin: '0 auto 16px' }} />
            <h2 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '8px' }}>
              Algo inesperado ocurrió
            </h2>
            <p style={{ color: '#9ca3af', fontSize: '0.88rem', marginBottom: '20px', lineHeight: 1.5 }}>
              {this.state.error?.message || 'Error al renderizar la vista.'}
            </p>
            <button
              onClick={this.handleReload}
              style={{
                background: '#e60023',
                color: '#fff',
                padding: '10px 22px',
                borderRadius: '9999px',
                fontWeight: 600,
                fontSize: '0.9rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer',
                border: 'none'
              }}
            >
              <RefreshCw size={16} />
              <span>Recargar Galería</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
