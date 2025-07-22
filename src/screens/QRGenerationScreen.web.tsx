import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { useGame } from '../context/GameContext';
import { QRCode as QRCodeType } from '../types';
import { generateRandomPoints, generateUniqueId } from '../utils/validation';

interface QRCodeCardProps {
  qrCode: QRCodeType;
  onShare: (qrCode: QRCodeType) => void;
  onPrint: (qrCode: QRCodeType) => void;
}

const QRCodeCard: React.FC<QRCodeCardProps> = ({ qrCode, onShare, onPrint }) => {
  const [qrImageUrl, setQrImageUrl] = useState<string>('');

  useEffect(() => {
    const generateImage = async () => {
      try {
        const dataUrl = await QRCode.toDataURL(qrCode.code, {
          width: 150,
          margin: 2,
          color: {
            dark: '#2D3436',
            light: '#FFFFFF'
          },
          errorCorrectionLevel: 'M'
        });
        setQrImageUrl(dataUrl);
      } catch (error) {
        console.error('Erro ao gerar QR Code:', error);
      }
    };
    generateImage();
  }, [qrCode.code]);

  return (
    <div style={styles.qrCodeCard}>
      {qrImageUrl ? (
        <img 
          src={qrImageUrl} 
          alt={`QR Code: ${qrCode.code}`}
          style={styles.qrCodeImage}
        />
      ) : (
        <div style={styles.qrCodeError}>
          ❌ Erro ao gerar QR
        </div>
      )}
      <div style={styles.qrCodeInfo}>
        <div style={styles.pointsText}>{qrCode.points} pts</div>
        <div style={styles.codeText}>
          {qrCode.code}
        </div>
        <div style={styles.buttonContainer}>
          <button
            style={styles.shareButton}
            onClick={() => onShare(qrCode)}
          >
            📤 Compartilhar
          </button>
          <button
            style={styles.printButton}
            onClick={() => onPrint(qrCode)}
          >
            🖨️ Imprimir
          </button>
        </div>
      </div>
    </div>
  );
};

interface Props {
  onBack: () => void;
  onNavigateToGameControl: () => void;
}

