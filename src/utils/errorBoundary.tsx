import React, { Component, ErrorInfo, ReactNode } from 'react';

// Versão web do ErrorBoundary - compatível com Vite
// Remove dependências React Native e usa HTML/CSS padrão

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo,
    });

    // Aqui você poderia enviar o erro para um serviço de monitoramento
    // como Crashlytics, Sentry, etc.
  }

  handleRestart = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div style={styles.container}>
          <div style={styles.content}>
            <div style={styles.iconContainer}>
              <span style={styles.errorIcon}>⚠️</span>
            </div>

            <h1 style={styles.title}>Ops! Algo deu errado</h1>
            
            <p style={styles.message}>
              O aplicativo encontrou um erro inesperado. Não se preocupe, 
              seus dados estão seguros!
            </p>

            <div style={styles.buttonContainer}>
              <button
                style={styles.restartButton}
                onClick={this.handleRestart}
              >
                <span style={styles.refreshIcon}>🔄</span>
                <span style={styles.restartButtonText}>Tentar Novamente</span>
              </button>
            </div>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <div style={styles.debugContainer}>
                <h3 style={styles.debugTitle}>Informações de Debug:</h3>
                <div style={styles.debugScroll}>
                  <pre style={styles.debugText}>
                    {this.state.error.toString()}
                  </pre>
                  {this.state.errorInfo && (
                    <pre style={styles.debugText}>
                      {this.state.errorInfo.componentStack}
                    </pre>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Estilos CSS-in-JS para web - compatível com Vite
const styles = {
  container: {
    display: 'flex',
    minHeight: '100vh',
    backgroundColor: '#F8F9FA',
    fontFamily: 'Arial, sans-serif',
  },
  content: {
    display: 'flex',
    flexDirection: 'column' as const,
    justifyContent: 'center',
    alignItems: 'center',
    padding: '40px',
    width: '100%',
  },
  iconContainer: {
    marginBottom: '40px',
  },
  errorIcon: {
    fontSize: '80px',
  },
  title: {
    fontSize: '32px',
    fontWeight: 'bold',
    color: '#2D3436',
    textAlign: 'center' as const,
    marginBottom: '20px',
  },
  message: {
    fontSize: '18px',
    color: '#636E72',
    textAlign: 'center' as const,
    lineHeight: '24px',
    marginBottom: '40px',
    maxWidth: '500px',
  },
  buttonContainer: {
    width: '100%',
    maxWidth: '300px',
    marginBottom: '40px',
  },
  restartButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF6B6B',
    padding: '15px 30px',
    borderRadius: '10px',
    border: 'none',
    cursor: 'pointer',
    width: '100%',
    fontSize: '16px',
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  refreshIcon: {
    marginRight: '10px',
    fontSize: '16px',
  },
  restartButtonText: {
    fontSize: '16px',
    fontWeight: 'bold',
  },
  debugContainer: {
    width: '100%',
    maxWidth: '600px',
    backgroundColor: '#FFFFFF',
    borderRadius: '8px',
    padding: '20px',
    maxHeight: '200px',
    border: '1px solid #DDD',
  },
  debugTitle: {
    fontSize: '14px',
    fontWeight: 'bold',
    color: '#2D3436',
    marginBottom: '10px',
  },
  debugScroll: {
    maxHeight: '150px',
    overflow: 'auto',
  },
  debugText: {
    fontSize: '12px',
    color: '#636E72',
    fontFamily: 'monospace',
    margin: 0,
    whiteSpace: 'pre-wrap' as const,
  },
};

export default ErrorBoundary;