import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { validateGameDuration } from '../utils/validation';

// Versão web do GameControlScreen - compatível com Vite
// Remove dependências React Native e usa HTML/CSS padrão

interface Props {
  onBack: () => void;
  onNavigateToResults: () => void;
  onNavigateToQRGeneration?: () => void;
}

const GameControlScreen: React.FC<Props> = ({ onBack, onNavigateToResults, onNavigateToQRGeneration }) => {
  const { state, dispatch } = useGame();
  const [gameDuration, setGameDuration] = useState('30');
  const [durationError, setDurationError] = useState<string | null>(null);

  const validateDuration = (duration: string): boolean => {
    const durationNum = parseInt(duration);
    const error = validateGameDuration(durationNum);
    setDurationError(error);
    return error === null;
  };

  const createNewGame = () => {
    if (!validateDuration(gameDuration)) {
      return;
    }

    const confirmed = window.confirm(
      'Criar Novo Jogo\n\nIsso irá resetar todos os dados do jogo atual. Continuar?'
    );

    if (confirmed) {
      dispatch({ type: 'RESET_GAME' });
      dispatch({
        type: 'CREATE_GAME_SESSION',
        payload: { duration: parseInt(gameDuration) },
      });
      alert('Sucesso! Novo jogo criado!');
    }
  };

  const startGame = () => {
    if (!state.currentSession) {
      alert('Erro: Nenhuma sessão de jogo ativa');
      return;
    }

    if (state.currentSession.teams.length === 0) {
      alert('Erro: Nenhuma equipe cadastrada');
      return;
    }

    if (state.currentSession.qrCodes.length === 0) {
      alert('Erro: Nenhum QR Code gerado');
      return;
    }

    dispatch({ type: 'START_TIMER' });
    alert('Jogo Iniciado! O cronômetro foi ativado');
  };

  const pauseGame = () => {
    dispatch({ type: 'PAUSE_TIMER' });
    alert('Jogo Pausado: O cronômetro foi pausado');
  };

  const endGame = () => {
    const confirmed = window.confirm(
      'Finalizar Jogo\n\nTem certeza que deseja finalizar o jogo?'
    );

    if (confirmed) {
      dispatch({ type: 'END_GAME' });
      alert('Jogo Finalizado: O jogo foi encerrado');
      onNavigateToResults();
    }
  };

  const resetGame = () => {
    const confirmed = window.confirm(
      'Resetar Jogo\n\nIsso irá apagar todos os dados do jogo atual. Esta ação não pode ser desfeita. Continuar?'
    );

    if (confirmed) {
      dispatch({ type: 'RESET_GAME' });
      alert('Jogo resetado com sucesso!');
    }
  };

  const gameStats = state.currentSession
    ? {
        teams: state.currentSession.teams.length,
        qrCodes: state.currentSession.qrCodes.length,
        totalPoints: state.currentSession.qrCodes.reduce((sum, qr) => sum + qr.points, 0),
        scannedCodes: state.currentSession.qrCodes.filter(qr => qr.scannedBy.length > 0).length,
      }
    : null;

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
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
        <h1 style={styles.title}>Controle do Jogo</h1>
      </div>

      <div style={styles.content}>
        {/* Timer Display */}
        {state.currentSession && (
          <div style={styles.timerSection}>
            <div style={styles.timerDisplay}>
              <span style={styles.timerIcon}>⏱️</span>
              <span style={styles.timerText}>
                {formatTime(state.timer.timeLeft)}
              </span>
              <span style={{
                ...styles.timerStatus,
                color: state.timer.isRunning ? '#4CAF50' : '#FF6B6B'
              }}>
                {state.timer.isRunning ? '▶️ Rodando' : '⏸️ Pausado'}
              </span>
            </div>
          </div>
        )}

        {/* Configurações do Jogo */}
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>⚙️ Configurações</h2>
          
          <div style={styles.inputGroup}>
            <label style={styles.label}>Duração do Jogo (minutos)</label>
            <input
              type="number"
              style={{
                ...styles.input,
                borderColor: durationError ? '#FF6B6B' : '#E0E0E0'
              }}
              value={gameDuration}
              onChange={(e) => {
                setGameDuration(e.target.value);
                if (durationError) validateDuration(e.target.value);
              }}
              placeholder="30"
              min="1"
              max="999"
            />
            {durationError && (
              <span style={styles.errorText}>❌ {durationError}</span>
            )}
          </div>

          <button 
            style={styles.createButton} 
            onClick={createNewGame}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#45B7B8'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#4ECDC4'}
          >
            <span style={styles.buttonIcon}>➕</span>
            <span>Criar Novo Jogo</span>
          </button>
        </div>

        {/* Controles do Jogo */}
        {state.currentSession && (
          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>🎮 Controles</h2>
            
            <div style={styles.controlsGrid}>
              <button
                style={{
                  ...styles.controlButton,
                  ...styles.startButton,
                  ...(state.currentSession.isActive ? styles.disabledButton : {})
                }}
                onClick={startGame}
                disabled={state.currentSession.isActive}
                onMouseEnter={(e) => {
                  if (!state.currentSession?.isActive) {
                    e.currentTarget.style.backgroundColor = '#45A049';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!state.currentSession?.isActive) {
                    e.currentTarget.style.backgroundColor = '#4CAF50';
                  }
                }}
              >
                <span style={styles.controlIcon}>▶️</span>
                <span>Iniciar</span>
              </button>

              <button
                style={{
                  ...styles.controlButton,
                  ...styles.pauseButton,
                  ...(!state.timer.isRunning ? styles.disabledButton : {})
                }}
                onClick={pauseGame}
                disabled={!state.timer.isRunning}
                onMouseEnter={(e) => {
                  if (state.timer.isRunning) {
                    e.currentTarget.style.backgroundColor = '#E68900';
                  }
                }}
                onMouseLeave={(e) => {
                  if (state.timer.isRunning) {
                    e.currentTarget.style.backgroundColor = '#FF9500';
                  }
                }}
              >
                <span style={styles.controlIcon}>⏸️</span>
                <span>Pausar</span>
              </button>

              <button
                style={{...styles.controlButton, ...styles.endButton}}
                onClick={endGame}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#D32F2F'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#F44336'}
              >
                <span style={styles.controlIcon}>⏹️</span>
                <span>Finalizar</span>
              </button>

              <button
                style={{...styles.controlButton, ...styles.resultsButton}}
                onClick={onNavigateToResults}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#7B1FA2'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#9C27B0'}
              >
                <span style={styles.controlIcon}>🏆</span>
                <span>Resultados</span>
              </button>
            </div>
          </div>
        )}

        {/* Estatísticas do Jogo */}
        {gameStats && (
          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>📊 Estatísticas</h2>
            
            <div style={styles.statsGrid}>
              <div style={styles.statCard}>
                <span style={styles.statIcon}>👥</span>
                <span style={styles.statNumber}>{gameStats.teams}</span>
                <span style={styles.statLabel}>Equipes</span>
              </div>
              
              <div style={styles.statCard}>
                <span style={styles.statIcon}>📱</span>
                <span style={styles.statNumber}>{gameStats.qrCodes}</span>
                <span style={styles.statLabel}>QR Codes</span>
              </div>
              
              <div style={styles.statCard}>
                <span style={styles.statIcon}>⭐</span>
                <span style={styles.statNumber}>{gameStats.totalPoints}</span>
                <span style={styles.statLabel}>Pontos Totais</span>
              </div>
              
              <div style={styles.statCard}>
                <span style={styles.statIcon}>✅</span>
                <span style={styles.statNumber}>{gameStats.scannedCodes}</span>
                <span style={styles.statLabel}>Escaneados</span>
              </div>
            </div>
          </div>
        )}

        {/* Ações Avançadas */}
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>🔧 Ações Avançadas</h2>
          
          <div style={styles.advancedButtonsGrid}>
            {onNavigateToQRGeneration && (
              <button 
                style={styles.qrGenerationButton} 
                onClick={onNavigateToQRGeneration}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#45B7B8'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#4ECDC4'}
              >
                <span style={styles.buttonIcon}>📱</span>
                <span>Gerar QR Codes</span>
              </button>
            )}
            
            <button 
              style={styles.dangerButton} 
              onClick={resetGame}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#C62828'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#D32F2F'}
            >
              <span style={styles.buttonIcon}>🗑️</span>
              <span>Resetar Jogo Completo</span>
            </button>
          </div>
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
    padding: '0 20px 40px 20px',
    maxWidth: '1200px',
    margin: '0 auto',
    width: '100%',
  },
  timerSection: {
    marginBottom: '30px',
  },
  timerDisplay: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: '15px',
    padding: '25px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    gap: '15px',
  },
  timerIcon: {
    fontSize: '32px',
  },
  timerText: {
    fontSize: '48px',
    fontWeight: 'bold',
    color: '#2D3436',
    fontFamily: 'monospace',
  },
  timerStatus: {
    fontSize: '18px',
    fontWeight: 'bold',
  },
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: '12px',
    padding: '25px',
    marginBottom: '25px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  },
  sectionTitle: {
    fontSize: '22px',
    fontWeight: 'bold',
    color: '#2D3436',
    marginBottom: '20px',
    margin: '0 0 20px 0',
  },
  inputGroup: {
    marginBottom: '20px',
  },
  label: {
    display: 'block',
    fontSize: '16px',
    fontWeight: 'bold',
    color: '#2D3436',
    marginBottom: '8px',
  },
  input: {
    width: '100%',
    maxWidth: '200px',
    padding: '12px',
    fontSize: '16px',
    border: '2px solid #E0E0E0',
    borderRadius: '8px',
    outline: 'none',
  },
  errorText: {
    display: 'block',
    color: '#FF6B6B',
    fontSize: '14px',
    marginTop: '5px',
  },
  createButton: {
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
  },
  controlsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
    gap: '15px',
  },
  controlButton: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    padding: '20px',
    border: 'none',
    borderRadius: '12px',
    fontSize: '16px',
    fontWeight: 'bold',
    color: '#FFFFFF',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    minHeight: '100px',
  },
  controlIcon: {
    fontSize: '24px',
  },
  startButton: {
    backgroundColor: '#4CAF50',
  },
  pauseButton: {
    backgroundColor: '#FF9500',
  },
  endButton: {
    backgroundColor: '#F44336',
  },
  resultsButton: {
    backgroundColor: '#9C27B0',
  },
  disabledButton: {
    backgroundColor: '#CCCCCC',
    cursor: 'not-allowed',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
    gap: '15px',
  },
  statCard: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    padding: '20px',
    backgroundColor: '#F8F9FA',
    borderRadius: '10px',
    border: '2px solid #E0E0E0',
  },
  statIcon: {
    fontSize: '24px',
    marginBottom: '8px',
  },
  statNumber: {
    fontSize: '28px',
    fontWeight: 'bold',
    color: '#2D3436',
    marginBottom: '4px',
  },
  statLabel: {
    fontSize: '12px',
    color: '#636E72',
    textAlign: 'center' as const,
  },
  dangerButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    padding: '15px 25px',
    backgroundColor: '#D32F2F',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '10px',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'background-color 0.2s ease',
  },
  buttonIcon: {
    fontSize: '18px',
  },
  advancedButtonsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '15px',
  },
  qrGenerationButton: {
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
  },
};

export default GameControlScreen;