import React, { useState } from 'react';
import TeamRegistrationScreen from './TeamRegistrationScreen.web';
import AdminLoginScreen from './AdminLoginScreen.web';
import GameControlScreen from './GameControlScreen.web';
import QRGenerationScreen from './QRGenerationScreen.web';
import QRScannerScreen from './QRScannerScreen.web';
import ScoreboardScreen from './ScoreboardScreen.web';
import { Team } from '../types';
import { useGame } from '../context/GameContext';

// Versão web do WelcomeScreen - compatível com Vite
// Remove dependências React Native e usa HTML/CSS padrão
interface Props {
  // Props opcionais para compatibilidade
}

const WelcomeScreen: React.FC<Props> = () => {
  const { state } = useGame();
  const [currentScreen, setCurrentScreen] = useState<'welcome' | 'teamRegistration' | 'adminLogin' | 'gameControl' | 'gameResults' | 'qrGeneration' | 'qrScanner' | 'scoreboard'>('welcome');
  const [registeredTeam, setRegisteredTeam] = useState<Team | null>(null);

  const handleTeamRegistration = () => {
    setCurrentScreen('teamRegistration');
  };

  const handleBackToWelcome = () => {
    setCurrentScreen('welcome');
  };

  const handleTeamRegistered = (team: Team) => {
    setRegisteredTeam(team);
    setCurrentScreen('welcome');
  };

  const handleAdminLogin = () => {
    setCurrentScreen('adminLogin');
  };

  const handleAdminLoginSuccess = () => {
    setCurrentScreen('gameControl');
  };

  const handleNavigateToResults = () => {
    setCurrentScreen('gameResults');
  };

  const handleNavigateToQRGeneration = () => {
    setCurrentScreen('qrGeneration');
  };

  const handleNavigateToQRScanner = () => {
    setCurrentScreen('qrScanner');
  };

  const handleNavigateToScoreboard = () => {
    setCurrentScreen('scoreboard');
  };

  // Renderização condicional baseada na tela atual
  if (currentScreen === 'teamRegistration') {
    return (
      <TeamRegistrationScreen 
        onBack={handleBackToWelcome}
        onTeamRegistered={handleTeamRegistered}
      />
    );
  }

  if (currentScreen === 'adminLogin') {
    return (
      <AdminLoginScreen 
        onBack={handleBackToWelcome}
        onLoginSuccess={handleAdminLoginSuccess}
      />
    );
  }

  if (currentScreen === 'gameControl') {
    return (
      <GameControlScreen 
        onBack={handleBackToWelcome}
        onNavigateToResults={handleNavigateToResults}
        onNavigateToQRGeneration={handleNavigateToQRGeneration}
      />
    );
  }

  if (currentScreen === 'qrGeneration') {
    return (
      <QRGenerationScreen 
        onBack={handleBackToWelcome}
        onNavigateToGameControl={() => setCurrentScreen('gameControl')}
      />
    );
  }

  if (currentScreen === 'qrScanner') {
    return (
      <QRScannerScreen 
        onBack={handleBackToWelcome}
      />
    );
  }

  if (currentScreen === 'scoreboard') {
    return (
      <ScoreboardScreen 
        onBack={handleBackToWelcome}
      />
    );
  }

  if (currentScreen === 'gameResults') {
    return (
      <div style={styles.container}>
        <div style={styles.header}>
          <button
            style={styles.backButton}
            onClick={() => setCurrentScreen('gameControl')}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#E0E0E0'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            ← Voltar ao Controle
          </button>
          <h1 style={styles.title}>Resultados do Jogo</h1>
        </div>
        <div style={styles.content}>
          <div style={styles.comingSoon}>
            <span style={styles.comingSoonIcon}>🚧</span>
            <h2 style={styles.comingSoonTitle}>Tela de Resultados</h2>
            <p style={styles.comingSoonText}>
              A visualização detalhada dos resultados está em desenvolvimento.
              <br />Por enquanto, você pode acompanhar o placar em tempo real através do controle do jogo.
            </p>
            <button
              style={styles.backToControlButton}
              onClick={() => setCurrentScreen('gameControl')}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#45B7B8'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#4ECDC4'}
            >
              🎮 Voltar ao Controle do Jogo
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.trophy}>🏆</div>
        <h1 style={styles.title}>QRCode Hunter</h1>
        <p style={styles.subtitle}>Escaneie, pontue e vença!</p>
        {registeredTeam && (
          <div style={styles.successMessage}>
            <p style={styles.successText}>
              ✅ Equipe "{registeredTeam.name}" cadastrada com sucesso!
            </p>
            <p style={styles.successSubtext}>
              {registeredTeam.participants.length} participante(s) registrado(s)
            </p>
          </div>
        )}
      </div>

      <div style={styles.buttonContainer}>
        <button
          style={{...styles.button, backgroundColor: '#FF6B6B'}}
          onClick={handleTeamRegistration}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(0.95)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
        >
          <span style={styles.buttonIcon}>👥</span>
          <span style={styles.buttonText}>Cadastrar Equipe</span>
        </button>

        <button
          style={{...styles.button, backgroundColor: '#4ECDC4'}}
          onClick={handleNavigateToQRScanner}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(0.95)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
        >
          <span style={styles.buttonIcon}>📱</span>
          <span style={styles.buttonText}>Escanear QR Codes</span>
        </button>

        <button
          style={{...styles.button, backgroundColor: '#FF9500'}}
          onClick={handleNavigateToScoreboard}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(0.95)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
        >
          <span style={styles.buttonIcon}>🏆</span>
          <span style={styles.buttonText}>Ver Placar</span>
        </button>

        <button
          style={{...styles.button, backgroundColor: '#9C27B0'}}
          onClick={handleAdminLogin}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(0.95)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
        >
          <span style={styles.buttonIcon}>⚙️</span>
          <span style={styles.buttonText}>Área do Organizador</span>
        </button>
      </div>

      <div style={styles.footer}>
        <p style={styles.footerText}>
          Reúna sua equipe e comece a diversão!
        </p>
      </div>
    </div>
  );
};

