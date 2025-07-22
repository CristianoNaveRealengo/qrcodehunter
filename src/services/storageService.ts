import { GameSession, QRCode, Team } from '@/types';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEYS = {
  GAME_SESSION: 'gameSession',
  CURRENT_TEAM: 'currentTeam',
  QR_CODES: 'qrCodes',
  GAME_HISTORY: 'gameHistory',
} as const;

export class StorageService {
  static async saveGameSession(session: GameSession): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.GAME_SESSION, JSON.stringify(session));
    } catch (error) {
      console.error('Erro ao salvar sessão do jogo:', error);
      throw error;
    }
  }

  static async loadGameSession(): Promise<GameSession | null> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.GAME_SESSION);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Erro ao carregar sessão do jogo:', error);
      return null;
    }
  }

  static async saveCurrentTeam(team: Team): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.CURRENT_TEAM, JSON.stringify(team));
    } catch (error) {
      console.error('Erro ao salvar equipe atual:', error);
      throw error;
    }
  }

  static async loadCurrentTeam(): Promise<Team | null> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.CURRENT_TEAM);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Erro ao carregar equipe atual:', error);
      return null;
    }
  }

  static async saveQRCodes(qrCodes: QRCode[]): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.QR_CODES, JSON.stringify(qrCodes));
    } catch (error) {
      console.error('Erro ao salvar QR Codes:', error);
      throw error;
    }
  }

  static async loadQRCodes(): Promise<QRCode[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.QR_CODES);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Erro ao carregar QR Codes:', error);
      return [];
    }
  }

  static async saveGameToHistory(session: GameSession): Promise<void> {
    try {
      const history = await this.loadGameHistory();
      const updatedHistory = [session, ...history.slice(0, 9)]; // Manter apenas os últimos 10 jogos
      await AsyncStorage.setItem(STORAGE_KEYS.GAME_HISTORY, JSON.stringify(updatedHistory));
    } catch (error) {
      console.error('Erro ao salvar histórico do jogo:', error);
      throw error;
    }
  }

  static async loadGameHistory(): Promise<GameSession[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.GAME_HISTORY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Erro ao carregar histórico do jogo:', error);
      return [];
    }
  }

  static async clearAllData(): Promise<void> {
    try {
      await AsyncStorage.multiRemove(Object.values(STORAGE_KEYS));
    } catch (error) {
      console.error('Erro ao limpar dados:', error);
      throw error;
    }
  }

  static async clearGameData(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.GAME_SESSION,
        STORAGE_KEYS.CURRENT_TEAM,
      ]);
    } catch (error) {
      console.error('Erro ao limpar dados do jogo:', error);
      throw error;
    }
  }
}