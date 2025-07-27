import { Quiz } from '@qrcode-hunter/shared';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { QuizRepository } from '../../repositories/QuizRepository';
import { QuizService } from '../../services/QuizService';

// Mock do repository
const mockQuizRepository = {
  create: vi.fn(),
  findById: vi.fn(),
  findAll: vi.fn(),
  update: vi.fn(),
  delete: vi.fn()
} as unknown as QuizRepository;

describe('QuizService', () => {
  let quizService: QuizService;

  beforeEach(() => {
    vi.clearAllMocks();
    quizService = new QuizService(mockQuizRepository);
  });

  describe('createQuiz', () => {
    it('deve criar um quiz válido', async () => {
      // Arrange
      const quizData = {
        title: 'Quiz de Geografia',
        description: 'Teste seus conhecimentos',
        questions: [
          {
            id: 'q1',
            title: 'Capital do Brasil?',
            options: [
              { id: 'opt1', text: 'São Paulo', color: '#EF4444', shape: 'circle' as const },
              { id: 'opt2', text: 'Brasília', color: '#10B981', shape: 'square' as const }
            ],
            correctAnswer: 1,
            timeLimit: 30,
            points: 1000
          }
        ],
        isActive: true
      };

      const expectedQuiz = {
        id: expect.any(String),
        ...quizData,
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date)
      };

      vi.mocked(mockQuizRepository.create).mockResolvedValue(expectedQuiz as Quiz);

      // Act
      const result = await quizService.createQuiz(quizData);

      // Assert
      expect(result).toEqual(expectedQuiz);
      expect(mockQuizRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          id: expect.any(String),
          title: quizData.title,
          description: quizData.description,
          questions: quizData.questions,
          isActive: quizData.isActive,
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date)
        })
      );
    });

    it('deve rejeitar quiz sem título', async () => {
      // Arrange
      const invalidQuizData = {
        title: '',
        description: 'Teste',
        questions: [
          {
            id: 'q1',
            title: 'Pergunta válida',
            options: [
              { id: 'opt1', text: 'Opção 1', color: '#EF4444', shape: 'circle' as const },
              { id: 'opt2', text: 'Opção 2', color: '#10B981', shape: 'square' as const }
            ],
            correctAnswer: 0,
            timeLimit: 30,
            points: 1000
          }
        ],
        isActive: true
      };

      // Act & Assert
      await expect(quizService.createQuiz(invalidQuizData))
        .rejects.toThrow('Título do quiz é obrigatório');
    });

    it('deve rejeitar quiz sem perguntas', async () => {
      // Arrange
      const invalidQuizData = {
        title: 'Quiz Válido',
        description: 'Teste',
        questions: [],
        isActive: true
      };

      // Act & Assert
      await expect(quizService.createQuiz(invalidQuizData))
        .rejects.toThrow('Quiz deve ter pelo menos uma pergunta');
    });
  });

  describe('getQuizById', () => {
    it('deve retornar quiz existente', async () => {
      // Arrange
      const quizId = 'quiz-123';
      const expectedQuiz = {
        id: quizId,
        title: 'Quiz Teste',
        description: 'Descrição',
        questions: [],
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      } as Quiz;

      vi.mocked(mockQuizRepository.findById).mockResolvedValue(expectedQuiz);

      // Act
      const result = await quizService.getQuizById(quizId);

      // Assert
      expect(result).toEqual(expectedQuiz);
      expect(mockQuizRepository.findById).toHaveBeenCalledWith(quizId);
    });

    it('deve retornar null para quiz inexistente', async () => {
      // Arrange
      const quizId = 'quiz-inexistente';
      vi.mocked(mockQuizRepository.findById).mockResolvedValue(null);

      // Act
      const result = await quizService.getQuizById(quizId);

      // Assert
      expect(result).toBeNull();
      expect(mockQuizRepository.findById).toHaveBeenCalledWith(quizId);
    });
  });

  describe('addQuestion', () => {
    it('deve adicionar pergunta válida ao quiz', async () => {
      // Arrange
      const quizId = 'quiz-123';
      const existingQuiz = {
        id: quizId,
        title: 'Quiz Teste',
        description: 'Descrição',
        questions: [],
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      } as Quiz;

      const questionData = {
        title: 'Nova pergunta',
        options: [
          { id: 'opt1', text: 'Opção 1', color: '#EF4444', shape: 'circle' as const },
          { id: 'opt2', text: 'Opção 2', color: '#10B981', shape: 'square' as const }
        ],
        correctAnswer: 0,
        timeLimit: 30,
        points: 1000
      };

      const updatedQuiz = {
        ...existingQuiz,
        questions: [
          {
            id: expect.any(String),
            ...questionData
          }
        ],
        updatedAt: expect.any(Date)
      };

      vi.mocked(mockQuizRepository.findById).mockResolvedValue(existingQuiz);
      vi.mocked(mockQuizRepository.update).mockResolvedValue(updatedQuiz as Quiz);

      // Act
      const result = await quizService.addQuestion(quizId, questionData);

      // Assert
      expect(result).toEqual(updatedQuiz);
      expect(mockQuizRepository.findById).toHaveBeenCalledWith(quizId);
      expect(mockQuizRepository.update).toHaveBeenCalledWith(
        quizId,
        expect.objectContaining({
          questions: expect.arrayContaining([
            expect.objectContaining({
              id: expect.any(String),
              title: questionData.title,
              options: questionData.options,
              correctAnswer: questionData.correctAnswer,
              timeLimit: questionData.timeLimit,
              points: questionData.points
            })
          ]),
          updatedAt: expect.any(Date)
        })
      );
    });

    it('deve rejeitar pergunta com menos de 2 opções', async () => {
      // Arrange
      const quizId = 'quiz-123';
      const existingQuiz = {
        id: quizId,
        title: 'Quiz Teste',
        questions: [],
        isActive: true
      } as Quiz;

      const invalidQuestionData = {
        title: 'Pergunta inválida',
        options: [
          { id: 'opt1', text: 'Única opção', color: '#EF4444', shape: 'circle' as const }
        ],
        correctAnswer: 0,
        timeLimit: 30,
        points: 1000
      };

      vi.mocked(mockQuizRepository.findById).mockResolvedValue(existingQuiz);

      // Act & Assert
      await expect(quizService.addQuestion(quizId, invalidQuestionData))
        .rejects.toThrow('Pergunta deve ter pelo menos 2 opções');
    });
  });

  describe('validateQuestion', () => {
    it('deve validar tempo limite entre 5 e 300 segundos', async () => {
      // Arrange
      const quizId = 'quiz-123';
      const existingQuiz = {
        id: quizId,
        title: 'Quiz Teste',
        questions: [],
        isActive: true
      } as Quiz;

      const invalidQuestionData = {
        title: 'Pergunta com tempo inválido',
        options: [
          { id: 'opt1', text: 'Opção 1', color: '#EF4444', shape: 'circle' as const },
          { id: 'opt2', text: 'Opção 2', color: '#10B981', shape: 'square' as const }
        ],
        correctAnswer: 0,
        timeLimit: 400, // Inválido
        points: 1000
      };

      vi.mocked(mockQuizRepository.findById).mockResolvedValue(existingQuiz);

      // Act & Assert
      await expect(quizService.addQuestion(quizId, invalidQuestionData))
        .rejects.toThrow('Tempo limite deve estar entre 5 e 300 segundos');
    });

    it('deve validar resposta correta como índice válido', async () => {
      // Arrange
      const quizId = 'quiz-123';
      const existingQuiz = {
        id: quizId,
        title: 'Quiz Teste',
        questions: [],
        isActive: true
      } as Quiz;

      const invalidQuestionData = {
        title: 'Pergunta com resposta inválida',
        options: [
          { id: 'opt1', text: 'Opção 1', color: '#EF4444', shape: 'circle' as const },
          { id: 'opt2', text: 'Opção 2', color: '#10B981', shape: 'square' as const }
        ],
        correctAnswer: 5, // Índice inválido
        timeLimit: 30,
        points: 1000
      };

      vi.mocked(mockQuizRepository.findById).mockResolvedValue(existingQuiz);

      // Act & Assert
      await expect(quizService.addQuestion(quizId, invalidQuestionData))
        .rejects.toThrow('Resposta correta deve ser um índice válido das opções');
    });
  });
});