// Estilos CSS-in-JS para web - compatível com Vite
const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column' as const,
    justifyContent: 'space-between',
    alignItems: 'center',
    minHeight: '100vh',
    backgroundColor: '#F8F9FA',
    padding: '50px 20px',
    fontFamily: 'Arial, sans-serif',
  },
  header: {
    textAlign: 'center' as const,
    marginTop: '10vh',
  },
  trophy: {
    fontSize: '80px',
    marginBottom: '20px',
  },
  title: {
    fontSize: '48px',
    fontWeight: 'bold',
    color: '#2D3436',
    margin: '20px 0 10px 0',
  },
  subtitle: {
    fontSize: '20px',
    color: '#636E72',
    margin: '10px 0',
  },
  buttonContainer: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '20px',
    width: '100%',
    maxWidth: '400px',
    padding: '0 40px',
  },
  button: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px 30px',
    borderRadius: '15px',
    border: 'none',
    cursor: 'pointer',
    fontSize: '22px',
    fontWeight: 'bold',
    color: '#FFFFFF',
    boxShadow: '0 2px 8px rgba(0,0,0,0.25)',
    transition: 'transform 0.2s ease',
  },
  buttonIcon: {
    marginRight: '15px',
    fontSize: '24px',
  },
  buttonText: {
    fontSize: '22px',
    fontWeight: 'bold',
  },
  footer: {
    textAlign: 'center' as const,
    marginBottom: '20px',
  },
  footerText: {
    fontSize: '16px',
    color: '#636E72',
    fontStyle: 'italic',
    margin: 0,
  },
  successMessage: {
    backgroundColor: '#D4F6D4',
    border: '2px solid #4CAF50',
    borderRadius: '12px',
    padding: '15px',
    marginTop: '20px',
    textAlign: 'center' as const,
  },
  successText: {
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#2E7D32',
    margin: '0 0 5px 0',
  },
  successSubtext: {
    fontSize: '14px',
    color: '#388E3C',
    margin: 0,
  },
  // Estilos para tela de resultados
  content: {
    flex: 1,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '40px 20px',
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
  comingSoon: {
    textAlign: 'center' as const,
    backgroundColor: '#FFFFFF',
    borderRadius: '15px',
    padding: '50px 40px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    maxWidth: '500px',
  },
  comingSoonIcon: {
    fontSize: '64px',
    marginBottom: '20px',
    display: 'block',
  },
  comingSoonTitle: {
    fontSize: '28px',
    fontWeight: 'bold',
    color: '#2D3436',
    marginBottom: '20px',
    margin: '0 0 20px 0',
  },
  comingSoonText: {
    fontSize: '16px',
    color: '#636E72',
    lineHeight: '1.6',
    marginBottom: '30px',
  },
  backToControlButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    padding: '15px 25px',
    backgroundColor: '#4ECDC4',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '10px',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'background-color 0.2s ease',
    margin: '0 auto',
  },
};

export default WelcomeScreen;