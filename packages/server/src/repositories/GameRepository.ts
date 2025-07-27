import { GameSession } from '@qrcode-hunter/shared';
import { DatabaseConnection } from '../database/DatabaseConnection';

/**
 * Repository para operações de GameSession no banco de dados
 * Implementa Repository Pattern e Dependency Inversion Principle
 */
export class GameRepository {
  constructor(private database: DatabaseConnection) {}

  /**
   * Cria uma nova sessão de jogo
   */
  async create(session: GameSession): Promise<GameSession> {
    try {
      const savedSession = await this.database.gameSession.create({
        data: {
          id: session.id,
          pin: session.pin,
          quizId: session.quizId,
          hostId: session.hostId,
          status: session.status,
          currentQuestionIndex: session.currentQuestionIndex,
          players: JSON.stringify(session.players),
          createdAt: session.createdAt
        }
      });

      return this.mapToGameSession(savedSession);
    } catch (error) {
      throw new Error(`Erro ao criar sessão: ${error}`);
    }
  }

  /**
   * Busca sessão por ID
   */
  async findById(id: string): Promise<GameSession | null> {
    try {
      const session = await this.database.gameSession.findUnique({
        where: { id }
      });

      return session ? this.mapToGameSession(session) : null;
    } catch (error) {
      throw new Error(`Erro ao buscar sessão: ${error}`);
    }
  }

  /**
   * Busca sessão por PIN
   */
  async findByPin(pin: string): Promise<GameSession | null> {
    try {
      const session = await this.database.gameSession.findUnique({
        where: { pin }
      });

      return session ? this.mapToGameSession(session) : null;
    } catch (error) {
      throw new Error(`Erro ao buscar sessão por PIN: ${error}`);
    }
  }

  /**
   * Lista sessões por host
   */
  async findByHost(hostId: string): Promise<GameSession[]> {
    try {
      const sessions = await this.database.gameSession.findMany({
        where: { hostId },
        orderBy: { createdAt: 'desc' }
      });

      return sessions.map(session => this.mapToGameSession(session));
    } catch (error) {
      throw new Error(`Erro ao buscar sessões do host: ${error}`);
    }
  }

  /**
   * Atualiza uma sessão
   */
  async update(id: string, session: GameSession): Promise<GameSession> {
    try {
      const updatedSession = await this.database.gameSession.update({
        where: { id },
        data: {
          status: session.status,
          currentQuestionIndex: session.currentQuestionIndex,
          players: JSON.stringify(session.players)
        }
      });

      return this.mapToGameSession(updatedSession);
    } catch (error) {
      throw new Error(`Erro ao atualizar sessão: ${error}`);
    }
  }

  /**
   * Remove uma sessão
   */
  async delete(id: string): Promise<boolean> {
    try {
      await this.database.gameSession.delete({
        where: { id }
      });
      return true;
    } catch (error) {
      console.error(`Erro ao deletar sessão: ${error}`);
      return false;
    }
  }

  /**
   * Lista sessões ativas
   */
  async findActive(): Promise<GameSession[]> {
    try {
      const sessions = await this.database.gameSession.findMany({
        where: { 
          status: { in: ['waiting', 'active'] }
        },
        orderBy: { createdAt: 'desc' }
      });

      return sessions.map(session => this.mapToGameSession(session));
    } catch (error) {
      throw new Error(`Erro ao buscar sessões ativas: ${error}`);
    }
  }

  /**
   * Remove sessões antigas (limpeza)
   */
  async cleanupOldSessions(olderThanHours: number = 24): Promise<number> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setHours(cutoffDate.getHours() - olderThanHours);

      const result = await this.database.gameSession.deleteMany({
        where: {
          createdAt: { lt: cutoffDate },
          status: 'finished'
        }
      });

      return result.count;
    } catch (error) {
      console.error(`Erro ao limpar sessões antigas: ${error}`);
      return 0;
    }
  }

  /**
   * Mapeia dados do banco para o modelo GameSession
   */
  private mapToGameSession(data: any): GameSession {
    return {
      id: data.id,
      pin: data.pin,
      quizId: data.quizId,
      hostId: data.hostId,
      status: data.status,
      currentQuestionIndex: data.currentQuestionIndex,
      players: JSON.parse(data.players || '[]'),
      createdAt: data.createdAt
    };
  }
}