import { StackNavigationProp } from '@react-navigation/stack';
import React, { useEffect, useState } from 'react';
import {
	Animated,
	Dimensions,
	ScrollView,
	Share,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useGame } from '../context/GameContext';
import { GameLogicService } from '../services/gameLogic';
import { StorageService } from '../services/storage';
import { RootStackParamList, Team } from '../types';

type GameResultsNavigationProp = StackNavigationProp<RootStackParamList, 'GameResults'>;

interface Props {
  navigation: GameResultsNavigationProp;
}

const { width } = Dimensions.get('window');

const GameResultsScreen: React.FC<Props> = ({ navigation }) => {
  const { state, dispatch } = useGame();
  const [rankedTeams, setRankedTeams] = useState<Team[]>([]);
  const [animatedValues] = useState<{ [key: string]: Animated.Value }>({});
  const [celebrationAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    if (state.currentSession?.teams) {
      const ranking = GameLogicService.calculateRanking(state.currentSession.teams);
      setRankedTeams(ranking);

      // Inicializar animações
      ranking.forEach((team, index) => {
        animatedValues[team.id] = new Animated.Value(0);
      });

      // Animar entrada dos resultados
      const animations = ranking.map((team, index) =>
        Animated.timing(animatedValues[team.id], {
          toValue: 1,
          duration: 500,
          delay: index * 200,
          useNativeDriver: true,
        })
      );

      Animated.stagger(200, animations).start();

      // Animação de celebração para o vencedor
      if (ranking.length > 0) {
        setTimeout(() => {
          Animated.loop(
            Animated.sequence([
              Animated.timing(celebrationAnim, {
                toValue: 1,
                duration: 1000,
                useNativeDriver: true,
              }),
              Animated.timing(celebrationAnim, {
                toValue: 0,
                duration: 1000,
                useNativeDriver: true,
              }),
            ])
          ).start();
        }, 1000);
      }

      // Salvar jogo no histórico
      if (state.currentSession) {
        StorageService.saveGameToHistory(state.currentSession);
      }
    }
  }, [state.currentSession]);

  const getPositionEmoji = (position: number) => {
    switch (position) {
      case 1:
        return '🏆';
      case 2:
        return '🥈';
      case 3:
        return '🥉';
      default:
        return '🏅';
    }
  };

  const getPositionColors = (position: number) => {
    switch (position) {
      case 1:
        return {
          background: '#FFD700',
          text: '#FFFFFF',
          shadow: '#FFA500',
        };
      case 2:
        return {
          background: '#C0C0C0',
          text: '#FFFFFF',
          shadow: '#A0A0A0',
        };
      case 3:
        return {
          background: '#CD7F32',
          text: '#FFFFFF',
          shadow: '#B8860B',
        };
      default:
        return {
          background: '#FFFFFF',
          text: '#2D3436',
          shadow: '#E0E0E0',
        };
    }
  };

  const shareResults = async () => {
    if (rankedTeams.length === 0) return;

    const resultsText = rankedTeams
      .map((team, index) => `${index + 1}º ${team.name} - ${team.score} pontos`)
      .join('\n');

    const shareMessage = `🏆 Resultados do QRCode Hunter 🏆\n\n${resultsText}\n\nParabéns a todos os participantes!`;

    try {
      await Share.share({
        message: shareMessage,
        title: 'Resultados do QRCode Hunter',
      });
    } catch (error) {
      console.error('Erro ao compartilhar resultados:', error);
    }
  };

  const startNewGame = () => {
    dispatch({ type: 'RESET_GAME' });
    navigation.navigate('Welcome');
  };

  const gameStats = state.currentSession ? GameLogicService.getGameStats(state.currentSession) : null;

  const WinnerCard: React.FC<{ team: Team }> = ({ team }) => {
    const colors = getPositionColors(1);
    
    return (
      <Animated.View
        style={[
          styles.winnerCard,
          {
            backgroundColor: colors.background,
            transform: [
              {
                scale: celebrationAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [1, 1.05],
                }),
              },
            ],
          },
        ]}
      >
        <View style={styles.winnerHeader}>
          <Text style={styles.winnerEmoji}>🏆</Text>
          <Text style={[styles.winnerTitle, { color: colors.text }]}>
            EQUIPE VENCEDORA
          </Text>
        </View>
        
        <Text style={[styles.winnerTeamName, { color: colors.text }]}>
          {team.name}
        </Text>
        
        <Text style={[styles.winnerScore, { color: colors.text }]}>
          {team.score.toLocaleString()} pontos
        </Text>
        
        <View style={styles.winnerStats}>
          <View style={styles.winnerStat}>
            <Text style={[styles.winnerStatNumber, { color: colors.text }]}>
              {team.participants.length}
            </Text>
            <Text style={[styles.winnerStatLabel, { color: colors.text }]}>
              Participantes
            </Text>
          </View>
          <View style={styles.winnerStat}>
            <Text style={[styles.winnerStatNumber, { color: colors.text }]}>
              {team.scannedCodes.length}
            </Text>
            <Text style={[styles.winnerStatLabel, { color: colors.text }]}>
              QRs Escaneados
            </Text>
          </View>
        </View>
      </Animated.View>
    );
  };

  const TeamResultCard: React.FC<{ team: Team; position: number }> = ({ team, position }) => {
    const colors = getPositionColors(position);
    const emoji = getPositionEmoji(position);

    return (
      <Animated.View
        style={[
          styles.teamResultCard,
          {
            backgroundColor: colors.background,
            shadowColor: colors.shadow,
            opacity: animatedValues[team.id] || 0,
            transform: [
              {
                translateY: (animatedValues[team.id] || new Animated.Value(0)).interpolate({
                  inputRange: [0, 1],
                  outputRange: [50, 0],
                }),
              },
            ],
          },
        ]}
      >
        <View style={styles.positionSection}>
          <Text style={styles.positionEmoji}>{emoji}</Text>
          <Text style={[styles.positionNumber, { color: colors.text }]}>
            {position}º
          </Text>
        </View>

        <View style={styles.teamSection}>
          <Text style={[styles.teamResultName, { color: colors.text }]} numberOfLines={1}>
            {team.name}
          </Text>
          <Text style={[styles.teamParticipants, { color: colors.text }]}>
            {team.participants.join(', ')}
          </Text>
        </View>

        <View style={styles.scoreSection}>
          <Text style={[styles.teamResultScore, { color: colors.text }]}>
            {team.score.toLocaleString()}
          </Text>
          <Text style={[styles.scoreLabel, { color: colors.text }]}>pontos</Text>
        </View>
      </Animated.View>
    );
  };

  if (!state.currentSession || rankedTeams.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Icon name="emoji-events" size={80} color="#636E72" />
        <Text style={styles.emptyTitle}>Nenhum Resultado</Text>
        <Text style={styles.emptyText}>
          Os resultados aparecerão quando o jogo for finalizado
        </Text>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>Voltar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const winner = rankedTeams[0];
  const hasMultipleWinners = rankedTeams.length > 1 && rankedTeams[1].score === winner.score;

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>🎉 Resultados Finais 🎉</Text>
          <Text style={styles.subtitle}>
            {hasMultipleWinners ? 'Temos um empate!' : 'Parabéns aos vencedores!'}
          </Text>
        </View>

        {/* Vencedor(es) */}
        <View style={styles.winnersSection}>
          {hasMultipleWinners ? (
            <View>
              <Text style={styles.tieTitle}>🤝 EMPATE NO PRIMEIRO LUGAR! 🤝</Text>
              {rankedTeams
                .filter(team => team.score === winner.score)
                .map(team => (
                  <WinnerCard key={team.id} team={team} />
                ))}
            </View>
          ) : (
            <WinnerCard team={winner} />
          )}
        </View>

        {/* Ranking Completo */}
        <View style={styles.rankingSection}>
          <Text style={styles.rankingTitle}>Classificação Final</Text>
          {rankedTeams.map((team, index) => (
            <TeamResultCard
              key={team.id}
              team={team}
              position={index + 1}
            />
          ))}
        </View>

        {/* Estatísticas do Jogo */}
        {gameStats && (
          <View style={styles.statsSection}>
            <Text style={styles.statsTitle}>Estatísticas do Jogo</Text>
            <View style={styles.statsGrid}>
              <View style={styles.statCard}>
                <Text style={styles.statNumber}>{gameStats.totalTeams}</Text>
                <Text style={styles.statLabel}>Equipes</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statNumber}>{gameStats.totalQRCodes}</Text>
                <Text style={styles.statLabel}>QR Codes</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statNumber}>{gameStats.averageScore}</Text>
                <Text style={styles.statLabel}>Média de Pontos</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statNumber}>{gameStats.totalPointsScanned}</Text>
                <Text style={styles.statLabel}>Pontos Totais</Text>
              </View>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Ações */}
      <View style={styles.actionsContainer}>
        <TouchableOpacity style={styles.shareButton} onPress={shareResults}>
          <Icon name="share" size={20} color="#FFFFFF" />
          <Text style={styles.shareButtonText}>Compartilhar</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.newGameButton} onPress={startNewGame}>
          <Icon name="refresh" size={20} color="#FFFFFF" />
          <Text style={styles.newGameButtonText}>Novo Jogo</Text>
        </TouchableOpacity>
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
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 30,
    backgroundColor: '#FFFFFF',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2D3436',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#636E72',
    textAlign: 'center',
  },
  winnersSection: {
    padding: 20,
  },
  tieTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FF6B6B',
    textAlign: 'center',
    marginBottom: 20,
  },
  winnerCard: {
    borderRadius: 20,
    padding: 25,
    marginBottom: 15,
    alignItems: 'center',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  winnerHeader: {
    alignItems: 'center',
    marginBottom: 15,
  },
  winnerEmoji: {
    fontSize: 50,
    marginBottom: 10,
  },
  winnerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 2,
  },
  winnerTeamName: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  winnerScore: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  winnerStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  winnerStat: {
    alignItems: 'center',
  },
  winnerStatNumber: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  winnerStatLabel: {
    fontSize: 12,
    marginTop: 2,
  },
  rankingSection: {
    padding: 20,
  },
  rankingTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2D3436',
    marginBottom: 15,
    textAlign: 'center',
  },
  teamResultCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    elevation: 3,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  positionSection: {
    alignItems: 'center',
    marginRight: 15,
    minWidth: 60,
  },
  positionEmoji: {
    fontSize: 24,
    marginBottom: 5,
  },
  positionNumber: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  teamSection: {
    flex: 1,
    marginRight: 15,
  },
  teamResultName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  teamParticipants: {
    fontSize: 12,
    opacity: 0.8,
  },
  scoreSection: {
    alignItems: 'flex-end',
  },
  teamResultScore: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  scoreLabel: {
    fontSize: 12,
    opacity: 0.8,
  },
  statsSection: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    margin: 20,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  statsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2D3436',
    marginBottom: 15,
    textAlign: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    width: '48%',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
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
  actionsContainer: {
    flexDirection: 'row',
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  shareButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4ECDC4',
    paddingVertical: 15,
    borderRadius: 12,
    marginRight: 10,
  },
  shareButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  newGameButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF6B6B',
    paddingVertical: 15,
    borderRadius: 12,
    marginLeft: 10,
  },
  newGameButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
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
    marginBottom: 30,
  },
  backButton: {
    backgroundColor: '#4ECDC4',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 12,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default GameResultsScreen;