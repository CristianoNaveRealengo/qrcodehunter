import { Request, Response, Router } from 'express';
import { z } from 'zod';
import { QuizService } from '../services/QuizService';

/**
 * Controller para endpoints relacionados a Quiz
 * Implementa Single Responsibility Principle
 */
export class QuizController {
  private router: Router;

  constructor(private quizService: QuizService) {
    this.router = Router();
    this.setupRoutes();
  }

  private setupRoutes(): void {
    this.router.get('/', this.getAllQuizzes.bind(this));
    this.router.get('/active', this.getActiveQuizzes.bind(this));
    this.router.get('/:id', this.getQuizById.bind(this));
    this.router.post('/', this.createQuiz.bind(this));
    this.router.put('/:id', this.updateQuiz.bind(this));
    this.router.delete('/:id', this.deleteQuiz.bind(this));
    this.router.post('/:id/questions', this.addQuestion.bind(this));
    this.router.delete('/:id/questions/:questionId', this.removeQuestion.bind(this));
  }

  /**
   * Lista todos os quizzes
   */
  async getAllQuizzes(req: Request, res: Response): Promise<void> {
    try {
      const quizzes = await this.quizService.getAllQuizzes();
      res.json({
        success: true,
        data: quizzes,
        message: 'Quizzes listados com sucesso'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Erro interno do servidor'
      });
    }
  }

  /**
   * Lista quizzes ativos
   */
  async getActiveQuizzes(req: Request, res: Response): Promise<void> {
    try {
      const quizzes = await this.quizService.getAllQuizzes();
      const activeQuizzes = quizzes.filter(quiz => quiz.isActive);
      
      res.json({
        success: true,
        data: activeQuizzes,
        message: 'Quizzes ativos listados com sucesso'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Erro interno do servidor'
      });
    }
  }

  /**
   * Busca quiz por ID
   */
  async getQuizById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const quiz = await this.quizService.getQuizById(id);
      
      if (!quiz) {
        res.status(404).json({
          success: false,
          error: 'Quiz não encontrado'
        });
        return;
      }

      res.json({
        success: true,
        data: quiz,
        message: 'Quiz encontrado com sucesso'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Erro interno do servidor'
      });
    }
  }

  /**
   * Cria um novo quiz
   */
  async createQuiz(req: Request, res: Response): Promise<void> {
    try {
      // Validação com Zod
      const createQuizSchema = z.object({
        title: z.string().min(1, 'Título é obrigatório'),
        description: z.string().optional().default(''),
        questions: z.array(z.object({
          title: z.string().min(1, 'Título da pergunta é obrigatório'),
          options: z.array(z.object({
            text: z.string().min(1, 'Texto da opção é obrigatório'),
            color: z.string().default('#3B82F6'),
            shape: z.enum(['circle', 'square', 'triangle', 'diamond']).default('circle')
          })).min(2, 'Mínimo 2 opções').max(4, 'Máximo 4 opções'),
          correctAnswer: z.number().min(0),
          timeLimit: z.number().min(5).max(300).default(30),
          points: z.number().min(0).default(1000),
          backgroundColor: z.string().optional(),
          shape: z.enum(['circle', 'square', 'triangle', 'diamond']).optional()
        })).min(1, 'Pelo menos uma pergunta é obrigatória'),
        isActive: z.boolean().default(true)
      });

      const validatedData = createQuizSchema.parse(req.body);
      
      // Adicionar IDs às opções
      const processedQuestions = validatedData.questions.map(question => ({
        ...question,
        options: question.options.map((option, index) => ({
          ...option,
          id: `option_${index}`
        }))
      }));

      const quiz = await this.quizService.createQuiz({
        ...validatedData,
        questions: processedQuestions
      });

      res.status(201).json({
        success: true,
        data: quiz,
        message: 'Quiz criado com sucesso'
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({
          success: false,
          error: 'Dados inválidos',
          details: error.errors
        });
      } else {
        res.status(500).json({
          success: false,
          error: error instanceof Error ? error.message : 'Erro interno do servidor'
        });
      }
    }
  }

  /**
   * Atualiza um quiz
   */
  async updateQuiz(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      
      const updateQuizSchema = z.object({
        title: z.string().min(1).optional(),
        description: z.string().optional(),
        isActive: z.boolean().optional(),
        questions: z.array(z.any()).optional()
      });

      const validatedData = updateQuizSchema.parse(req.body);
      const quiz = await this.quizService.updateQuiz(id, validatedData);
      
      if (!quiz) {
        res.status(404).json({
          success: false,
          error: 'Quiz não encontrado'
        });
        return;
      }

      res.json({
        success: true,
        data: quiz,
        message: 'Quiz atualizado com sucesso'
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({
          success: false,
          error: 'Dados inválidos',
          details: error.errors
        });
      } else {
        res.status(500).json({
          success: false,
          error: error instanceof Error ? error.message : 'Erro interno do servidor'
        });
      }
    }
  }

  /**
   * Remove um quiz
   */
  async deleteQuiz(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const success = await this.quizService.deleteQuiz(id);
      
      if (!success) {
        res.status(404).json({
          success: false,
          error: 'Quiz não encontrado'
        });
        return;
      }

      res.json({
        success: true,
        message: 'Quiz removido com sucesso'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Erro interno do servidor'
      });
    }
  }

  /**
   * Adiciona pergunta ao quiz
   */
  async addQuestion(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      
      const addQuestionSchema = z.object({
        title: z.string().min(1, 'Título da pergunta é obrigatório'),
        options: z.array(z.object({
          text: z.string().min(1),
          color: z.string().default('#3B82F6'),
          shape: z.enum(['circle', 'square', 'triangle', 'diamond']).default('circle')
        })).min(2).max(4),
        correctAnswer: z.number().min(0),
        timeLimit: z.number().min(5).max(300).default(30),
        points: z.number().min(0).default(1000)
      });

      const validatedData = addQuestionSchema.parse(req.body);
      
      // Adicionar IDs às opções
      const processedQuestion = {
        ...validatedData,
        options: validatedData.options.map((option, index) => ({
          ...option,
          id: `option_${index}`
        }))
      };

      const quiz = await this.quizService.addQuestion(id, processedQuestion);
      
      if (!quiz) {
        res.status(404).json({
          success: false,
          error: 'Quiz não encontrado'
        });
        return;
      }

      res.json({
        success: true,
        data: quiz,
        message: 'Pergunta adicionada com sucesso'
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({
          success: false,
          error: 'Dados inválidos',
          details: error.errors
        });
      } else {
        res.status(500).json({
          success: false,
          error: error instanceof Error ? error.message : 'Erro interno do servidor'
        });
      }
    }
  }

  /**
   * Remove pergunta do quiz
   */
  async removeQuestion(req: Request, res: Response): Promise<void> {
    try {
      const { id, questionId } = req.params;
      const quiz = await this.quizService.removeQuestion(id, questionId);
      
      if (!quiz) {
        res.status(404).json({
          success: false,
          error: 'Quiz ou pergunta não encontrada'
        });
        return;
      }

      res.json({
        success: true,
        data: quiz,
        message: 'Pergunta removida com sucesso'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Erro interno do servidor'
      });
    }
  }

  public getRouter(): Router {
    return this.router;
  }
}