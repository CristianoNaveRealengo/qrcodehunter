import { StackNavigationProp } from '@react-navigation/stack';
import React, { useState } from 'react';
import {
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useGame } from '../context/GameContext';
import { RootStackParamList } from '../types';
import { validateGameDuration } from '../utils/validation';

type GameControlNavigationProp = StackNavigationProp<RootStackParamList, 'GameControl'>;

interface Props {
  navigation: GameControlNavigationProp;
}

const GameControlScreen: React.FC<Props> = ({ navigation }) => {
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

    Alert.alert(
      'Criar Novo Jogo',
      'Isso irá resetar todos os dados do jogo atual. Continuar?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Confirmar',
          style: 'destructive',
          onPress: () => {
            dispatch({ type: 'RESET_GAME' });
            dispatch({
              type: 'CREATE_GAME_SESSION',
              payload: { duration: parseInt(gameDuration) },
            });
            Alert.alert('Sucesso', 'Novo jogo criado!');
          },
        },
      ]
    );
  };

  const startGame = () => {
    if (!state.currentSession) {
      Alert.alert('Erro', 'Nenhuma sessão de jogo ativa');
      return;
    }

    if (state.currentSession.teams.length === 0) {
      Alert.alert('Erro', 'Nenhuma equipe cadastrada');
      return;
    }

    if (state.currentSession.qrCodes.length === 0) {
      Alert.alert('Erro', 'Nenhum QR Code gerado');
      return;
    }

    dispatch({ type: 'START_TIMER' });
    Alert.alert('Jogo Iniciado!', 'O cronômetro foi ativado');
  };

  const pauseGame = () => {
    dispatch({ type: 'PAUSE_TIMER' });
    Alert.alert('Jogo Pausado', 'O cronômetro foi pausado');
  };

  const endGame = () => {
    Alert.alert(
      'Finalizar Jogo',
      'Tem certeza que deseja finalizar o jogo?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Finalizar',
          style: 'destructive',
          onPress: () => {
            dispatch({ type: 'END_GAME' });
            Alert.alert('Jogo Finalizado', 'O jogo foi encerrado');
            navigation.navigate('GameResults');
          },
        },
      ]
    );
  };

  const gameStats = state.currentSession
    ? {
        teams: state.currentSession.teams.length,
        qrCodes: state.currentSession.qrCodes.length,
        totalPoints: state.currentSession.qrCodes.reduce((sum, qr) => sum + qr.points, 0),
        scannedCodes: state.currentSession.qrCodes.filter(qr => qr.scannedBy.length > 0).length,
      }
    : null;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-back" size={24} color="#2D3436" />
        </TouchableOpacity>
        <Text style={styles.title}>Controle do Jogo</Text>
      </View>

      {/* Configurações do Jogo */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Configurações</Text>
        
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Duração do Jogo (minutos)</Text>
          <TextInput
            style={[styles.input, durationError && styles.inputError]}
            value={gameDuration}
            onChangeText={(text) => {
              setGameDuration(text);
              if (durationError) validateDuration(text);
            }}
            placeholder="30"
            keyboardType="numeric"
            maxLength={3}
          />
          {durationError && (
            <Text style={styles.errorText}>{durationError}</Text>
          )}
        </View>

        <TouchableOpacity style={styles.createButton} onPress={createNewGame}>
          <Icon name="add-circle" size={24} color="#FFFFFF" />
          <Text style={styles.createButtonText}>Criar Novo Jogo</Text>
        </TouchableOpacity>
      </View>

      {/* Controles do Jogo */}
      {state.currentSession && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Controles</Text>
          
          <View style={styles.controlsGrid}>
            <TouchableOpacity
              style={[
                styles.controlButton,
                styles.startButton,
                state.currentSession.isActive && styles.disabledButton,
              ]}
              onPress={startGame}
              disabled={state.currentSession.isActive}
            >
              <Icon name="play-arrow" size={32} color="#FFFFFF" />
              <Text style={styles.controlButtonText}>Iniciar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.controlButton,
                styles.pauseButton,
                !state.timer.isRunning && styles.disabledButton,
              ]}
              onPress={pauseGame}
              disabled={!state.timer.isRunning}
            >
              <Icon name="pause" size={32} color="#FFFFFF" />
              <Text style={styles.controlButtonText}>Pausar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.controlButton, styles.endButton]}
              onPress={endGame}
            >
              <Icon name="stop" size={32} color="#FFFFFF" />
              <Text style={styles.controlButtonText}>Finalizar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.controlButton, styles.resultsButton]}
              onPress={() => navigation.navigate('GameResults')}
            >
              <Icon name="emoji-events" size={32} color="#FFFFFF" />
              <Text style={styles.controlButtonText}>Resultados</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Status do Jogo */}
      {state.currentSession && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Status do Jogo</Text>
          
          <View style={styles.statusCard}>
            <View style={styles.statusHeader}>
              <View
                style={[
                  styles.statusIndicator,
                  {
                    backgroundColor: state.currentSession.isActive ? '#96CEB4' : '#FF6B6B',
                  },
                ]}
              />
              <Text style={styles.statusText}>
                {state.currentSession.isActive ? 'Jogo Ativo' : 'Jogo Pausado'}
              </Text>
            </View>

            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{gameStats?.teams || 0}</Text>
                <Text style={styles.statLabel}>Equipes</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{gameStats?.qrCodes || 0}</Text>
                <Text style={styles.statLabel}>QR Codes</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{gameStats?.scannedCodes || 0}</Text>
                <Text style={styles.statLabel}>Escaneados</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{gameStats?.totalPoints || 0}</Text>
                <Text style={styles.statLabel}>Pontos Totais</Text>
              </View>
            </View>
          </View>
        </View>
      )}

      {/* Ações Rápidas */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Ações Rápidas</Text>
        
        <TouchableOpacity
          style={styles.quickAction}
          onPress={() => navigation.navigate('QRGeneration')}
        >
          <Icon name="qr-code" size={24} color="#4ECDC4" />
          <Text style={styles.quickActionText}>Gerar QR Codes</Text>
          <Icon name="chevron-right" size={24} color="#636E72" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.quickAction}
          onPress={() => navigation.navigate('MainGame')}
        >
          <Icon name="leaderboard" size={24} color="#4ECDC4" />
          <Text style={styles.quickActionText}>Ver Placar</Text>
          <Icon name="chevron-right" size={24} color="#636E72" />
        </TouchableOpacity>
      </View>
    </ScrollView>
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
    padding: 20,
    marginTop: 40,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backButton: {
    padding: 10,
    marginRight: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2D3436',
  },
  section: {
    backgroundColor: '#FFFFFF',
    margin: 15,
    borderRadius: 12,
    padding: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2D3436',
    marginBottom: 15,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2D3436',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  inputError: {
    borderColor: '#FF6B6B',
  },
  errorText: {
    color: '#FF6B6B',
    fontSize: 14,
    marginTop: 5,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4ECDC4',
    paddingVertical: 15,
    borderRadius: 8,
  },
  createButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  controlsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  controlButton: {
    width: '48%',
    alignItems: 'center',
    paddingVertical: 20,
    borderRadius: 12,
    marginBottom: 10,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  startButton: {
    backgroundColor: '#96CEB4',
  },
  pauseButton: {
    backgroundColor: '#FFEAA7',
  },
  endButton: {
    backgroundColor: '#FF6B6B',
  },
  resultsButton: {
    backgroundColor: '#45B7D1',
  },
  disabledButton: {
    backgroundColor: '#A0A0A0',
    opacity: 0.6,
  },
  controlButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 5,
  },
  statusCard: {
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    padding: 15,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 10,
  },
  statusText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2D3436',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4ECDC4',
  },
  statLabel: {
    fontSize: 12,
    color: '#636E72',
    marginTop: 2,
  },
  quickAction: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  quickActionText: {
    flex: 1,
    fontSize: 16,
    color: '#2D3436',
    marginLeft: 15,
  },
});

export default GameControlScreen;