const QRGenerationScreen: React.FC<Props> = ({ onBack, onNavigateToGameControl }) => {
  const { state, dispatch } = useGame();
  const [generatedCodes, setGeneratedCodes] = useState<QRCodeType[]>([]);

  useEffect(() => {
    if (state.currentSession?.qrCodes) {
      setGeneratedCodes(state.currentSession.qrCodes);
    }
  }, [state.currentSession?.qrCodes]);

  const generateQRCode = async () => {
    const newCode: QRCodeType = {
      id: generateUniqueId(),
      code: `GINCANA_${generateUniqueId()}`,
      points: generateRandomPoints(),
      isActive: true,
      scannedBy: [],
      createdAt: new Date(),
    };

    // Se não há sessão ativa, criar uma nova
    if (!state.currentSession) {
      dispatch({ type: 'CREATE_GAME_SESSION', payload: { duration: 30 } });
    }

    dispatch({ type: 'ADD_QR_CODE', payload: newCode });
    setGeneratedCodes(prev => [...prev, newCode]);
  };

  const generateMultipleCodes = () => {
    // Usando window.prompt com fallback para ambientes sem suporte
    const count = window.prompt ? 
      window.prompt('Quantos códigos você deseja gerar? (5, 10 ou 20)') :
      '10'; // Fallback padrão para 10 códigos
    
    const numCount = parseInt(count || '0');
    
    if ([5, 10, 20].includes(numCount)) {
      generateBatch(numCount);
    } else if (count) {
      alert('Por favor, escolha 5, 10 ou 20 códigos.');
    }
  };

  const generateBatch = async (count: number) => {
    const newCodes: QRCodeType[] = [];
    
    for (let i = 0; i < count; i++) {
      const newCode: QRCodeType = {
        id: generateUniqueId(),
        code: `GINCANA_${generateUniqueId()}`,
        points: generateRandomPoints(),
        isActive: true,
        scannedBy: [],
        createdAt: new Date(),
      };
      newCodes.push(newCode);
    }

    // Se não há sessão ativa, criar uma nova
    if (!state.currentSession) {
      dispatch({ type: 'CREATE_GAME_SESSION', payload: { duration: 30 } });
    }

    newCodes.forEach(code => {
      dispatch({ type: 'ADD_QR_CODE', payload: code });
    });

    setGeneratedCodes(prev => [...prev, ...newCodes]);
    
    alert(`${count} códigos QR foram gerados!`);
  };

  const shareQRCode = async (qrCode: QRCodeType) => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'Código QR da Gincana',
          text: `Código QR da Gincana - ${qrCode.points} pontos\nCódigo: ${qrCode.code}`,
        });
      } else {
        // Fallback para navegadores que não suportam Web Share API
        navigator.clipboard.writeText(`Código QR da Gincana - ${qrCode.points} pontos\nCódigo: ${qrCode.code}`);
        alert('Código copiado para a área de transferência!');
      }
    } catch (error) {
      console.error('Erro ao compartilhar:', error);
      alert('Erro ao compartilhar o código.');
    }
  };

  const printQRCode = async (qrCode: QRCodeType) => {
    try {
      // Gerar a imagem do QR code para impressão
      const dataUrl = await QRCode.toDataURL(qrCode.code, {
        width: 300,
        margin: 4,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        },
        errorCorrectionLevel: 'M'
      });

      // Criar uma nova janela para impressão
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>QR Code - ${qrCode.code}</title>
              <style>
                body {
                  font-family: Arial, sans-serif;
                  text-align: center;
                  margin: 20px;
                }
                .qr-container {
                  border: 2px solid #000;
                  padding: 20px;
                  margin: 20px auto;
                  width: fit-content;
                  border-radius: 10px;
                }
                .qr-image {
                  display: block;
                  margin: 0 auto 15px;
                }
                .qr-info {
                  font-size: 16px;
                  margin: 10px 0;
                }
                .points {
                  font-size: 24px;
                  font-weight: bold;
                  color: #FF6B6B;
                }
                .code {
                  font-size: 14px;
                  color: #666;
                  word-break: break-all;
                }
                @media print {
                  body { margin: 0; }
                  .qr-container { border: 2px solid #000; }
                }
              </style>
            </head>
            <body>
              <div class="qr-container">
                <h2>QR Code da Gincana</h2>
                <img src="${dataUrl}" alt="QR Code" class="qr-image" />
                <div class="qr-info">
                  <div class="points">${qrCode.points} pontos</div>
                  <div class="code">Código: ${qrCode.code}</div>
                  <div style="font-size: 12px; color: #999; margin-top: 15px;">
                    Gerado em: ${new Date(qrCode.createdAt).toLocaleString('pt-BR')}
                  </div>
                </div>
              </div>
            </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.focus();
        
        // Aguardar um pouco para a imagem carregar antes de imprimir
        setTimeout(() => {
          printWindow.print();
          printWindow.close();
        }, 500);
      }
    } catch (error) {
      console.error('Erro ao imprimir QR code:', error);
      alert('Erro ao imprimir o código QR.');
    }
  };

  const printAllQRCodes = async () => {
    if (generatedCodes.length === 0) {
      alert('Não há códigos QR para imprimir.');
      return;
    }

    try {
      // Gerar todas as imagens dos QR codes
      const qrImages = await Promise.all(
        generatedCodes.map(async (qrCode) => {
          const dataUrl = await QRCode.toDataURL(qrCode.code, {
            width: 250,
            margin: 3,
            color: {
              dark: '#000000',
              light: '#FFFFFF'
            },
            errorCorrectionLevel: 'M'
          });
          return { ...qrCode, imageUrl: dataUrl };
        })
      );

      // Criar uma nova janela para impressão de todos os códigos
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        const qrCodesHtml = qrImages.map(qr => `
          <div class="qr-item">
            <img src="${qr.imageUrl}" alt="QR Code" class="qr-image" />
            <div class="qr-info">
              <div class="points">${qr.points} pts</div>
              <div class="code">${qr.code}</div>
            </div>
          </div>
        `).join('');

        printWindow.document.write(`
          <html>
            <head>
              <title>Todos os QR Codes da Gincana</title>
              <style>
                body {
                  font-family: Arial, sans-serif;
                  margin: 20px;
                }
                .header {
                  text-align: center;
                  margin-bottom: 30px;
                  border-bottom: 2px solid #000;
                  padding-bottom: 15px;
                }
                .qr-grid {
                  display: grid;
                  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                  gap: 20px;
                  margin-top: 20px;
                }
                .qr-item {
                  border: 1px solid #000;
                  padding: 15px;
                  text-align: center;
                  border-radius: 8px;
                  page-break-inside: avoid;
                }
                .qr-image {
                  width: 150px;
                  height: 150px;
                  margin-bottom: 10px;
                }
                .points {
                  font-size: 18px;
                  font-weight: bold;
                  color: #FF6B6B;
                  margin: 5px 0;
                }
                .code {
                  font-size: 10px;
                  color: #666;
                  word-break: break-all;
                }
                .summary {
                  text-align: center;
                  margin: 20px 0;
                  font-size: 14px;
                }
                @media print {
                  body { margin: 10px; }
                  .qr-grid { gap: 15px; }
                  .qr-item { border: 1px solid #000; }
                }
              </style>
            </head>
            <body>
              <div class="header">
                <h1>QR Codes da Gincana</h1>
                <div class="summary">
                  Total de códigos: ${generatedCodes.length} | 
                  Pontos totais: ${generatedCodes.reduce((sum, code) => sum + code.points, 0)} pts
                </div>
              </div>
              <div class="qr-grid">
                ${qrCodesHtml}
              </div>
            </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.focus();
        
        // Aguardar um pouco para as imagens carregarem antes de imprimir
        setTimeout(() => {
          printWindow.print();
          printWindow.close();
        }, 1000);
      }
    } catch (error) {
      console.error('Erro ao imprimir todos os QR codes:', error);
      alert('Erro ao imprimir os códigos QR.');
    }
  };

  const clearAllCodes = () => {
    // Usando window.confirm que é mais compatível
    const shouldClear = window.confirm ? 
      window.confirm('Tem certeza que deseja remover todos os códigos QR?') :
      true; // Fallback para ambientes sem confirm
    
    if (shouldClear) {
      setGeneratedCodes([]);
      // Reset da sessão para limpar os códigos
      if (state.currentSession) {
        dispatch({ type: 'CREATE_GAME_SESSION', payload: { duration: 30 } });
      }
    }
  };



  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <button style={styles.backButton} onClick={onBack}>
          ← Voltar
        </button>
        <h1 style={styles.title}>Gerar QR Codes</h1>
        <button style={styles.controlButton} onClick={onNavigateToGameControl}>
          ⚙️ Controle
        </button>
      </div>

      <div style={styles.actionButtons}>
        <button style={styles.generateButton} onClick={generateQRCode}>
          📱 Gerar 1 Código
        </button>

        <button style={styles.batchButton} onClick={generateMultipleCodes}>
          📊 Gerar Vários
        </button>

        {generatedCodes.length > 0 && (
          <button style={styles.printAllButton} onClick={printAllQRCodes}>
            🖨️ Imprimir Todos
          </button>
        )}
      </div>

      <div style={styles.statsContainer}>
        <div style={styles.statItem}>
          <div style={styles.statNumber}>{generatedCodes.length}</div>
          <div style={styles.statLabel}>Códigos Gerados</div>
        </div>
        <div style={styles.statItem}>
          <div style={styles.statNumber}>
            {generatedCodes.reduce((sum, code) => sum + code.points, 0)}
          </div>
          <div style={styles.statLabel}>Pontos Totais</div>
        </div>
      </div>

      <div style={styles.codesContainer}>
        <div style={styles.codesGrid}>
          {generatedCodes.map((qrCode) => (
            <QRCodeCard key={qrCode.id} qrCode={qrCode} onShare={shareQRCode} onPrint={printQRCode} />
          ))}
        </div>
      </div>

      {generatedCodes.length > 0 && (
        <button style={styles.clearButton} onClick={clearAllCodes}>
          🗑️ Limpar Todos
        </button>
      )}
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column' as const,
    height: '100vh',
    backgroundColor: '#F8F9FA',
    fontFamily: 'Arial, sans-serif',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '20px',
    marginTop: '20px',
  },
  backButton: {
    padding: '10px 15px',
    backgroundColor: 'transparent',
    border: 'none',
    fontSize: '16px',
    cursor: 'pointer',
    borderRadius: '8px',
    transition: 'background-color 0.2s',
  },
  title: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#2D3436',
    margin: 0,
  },
  controlButton: {
    padding: '10px 15px',
    backgroundColor: 'transparent',
    border: 'none',
    fontSize: '16px',
    cursor: 'pointer',
    borderRadius: '8px',
    transition: 'background-color 0.2s',
  },
  actionButtons: {
    display: 'flex',
    padding: '0 20px',
    gap: '15px',
    marginBottom: '20px',
  },
  generateButton: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4ECDC4',
    color: '#FFFFFF',
    padding: '15px',
    border: 'none',
    borderRadius: '12px',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  },
  batchButton: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#45B7D1',
    color: '#FFFFFF',
    padding: '15px',
    border: 'none',
    borderRadius: '12px',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  },
  statsContainer: {
    display: 'flex',
    padding: '0 20px',
    marginBottom: '20px',
    gap: '10px',
  },
  statItem: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: '15px',
    borderRadius: '12px',
    textAlign: 'center' as const,
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  statNumber: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#4ECDC4',
  },
  statLabel: {
    fontSize: '12px',
    color: '#636E72',
    marginTop: '5px',
  },
  codesContainer: {
    flex: 1,
    padding: '0 20px',
    overflowY: 'auto' as const,
  },
  codesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
    gap: '15px',
  },
  qrCodeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: '12px',
    padding: '15px',
    textAlign: 'center' as const,
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
  },
  qrCodeImage: {
    width: '150px',
    height: '150px',
    border: '1px solid #E0E0E0',
    borderRadius: '8px',
  },
  qrCodeError: {
    width: '150px',
    height: '150px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFE5E5',
    border: '1px solid #FF6B6B',
    borderRadius: '8px',
    color: '#FF6B6B',
    fontSize: '14px',
  },
  qrCodeInfo: {
    marginTop: '10px',
  },
  pointsText: {
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#FF6B6B',
  },
  codeText: {
    fontSize: '10px',
    color: '#636E72',
    marginTop: '5px',
    wordBreak: 'break-all' as const,
  },
  buttonContainer: {
    display: 'flex',
    gap: '5px',
    marginTop: '8px',
  },
  shareButton: {
    flex: 1,
    padding: '5px 8px',
    backgroundColor: '#F0F0F0',
    border: 'none',
    borderRadius: '6px',
    fontSize: '11px',
    color: '#4ECDC4',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  },
  printButton: {
    flex: 1,
    padding: '5px 8px',
    backgroundColor: '#F0F0F0',
    border: 'none',
    borderRadius: '6px',
    fontSize: '11px',
    color: '#FF6B6B',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  },
  printAllButton: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF6B6B',
    color: '#FFFFFF',
    padding: '15px',
    border: 'none',
    borderRadius: '12px',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  },
  clearButton: {
    margin: '20px',
    padding: '15px',
    backgroundColor: '#FFFFFF',
    color: '#FF6B6B',
    border: '1px solid #FF6B6B',
    borderRadius: '12px',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  },
};

export default QRGenerationScreen;