import React, { useEffect, useState } from 'react';
import { useGame } from '../context/GameContext';
import { GameLogicService } from '../services/gameLogic';
import { Team } from '../types';

// Versão web do ScoreboardScreen - compatível com Vite
// Remove dependências React Native e usa HTML/CSS padrão

interface Props {
  onBack?: () => void;
}

const ScoreboardScreen: React.FC<Props> = ({ onBack }) => {
  const { state } = useGame();
  const [rankedTeams, setRankedTeams] = useState<Team[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    updateRanking();
    
    // Atualizar ranking a cada 2 segundos
    const interval = setInterval(updateRanking, 2000);
    
    return () => clearInterval(interval);
  }, [state.currentSession?.teams]);

  const updateRanking = () => {
    if (state.currentSession?.teams) {
      const newRanking = GameLogicService.calculateRanking(state.currentSession.teams);
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
        return { icon: '🏆', color: '#FFD700' };
      case 2:
        return { icon: '🥈', color: '#C0C0C0' };
      case 3:
        return { icon: '🥉', color: '#CD7F32' };
      default:
        return { icon: '👥', color: '#636E72' };
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
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          padding: '15px',
          marginBottom: '10px',
          borderRadius: '15px',
          background: colors.background,
          border: `${isCurrentTeam ? '3px' : '1px'} solid ${isCurrentTeam ? '#FF6B6B' : colors.border}`,
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          position: 'relative',
          transition: 'all 0.3s ease',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            marginRight: '15px',
            minWidth: '50px',
          }}
        >
          <span style={{ fontSize: '32px' }}>{icon.icon}</span>
          <span
            style={{
              fontSize: '14px',
              fontWeight: 'bold',
              color: colors.text,
              marginTop: '2px',
            }}
          >
            {position}º
          </span>
        </div>

        <div style={{ flex: 1, marginRight: '15px' }}>
          <h3
            style={{
              fontSize: '18px',
              fontWeight: 'bold',
              color: colors.text,
              margin: '0 0 2px 0',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {team.name}
          </h3>
          <p
            style={{
              fontSize: '12px',
              color: colors.text,
              opacity: 0.8,
              margin: '0',
            }}
          >
            {team.participants.length} participante{team.participants.length !== 1 ? 's' : ''}
          </p>
          <p
            style={{
              fontSize: '12px',
              color: colors.text,
              opacity: 0.8,
              margin: '0',
            }}
          >
            {team.scannedCodes.length} código{team.scannedCodes.length !== 1 ? 's' : ''} escaneado{team.scannedCodes.length !== 1 ? 's' : ''}
          </p>
        </div>

        <div style={{ textAlign: 'right' }}>
          <div
            style={{
              fontSize: '24px',
              fontWeight: 'bold',
              color: colors.text,
            }}
          >
            {team.score.toLocaleString()}
          </div>
          <div
            style={{
              fontSize: '12px',
              color: colors.text,
              opacity: 0.8,
            }}
          >
            pontos
          </div>
        </div>

        {isCurrentTeam && (
          <div
            style={{
              position: 'absolute',
              top: '-5px',
              right: '-5px',
              backgroundColor: '#FFFFFF',
              borderRadius: '15px',
              padding: '5px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
            }}
          >
            <span style={{ fontSize: '20px', color: '#FF6B6B' }}>⭐</span>
          </div>
        )}
      </div>
    );
  };

  const gameStats = state.currentSession ? GameLogicService.getGameStats(state.currentSession) : null;

  if (!state.currentSession || rankedTeams.length === 0) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
          backgroundColor: '#F8F9FA',
          padding: '40px',
          textAlign: 'center',
        }}
      >
        <span style={{ fontSize: '80px', marginBottom: '20px' }}>📊</span>
        <h2
          style={{
            fontSize: '24px',
            fontWeight: 'bold',
            color: '#2D3436',
            marginBottom: '10px',
          }}
        >
          Nenhuma Equipe Cadastrada
        </h2>
        <p
          style={{
            fontSize: '16px',
            color: '#636E72',
            lineHeight: '24px',
            maxWidth: '400px',
          }}
        >
          As equipes aparecerão aqui quando se cadastrarem
        </p>
        {onBack && (
          <button
            onClick={onBack}
            style={{
              marginTop: '20px',
              padding: '12px 24px',
              backgroundColor: '#4ECDC4',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = '#45B7D1';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = '#4ECDC4';
            }}
          >
            ← Voltar
          </button>
        )}
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#F8F9FA',
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }}
    >
      {/* Header com estatísticas */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          padding: '20px',
          borderBottom: '1px solid #E0E0E0',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '15px' }}>
          {onBack && (
            <button
              onClick={onBack}
              style={{
                marginRight: '15px',
                padding: '8px 16px',
                backgroundColor: '#6C757D',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontSize: '14px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = '#5A6268';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = '#6C757D';
              }}
            >
              ← Voltar
            </button>
          )}
          <h1
            style={{
              fontSize: '28px',
              fontWeight: 'bold',
              color: '#2D3436',
              margin: '0',
              flex: 1,
              textAlign: 'center',
            }}
          >
            Placar do QRCode Hunter
          </h1>
          <button
            onClick={onRefresh}
            disabled={refreshing}
            style={{
              padding: '8px 16px',
              backgroundColor: refreshing ? '#95A5A6' : '#4ECDC4',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '14px',
              cursor: refreshing ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            {refreshing ? '🔄 Atualizando...' : '🔄 Atualizar'}
          </button>
        </div>
        
        {gameStats && (
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-around',
              flexWrap: 'wrap',
              gap: '20px',
            }}
          >
            <div style={{ textAlign: 'center' }}>
              <div
                style={{
                  fontSize: '24px',
                  fontWeight: 'bold',
                  color: '#4ECDC4',
                }}
              >
                {gameStats.totalTeams}
              </div>
              <div
                style={{
                  fontSize: '12px',
                  color: '#636E72',
                  marginTop: '2px',
                }}
              >
                Equipes
              </div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div
                style={{
                  fontSize: '24px',
                  fontWeight: 'bold',
                  color: '#4ECDC4',
                }}
              >
                {gameStats.totalQRCodes}
              </div>
              <div
                style={{
                  fontSize: '12px',
                  color: '#636E72',
                  marginTop: '2px',
                }}
              >
                QR Codes
              </div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div
                style={{
                  fontSize: '24px',
                  fontWeight: 'bold',
                  color: '#4ECDC4',
                }}
              >
                {gameStats.topScore}
              </div>
              <div
                style={{
                  fontSize: '12px',
                  color: '#636E72',
                  marginTop: '2px',
                }}
              >
                Maior Pontuação
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Lista de equipes */}
      <div
        style={{
          padding: '15px',
          maxHeight: 'calc(100vh - 200px)',
          overflowY: 'auto',
        }}
      >
        {rankedTeams.map((team, index) => (
          <TeamCard
            key={team.id}
            team={team}
            position={index + 1}
          />
        ))}
      </div>

      {/* Status do jogo */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          padding: '15px 20px',
          borderTop: '1px solid #E0E0E0',
          position: 'fixed',
          bottom: '0',
          left: '0',
          right: '0',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div
            style={{
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              backgroundColor: state.currentSession.isActive ? '#96CEB4' : '#FF6B6B',
              marginRight: '8px',
            }}
          />
          <span
            style={{
              fontSize: '14px',
              color: '#636E72',
              fontWeight: '500',
            }}
          >
            {state.currentSession.isActive ? 'Jogo Ativo' : 'Jogo Pausado'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ScoreboardScreen;