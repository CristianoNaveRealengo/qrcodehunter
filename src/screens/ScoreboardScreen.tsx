import React, { useEffect, useState } from 'react';
import {
    Animated,
    Dimensions,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useGame } from '../context/GameContext';
import { GameLogicService } from '../services/gameLogic';
import { Team } from '../types';

const { width } = Dimensions.get('window');

const ScoreboardScreen: React.FC = () => {
  const { state } = useGame();
  const [rankedTeams, setRankedTeams] = useState<Team[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [animatedValues] = useState<{ [key: string]: Animated.Value }>({});

  useEffect(() => {
    updateRanking();
    
    // Atualizar ranking a cada 2 segundos
    const interval = setInterval(updateRanking, 2000);
    
    return () => clearInterval(interval);
  }, [state.currentSession?.teams]);

  const updateRanking = () => {
    if (state.currentSession?.teams) {
      const newRanking = GameLogicService.calculateRanking(state.currentSession.teams);
      
      // Inicializar valores animados para novas equipes
      newRanking.forEach((team, index) => {
        if (!animatedValues[team.id]) {
          animatedValues[team.id] = new Animated.Value(index);
        }
      });
      
      // Animar mudanças de posição
      newRanking.forEach((team, newIndex) => {
        Animated.spring(animatedValues[team.id], {
          toValue: newIndex,
          useNativeDriver: false,
          tension: 100,
          friction: 8,
        }).start();
      });
      
      setRankedTeams(newRanking);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    updateRanking();
    setTimeout(() => setRefreshing(false), 1000);
  };

  const getPositionIcon = (position: number) => {
    switch (position) {
      case 1:
        return { name: 'emoji-events', color: '#FFD700' };
      case 2:
        return { name: 'emoji-events', color: '#C0C0C0' };
      case 3:
        return { name: 'emoji-events', color: '#CD7F32' };
      default:
        return { name: 'group', color: '#636E72' };
    }
  };

  const getPositionColors = (position: number) => {
    switch (position) {
      case 1:
        return {
          background: 'linear-gradient(135deg, #FFD700, #FFA500)',
          border: '#FFD700',
          text: '#FFFFFF',
        };
      case 2:
        return {
          background: 'linear-gradient(135deg, #C0C0C0, #A0A0A0)',
          border: '#C0C0C0',
          text: '#FFFFFF',
        };
      case 3:
        return {
          background: 'linear-gradient(135deg, #CD7F32, #B8860B)',
          border: '#CD7F32',
          text: '#FFFFFF',
        };
      default:
        return {
          background: '#FFFFFF',
          border: '#E0E0E0',
          text: '#2D3436',
        };
    }
  };

  const TeamCard: React.FC<{ team: Team; position: number }> = ({ team, position }) => {
    const icon = getPositionIcon(position);
    const colors = getPositionColors(position);
    const isCurrentTeam = state.currentTeam?.id === team.id;

    return (
      <Animated.View
        style={[
          styles.teamCard,
          {
            backgroundColor: colors.background,
            borderColor: isCurrentTeam ? '#FF6B6B' : colors.border,
            borderWidth: isCurrentTeam ? 3 : 1,
            transform: [
              {
                translateY: animatedValues[team.id]?.interpolate({
                  inputRange: [0, rankedTeams.length],
                  outputRange: [0, rankedTeams.length * 80],
                  extrapolate: 'clamp',
                }) || 0,
              },
            ],
          },
        ]}
      >
        <View style={styles.positionContainer}>
          <Icon name={icon.name} size={32} color={icon.color} />
          <Text style={[styles.positionText, { color: colors.text }]}>
            {position}º
          </Text>
        </View>

        <View style={styles.teamInfo}>
          <Text style={[styles.teamName, { color: colors.text }]} numberOfLines={1}>
            {team.name}
          </Text>
          <Text style={[styles.participantsCount, { color: colors.text }]}>
            {team.participants.length} participante{team.participants.length !== 1 ? 's' : ''}
          </Text>
          <Text style={[styles.scannedCodes, { color: colors.text }]}>
            {team.scannedCodes.length} código{team.scannedCodes.length !== 1 ? 's' : ''} escaneado{team.scannedCodes.length !== 1 ? 's' : ''}
          </Text>
        </View>

        <View style={styles.scoreContainer}>
          <Text style={[styles.score, { color: colors.text }]}>
            {team.score.toLocaleString()}
          </Text>
          <Text style={[styles.pointsLabel, { color: colors.text }]}>
            pontos
          </Text>
        </View>

        {isCurrentTeam && (
          <View style={styles.currentTeamIndicator}>
            <Icon name="star" size={20} color="#FF6B6B" />
          </View>
        )}
      </Animated.View>
    );
  };

  const gameStats = state.currentSession ? GameLogicService.getGameStats(state.currentSession) : null;

  if (!state.currentSession || rankedTeams.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Icon name="leaderboard" size={80} color="#636E72" />
        <Text style={styles.emptyTitle}>Nenhuma Equipe Cadastrada</Text>
        <Text style={styles.emptyText}>
          As equipes aparecerão aqui quando se cadastrarem
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header com estatísticas */}
      <View style={styles.header}>
        <Text style={styles.title}>Placar do QRCode Hunter</Text>
        
        {gameStats && (
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{gameStats.totalTeams}</Text>
              <Text style={styles.statLabel}>Equipes</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{gameStats.totalQRCodes}</Text>
              <Text style={styles.statLabel}>QR Codes</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{gameStats.topScore}</Text>
              <Text style={styles.statLabel}>Maior Pontuação</Text>
            </View>
          </View>
        )}
      </View>

      {/* Lista de equipes */}
      <ScrollView
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#4ECDC4']}
            tintColor="#4ECDC4"
          />
        }
      >
        <View style={styles.teamsContainer}>
          {rankedTeams.map((team, index) => (
            <TeamCard
              key={team.id}
              team={team}
              position={index + 1}
            />
          ))}
        </View>
      </ScrollView>

      {/* Status do jogo */}
      <View style={styles.gameStatus}>
        <View style={styles.statusIndicator}>
          <View
            style={[
              styles.statusDot,
              {
                backgroundColor: state.currentSession.isActive ? '#96CEB4' : '#FF6B6B',
              },
            ]}
          />
          <Text style={styles.statusText}>
            {state.currentSession.isActive ? 'Jogo Ativo' : 'Jogo Pausado'}
          </Text>
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
    textAlign: 'center',
    marginBottom: 15,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4ECDC4',
  },
  statLabel: {
    fontSize: 12,
    color: '#636E72',
    marginTop: 2,
  },
  scrollContainer: {
    flex: 1,
  },
  teamsContainer: {
    padding: 15,
  },
  teamCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    marginBottom: 10,
    borderRadius: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    position: 'relative',
  },
  positionContainer: {
    alignItems: 'center',
    marginRight: 15,
    minWidth: 50,
  },
  positionText: {
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 2,
  },
  teamInfo: {
    flex: 1,
    marginRight: 15,
  },
  teamName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  participantsCount: {
    fontSize: 12,
    opacity: 0.8,
  },
  scannedCodes: {
    fontSize: 12,
    opacity: 0.8,
  },
  scoreContainer: {
    alignItems: 'flex-end',
  },
  score: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  pointsLabel: {
    fontSize: 12,
    opacity: 0.8,
  },
  currentTeamIndicator: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 5,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  gameStatus: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  statusText: {
    fontSize: 14,
    color: '#636E72',
    fontWeight: '500',
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

export default ScoreboardScreen;