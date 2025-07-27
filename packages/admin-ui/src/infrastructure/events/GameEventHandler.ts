/**
 * Manipulador de eventos WebSocket para o jogo
 * Camada de Infrastructure - Clean Architecture
 */

import { IGameStateManager, IWebSocketGateway } from '../../domain/usecases/GameUseCases';

/**
 * Classe responsável por configurar e gerenciar eventos WebSocket
 * Responsabilidade única: Orquestrar eventos de WebSocket e atualizar estado
 */
export class GameEventHandler {
  constructor(
    private webSocketGateway: IWebSocketGateway,
    private stateManager: IGameStateManager
  ) {}

  /**
   * Configura todos os listeners de eventos WebSocket
   * Método principal para inicialização dos eventos
   */
  setupEventListeners(): void {
    this.setupSessionEvents();
    this.setupPlayerEvents();
    this.setupQuestionEvents();
    this.setupGameEvents();
    this.setupErrorEvents();
  }

  /**
   * Configura eventos relacionados à sessão
   */
  private setupSessionEvents(): void {
    // Sessão criada
    this.webSocketGateway.on('session:created', (data) => {
      this.stateManager.setCurrentSession(data.session);
      this.stateManager.setPlayers(data.session.players);
      console.log('🎮 Sessão criada:', data.session.pin);
    });

    // Sessão iniciada
    this.webSocketGateway.on('session:started', (data) => {
      this.stateManager.setCurrentSession(data.session);
      console.log('🚀 Sessão iniciada');
    });
  }

  /**
   * Configura eventos relacionados aos jogadores
   */
  private setupPlayerEvents(): void {
    // Jogador entrou
    this.webSocketGateway.on('player:joined', (data) => {
      if (data.player) {
        // Usar método específico do adapter se disponível
        if ('addPlayer' in this.stateManager) {
          (this.stateManager as any).addPlayer(data.player);
        } else {
          // Fallback para implementação genérica
          const currentPlayers = (this.stateManager as any).getPlayers?.() || [];
          this.stateManager.setPlayers([...currentPlayers, data.player]);
        }
        console.log('👤 Jogador entrou:', data.player.name);
      }
    });
  }

  /**
   * Configura eventos relacionados às perguntas
   */
  private setupQuestionEvents(): void {
    // Pergunta iniciada
    this.webSocketGateway.on('question:started', (data) => {
      this.stateManager.setCurrentResults(null); // Limpar resultados anteriores
      console.log('❓ Nova pergunta:', data.question.title);
    });

    // Resposta recebida
    this.webSocketGateway.on('answer:received', (data) => {
      console.log('✅ Resposta recebida do jogador:', data.playerId);
    });

    // Pergunta finalizada com resultados
    this.webSocketGateway.on('question:ended', (data) => {
      this.stateManager.setCurrentResults(data.results);
      console.log('📊 Resultados da pergunta:', data.results);
    });
  }

  /**
   * Configura eventos relacionados ao jogo
   */
  private setupGameEvents(): void {
    // Jogo finalizado
    this.webSocketGateway.on('game:ended', (data) => {
      this.stateManager.setFinalResults(data.finalResults);
      
      // Atualizar status da sessão se método disponível
      if ('updateSessionStatus' in this.stateManager) {
        (this.stateManager as any).updateSessionStatus('finished');
      }
      
      console.log('🏁 Jogo finalizado:', data.finalResults);
    });
  }

  /**
   * Configura eventos de erro
   */
  private setupErrorEvents(): void {
    // Erros
    this.webSocketGateway.on('error', (data) => {
      this.stateManager.setError(data.message);
      this.stateManager.setLoading(false);
      console.error('❌ Erro WebSocket:', data.message);
    });
  }

  /**
   * Remove todos os listeners (cleanup)
   * Importante para evitar memory leaks
   */
  cleanup(): void {
    const events = [
      'session:created',
      'session:started',
      'player:joined',
      'question:started',
      'answer:received',
      'question:ended',
      'game:ended',
      'error'
    ];

    events.forEach(event => {
      this.webSocketGateway.off(event);
    });
  }
}