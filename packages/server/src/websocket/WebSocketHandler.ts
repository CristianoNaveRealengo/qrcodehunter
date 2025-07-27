import { SocketEvents } from '@qrcode-hunter/shared';
import { Server, Socket } from 'socket.io';
import { GameService } from '../services/GameService';

/**
 * Handler para eventos WebSocket do jogo
 * Implementa Single Responsibility Principle
 */
export class WebSocketHandler {
  private connectedPlayers: Map<string, { socket: Socket; playerId: string; sessionId: string }> = new Map();
  private connectedAdmins: Map<string, { socket: Socket; hostId: string }> = new Map();

  constructor(
    private io: Server,
    private gameService: GameService
  ) {}

  /**
   * Inicializa os handlers de WebSocket
   */
  public initialize(): void {
    this.io.on('connection', (socket: Socket) => {
      console.log(`🔌 Cliente conectado: ${socket.id}`);

      // Eventos do Admin
      socket.on('admin:create-session', this.handleCreateSession.bind(this, socket));
      socket.on('admin:start-session', this.handleStartSession.bind(this, socket));
      socket.on('admin:next-question', this.handleNextQuestion.bind(this, socket));
      socket.on('admin:end-session', this.handleEndSession.bind(this, socket));

      // Eventos do Player
      socket.on('player:join', this.handlePlayerJoin.bind(this, socket));
      socket.on('player:answer', this.handlePlayerAnswer.bind(this, socket));

      // Eventos de conexão
      socket.on('disconnect', this.handleDisconnect.bind(this, socket));
    });
  }

  /**
   * Admin cria uma nova sessão
   */
  private async handleCreateSession(socket: Socket, data: SocketEvents['admin:create-session']): Promise<void> {
    try {
      const { quizId } = data;
      const hostId = socket.id; // Usar socket ID como host ID temporário
      
      const session = await this.gameService.createSession(quizId, hostId);
      
      // Registrar admin
      this.connectedAdmins.set(socket.id, { socket, hostId });
      
      // Entrar na sala da sessão
      socket.join(`session:${session.id}`);
      
      // Confirmar criação para o admin
      socket.emit('session:created', { session });
      
      console.log(`📊 Sessão criada: ${session.pin} (${session.id})`);
    } catch (error) {
      socket.emit('error', { 
        message: error instanceof Error ? error.message : 'Erro ao criar sessão' 
      });
    }
  }

  /**
   * Admin inicia a sessão
   */
  private async handleStartSession(socket: Socket, data: SocketEvents['admin:start-session']): Promise<void> {
    try {
      const { sessionId } = data;
      const session = await this.gameService.startSession(sessionId);
      
      // Notificar todos na sessão
      this.io.to(`session:${sessionId}`).emit('session:started', { session });
      
      // Enviar primeira pergunta
      await this.sendCurrentQuestion(sessionId);
      
      console.log(`🚀 Sessão iniciada: ${sessionId}`);
    } catch (error) {
      socket.emit('error', { 
        message: error instanceof Error ? error.message : 'Erro ao iniciar sessão' 
      });
    }
  }

  /**
   * Admin avança para próxima pergunta
   */
  private async handleNextQuestion(socket: Socket, data: SocketEvents['admin:next-question']): Promise<void> {
    try {
      const { sessionId } = data;
      
      // Primeiro, enviar resultados da pergunta atual
      await this.sendQuestionResults(sessionId);
      
      // Aguardar um pouco para mostrar resultados
      setTimeout(async () => {
        const session = await this.gameService.nextQuestion(sessionId);
        
        if (session.status === 'finished') {
          // Jogo finalizado
          const finalResults = await this.gameService.getGameResults(sessionId);
          this.io.to(`session:${sessionId}`).emit('game:ended', { finalResults });
          console.log(`🏁 Jogo finalizado: ${sessionId}`);
        } else {
          // Próxima pergunta
          await this.sendCurrentQuestion(sessionId);
        }
      }, 3000); // 3 segundos para mostrar resultados
      
    } catch (error) {
      socket.emit('error', { 
        message: error instanceof Error ? error.message : 'Erro ao avançar pergunta' 
      });
    }
  }

  /**
   * Admin finaliza a sessão
   */
  private async handleEndSession(socket: Socket, data: SocketEvents['admin:end-session']): Promise<void> {
    try {
      const { sessionId } = data;
      const session = await this.gameService.endSession(sessionId);
      
      const finalResults = await this.gameService.getGameResults(sessionId);
      this.io.to(`session:${sessionId}`).emit('game:ended', { finalResults });
      
      // Limpar conexões da sessão
      this.cleanupSession(sessionId);
      
      console.log(`🛑 Sessão finalizada: ${sessionId}`);
    } catch (error) {
      socket.emit('error', { 
        message: error instanceof Error ? error.message : 'Erro ao finalizar sessão' 
      });
    }
  }

