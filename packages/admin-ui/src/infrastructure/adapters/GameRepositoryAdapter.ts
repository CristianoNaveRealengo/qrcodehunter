/**
 * Adaptador para repositório de jogos
 * Camada de Interface Adapters - Clean Architecture
 */

import { GameSession } from '@qrcode-hunter/shared';
import { IGameRepository } from '../../domain/usecases/GameUseCases';
import { GameService } from '../../services/GameService';

/**
 * Adaptador que implementa a interface IGameRepository
 * Responsabilidade única: Adaptar o GameService para os use cases
 */
export class GameRepositoryAdapter implements IGameRepository {
  constructor(private gameService: GameService) {}

  async createSession(quizId: string, hostId: string): Promise<GameSession> {
    return await this.gameService.createSession(quizId, hostId);
  }
}