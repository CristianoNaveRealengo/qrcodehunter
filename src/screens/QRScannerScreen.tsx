import React, { useEffect, useState } from 'react';
import {
    Alert,
    Dimensions,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    Vibration,
    View,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Camera, useCameraDevices, useCodeScanner } from 'react-native-vision-camera';
import { useGame } from '../context/GameContext';
import { validateQRCode } from '../utils/validation';

const { width, height } = Dimensions.get('window');

const QRScannerScreen: React.FC = () => {
  const { state, dispatch } = useGame();
  const [hasPermission, setHasPermission] = useState(false);
  const [isActive, setIsActive] = useState(true);
  const [flashEnabled, setFlashEnabled] = useState(false);
  const [lastScannedCode, setLastScannedCode] = useState<string>('');

  const devices = useCameraDevices();
  const device = devices.back;

  useEffect(() => {
    checkCameraPermission();
  }, []);

  const checkCameraPermission = async () => {
    try {
      const permission = await Camera.requestCameraPermission();
      setHasPermission(permission === 'authorized');
    } catch (error) {
      console.error('Erro ao verificar permissão da câmera:', error);
      Alert.alert('Erro', 'Não foi possível acessar a câmera');
    }
  };

  const codeScanner = useCodeScanner({
    codeTypes: ['qr'],
    onCodeScanned: (codes) => {
      if (codes.length > 0 && isActive) {
        const scannedValue = codes[0].value;
        if (scannedValue && scannedValue !== lastScannedCode) {
          setLastScannedCode(scannedValue);
          handleQRCodeScanned(scannedValue);
        }
      }
    },
  });

  const handleQRCodeScanned = (code: string) => {
    if (!validateQRCode(code) || !code.startsWith('GINCANA_')) {
      Alert.alert('Código Inválido', 'Este não é um código QR válido da gincana');
      return;
    }

    if (!state.currentTeam) {
      Alert.alert('Erro', 'Nenhuma equipe selecionada');
      return;
    }

    if (!state.currentSession?.isActive) {
      Alert.alert('Jogo Pausado', 'O jogo não está ativo no momento');
      return;
    }

    const qrCode = state.currentSession.qrCodes.find(qr => qr.code === code);
    
    if (!qrCode) {
      Alert.alert('Código Não Encontrado', 'Este código QR não foi encontrado no sistema');
      return;
    }

    if (qrCode.scannedBy.includes(state.currentTeam.id)) {
      Alert.alert(
        'Código Já Usado',
        'Sua equipe já escaneou este código QR!'
      );
      return;
    }

    // Pausar scanner temporariamente
    setIsActive(false);

    // Feedback tátil
    Vibration.vibrate(200);

    // Processar escaneamento
    dispatch({
      type: 'SCAN_QR_CODE',
      payload: {
        teamId: state.currentTeam.id,
        qrCodeId: qrCode.id,
      },
    });

    // Mostrar feedback de sucesso
    Alert.alert(
      'Parabéns! 🎉',
      `Sua equipe ganhou ${qrCode.points} pontos!`,
      [
        {
          text: 'Continuar',
          onPress: () => {
            setIsActive(true);
            setLastScannedCode('');
          },
        },
      ]
    );
  };

  const toggleFlash = () => {
    setFlashEnabled(!flashEnabled);
  };

  if (!hasPermission) {
    return (
      <View style={styles.permissionContainer}>
        <Icon name="camera-alt" size={80} color="#636E72" />
        <Text style={styles.permissionTitle}>Permissão da Câmera</Text>
        <Text style={styles.permissionText}>
          Precisamos acessar sua câmera para escanear os códigos QR
        </Text>
        <TouchableOpacity style={styles.permissionButton} onPress={checkCameraPermission}>
          <Text style={styles.permissionButtonText}>Permitir Câmera</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!device) {
    return (
      <View style={styles.errorContainer}>
        <Icon name="error" size={80} color="#FF6B6B" />
        <Text style={styles.errorText}>Câmera não disponível</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      
      <Camera
        style={styles.camera}
        device={device}
        isActive={isActive}
        codeScanner={codeScanner}
        torch={flashEnabled ? 'on' : 'off'}
      />

      {/* Overlay */}
      <View style={styles.overlay}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.teamInfo}>
            <Text style={styles.teamName}>{state.currentTeam?.name}</Text>
            <Text style={styles.teamScore}>
              {state.currentTeam?.score || 0} pontos
            </Text>
          </View>
        </View>

        {/* Scanner Frame */}
        <View style={styles.scannerFrame}>
          <View style={styles.scannerCorner} />
          <View style={[styles.scannerCorner, styles.topRight]} />
          <View style={[styles.scannerCorner, styles.bottomLeft]} />
          <View style={[styles.scannerCorner, styles.bottomRight]} />
        </View>

        {/* Instructions */}
        <View style={styles.instructions}>
          <Text style={styles.instructionText}>
            Aponte a câmera para o código QR
          </Text>
          <Text style={styles.instructionSubtext}>
            O código será escaneado automaticamente
          </Text>
        </View>

        {/* Controls */}
        <View style={styles.controls}>
          <TouchableOpacity
            style={[styles.controlButton, flashEnabled && styles.controlButtonActive]}
            onPress={toggleFlash}
          >
            <Icon 
              name={flashEnabled ? 'flash-on' : 'flash-off'} 
              size={24} 
              color={flashEnabled ? '#FFD700' : '#FFFFFF'} 
            />
            <Text style={styles.controlButtonText}>Flash</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  camera: {
    flex: 1,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'space-between',
  },
  header: {
    paddingTop: 50,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  teamInfo: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    alignItems: 'center',
  },
  teamName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  teamScore: {
    fontSize: 14,
    color: '#4ECDC4',
    marginTop: 2,
  },
  scannerFrame: {
    alignSelf: 'center',
    width: 250,
    height: 250,
    position: 'relative',
  },
  scannerCorner: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderColor: '#4ECDC4',
    borderWidth: 4,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderRightWidth: 0,
    borderBottomWidth: 0,
    top: 0,
    left: 0,
  },
  topRight: {
    top: 0,
    right: 0,
    left: undefined,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    top: undefined,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderTopWidth: 0,
    borderRightWidth: 0,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    top: undefined,
    left: undefined,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderTopWidth: 0,
    borderLeftWidth: 0,
  },
  instructions: {
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  instructionText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
  },
  instructionSubtext: {
    fontSize: 14,
    color: '#A0A0A0',
    textAlign: 'center',
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingBottom: 50,
  },
  controlButton: {
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  controlButtonActive: {
    borderColor: '#FFD700',
  },
  controlButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    marginTop: 4,
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    paddingHorizontal: 40,
  },
  permissionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2D3436',
    marginTop: 20,
    marginBottom: 10,
  },
  permissionText: {
    fontSize: 16,
    color: '#636E72',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 30,
  },
  permissionButton: {
    backgroundColor: '#4ECDC4',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 12,
  },
  permissionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
  },
  errorText: {
    fontSize: 18,
    color: '#FF6B6B',
    marginTop: 20,
  },
});

export default QRScannerScreen;