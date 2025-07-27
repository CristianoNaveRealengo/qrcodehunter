import { GameResults, GameSession, Player, PlayerAnswer, QuestionResults } from '@qrcode-hunter/shared';
import { v4 as uuidv4 } from 'uuid';
import { GameRepository } from '../repositories/GameRepository';
import { QuizRepository } from '../repositories/QuizRepository';

/**
 * Serviço responsável pela lógica de negócio das sessões de jogo
 * Implementa Single Responsibility Principle
 */
export class GameService {
  constructor(
    private gameRepository: GameRepository,
    private quizRepository: QuizRepository
  ) {}

  /**
   * Cria uma nova sessão de jogo
   * Valida se o quiz existe, está ativo e possui perguntas antes de criar a sessão
   */
  async createSession(quizId: string, hostId: string): Promise<GameSession> {
    // Busca o quiz no repositório
    const quiz = await this.quizRepository.findById(quizId);
    if (!quiz) {
      throw new Error('Quiz não encontrado');
    }

    // Valida se o quiz está ativo para uso
    if (!quiz.isActive) {
      throw new Error('Quiz não está ativo');
    }

    // Valida se o quiz possui pelo menos uma pergunta para criar a sessão
    if (!quiz.questions || quiz.questions.length === 0) {
      throw new Error('Quiz deve ter pelo menos uma pergunta');
    }

    const session: GameSession = {
      id: uuidv4(),
      pin: this.generatePin(),
      quizId,
      hostId,
      status: 'waiting',
      currentQuestionIndex: 0,
      players: [],
      createdAt: new Date()
    };

    return await this.gameRepository.create(session);
  }

  /**
   * Adiciona um jogador à sessão
   */
  async addPlayer(pin: string, playerName: string): Promise<{ session: GameSession; player: Player }> {
    const session = await this.gameRepository.findByPin(pin);
    if (!session) {
      throw new Error('Sessão não encontrada');
    }

    if (session.status === 'active') {
      throw new Error('Não é possível entrar em uma sessão em andamento');
    }

    if (session.status === 'finished') {
      throw new Error('Não é possível entrar em uma sessão finalizada');
    }

    // Validar comprimento do nome
    if (!playerName || playerName.trim().length === 0 || playerName.trim().length > 20) {
      throw new Error('Nome do jogador deve ter entre 1 e 20 caracteres');
    }

    // Verifica se o nome já existe (case insensitive)
    const existingPlayer = session.players.find(p => p.name.toLowerCase() === playerName.trim().toLowerCase());
    if (existingPlayer) {
      throw new Error('Nome de jogador já existe nesta sessão');
    }

    const player: Player = {
      id: uuidv4(),
      name: playerName,
      sessionId: session.id,
      score: 0,
      answers: [],
      isConnected: true
    };

    session.players.push(player);
    const updatedSession = await this.gameRepository.update(session.id, session);

    return { session: updatedSession, player };
  }

  /**
   * Inicia uma sessão de jogo
   */
  async startSession(sessionId: string): Promise<GameSession> {
    const session = await this.gameRepository.findById(sessionId);
    if (!session) {
      throw new Error('Sessão não encontrada');
    }

    if (session.status !== 'waiting') {
      throw new Error('Sessão já foi iniciada');
    }

    if (session.players.length === 0) {
      throw new Error('Não há jogadores na sessão');
    }

    session.status = 'active';
    session.currentQuestionIndex = 0;

    return await this.gameRepository.update(sessionId, session);
  }

  /**
   * Processa resposta de um jogador
   */
  async submitAnswer(
    sessionId: string, 
    playerId: string, 
    questionId: string, 
    selectedOption: number,
    timeToAnswer: number
  ): Promise<PlayerAnswer> {
    const session = await this.gameRepository.findById(sessionId);
    if (!session) {
      throw new Error('Sessão não encontrada');
    }

    const quiz = await this.quizRepository.findById(session.quizId);
    if (!quiz) {
      throw new Error('Quiz não encontrado');
    }

    const question = quiz.questions.find(q => q.id === questionId);
    if (!question) {
      throw new Error('Pergunta não encontrada');
    }

    const player = session.players.find(p => p.id === playerId);
    if (!player) {
      throw new Error('Jogador não encontrado');
    }

    // Verifica se já respondeu esta pergunta
    const existingAnswer = player.answers.find(a => a.questionId === questionId);
    if (existingAnswer) {
      throw new Error('Jogador já respondeu esta pergunta');
    }

    const isCorrect = selectedOption === question.correctAnswer;
    const points = this.calculatePoints(question.points, timeToAnswer, question.timeLimit, isCorrect);

    const answer: PlayerAnswer = {
      questionId,
      selectedOption,
      timeToAnswer,
      isCorrect,
      points
    };

    player.answers.push(answer);
    player.score += points;

    await this.gameRepository.update(sessionId, session);

    return answer;
  }

