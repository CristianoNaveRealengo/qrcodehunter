import { GameSession, GameState, QRCode, Team } from '@/types';

export type GameAction =
  | { type: 'SET_GAME_SESSION'; payload: GameSession }
  | { type: 'SET_CURRENT_TEAM'; payload: Team }
  | { type: 'SET_ADMIN_MODE'; payload: boolean }
  | { type: 'ADD_TEAM'; payload: Team }
  | { type: 'UPDATE_TEAM_SCORE'; payload: { teamId: string; points: number; qrCodeId: string } }
  | { type: 'ADD_QR_CODE'; payload: QRCode }
  | { type: 'START_GAME' }
  | { type: 'END_GAME' }
  | { type: 'UPDATE_TIMER'; payload: { timeLeft: number; isRunning: boolean } }
  | { type: 'RESET_GAME' };

export const gameReducer = (state: GameState, action: GameAction): GameState => {
  switch (action.type) {
    case 'SET_GAME_SESSION':
      return {
        ...state,
        currentSession: action.payload,
      };

    case 'SET_CURRENT_TEAM':
      return {
        ...state,
        currentTeam: action.payload,
      };

    case 'SET_ADMIN_MODE':
      return {
        ...state,
        isAdmin: action.payload,
      };

    case 'ADD_TEAM':
      if (!state.currentSession) return state;
      
      const updatedSession = {
        ...state.currentSession,
        teams: [...state.currentSession.teams, action.payload],
      };
      
      return {
        ...state,
        currentSession: updatedSession,
      };

    case 'UPDATE_TEAM_SCORE':
      if (!state.currentSession) return state;
      
      const { teamId, points, qrCodeId } = action.payload;
      
      const updatedTeams = state.currentSession.teams.map(team => {
        if (team.id === teamId) {
          return {
            ...team,
            score: team.score + points,
            scannedCodes: [...team.scannedCodes, qrCodeId],
          };
        }
        return team;
      });

      const updatedQRCodes = state.currentSession.qrCodes.map(qr => {
        if (qr.id === qrCodeId) {
          return {
            ...qr,
            scannedBy: [...qr.scannedBy, teamId],
          };
        }
        return qr;
      });

      return {
        ...state,
        currentSession: {
          ...state.currentSession,
          teams: updatedTeams,
          qrCodes: updatedQRCodes,
        },
        currentTeam: state.currentTeam?.id === teamId 
          ? updatedTeams.find(t => t.id === teamId) || state.currentTeam
          : state.currentTeam,
      };

    case 'ADD_QR_CODE':
      if (!state.currentSession) return state;
      
      return {
        ...state,
        currentSession: {
          ...state.currentSession,
          qrCodes: [...state.currentSession.qrCodes, action.payload],
        },
      };

    case 'START_GAME':
      if (!state.currentSession) return state;
      
      return {
        ...state,
        currentSession: {
          ...state.currentSession,
          isActive: true,
          startTime: new Date(),
        },
        timer: {
          timeLeft: state.currentSession.duration * 60,
          isRunning: true,
        },
      };

    case 'END_GAME':
      if (!state.currentSession) return state;
      
      return {
        ...state,
        currentSession: {
          ...state.currentSession,
          isActive: false,
          endTime: new Date(),
        },
        timer: {
          timeLeft: 0,
          isRunning: false,
        },
      };

    case 'UPDATE_TIMER':
      return {
        ...state,
        timer: action.payload,
      };

    case 'RESET_GAME':
      return {
        ...state,
        currentSession: null,
        currentTeam: null,
        timer: {
          timeLeft: 0,
          isRunning: false,
        },
      };

    default:
      return state;
  }
};