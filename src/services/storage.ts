import AsyncStorage from '@react-native-async-storage/async-storage';
import { GameSession, QRCode, Team } from '../types';

const STORAGE_KEYS = {
  GAME_SESSION: 'gameSession',
  CURRENT_TEAM: 'currentTeam',
  QR_CODES: 'qrCodes',
  GAME_HISTORY: 'gameHistory',
};

export const StorageService = {
  // Game Session
  async saveGameSession(session: GameSession): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.GAME_SESSION, JSON.stringify(session));
    } catch (error) {
      console.error('Erro ao salvar sessão do jogo:', error);
      throw error;
    }
  },

  async getGameSession(): Promise<GameSession | null> {
    try {
      const session = await AsyncStorage.getItem(STORAGE_KEYS.GAME_SESSION);
      return session ? JSON.parse(session) : null;
    } catch (error) {
      console.error('Erro ao carregar sessão do jogo:', error);
      return null;
    }
  },

  // Current Team
  async saveCurrentTeam(team: Team): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.CURRENT_TEAM, JSON.stringify(team));
    } catch (error) {
      console.error('Erro ao salvar equipe atual:', error);
      throw error;
    }
  },

  async getCurrentTeam(): Promise<Team | null> {
    try {
      const team = await AsyncStorage.getItem(STORAGE_KEYS.CURRENT_TEAM);
      return team ? JSON.parse(team) : null;
    } catch (error) {
      console.error('Erro ao carregar equipe atual:', error);
      return null;
    }
  },

  // QR Codes
  async saveQRCodes(qrCodes: QRCode[]): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.QR_CODES, JSON.stringify(qrCodes));
    } catch (error) {
      console.error('Erro ao salvar QR codes:', error);
      throw error;
    }
  },

  async getQRCodes(): Promise<QRCode[]> {
    try {
      const qrCodes = await AsyncStorage.getItem(STORAGE_KEYS.QR_CODES);
      return qrCodes ? JSON.parse(qrCodes) : [];
    } catch (error) {
      console.error('Erro ao carregar QR codes:', error);
      return [];
    }
  },

  // Game History
  async saveGameToHistory(session: GameSession): Promise<void> {
    try {
      const history = await this.getGameHistory();
      const updatedHistory = [session, ...history.slice(0, 9)]; // Manter apenas 10 jogos
      await AsyncStorage.setItem(STORAGE_KEYS.GAME_HISTORY, JSON.stringify(updatedHistory));
    } catch (error) {
      console.error('Erro ao salvar histórico:', error);
      throw error;
    }
  },

  async getGameHistory(): Promise<GameSession[]> {
    try {
      const history = await AsyncStorage.getItem(STORAGE_KEYS.GAME_HISTORY);
      return history ? JSON.parse(history) : [];
    } catch (error) {
      console.error('Erro ao carregar histórico:', error);
      return [];
    }
  },

  // Clear all data
  async clearAllData(): Promise<void> {
    try {
      await AsyncStorage.clear();
    } catch (error) {
      console.error('Erro ao limpar dados:', error);
      throw error;
    }
  },
};