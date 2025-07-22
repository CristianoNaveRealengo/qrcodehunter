import { StackNavigationProp } from '@react-navigation/stack';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    Dimensions,
    ScrollView,
    Share,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useGame } from '../context/GameContext';
import { QRCode as QRCodeType, RootStackParamList } from '../types';
import { generateRandomPoints, generateUniqueId } from '../utils/validation';

type QRGenerationNavigationProp = StackNavigationProp<RootStackParamList, 'QRGeneration'>;

interface Props {
  navigation: QRGenerationNavigationProp;
}

const { width } = Dimensions.get('window');
const QR_SIZE = (width - 80) / 2;

const QRGenerationScreen: React.FC<Props> = ({ navigation }) => {
  const { state, dispatch } = useGame();
  const [generatedCodes, setGeneratedCodes] = useState<QRCodeType[]>([]);

  useEffect(() => {
    if (state.currentSession?.qrCodes) {
      setGeneratedCodes(state.currentSession.qrCodes);
    }
  }, [state.currentSession?.qrCodes]);

  const generateQRCode = () => {
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
    Alert.alert(
      'Gerar Múltiplos Códigos',
      'Quantos códigos você deseja gerar?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: '5 códigos', onPress: () => generateBatch(5) },
        { text: '10 códigos', onPress: () => generateBatch(10) },
        { text: '20 códigos', onPress: () => generateBatch(20) },
      ]
    );
  };

  const generateBatch = (count: number) => {
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
    
    Alert.alert('Sucesso', `${count} códigos QR foram gerados!`);
  };

  const shareQRCode = async (qrCode: QRCodeType) => {
    try {
      await Share.share({
        message: `Código QR da Gincana - ${qrCode.points} pontos\nCódigo: ${qrCode.code}`,
        title: 'Código QR da Gincana',
      });
    } catch (error) {
      console.error('Erro ao compartilhar:', error);
    }
  };

  const clearAllCodes = () => {
    Alert.alert(
      'Limpar Códigos',
      'Tem certeza que deseja remover todos os códigos QR?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Confirmar',
          style: 'destructive',
          onPress: () => {
            setGeneratedCodes([]);
            // Reset da sessão para limpar os códigos
            if (state.currentSession) {
              dispatch({ type: 'CREATE_GAME_SESSION', payload: { duration: 30 } });
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-back" size={24} color="#2D3436" />
        </TouchableOpacity>
        <Text style={styles.title}>Gerar QR Codes</Text>
        <TouchableOpacity
          style={styles.controlButton}
          onPress={() => navigation.navigate('GameControl')}
        >
          <Icon name="settings" size={24} color="#4ECDC4" />
        </TouchableOpacity>
      </View>

      <View style={styles.actionButtons}>
        <TouchableOpacity style={styles.generateButton} onPress={generateQRCode}>
          <Icon name="qr-code" size={24} color="#FFFFFF" />
          <Text style={styles.generateButtonText}>Gerar 1 Código</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.batchButton} onPress={generateMultipleCodes}>
          <Icon name="qr-code-scanner" size={24} color="#FFFFFF" />
          <Text style={styles.batchButtonText}>Gerar Vários</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{generatedCodes.length}</Text>
          <Text style={styles.statLabel}>Códigos Gerados</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>
            {generatedCodes.reduce((sum, code) => sum + code.points, 0)}
          </Text>
          <Text style={styles.statLabel}>Pontos Totais</Text>
        </View>
      </View>

      <ScrollView style={styles.codesContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.codesGrid}>
          {generatedCodes.map((qrCode) => (
            <View key={qrCode.id} style={styles.qrCodeCard}>
              <QRCode
                value={qrCode.code}
                size={QR_SIZE - 40}
                backgroundColor="#FFFFFF"
                color="#2D3436"
              />
              <View style={styles.qrCodeInfo}>
                <Text style={styles.pointsText}>{qrCode.points} pts</Text>
                <Text style={styles.codeText} numberOfLines={1}>
                  {qrCode.code}
                </Text>
                <TouchableOpacity
                  style={styles.shareButton}
                  onPress={() => shareQRCode(qrCode)}
                >
                  <Icon name="share" size={16} color="#4ECDC4" />
                  <Text style={styles.shareButtonText}>Compartilhar</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      {generatedCodes.length > 0 && (
        <TouchableOpacity style={styles.clearButton} onPress={clearAllCodes}>
          <Icon name="delete" size={20} color="#FF6B6B" />
          <Text style={styles.clearButtonText}>Limpar Todos</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    marginTop: 40,
  },
  backButton: {
    padding: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2D3436',
  },
  controlButton: {
    padding: 10,
  },
  actionButtons: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 15,
    marginBottom: 20,
  },
  generateButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4ECDC4',
    paddingVertical: 15,
    borderRadius: 12,
  },
  generateButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  batchButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#45B7D1',
    paddingVertical: 15,
    borderRadius: 12,
  },
  batchButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  statItem: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginHorizontal: 5,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4ECDC4',
  },
  statLabel: {
    fontSize: 12,
    color: '#636E72',
    marginTop: 5,
  },
  codesContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  codesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  qrCodeCard: {
    width: QR_SIZE,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  qrCodeInfo: {
    alignItems: 'center',
    marginTop: 10,
    width: '100%',
  },
  pointsText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FF6B6B',
  },
  codeText: {
    fontSize: 10,
    color: '#636E72',
    marginTop: 5,
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    paddingVertical: 5,
    paddingHorizontal: 10,
    backgroundColor: '#F0F0F0',
    borderRadius: 8,
  },
  shareButtonText: {
    fontSize: 12,
    color: '#4ECDC4',
    marginLeft: 4,
  },
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginBottom: 20,
    paddingVertical: 15,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FF6B6B',
  },
  clearButtonText: {
    color: '#FF6B6B',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
});

export default QRGenerationScreen;