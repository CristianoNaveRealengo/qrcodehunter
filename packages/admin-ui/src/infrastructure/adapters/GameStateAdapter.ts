/**
 * Adaptador para gerenciamento de estado do jogo
 * Camada de Interface Adapters - Clean Architecture
 */

import { createSignal } from 'solid-js';
import { GameResults, GameSession, Player, QuestionResults } from '@qrcode-hunter/shared';
import { IGameStateManager } from '../../domain/usecases/GameUseCases';

/**
 * Implementação concreta do gerenciador de estado usando SolidJS signals
 * Responsabilidade única: Gerenciar estado reativo da aplicação
 */
export class GameStateAdapter implements IGameStateManager {
  // Signals para estado reativo
  private [currentSession, setCurrentSessionSignal] = createSignal<GameSession | null>(null);
  private [players, setPlayersSignal] = createSignal<Player[]>([]);
  private [currentResults, setCurrentResultsSignal] = createSignal<QuestionResults | null>(null);
  private [finalResults, setFinalResultsSignal] = createSignal<GameResults | null>(null);
  private [loading, setLoadingSignal] = createSignal(false);
  private [error, setErrorSignal] = createSignal<string | null>(null);

  // Getters para acessar os signals
  getCurrentSession = () => this.currentSession();
  getPlayers = () => this.players();
  getCurrentResults = () => this.currentResults();
  getFinalResults = () => this.finalResults();
  getLoading = () => this.loading();
  getError = () => this.error();

  // Implementação da interface IGameStateManager
  setCurrentSession(session: GameSession | null): void {
    this.setCurrentSessionSignal(session);
  }

  setPlayers(players: Player[]): void {
    this.setPlayersSignal(players);
  }

  setCurrentResults(results: QuestionResults | null): void {
    this.setCurrentResultsSignal(results);
  }

  setFinalResults(results: GameResults | null): void {
    this.setFinalResultsSignal(results);
  }

  setLoading(loading: boolean): void {
    this.setLoadingSignal(loading);
  }

  setError(error: string | null): void {
    this.setErrorSignal(error);
  }

  /**
   * Adiciona um jogador à lista existente
   * Método auxiliar para eventos de WebSocket
   */
  addPlayer(player: Player): void {
    this.setPlayersSignal(prev => [...prev, player]);
  }

  /**
   * Atualiza o status da sessão atual
   * Método auxiliar para transições de estado
   */
  updateSessionStatus(status: string): void {
    const current = this.getCurrentSession();
    if (current) {
      this.setCurrentSession({ ...current, status });
    }
  }

  /**
   * Limpa todos os resultados
   * Útil ao iniciar nova pergunta
   */
  clearResults(): void {
    this.setCurrentResults(null);
  }

  /**
   * Limpa erro atual
   * Método para reset de estado de erro
   */
  clearError(): void {
    this.setError(null);
  }
}