  /**
   * Jogador entra na sessão
   */
  private async handlePlayerJoin(socket: Socket, data: SocketEvents['player:join']): Promise<void> {
    try {
      const { pin, playerName } = data;
      const result = await this.gameService.addPlayer(pin, playerName);
      
      // Registrar jogador
      this.connectedPlayers.set(socket.id, {
        socket,
        playerId: result.player.id,
        sessionId: result.session.id
      });
      
      // Entrar na sala da sessão
      socket.join(`session:${result.session.id}`);
      
      // Confirmar entrada para o jogador
      socket.emit('player:joined', { 
        player: result.player, 
        session: result.session 
      });
      
      // Notificar admin sobre novo jogador
      socket.to(`session:${result.session.id}`).emit('player:joined', { 
        player: result.player 
      });
      
      console.log(`🎮 Jogador entrou: ${playerName} na sessão ${pin}`);
    } catch (error) {
      socket.emit('error', { 
        message: error instanceof Error ? error.message : 'Erro ao entrar na sessão' 
      });
    }
  }

  /**
   * Jogador submete resposta
   */
  private async handlePlayerAnswer(socket: Socket, data: SocketEvents['player:answer']): Promise<void> {
    try {
      const { sessionId, questionId, answer } = data;
      const playerConnection = this.connectedPlayers.get(socket.id);
      
      if (!playerConnection) {
        socket.emit('error', { message: 'Jogador não encontrado' });
        return;
      }
      
      const timeToAnswer = Date.now(); // Simplificado - calcular tempo real
      
      const playerAnswer = await this.gameService.submitAnswer(
        sessionId,
        playerConnection.playerId,
        questionId,
        answer,
        timeToAnswer
      );
      
      // Confirmar resposta para o jogador
      socket.emit('answer:submitted', { answer: playerAnswer });
      
      // Notificar admin sobre resposta recebida (sem revelar a resposta)
      socket.to(`session:${sessionId}`).emit('answer:received', {
        playerId: playerConnection.playerId,
        questionId
      });
      
      console.log(`✅ Resposta recebida de ${playerConnection.playerId}`);
    } catch (error) {
      socket.emit('error', { 
        message: error instanceof Error ? error.message : 'Erro ao submeter resposta' 
      });
    }
  }

  /**
   * Cliente desconectou
   */
  private handleDisconnect(socket: Socket): void {
    console.log(`🔌 Cliente desconectado: ${socket.id}`);
    
    // Remover das listas de conexões
    this.connectedPlayers.delete(socket.id);
    this.connectedAdmins.delete(socket.id);
  }

  /**
   * Envia pergunta atual para todos os jogadores
   */
  private async sendCurrentQuestion(sessionId: string): Promise<void> {
    try {
      // Buscar sessão e quiz para obter pergunta atual
      // Implementação simplificada - expandir conforme necessário
      
      const mockQuestion = {
        id: 'q1',
        title: 'Qual é a capital do Brasil?',
        options: [
          { id: 'opt1', text: 'São Paulo', color: '#EF4444', shape: 'circle' as const },
          { id: 'opt2', text: 'Rio de Janeiro', color: '#3B82F6', shape: 'square' as const },
          { id: 'opt3', text: 'Brasília', color: '#10B981', shape: 'triangle' as const },
          { id: 'opt4', text: 'Salvador', color: '#F59E0B', shape: 'diamond' as const }
        ],
        correctAnswer: 2,
        timeLimit: 30,
        points: 1000
      };
      
      this.io.to(`session:${sessionId}`).emit('question:started', {
        question: mockQuestion,
        timeLimit: mockQuestion.timeLimit
      });
      
      console.log(`❓ Pergunta enviada para sessão: ${sessionId}`);
    } catch (error) {
      console.error('Erro ao enviar pergunta:', error);
    }
  }

  /**
   * Envia resultados da pergunta atual
   */
  private async sendQuestionResults(sessionId: string): Promise<void> {
    try {
      // Implementação simplificada - expandir conforme necessário
      const mockResults = {
        questionId: 'q1',
        correctAnswer: 2,
        playerAnswers: [],
        leaderboard: []
      };
      
      this.io.to(`session:${sessionId}`).emit('question:ended', {
        results: mockResults
      });
      
      console.log(`📊 Resultados enviados para sessão: ${sessionId}`);
    } catch (error) {
      console.error('Erro ao enviar resultados:', error);
    }
  }

  /**
   * Limpa conexões de uma sessão
   */
  private cleanupSession(sessionId: string): void {
    // Remover jogadores da sessão
    for (const [socketId, connection] of this.connectedPlayers.entries()) {
      if (connection.sessionId === sessionId) {
        connection.socket.leave(`session:${sessionId}`);
        this.connectedPlayers.delete(socketId);
      }
    }
    
    // Remover admins da sessão
    for (const [socketId, connection] of this.connectedAdmins.entries()) {
      connection.socket.leave(`session:${sessionId}`);
    }
  }
}