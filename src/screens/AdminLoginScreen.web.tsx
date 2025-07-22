import React, { useState } from 'react';
import { useGame } from '../context/GameContext';

// Versão web do AdminLoginScreen - compatível com Vite
// Remove dependências React Native e usa HTML/CSS padrão

interface Props {
  onBack: () => void;
  onLoginSuccess: () => void;
}

const ADMIN_PASSWORD = 'admin123'; // Em produção, isso deveria ser mais seguro

const AdminLoginScreen: React.FC<Props> = ({ onBack, onLoginSuccess }) => {
  const { dispatch } = useGame();
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = () => {
    if (!password.trim()) {
      setError('Digite a senha de administrador');
      return;
    }

    setIsLoading(true);
    setError('');

    // Simular verificação de senha
    setTimeout(() => {
      if (password === ADMIN_PASSWORD) {
        dispatch({ type: 'SET_ADMIN_MODE', payload: true });
        onLoginSuccess();
      } else {
        setError('Senha incorreta');
      }
      setIsLoading(false);
    }, 500);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleLogin();
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <button
          style={styles.backButton}
          onClick={onBack}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#E0E0E0'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
        >
          ← Voltar
        </button>
        <h1 style={styles.title}>Área do Organizador</h1>
      </div>

      <div style={styles.content}>
        <div style={styles.iconContainer}>
          <div style={styles.adminIcon}>⚙️</div>
        </div>

        <p style={styles.subtitle}>
          Digite a senha para acessar as ferramentas de organização
        </p>

        <div style={styles.inputContainer}>
          <span style={styles.inputIcon}>🔒</span>
          <input
            type="password"
            style={{
              ...styles.input,
              borderColor: error ? '#FF6B6B' : '#E0E0E0'
            }}
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (error) setError('');
            }}
            onKeyPress={handleKeyPress}
            placeholder="Senha do organizador"
            disabled={isLoading}
          />
        </div>

        {error && (
          <div style={styles.errorContainer}>
            <span style={styles.errorText}>❌ {error}</span>
          </div>
        )}

        <button
          style={{
            ...styles.loginButton,
            backgroundColor: isLoading ? '#A0A0A0' : '#4ECDC4',
            cursor: isLoading ? 'not-allowed' : 'pointer'
          }}
          onClick={handleLogin}
          disabled={isLoading}
          onMouseEnter={(e) => {
            if (!isLoading) {
              e.currentTarget.style.backgroundColor = '#45B7B8';
            }
          }}
          onMouseLeave={(e) => {
            if (!isLoading) {
              e.currentTarget.style.backgroundColor = '#4ECDC4';
            }
          }}
        >
          {isLoading ? (
            <span style={styles.loginButtonText}>🔄 Verificando...</span>
          ) : (
            <>
              <span style={styles.loginButtonIcon}>🔑</span>
              <span style={styles.loginButtonText}>Entrar</span>
            </>
          )}
        </button>

        <div style={styles.infoContainer}>
          <p style={styles.infoText}>
            Como organizador, você pode:
          </p>
          <div style={styles.featureList}>
            <div style={styles.featureItem}>
              <span style={styles.featureIcon}>📱</span>
              <span style={styles.featureText}>Gerar QR Codes com pontuações</span>
            </div>
            <div style={styles.featureItem}>
              <span style={styles.featureIcon}>▶️</span>
              <span style={styles.featureText}>Controlar início e fim do jogo</span>
            </div>
            <div style={styles.featureItem}>
              <span style={styles.featureIcon}>⏱️</span>
              <span style={styles.featureText}>Definir tempo da gincana</span>
            </div>
            <div style={styles.featureItem}>
              <span style={styles.featureIcon}>🏆</span>
              <span style={styles.featureText}>Visualizar placar em tempo real</span>
            </div>
          </div>
        </div>

        <div style={styles.passwordHint}>
          <p style={styles.hintText}>
            💡 <strong>Dica para teste:</strong> A senha padrão é "admin123"
          </p>
        </div>
      </div>
    </div>
  );
};

// Estilos CSS-in-JS para web - compatível com Vite
const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column' as const,
    minHeight: '100vh',
    backgroundColor: '#F8F9FA',
    fontFamily: 'Arial, sans-serif',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    padding: '20px',
    marginTop: '20px',
  },
  backButton: {
    display: 'flex',
    alignItems: 'center',
    padding: '10px 15px',
    marginRight: '15px',
    backgroundColor: 'transparent',
    border: '2px solid #E0E0E0',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '16px',
    color: '#2D3436',
    transition: 'background-color 0.2s ease',
  },
  title: {
    fontSize: '28px',
    fontWeight: 'bold',
    color: '#2D3436',
    margin: 0,
  },
  content: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column' as const,
    justifyContent: 'center',
    alignItems: 'center',
    padding: '0 30px',
    maxWidth: '500px',
    margin: '0 auto',
  },
  iconContainer: {
    textAlign: 'center' as const,
    marginBottom: '30px',
  },
  adminIcon: {
    fontSize: '80px',
  },
  subtitle: {
    fontSize: '18px',
    color: '#636E72',
    textAlign: 'center' as const,
    marginBottom: '40px',
    lineHeight: '1.5',
  },
  inputContainer: {
    display: 'flex',
    alignItems: 'center',
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: '12px',
    border: '2px solid #E0E0E0',
    marginBottom: '20px',
    padding: '0 15px',
  },
  inputIcon: {
    marginRight: '10px',
    fontSize: '20px',
  },
  input: {
    flex: 1,
    padding: '15px 0',
    fontSize: '16px',
    color: '#2D3436',
    border: 'none',
    outline: 'none',
    backgroundColor: 'transparent',
  },
  errorContainer: {
    width: '100%',
    marginBottom: '20px',
  },
  errorText: {
    color: '#FF6B6B',
    fontSize: '14px',
    fontWeight: 'bold',
  },
  loginButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    padding: '18px',
    borderRadius: '12px',
    border: 'none',
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#FFFFFF',
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
    transition: 'all 0.2s ease',
    marginBottom: '40px',
  },
  loginButtonIcon: {
    marginRight: '10px',
    fontSize: '20px',
  },
  loginButtonText: {
    fontSize: '18px',
    fontWeight: 'bold',
  },
  infoContainer: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: '12px',
    padding: '25px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    marginBottom: '20px',
  },
  infoText: {
    fontSize: '16px',
    fontWeight: 'bold',
    color: '#2D3436',
    marginBottom: '15px',
    textAlign: 'center' as const,
  },
  featureList: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '12px',
  },
  featureItem: {
    display: 'flex',
    alignItems: 'center',
  },
  featureIcon: {
    marginRight: '12px',
    fontSize: '18px',
    width: '24px',
    textAlign: 'center' as const,
  },
  featureText: {
    fontSize: '14px',
    color: '#636E72',
  },
  passwordHint: {
    width: '100%',
    backgroundColor: '#FFF3CD',
    border: '1px solid #FFEAA7',
    borderRadius: '8px',
    padding: '15px',
    textAlign: 'center' as const,
  },
  hintText: {
    fontSize: '14px',
    color: '#856404',
    margin: 0,
  },
};

export default AdminLoginScreen;