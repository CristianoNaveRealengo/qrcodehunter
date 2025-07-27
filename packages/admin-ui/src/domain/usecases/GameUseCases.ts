/**
 * Casos de uso para gerenciamento de sessões de jogo
 * Camada de Use Cases - Clean Architecture
 */

import { GameResults, GameSession, Player, QuestionResults } from '@qrcode-hunter/shared';

// Interfaces para inversão de dependência
export interface IGameRepository {
  createSession(quizId: string, hostId: string): Promise<GameSession>;
}

export interface IWebSocketGateway {
  emit(event: string, data: any): void;
  on(event: string, callback: (data: any) => void): void;
  off(event: string, callback?: (data: any) => void): void;
}

export interface IGameStateManager {
  setCurrentSession(session: GameSession | null): void;
  setPlayers(players: Player[]): void;
  setCurrentResults(results: QuestionResults | null): void;
  setFinalResults(results: GameResults | null): void;
  setLoading(loading: boolean): void;
  setError(error: string | null): void;
}

/**
 * Caso de uso: Criar nova sessão de jogo
 * Responsabilidade única: Orquestrar criação de sessão
 */
export class CreateGameSessionUseCase {
  constructor(
    private gameRepository: IGameRepository,
    private webSocketGateway: IWebSocketGateway,
    private stateManager: IGameStateManager
  ) {}

  async execute(quizId: string): Promise<GameSession> {
    try {
      this.stateManager.setLoading(true);
      this.stateManager.setError(null);
      
      // Criar sessão via repositório
      const session = await this.gameRepository.createSession(quizId, 'admin-host');
      
      // Notificar via WebSocket
      this.webSocketGateway.emit('admin:create-session', { quizId });
      
      return session;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao criar sessão';
      this.stateManager.setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      this.stateManager.setLoading(false);
    }
  }
}

/**
 * Caso de uso: Iniciar sessão de jogo
 * Responsabilidade única: Orquestrar início da sessão
 */
export class StartGameSessionUseCase {
  constructor(
    private webSocketGateway: IWebSocketGateway,
    private stateManager: IGameStateManager
  ) {}

  async execute(sessionId: string): Promise<void> {
    try {
      this.stateManager.setLoading(true);
      this.stateManager.setError(null);
      
      this.webSocketGateway.emit('admin:start-session', { sessionId });
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao iniciar sessão';
      this.stateManager.setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      this.stateManager.setLoading(false);
    }
  }
}

/**
 * Caso de uso: Avançar para próxima pergunta
 * Responsabilidade única: Orquestrar transição de pergunta
 */
export class NextQuestionUseCase {
  constructor(
    private webSocketGateway: IWebSocketGateway,
    private stateManager: IGameStateManager
  ) {}

  async execute(sessionId: string): Promise<void> {
    try {
      this.stateManager.setLoading(true);
      this.stateManager.setError(null);
      
      this.webSocketGateway.emit('admin:next-question', { sessionId });
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao avançar pergunta';
      this.stateManager.setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      this.stateManager.setLoading(false);
    }
  }
}

/**
 * Caso de uso: Finalizar sessão de jogo
 * Responsabilidade única: Orquestrar finalização da sessão
 */
export class EndGameSessionUseCase {
  constructor(
    private webSocketGateway: IWebSocketGateway,
    private stateManager: IGameStateManager
  ) {}

  async execute(sessionId: string): Promise<void> {
    try {
      this.stateManager.setLoading(true);
      this.stateManager.setError(null);
      
      this.webSocketGateway.emit('admin:end-session', { sessionId });
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao finalizar sessão';
      this.stateManager.setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      this.stateManager.setLoading(false);
    }
  }
}