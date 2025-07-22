import { GameSession, QRCode, Team } from '../types';

export class GameLogicService {
  /**
   * Verifica se uma equipe pode escanear um QR Code
   */
  static canTeamScanQRCode(team: Team, qrCode: QRCode, gameSession: GameSession): {
    canScan: boolean;
    reason?: string;
  } {
    if (!gameSession.isActive) {
      return { canScan: false, reason: 'O jogo não está ativo' };
    }

    if (!qrCode.isActive) {
      return { canScan: false, reason: 'Este código QR não está ativo' };
    }

    if (qrCode.scannedBy.includes(team.id)) {
      return { canScan: false, reason: 'Sua equipe já escaneou este código' };
    }

    return { canScan: true };
  }

  /**
   * Processa o escaneamento de um QR Code
   */
  static processScan(team: Team, qrCode: QRCode): {
    updatedTeam: Team;
    updatedQRCode: QRCode;
    pointsEarned: number;
  } {
    const pointsEarned = qrCode.points;

    const updatedTeam: Team = {
      ...team,
      score: team.score + pointsEarned,
      scannedCodes: [...team.scannedCodes, qrCode.id],
    };

    const updatedQRCode: QRCode = {
      ...qrCode,
      scannedBy: [...qrCode.scannedBy, team.id],
    };

    return {
      updatedTeam,
      updatedQRCode,
      pointsEarned,
    };
  }

  /**
   * Calcula o ranking das equipes
   */
  static calculateRanking(teams: Team[]): Team[] {
    return teams
      .slice() // Criar cópia para não modificar o array original
      .sort((a, b) => {
        // Primeiro critério: pontuação (maior primeiro)
        if (b.score !== a.score) {
          return b.score - a.score;
        }
        
        // Segundo critério: equipe cadastrada primeiro (em caso de empate)
        return a.createdAt.getTime() - b.createdAt.getTime();
      });
  }

  /**
   * Verifica se o jogo deve terminar
   */
  static shouldGameEnd(gameSession: GameSession, currentTime: Date): boolean {
    if (!gameSession.startTime) {
      return false;
    }

    const elapsedMinutes = (currentTime.getTime() - gameSession.startTime.getTime()) / (1000 * 60);
    return elapsedMinutes >= gameSession.duration;
  }

  /**
   * Calcula o tempo restante do jogo em segundos
   */
  static getTimeLeft(gameSession: GameSession, currentTime: Date): number {
    if (!gameSession.startTime) {
      return gameSession.duration * 60; // Retorna duração total se não iniciou
    }

    const elapsedSeconds = (currentTime.getTime() - gameSession.startTime.getTime()) / 1000;
    const totalSeconds = gameSession.duration * 60;
    const timeLeft = Math.max(0, totalSeconds - elapsedSeconds);

    return Math.floor(timeLeft);
  }

  /**
   * Obtém estatísticas do jogo
   */
  static getGameStats(gameSession: GameSession): {
    totalTeams: number;
    totalQRCodes: number;
    totalPointsAvailable: number;
    totalPointsScanned: number;
    averageScore: number;
    topScore: number;
  } {
    const totalTeams = gameSession.teams.length;
    const totalQRCodes = gameSession.qrCodes.length;
    const totalPointsAvailable = gameSession.qrCodes.reduce((sum, qr) => sum + qr.points, 0);
    
    const scannedQRCodes = gameSession.qrCodes.filter(qr => qr.scannedBy.length > 0);
    const totalPointsScanned = scannedQRCodes.reduce((sum, qr) => sum + (qr.points * qr.scannedBy.length), 0);
    
    const totalScore = gameSession.teams.reduce((sum, team) => sum + team.score, 0);
    const averageScore = totalTeams > 0 ? totalScore / totalTeams : 0;
    
    const topScore = gameSession.teams.length > 0 
      ? Math.max(...gameSession.teams.map(team => team.score))
      : 0;

    return {
      totalTeams,
      totalQRCodes,
      totalPointsAvailable,
      totalPointsScanned,
      averageScore: Math.round(averageScore),
      topScore,
    };
  }

  /**
   * Valida se um código QR é válido para a gincana
   */
  static isValidGincanaQRCode(code: string): boolean {
    return typeof code === 'string' && 
           code.length > 0 && 
           code.startsWith('GINCANA_') &&
           code.length > 8; // GINCANA_ + pelo menos 1 caractere
  }

  /**
   * Gera feedback baseado na pontuação obtida
   */
  static getScoreFeedback(points: number): {
    message: string;
    emoji: string;
    color: string;
  } {
    if (points >= 4000) {
      return {
        message: 'Incrível! Pontuação máxima!',
        emoji: '🏆',
        color: '#FFD700',
      };
    } else if (points >= 3000) {
      return {
        message: 'Excelente! Muito bem!',
        emoji: '🎉',
        color: '#FF6B6B',
      };
    } else if (points >= 2000) {
      return {
        message: 'Ótimo trabalho!',
        emoji: '👏',
        color: '#4ECDC4',
      };
    } else if (points >= 1000) {
      return {
        message: 'Bom trabalho!',
        emoji: '👍',
        color: '#45B7D1',
      };
    } else {
      return {
        message: 'Continue assim!',
        emoji: '💪',
        color: '#96CEB4',
      };
    }
  }
}