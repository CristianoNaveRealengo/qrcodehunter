import { Request, Response, Router } from 'express';
import { z } from 'zod';
import { GameService } from '../services/GameService';

/**
 * Controller para endpoints relacionados a Game Sessions
 * Implementa Single Responsibility Principle
 */
export class GameController {
  private router: Router;

  constructor(private gameService: GameService) {
    this.router = Router();
    this.setupRoutes();
  }

  private setupRoutes(): void {
    this.router.post('/session', this.createSession.bind(this));
    this.router.post('/session/:sessionId/start', this.startSession.bind(this));
    this.router.post('/session/:sessionId/next', this.nextQuestion.bind(this));
    this.router.post('/session/:sessionId/end', this.endSession.bind(this));
    this.router.post('/join', this.joinSession.bind(this));
    this.router.post('/answer', this.submitAnswer.bind(this));
    this.router.get('/session/:sessionId/results/:questionId', this.getQuestionResults.bind(this));
    this.router.get('/session/:sessionId/final-results', this.getFinalResults.bind(this));
  }

  /**
   * Cria uma nova sessão de jogo
   */
  async createSession(req: Request, res: Response): Promise<void> {
    try {
      const createSessionSchema = z.object({
        quizId: z.string().min(1, 'Quiz ID é obrigatório'),
        hostId: z.string().min(1, 'Host ID é obrigatório')
      });

      const { quizId, hostId } = createSessionSchema.parse(req.body);
      const session = await this.gameService.createSession(quizId, hostId);

      res.status(201).json({
        success: true,
        data: session,
        message: 'Sessão criada com sucesso'
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({
          success: false,
          error: 'Dados inválidos',
          details: error.errors
        });
      } else {
        res.status(400).json({
          success: false,
          error: error instanceof Error ? error.message : 'Erro ao criar sessão'
        });
      }
    }
  }

  /**
   * Inicia uma sessão de jogo
   */
  async startSession(req: Request, res: Response): Promise<void> {
    try {
      const { sessionId } = req.params;
      const session = await this.gameService.startSession(sessionId);

      res.json({
        success: true,
        data: session,
        message: 'Sessão iniciada com sucesso'
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Erro ao iniciar sessão'
      });
    }
  }

  /**
   * Avança para próxima pergunta
   */
  async nextQuestion(req: Request, res: Response): Promise<void> {
    try {
      const { sessionId } = req.params;
      const session = await this.gameService.nextQuestion(sessionId);

      res.json({
        success: true,
        data: session,
        message: session.status === 'finished' ? 'Jogo finalizado' : 'Próxima pergunta'
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Erro ao avançar pergunta'
      });
    }
  }

  /**
   * Finaliza uma sessão
   */
  async endSession(req: Request, res: Response): Promise<void> {
    try {
      const { sessionId } = req.params;
      const session = await this.gameService.endSession(sessionId);

      res.json({
        success: true,
        data: session,
        message: 'Sessão finalizada com sucesso'
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Erro ao finalizar sessão'
      });
    }
  }

  /**
   * Jogador entra na sessão
   */
  async joinSession(req: Request, res: Response): Promise<void> {
    try {
      const joinSessionSchema = z.object({
        pin: z.string().length(6, 'PIN deve ter 6 dígitos'),
        playerName: z.string().min(1, 'Nome do jogador é obrigatório').max(20, 'Nome muito longo')
      });

      const { pin, playerName } = joinSessionSchema.parse(req.body);
      const result = await this.gameService.addPlayer(pin, playerName);

      res.json({
        success: true,
        data: result,
        message: 'Jogador adicionado com sucesso'
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({
          success: false,
          error: 'Dados inválidos',
          details: error.errors
        });
      } else {
        res.status(400).json({
          success: false,
          error: error instanceof Error ? error.message : 'Erro ao entrar na sessão'
        });
      }
    }
  }

  /**
   * Submete resposta do jogador
   */
  async submitAnswer(req: Request, res: Response): Promise<void> {
    try {
      const submitAnswerSchema = z.object({
        sessionId: z.string().min(1, 'Session ID é obrigatório'),
        playerId: z.string().min(1, 'Player ID é obrigatório'),
        questionId: z.string().min(1, 'Question ID é obrigatório'),
        selectedOption: z.number().min(0, 'Opção selecionada inválida'),
        timeToAnswer: z.number().min(0, 'Tempo de resposta inválido')
      });

      const { sessionId, playerId, questionId, selectedOption, timeToAnswer } = 
        submitAnswerSchema.parse(req.body);

      const answer = await this.gameService.submitAnswer(
        sessionId, 
        playerId, 
        questionId, 
        selectedOption, 
        timeToAnswer
      );

      res.json({
        success: true,
        data: answer,
        message: 'Resposta registrada com sucesso'
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({
          success: false,
          error: 'Dados inválidos',
          details: error.errors
        });
      } else {
        res.status(400).json({
          success: false,
          error: error instanceof Error ? error.message : 'Erro ao registrar resposta'
        });
      }
    }
  }

  /**
   * Obtém resultados de uma pergunta
   */
  async getQuestionResults(req: Request, res: Response): Promise<void> {
    try {
      const { sessionId, questionId } = req.params;
      const results = await this.gameService.getQuestionResults(sessionId, questionId);

      res.json({
        success: true,
        data: results,
        message: 'Resultados da pergunta obtidos com sucesso'
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Erro ao obter resultados'
      });
    }
  }

  /**
   * Obtém resultados finais do jogo
   */
  async getFinalResults(req: Request, res: Response): Promise<void> {
    try {
      const { sessionId } = req.params;
      const results = await this.gameService.getGameResults(sessionId);

      res.json({
        success: true,
        data: results,
        message: 'Resultados finais obtidos com sucesso'
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Erro ao obter resultados finais'
      });
    }
  }

  public getRouter(): Router {
    return this.router;
  }
}