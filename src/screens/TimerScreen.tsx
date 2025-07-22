import React, { useEffect, useState } from 'react';
import {
    Alert,
    Animated,
    Dimensions,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useGame } from '../context/GameContext';
import { GameLogicService } from '../services/gameLogic';
import { formatTime } from '../utils/validation';

const { width, height } = Dimensions.get('window');

const TimerScreen: React.FC = () => {
  const { state, dispatch } = useGame();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [pulseAnim] = useState(new Animated.Value(1));
  const [warningShown, setWarningShown] = useState(false);
  const [finalWarningShown, setFinalWarningShown] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (state.currentSession && state.timer.isRunning) {
      const timeLeft = GameLogicService.getTimeLeft(state.currentSession, currentTime);
      
      dispatch({ type: 'UPDATE_TIMER', payload: timeLeft });

      // Alertas de tempo
      if (timeLeft <= 60 && timeLeft > 0 && !finalWarningShown) {
        setFinalWarningShown(true);
        Alert.alert('⏰ Último Minuto!', 'Apenas 1 minuto restante!');
        startPulseAnimation();
      } else if (timeLeft <= 300 && timeLeft > 60 && !warningShown) {
        setWarningShown(true);
        Alert.alert('⚠️ Atenção!', 'Restam apenas 5 minutos!');
      }

      // Finalizar jogo automaticamente
      if (timeLeft <= 0 && state.currentSession.isActive) {
        dispatch({ type: 'END_GAME' });
        Alert.alert(
          '🏁 Tempo Esgotado!',
          'O jogo foi finalizado automaticamente.',
          [{ text: 'Ver Resultados', onPress: () => {} }]
        );
      }
    }
  }, [currentTime, state.currentSession, state.timer.isRunning]);

  const startPulseAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const getTimerColor = (timeLeft: number) => {
    if (timeLeft <= 60) return '#FF6B6B'; // Vermelho - crítico
    if (timeLeft <= 300) return '#FFEAA7'; // Amarelo - aviso
    return '#4ECDC4'; // Verde - normal
  };

  const getTimerIcon = (timeLeft: number) => {
    if (timeLeft <= 60) return 'timer-off';
    if (timeLeft <= 300) return 'timer';
    return 'timer';
  };

  const getProgressPercentage = () => {
    if (!state.currentSession) return 100;
    
    const totalSeconds = state.currentSession.duration * 60;
    const timeLeft = state.timer.timeLeft;
    return Math.max(0, (timeLeft / totalSeconds) * 100);
  };

  const getGameStatusMessage = () => {
    if (!state.currentSession) {
      return 'Nenhum jogo ativo';
    }

    if (!state.currentSession.isActive) {
      return 'Jogo pausado';
    }

    if (!state.timer.isRunning) {
      return 'Aguardando início';
    }

    const timeLeft = state.timer.timeLeft;
    if (timeLeft <= 0) {
      return 'Tempo esgotado!';
    }

    return 'Jogo em andamento';
  };

  if (!state.currentSession) {
    return (
      <View style={styles.emptyContainer}>
        <Icon name="timer-off" size={80} color="#636E72" />
        <Text style={styles.emptyTitle}>Nenhum Jogo Ativo</Text>
        <Text style={styles.emptyText}>
          O cronômetro aparecerá quando um jogo for iniciado
        </Text>
      </View>
    );
  }

  const timeLeft = state.timer.timeLeft;
  const timerColor = getTimerColor(timeLeft);
  const timerIcon = getTimerIcon(timeLeft);
  const progressPercentage = getProgressPercentage();

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Cronômetro</Text>
        <Text style={styles.gameStatus}>{getGameStatusMessage()}</Text>
      </View>

      {/* Timer Principal */}
      <View style={styles.timerContainer}>
        <Animated.View
          style={[
            styles.timerCircle,
            {
              borderColor: timerColor,
              transform: [{ scale: timeLeft <= 60 ? pulseAnim : 1 }],
            },
          ]}
        >
          <Icon name={timerIcon} size={60} color={timerColor} />
          <Text style={[styles.timeText, { color: timerColor }]}>
            {formatTime(timeLeft)}
          </Text>
          <Text style={styles.timeLabel}>restante</Text>
        </Animated.View>

        {/* Barra de Progresso */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <Animated.View
              style={[
                styles.progressFill,
                {
                  width: `${progressPercentage}%`,
                  backgroundColor: timerColor,
                },
              ]}
            />
          </View>
          <Text style={styles.progressText}>
            {Math.round(progressPercentage)}% do tempo restante
          </Text>
        </View>
      </View>

      {/* Informações do Jogo */}
      <View style={styles.gameInfo}>
        <View style={styles.infoCard}>
          <Icon name="schedule" size={24} color="#4ECDC4" />
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>Duração Total</Text>
            <Text style={styles.infoValue}>
              {state.currentSession.duration} minutos
            </Text>
          </View>
        </View>

        <View style={styles.infoCard}>
          <Icon name="play-arrow" size={24} color="#96CEB4" />
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>Início</Text>
            <Text style={styles.infoValue}>
              {state.currentSession.startTime
                ? new Date(state.currentSession.startTime).toLocaleTimeString('pt-BR', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })
                : 'Não iniciado'}
            </Text>
          </View>
        </View>

        <View style={styles.infoCard}>
          <Icon name="stop" size={24} color="#FF6B6B" />
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>Término Previsto</Text>
            <Text style={styles.infoValue}>
              {state.currentSession.startTime
                ? new Date(
                    new Date(state.currentSession.startTime).getTime() +
                      state.currentSession.duration * 60 * 1000
                  ).toLocaleTimeString('pt-BR', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })
                : '--:--'}
            </Text>
          </View>
        </View>
      </View>

      {/* Alertas de Tempo */}
      {timeLeft <= 300 && timeLeft > 0 && (
        <View style={[styles.warningContainer, { backgroundColor: timerColor + '20' }]}>
          <Icon name="warning" size={20} color={timerColor} />
          <Text style={[styles.warningText, { color: timerColor }]}>
            {timeLeft <= 60
              ? 'Último minuto! Finalize seus escaneamentos!'
              : 'Atenção! Poucos minutos restantes!'}
          </Text>
        </View>
      )}

      {/* Status das Equipes */}
      <View style={styles.teamsStatus}>
        <Text style={styles.teamsTitle}>Status das Equipes</Text>
        <View style={styles.teamsStats}>
          <View style={styles.teamsStat}>
            <Text style={styles.teamsStatNumber}>
              {state.currentSession.teams.length}
            </Text>
            <Text style={styles.teamsStatLabel}>Equipes</Text>
          </View>
          <View style={styles.teamsStat}>
            <Text style={styles.teamsStatNumber}>
              {state.currentSession.teams.reduce((sum, team) => sum + team.score, 0)}
            </Text>
            <Text style={styles.teamsStatLabel}>Pontos Totais</Text>
          </View>
          <View style={styles.teamsStat}>
            <Text style={styles.teamsStatNumber}>
              {state.currentSession.qrCodes.filter(qr => qr.scannedBy.length > 0).length}
            </Text>
            <Text style={styles.teamsStatLabel}>QRs Escaneados</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2D3436',
    marginBottom: 5,
  },
  gameStatus: {
    fontSize: 16,
    color: '#636E72',
    fontStyle: 'italic',
  },
  timerContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  timerCircle: {
    width: 250,
    height: 250,
    borderRadius: 125,
    borderWidth: 8,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    marginBottom: 30,
  },
  timeText: {
    fontSize: 48,
    fontWeight: 'bold',
    marginTop: 10,
  },
  timeLabel: {
    fontSize: 16,
    color: '#636E72',
    marginTop: 5,
  },
  progressContainer: {
    width: width - 60,
    alignItems: 'center',
  },
  progressBar: {
    width: '100%',
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    color: '#636E72',
    marginTop: 8,
  },
  gameInfo: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  infoContent: {
    marginLeft: 15,
    flex: 1,
  },
  infoLabel: {
    fontSize: 14,
    color: '#636E72',
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2D3436',
  },
  warningContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    padding: 15,
    borderRadius: 12,
    marginBottom: 20,
  },
  warningText: {
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 10,
    flex: 1,
  },
  teamsStatus: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    borderRadius: 12,
    padding: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  teamsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2D3436',
    marginBottom: 15,
    textAlign: 'center',
  },
  teamsStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  teamsStat: {
    alignItems: 'center',
  },
  teamsStatNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4ECDC4',
  },
  teamsStatLabel: {
    fontSize: 12,
    color: '#636E72',
    marginTop: 2,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2D3436',
    marginTop: 20,
    marginBottom: 10,
  },
  emptyText: {
    fontSize: 16,
    color: '#636E72',
    textAlign: 'center',
    lineHeight: 24,
  },
});

export default TimerScreen;