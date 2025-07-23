import React, { createContext, useContext, useEffect, useReducer } from 'react';
import { GameSession, GameState, QRCode, Team } from '../types';
import { generateUniqueId } from '../utils/validation';

// Versão web do GameContext - compatível com Vite
// Substitui AsyncStorage por localStorage

type GameAction =
  | { type: 'SET_CURRENT_TEAM'; payload: Team }
  | { type: 'SET_ADMIN_MODE'; payload: boolean }
  | { type: 'CREATE_GAME_SESSION'; payload: { duration: number } }
  | { type: 'ADD_TEAM'; payload: Team }
  | { type: 'ADD_QR_CODE'; payload: QRCode }
  | { type: 'SCAN_QR_CODE'; payload: { teamId: string; qrCodeId: string } }
  | { type: 'START_TIMER' }
  | { type: 'PAUSE_TIMER' }
  | { type: 'UPDATE_TIMER'; payload: number }
  | { type: 'END_GAME' }
  | { type: 'RESET_GAME' }
  | { type: 'LOAD_GAME_STATE'; payload: GameState };

const initialState: GameState = {
  currentSession: null,
  currentTeam: null,
  isAdmin: false,
  timer: {
    timeLeft: 0,
    isRunning: false,
  },
};

const gameReducer = (state: GameState, action: GameAction): GameState => {
  switch (action.type) {
    case 'SET_CURRENT_TEAM':
      return { ...state, currentTeam: action.payload };
    
    case 'SET_ADMIN_MODE':
      return { ...state, isAdmin: action.payload };
    
    case 'CREATE_GAME_SESSION':
      const newSession: GameSession = {
        id: generateUniqueId(),
        isActive: false,
        duration: action.payload.duration,
        startTime: null,
        endTime: null,
        teams: [],
        qrCodes: [],
      };
      return {
        ...state,
        currentSession: newSession,
        timer: { timeLeft: action.payload.duration * 60, isRunning: false },
      };
    
    case 'ADD_TEAM':
      if (!state.currentSession) return state;
      return {
        ...state,
        currentSession: {
          ...state.currentSession,
          teams: [...state.currentSession.teams, action.payload],
        },
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
    
    case 'SCAN_QR_CODE':
      if (!state.currentSession) return state;
      
      const qrCode = state.currentSession.qrCodes.find(qr => qr.id === action.payload.qrCodeId);
      if (!qrCode || qrCode.scannedBy.includes(action.payload.teamId)) return state;
      
      const updatedQRCodes = state.currentSession.qrCodes.map(qr =>
        qr.id === action.payload.qrCodeId
          ? { ...qr, scannedBy: [...qr.scannedBy, action.payload.teamId] }
          : qr
      );
      
      const updatedTeams = state.currentSession.teams.map(team =>
        team.id === action.payload.teamId
          ? {
              ...team,
              score: team.score + qrCode.points,
              scannedCodes: [...team.scannedCodes, action.payload.qrCodeId],
            }
          : team
      );
      
      return {
        ...state,
        currentSession: {
          ...state.currentSession,
          qrCodes: updatedQRCodes,
          teams: updatedTeams,
        },
      };
    
    case 'START_TIMER':
      if (!state.currentSession) return state;
      return {
        ...state,
        currentSession: {
          ...state.currentSession,
          isActive: true,
          startTime: new Date(),
        },
        timer: { ...state.timer, isRunning: true },
      };
    
    case 'PAUSE_TIMER':
      return {
        ...state,
        timer: { ...state.timer, isRunning: false },
      };
    
    case 'UPDATE_TIMER':
      return {
        ...state,
        timer: { ...state.timer, timeLeft: action.payload },
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
        timer: { ...state.timer, isRunning: false },
      };
    
    case 'RESET_GAME':
      return initialState;
    
    case 'LOAD_GAME_STATE':
      return action.payload;
    
    default:
      return state;
  }
};

const GameContext = createContext<{
  state: GameState;
  dispatch: React.Dispatch<GameAction>;
} | null>(null);

import {  useState } from 'react';
import { GameLogicService } from '../services/gameLogic'; // Importe se não estiver

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(gameReducer, initialState);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Novo useEffect para atualizar o timer globalmente
  useEffect(() => {
    if (state.currentSession && state.timer.isRunning) {
      const interval = setInterval(() => {
        const newTime = new Date();
        setCurrentTime(newTime);
        const timeLeft = GameLogicService.getTimeLeft(state.currentSession, newTime);
        dispatch({ type: 'UPDATE_TIMER', payload: timeLeft });

        // Lógica de alertas e fim de jogo (mova do TimerScreen)
        if (timeLeft <= 0 && state.currentSession.isActive) {
          dispatch({ type: 'END_GAME' });
          // Adicione alerta se necessário
        }
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [state.currentSession, state.timer.isRunning]);

  // Carregar estado do localStorage
  useEffect(() => {
    const loadGameState = () => {
      try {
        const savedState = localStorage.getItem('gameState');
        if (savedState) {
          const parsedState = JSON.parse(savedState);
          dispatch({ type: 'LOAD_GAME_STATE', payload: parsedState });
        }
      } catch (error) {
        console.error('Erro ao carregar estado do jogo:', error);
      }
    };

    loadGameState();
  }, []);

  // Salvar estado no localStorage
  useEffect(() => {
    const saveGameState = () => {
      try {
        localStorage.setItem('gameState', JSON.stringify(state));
      } catch (error) {
        console.error('Erro ao salvar estado do jogo:', error);
      }
    };

    saveGameState();
  }, [state]);

  return (
    <GameContext.Provider value={{ state, dispatch }}>
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame deve ser usado dentro de GameProvider');
  }
  return context;
};