  /**
   * Avança para a próxima pergunta
   */
  async nextQuestion(sessionId: string): Promise<GameSession> {
    const session = await this.gameRepository.findById(sessionId);
    if (!session) {
      throw new Error('Sessão não encontrada');
    }

    const quiz = await this.quizRepository.findById(session.quizId);
    if (!quiz) {
      throw new Error('Quiz não encontrado');
    }

    if (session.currentQuestionIndex >= quiz.questions.length - 1) {
      // Última pergunta - finalizar jogo
      session.status = 'finished';
    } else {
      session.currentQuestionIndex++;
    }

    return await this.gameRepository.update(sessionId, session);
  }

  /**
   * Finaliza uma sessão de jogo
   */
  async endSession(sessionId: string): Promise<GameSession> {
    const session = await this.gameRepository.findById(sessionId);
    if (!session) {
      throw new Error('Sessão não encontrada');
    }

    session.status = 'finished';
    return await this.gameRepository.update(sessionId, session);
  }

  /**
   * Obtém resultados de uma pergunta
   */
  async getQuestionResults(sessionId: string, questionId: string): Promise<QuestionResults> {
    const session = await this.gameRepository.findById(sessionId);
    if (!session) {
      throw new Error('Sessão não encontrada');
    }

    const quiz = await this.quizRepository.findById(session.quizId);
    if (!quiz) {
      throw new Error('Quiz não encontrado');
    }

    const question = quiz.questions.find(q => q.id === questionId);
    if (!question) {
      throw new Error('Pergunta não encontrada');
    }

    const playerAnswers = session.players.map(player => {
      const answer = player.answers.find(a => a.questionId === questionId);
      return {
        playerId: player.id,
        answer: answer?.selectedOption ?? -1,
        isCorrect: answer?.isCorrect ?? false
      };
    });

    const leaderboard = session.players
      .map(player => ({
        playerId: player.id,
        playerName: player.name,
        score: player.score
      }))
      .sort((a, b) => b.score - a.score);

    return {
      questionId,
      correctAnswer: question.correctAnswer,
      playerAnswers,
      leaderboard
    };
  }

  /**
   * Obtém resultados finais do jogo
   */
  async getGameResults(sessionId: string): Promise<GameResults> {
    const session = await this.gameRepository.findById(sessionId);
    if (!session) {
      throw new Error('Sessão não encontrada');
    }

    const quiz = await this.quizRepository.findById(session.quizId);
    if (!quiz) {
      throw new Error('Quiz não encontrado');
    }

    const finalLeaderboard = session.players
      .map(player => ({
        playerId: player.id,
        playerName: player.name,
        totalScore: player.score
      }))
      .sort((a, b) => b.totalScore - a.totalScore);

    return {
      sessionId,
      finalLeaderboard,
      totalQuestions: quiz.questions.length
    };
  }

  /**
   * Gera um PIN único para a sessão
   */
  private generatePin(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  /**
   * Calcula pontuação baseada no tempo de resposta
   */
  private calculatePoints(basePoints: number, timeToAnswer: number, timeLimit: number, isCorrect: boolean): number {
    if (!isCorrect) return 0;

    // Converter timeToAnswer de milissegundos para segundos
    const timeInSeconds = timeToAnswer / 1000;
    
    // Pontuação diminui conforme o tempo aumenta
    const timeBonus = Math.max(0, (timeLimit - timeInSeconds) / timeLimit);
    return Math.round(basePoints * (0.5 + 0.5 * timeBonus));
  }

  /**
   * Limpa sessões antigas (método futuro)
   */
  async cleanupOldSessions(olderThanHours: number = 24): Promise<number> {
    return await this.gameRepository.cleanupOldSessions(olderThanHours);
  }

  /**
   * Pausa uma sessão ativa (método futuro)
   */
  async pauseSession(sessionId: string): Promise<GameSession> {
    const session = await this.gameRepository.findById(sessionId);
    if (!session) {
      throw new Error('Sessão não encontrada');
    }

    if (session.status !== 'active') {
      throw new Error('Apenas sessões ativas podem ser pausadas');
    }

    session.status = 'paused' as any; // Adicionar ao tipo depois
    return await this.gameRepository.update(sessionId, session);
  }

  /**
   * Retoma uma sessão pausada (método futuro)
   */
  async resumeSession(sessionId: string): Promise<GameSession> {
    const session = await this.gameRepository.findById(sessionId);
    if (!session) {
      throw new Error('Sessão não encontrada');
    }

    if ((session.status as any) !== 'paused') {
      throw new Error('Apenas sessões pausadas podem ser retomadas');
    }

    session.status = 'active';
    return await this.gameRepository.update(sessionId, session);
  }
}