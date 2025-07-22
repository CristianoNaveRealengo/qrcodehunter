import React, { useState, useRef, useEffect } from 'react';
import { useGame } from '../context/GameContext';
import { validateQRCode } from '../utils/validation';
import { GameLogicService } from '../services/gameLogic';

// Versão web do QRScannerScreen - compatível com Vite
// Usa HTML5 getUserMedia API para acessar a câmera

interface Props {
  onBack: () => void;
}

const QRScannerScreen: React.FC<Props> = ({ onBack }) => {
  const { state, dispatch } = useGame();
  const [isScanning, setIsScanning] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [lastScannedCode, setLastScannedCode] = useState<string>('');
  const [scanResult, setScanResult] = useState<string>('');
  const [manualCode, setManualCode] = useState<string>('');
  const [selectedTeamId, setSelectedTeamId] = useState<string>('');
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const scanIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment', // Câmera traseira
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });
      
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      
      setHasPermission(true);
      setIsScanning(true);
      startQRCodeDetection();
    } catch (error) {
      console.error('Erro ao acessar câmera:', error);
      setHasPermission(false);
      alert('Erro ao acessar a câmera. Verifique as permissões do navegador.');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
      scanIntervalRef.current = null;
    }
    setIsScanning(false);
  };

  const startQRCodeDetection = () => {
    // Simula detecção de QR code através de análise de imagem
    // Em uma implementação real, você usaria uma biblioteca como jsQR
    scanIntervalRef.current = setInterval(() => {
      if (videoRef.current && canvasRef.current && isScanning) {
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');
        const video = videoRef.current;
        
        if (context && video.readyState === video.HAVE_ENOUGH_DATA) {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          context.drawImage(video, 0, 0, canvas.width, canvas.height);
          
          // Aqui seria onde uma biblioteca de QR code analisaria a imagem
          // Por simplicidade, vamos usar entrada manual
        }
      }
    }, 100);
  };

  const handleQRCodeScanned = (code: string) => {
    if (!validateQRCode(code) || !code.startsWith('GINCANA_')) {
      setScanResult('❌ Código inválido! Deve ser um código QR da gincana.');
      return;
    }

    if (!selectedTeamId) {
      setScanResult('❌ Selecione uma equipe primeiro.');
      return;
    }

    if (!state.currentSession?.isActive) {
      setScanResult('⏸️ O jogo não está ativo no momento.');
      return;
    }

    const selectedTeam = state.currentSession.teams.find(team => team.id === selectedTeamId);
    if (!selectedTeam) {
      setScanResult('❌ Equipe selecionada não encontrada.');
      return;
    }

    const qrCode = state.currentSession.qrCodes.find(qr => qr.code === code);
    
    if (!qrCode) {
      setScanResult('❌ Código QR não encontrado no sistema.');
      return;
    }

    const canScanResult = GameLogicService.canTeamScanQRCode(
      selectedTeam,
      qrCode,
      state.currentSession
    );

    if (!canScanResult.canScan) {
      setScanResult(`❌ ${canScanResult.reason}`);
      return;
    }

    // Processar o scan
    const scanResult = GameLogicService.processScan(selectedTeam, qrCode);
    
    dispatch({ type: 'SCAN_QR_CODE', payload: { teamId: selectedTeam.id, qrCodeId: qrCode.id } });
    
    setScanResult(`✅ Sucesso! +${scanResult.pointsEarned} pontos para ${selectedTeam.name}!`);
    setLastScannedCode(code);
    
    // Vibração de feedback (se suportado)
    if ('vibrate' in navigator) {
      navigator.vibrate(200);
    }
  };

  const handleManualSubmit = () => {
    if (manualCode.trim()) {
      handleQRCodeScanned(manualCode.trim());
      setManualCode('');
    }
  };

  const gameSession = state.currentSession;
  const selectedTeam = gameSession?.teams.find(team => team.id === selectedTeamId);
  const availableTeams = gameSession?.teams || [];

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
        <h1 style={styles.title}>Scanner QR</h1>
      </div>

      <div style={styles.content}>
        {/* Seletor de equipe */}
        <div style={styles.teamSelector}>
          <h2 style={styles.selectorTitle}>Selecione a Equipe:</h2>
          {availableTeams.length > 0 ? (
            <select
              value={selectedTeamId}
              onChange={(e) => setSelectedTeamId(e.target.value)}
              style={styles.teamSelect}
            >
              <option value="">-- Escolha uma equipe --</option>
              {availableTeams.map(team => (
                <option key={team.id} value={team.id}>
                  {team.name} ({team.score} pontos)
                </option>
              ))}
            </select>
          ) : (
            <p style={styles.noTeamsText}>❌ Nenhuma equipe cadastrada ainda.</p>
          )}
        </div>

        {/* Informações da equipe selecionada */}
        {selectedTeam && (
          <div style={styles.teamInfo}>
            <h3 style={styles.teamName}>Equipe Selecionada: {selectedTeam.name}</h3>
            <p style={styles.teamScore}>Pontuação: {selectedTeam.score} pontos</p>
            <p style={styles.teamCodes}>Códigos escaneados: {selectedTeam.scannedCodes.length}</p>
            <div style={styles.participantsList}>
              <strong>Participantes:</strong> {selectedTeam.participants.join(', ')}
            </div>
          </div>
        )}

        {/* Status do jogo */}
        {gameSession && (
          <div style={styles.gameStatus}>
            <p style={styles.statusText}>
              Status: {gameSession.isActive ? '🟢 Jogo Ativo' : '🔴 Jogo Pausado'}
            </p>
            {state.timer.timeLeft > 0 && (
              <p style={styles.timeText}>
                Tempo restante: {Math.floor(state.timer.timeLeft / 60)}:{(state.timer.timeLeft % 60).toString().padStart(2, '0')}
              </p>
            )}
          </div>
        )}

        {/* Área da câmera */}
        <div style={styles.cameraSection}>
          <div style={styles.cameraContainer}>
            {hasPermission === null && (
              <div style={styles.permissionPrompt}>
                <p style={styles.promptText}>Clique para ativar a câmera</p>
                <button style={styles.startButton} onClick={startCamera}>
                  📷 Iniciar Câmera
                </button>
              </div>
            )}

            {hasPermission === false && (
              <div style={styles.permissionDenied}>
                <p style={styles.errorText}>❌ Acesso à câmera negado</p>
                <p style={styles.errorSubtext}>Verifique as permissões do navegador</p>
              </div>
            )}

            {hasPermission === true && (
              <div style={styles.videoContainer}>
                <video
                  ref={videoRef}
                  style={styles.video}
                  autoPlay
                  playsInline
                  muted
                />
                <canvas
                  ref={canvasRef}
                  style={styles.hiddenCanvas}
                />
                <div style={styles.scanOverlay}>
                  <div style={styles.scanFrame}></div>
                  <p style={styles.scanInstructions}>
                    Posicione o QR code dentro do quadrado
                  </p>
                </div>
              </div>
            )}
          </div>

          {isScanning && (
            <button
              style={styles.stopButton}
              onClick={stopCamera}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#C62828'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#D32F2F'}
            >
              ⏹️ Parar Câmera
            </button>
          )}
        </div>

        {/* Entrada manual */}
        <div style={styles.manualSection}>
          <h3 style={styles.manualTitle}>Ou digite o código manualmente:</h3>
          <div style={styles.manualInputContainer}>
            <input
              type="text"
              value={manualCode}
              onChange={(e) => setManualCode(e.target.value)}
              placeholder="Digite o código QR (ex: GINCANA_ABC123)"
              style={styles.manualInput}
              onKeyPress={(e) => e.key === 'Enter' && handleManualSubmit()}
            />
            <button
              style={styles.submitButton}
              onClick={handleManualSubmit}
              disabled={!manualCode.trim()}
              onMouseEnter={(e) => !manualCode.trim() ? null : e.currentTarget.style.backgroundColor = '#45B7B8'}
              onMouseLeave={(e) => !manualCode.trim() ? null : e.currentTarget.style.backgroundColor = '#4ECDC4'}
            >
              ✅ Escanear
            </button>
          </div>
        </div>

        {/* Resultado do scan */}
        {scanResult && (
          <div style={{
            ...styles.scanResult,
            backgroundColor: scanResult.includes('✅') ? '#D4F6D4' : '#FFE6E6',
            borderColor: scanResult.includes('✅') ? '#4CAF50' : '#F44336'
          }}>
            <p style={{
              ...styles.resultText,
              color: scanResult.includes('✅') ? '#2E7D32' : '#C62828'
            }}>
              {scanResult}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

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
    backgroundColor: '#FFFFFF',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
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
    padding: '20px',
    maxWidth: '800px',
    margin: '0 auto',
    width: '100%',
  },
  teamInfo: {
    backgroundColor: '#FFFFFF',
    borderRadius: '12px',
    padding: '20px',
    marginBottom: '20px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    textAlign: 'center' as const,
  },
  teamName: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#2D3436',
    margin: '0 0 10px 0',
  },
  teamScore: {
    fontSize: '20px',
    color: '#4CAF50',
    fontWeight: 'bold',
    margin: '5px 0',
  },
  teamCodes: {
    fontSize: '16px',
    color: '#636E72',
    margin: '5px 0 0 0',
  },
  participantsList: {
    fontSize: '14px',
    color: '#636E72',
    marginTop: '10px',
    padding: '10px',
    backgroundColor: '#F8F9FA',
    borderRadius: '8px',
  },
  teamSelector: {
    backgroundColor: '#FFFFFF',
    borderRadius: '12px',
    padding: '20px',
    marginBottom: '20px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  },
  selectorTitle: {
    fontSize: '20px',
    fontWeight: 'bold',
    color: '#2D3436',
    margin: '0 0 15px 0',
  },
  teamSelect: {
    width: '100%',
    padding: '12px',
    fontSize: '16px',
    border: '2px solid #E0E0E0',
    borderRadius: '8px',
    backgroundColor: '#FFFFFF',
    color: '#2D3436',
    outline: 'none',
    cursor: 'pointer',
  },
  noTeamsText: {
    fontSize: '16px',
    color: '#E74C3C',
    textAlign: 'center' as const,
    margin: 0,
    padding: '20px',
    backgroundColor: '#FDEDEC',
    borderRadius: '8px',
    border: '1px solid #F1948A',
  },
  noTeamWarning: {
    backgroundColor: '#FFF3CD',
    border: '2px solid #FFC107',
    borderRadius: '12px',
    padding: '20px',
    marginBottom: '20px',
    textAlign: 'center' as const,
  },
  warningText: {
    fontSize: '18px',
    color: '#856404',
    margin: 0,
  },
  gameStatus: {
    backgroundColor: '#FFFFFF',
    borderRadius: '12px',
    padding: '15px',
    marginBottom: '20px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    textAlign: 'center' as const,
  },
  statusText: {
    fontSize: '16px',
    fontWeight: 'bold',
    margin: '0 0 5px 0',
  },
  timeText: {
    fontSize: '14px',
    color: '#636E72',
    margin: 0,
  },
  cameraSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: '12px',
    padding: '20px',
    marginBottom: '20px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  },
  cameraContainer: {
    position: 'relative' as const,
    width: '100%',
    maxWidth: '400px',
    margin: '0 auto',
    aspectRatio: '4/3',
    backgroundColor: '#000000',
    borderRadius: '12px',
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  permissionPrompt: {
    textAlign: 'center' as const,
    color: '#FFFFFF',
  },
  promptText: {
    fontSize: '18px',
    marginBottom: '20px',
  },
  startButton: {
    padding: '15px 25px',
    backgroundColor: '#4ECDC4',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '10px',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
  },
  permissionDenied: {
    textAlign: 'center' as const,
    color: '#FFFFFF',
  },
  errorText: {
    fontSize: '18px',
    marginBottom: '10px',
  },
  errorSubtext: {
    fontSize: '14px',
    opacity: 0.8,
  },
  videoContainer: {
    position: 'relative' as const,
    width: '100%',
    height: '100%',
  },
  video: {
    width: '100%',
    height: '100%',
    objectFit: 'cover' as const,
  },
  hiddenCanvas: {
    display: 'none',
  },
  scanOverlay: {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scanFrame: {
    width: '200px',
    height: '200px',
    border: '3px solid #4ECDC4',
    borderRadius: '12px',
    backgroundColor: 'transparent',
  },
  scanInstructions: {
    color: '#FFFFFF',
    fontSize: '14px',
    marginTop: '10px',
    textAlign: 'center' as const,
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: '5px 10px',
    borderRadius: '5px',
  },
  stopButton: {
    display: 'block',
    margin: '15px auto 0',
    padding: '10px 20px',
    backgroundColor: '#D32F2F',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'background-color 0.2s ease',
  },
  manualSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: '12px',
    padding: '20px',
    marginBottom: '20px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  },
  manualTitle: {
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#2D3436',
    marginBottom: '15px',
    margin: '0 0 15px 0',
  },
  manualInputContainer: {
    display: 'flex',
    gap: '10px',
    alignItems: 'center',
  },
  manualInput: {
    flex: 1,
    padding: '12px',
    fontSize: '16px',
    border: '2px solid #E0E0E0',
    borderRadius: '8px',
    outline: 'none',
  },
  submitButton: {
    padding: '12px 20px',
    backgroundColor: '#4ECDC4',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'background-color 0.2s ease',
  },
  scanResult: {
    borderRadius: '12px',
    padding: '20px',
    border: '2px solid',
    textAlign: 'center' as const,
  },
  resultText: {
    fontSize: '18px',
    fontWeight: 'bold',
    margin: 0,
  },
};

export default QRScannerScreen;