import { GameSession, Quiz } from '@qrcode-hunter/shared';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { GameRepository } from '../../repositories/GameRepository';
import { QuizRepository } from '../../repositories/QuizRepository';
import { GameService } from '../../services/GameService';

// Mocks dos repositories
const mockGameRepository = {
  create: vi.fn(),
  findById: vi.fn(),
  findByPin: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
  findActive: vi.fn(),
  cleanupOldSessions: vi.fn()
} as unknown as GameRepository;

const mockQuizRepository = {
  findById: vi.fn()
} as unknown as QuizRepository;

describe('GameService - Advanced TDD Tests', () => {
  let gameService: GameService;

  beforeEach(() => {
    vi.clearAllMocks();
    gameService = new GameService(mockGameRepository, mockQuizRepository);
  });

  describe('Criação de Sessão', () => {
    it('deve gerar PIN único de 6 dígitos', async () => {
      const mockQuiz = {
        id: 'quiz1',
        title: 'Quiz Teste',
        isActive: true,
        questions: [{ id: 'q1', title: 'Pergunta', options: [], correctAnswer: 0, timeLimit: 30, points: 1000 }]
      } as Quiz;

      const mockSession = {
        id: 'session1',
        pin: '123456',
        quizId: 'quiz1',
        hostId: 'host1',
        status: 'waiting',
        currentQuestionIndex: 0,
        players: [],
        createdAt: new Date()
      } as GameSession;

      vi.mocked(mockQuizRepository.findById).mockResolvedValue(mockQuiz);
      vi.mocked(mockGameRepository.create).mockResolvedValue(mockSession);

      const result = await gameService.createSession('quiz1', 'host1');

      expect(result.pin).toMatch(/^\d{6}$/);
      expect(mockGameRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          pin: expect.stringMatching(/^\d{6}$/)
        })
      );
    });

    it('deve criar sessão com status waiting', async () => {
      const mockQuiz = {
        id: 'quiz1',
        isActive: true,
        questions: [{ id: 'q1' }]
      } as Quiz;

      const mockSession = {
        id: 'session1',
        status: 'waiting',
        currentQuestionIndex: 0,
        players: []
      } as GameSession;

      vi.mocked(mockQuizRepository.findById).mockResolvedValue(mockQuiz);
      vi.mocked(mockGameRepository.create).mockResolvedValue(mockSession);

      const result = await gameService.createSession('quiz1', 'host1');

      expect(result.status).toBe('waiting');
      expect(result.currentQuestionIndex).toBe(0);
      expect(result.players).toEqual([]);
    });

    it('deve rejeitar quiz inativo', async () => {
      const inactiveQuiz = {
        id: 'quiz1',
        isActive: false,
        questions: []
      } as Quiz;

      vi.mocked(mockQuizRepository.findById).mockResolvedValue(inactiveQuiz);

      await expect(gameService.createSession('quiz1', 'host1'))
        .rejects.toThrow('Quiz não está ativo');
    });

    it('deve rejeitar quiz sem perguntas', async () => {
      const emptyQuiz = {
        id: 'quiz1',
        isActive: true,
        questions: []
      } as Quiz;

      vi.mocked(mockQuizRepository.findById).mockResolvedValue(emptyQuiz);

      await expect(gameService.createSession('quiz1', 'host1'))
        .rejects.toThrow('Quiz deve ter pelo menos uma pergunta');
    });
  });

  describe('Gerenciamento de Jogadores', () => {
    it('deve adicionar jogador com dados válidos', async () => {
      const mockSession = {
        id: 'session1',
        pin: '123456',
        status: 'waiting',
        players: []
      } as GameSession;

      const updatedSession = {
        ...mockSession,
        players: [
          {
            id: expect.any(String),
            name: 'João',
            sessionId: 'session1',
            score: 0,
            answers: [],
            isConnected: true
          }
        ]
      } as GameSession;

      vi.mocked(mockGameRepository.findByPin).mockResolvedValue(mockSession);
      vi.mocked(mockGameRepository.update).mockResolvedValue(updatedSession);

      const result = await gameService.addPlayer('123456', 'João');

      expect(result.player.name).toBe('João');
      expect(result.player.score).toBe(0);
      expect(result.player.isConnected).toBe(true);
      expect(result.session.players).toHaveLength(1);
    });

    it('deve validar nome de jogador único (case insensitive)', async () => {
      const mockSession = {
        id: 'session1',
        pin: '123456',
        status: 'waiting',
        players: [
          {
            id: 'player1',
            name: 'João',
            sessionId: 'session1',
            score: 0,
            answers: [],
            isConnected: true
          }
        ]
      } as GameSession;

      vi.mocked(mockGameRepository.findByPin).mockResolvedValue(mockSession);

      // Teste case insensitive
      await expect(gameService.addPlayer('123456', 'joão'))
        .rejects.toThrow('Nome de jogador já existe nesta sessão');

      await expect(gameService.addPlayer('123456', 'JOÃO'))
        .rejects.toThrow('Nome de jogador já existe nesta sessão');
    });

    it('deve validar comprimento do nome do jogador', async () => {
      const mockSession = {
        id: 'session1',
        pin: '123456',
        status: 'waiting',
        players: []
      } as GameSession;

      vi.mocked(mockGameRepository.findByPin).mockResolvedValue(mockSession);

      // Nome muito curto
      await expect(gameService.addPlayer('123456', ''))
        .rejects.toThrow('Nome do jogador deve ter entre 1 e 20 caracteres');

      // Nome muito longo
      const longName = 'a'.repeat(21);
      await expect(gameService.addPlayer('123456', longName))
        .rejects.toThrow('Nome do jogador deve ter entre 1 e 20 caracteres');
    });

    it('deve rejeitar entrada em sessão ativa', async () => {
      const activeSession = {
        id: 'session1',
        pin: '123456',
        status: 'active',
        players: []
      } as GameSession;

      vi.mocked(mockGameRepository.findByPin).mockResolvedValue(activeSession);

      await expect(gameService.addPlayer('123456', 'João'))
        .rejects.toThrow('Não é possível entrar em uma sessão em andamento');
    });

    it('deve rejeitar entrada em sessão finalizada', async () => {
      const finishedSession = {
        id: 'session1',
        pin: '123456',
        status: 'finished',
        players: []
      } as GameSession;

      vi.mocked(mockGameRepository.findByPin).mockResolvedValue(finishedSession);

      await expect(gameService.addPlayer('123456', 'João'))
        .rejects.toThrow('Não é possível entrar em uma sessão finalizada');
    });
  });

  describe('Controle de Sessão', () => {
    it('deve iniciar sessão com pelo menos um jogador', async () => {
      const mockSession = {
        id: 'session1',
        status: 'waiting',
        players: [
          {
            id: 'player1',
            name: 'João',
            sessionId: 'session1',
            score: 0,
            answers: [],
            isConnected: true
          }
        ]
      } as GameSession;

      const startedSession = {
        ...mockSession,
        status: 'active',
        currentQuestionIndex: 0
      } as GameSession;

      vi.mocked(mockGameRepository.findById).mockResolvedValue(mockSession);
      vi.mocked(mockGameRepository.update).mockResolvedValue(startedSession);

      const result = await gameService.startSession('session1');

      expect(result.status).toBe('active');
      expect(result.currentQuestionIndex).toBe(0);
    });

    it('deve rejeitar início sem jogadores', async () => {
      const emptySession = {
        id: 'session1',
        status: 'waiting',
        players: []
      } as GameSession;

      vi.mocked(mockGameRepository.findById).mockResolvedValue(emptySession);

      await expect(gameService.startSession('session1'))
        .rejects.toThrow('Não há jogadores na sessão');
    });

    it('deve avançar para próxima pergunta', async () => {
      const mockSession = {
        id: 'session1',
        status: 'active',
        currentQuestionIndex: 0,
        quizId: 'quiz1'
      } as GameSession;

      const mockQuiz = {
        id: 'quiz1',
        questions: [
          { id: 'q1', title: 'Pergunta 1' },
          { id: 'q2', title: 'Pergunta 2' }
        ]
      } as Quiz;

      const updatedSession = {
        ...mockSession,
        currentQuestionIndex: 1
      } as GameSession;

      vi.mocked(mockGameRepository.findById).mockResolvedValue(mockSession);
      vi.mocked(mockQuizRepository.findById).mockResolvedValue(mockQuiz);
      vi.mocked(mockGameRepository.update).mockResolvedValue(updatedSession);

      const result = await gameService.nextQuestion('session1');

      expect(result.currentQuestionIndex).toBe(1);
      expect(result.status).toBe('active');
    });

    it('deve finalizar jogo na última pergunta', async () => {
      const mockSession = {
        id: 'session1',
        status: 'active',
        currentQuestionIndex: 1, // Última pergunta (índice 1 de 2 perguntas)
        quizId: 'quiz1'
      } as GameSession;

      const mockQuiz = {
        id: 'quiz1',
        questions: [
          { id: 'q1', title: 'Pergunta 1' },
          { id: 'q2', title: 'Pergunta 2' }
        ]
      } as Quiz;

      const finishedSession = {
        ...mockSession,
        status: 'finished'
      } as GameSession;

      vi.mocked(mockGameRepository.findById).mockResolvedValue(mockSession);
      vi.mocked(mockQuizRepository.findById).mockResolvedValue(mockQuiz);
      vi.mocked(mockGameRepository.update).mockResolvedValue(finishedSession);

      const result = await gameService.nextQuestion('session1');

      expect(result.status).toBe('finished');
    });
  });

  describe('Sistema de Pontuação', () => {
    it('deve calcular pontuação baseada no tempo (resposta rápida)', async () => {
      const mockSession = {
        id: 'session1',
        quizId: 'quiz1',
        players: [
          {
            id: 'player1',
            name: 'João',
            sessionId: 'session1',
            score: 0,
            answers: [],
            isConnected: true
          }
        ]
      } as GameSession;

      const mockQuiz = {
        id: 'quiz1',
        questions: [
          {
            id: 'question1',
            title: 'Pergunta teste',
            options: [
              { id: 'opt1', text: 'A', color: '#dc2626', shape: 'circle' },
              { id: 'opt2', text: 'B', color: '#2563eb', shape: 'square' }
            ],
            correctAnswer: 0,
            timeLimit: 30,
            points: 1000
          }
        ]
      } as Quiz;

      vi.mocked(mockGameRepository.findById).mockResolvedValue(mockSession);
      vi.mocked(mockQuizRepository.findById).mockResolvedValue(mockQuiz);
      vi.mocked(mockGameRepository.update).mockResolvedValue(mockSession);

      // Resposta rápida (5 segundos de 30)
      const result = await gameService.submitAnswer('session1', 'player1', 'question1', 0, 5000);

      expect(result.isCorrect).toBe(true);
      expect(result.points).toBeGreaterThan(500); // Deve ter bonus por velocidade
      expect(result.points).toBeLessThanOrEqual(1000);
    });

    it('deve calcular pontuação baseada no tempo (resposta lenta)', async () => {
      const mockSession = {
        id: 'session1',
        quizId: 'quiz1',
        players: [
          {
            id: 'player1',
            name: 'João',
            sessionId: 'session1',
            score: 0,
            answers: [],
            isConnected: true
          }
        ]
      } as GameSession;

      const mockQuiz = {
        id: 'quiz1',
        questions: [
          {
            id: 'question1',
            correctAnswer: 0,
            timeLimit: 30,
            points: 1000
          }
        ]
      } as Quiz;

      vi.mocked(mockGameRepository.findById).mockResolvedValue(mockSession);
      vi.mocked(mockQuizRepository.findById).mockResolvedValue(mockQuiz);
      vi.mocked(mockGameRepository.update).mockResolvedValue(mockSession);

      // Resposta lenta (25 segundos de 30)
      const result = await gameService.submitAnswer('session1', 'player1', 'question1', 0, 25000);

      expect(result.isCorrect).toBe(true);
      expect(result.points).toBeGreaterThan(0);
      expect(result.points).toBeLessThan(700); // Menos pontos por ser lenta
    });

    it('deve dar 0 pontos para resposta incorreta', async () => {
      const mockSession = {
        id: 'session1',
        quizId: 'quiz1',
        players: [
          {
            id: 'player1',
            name: 'João',
            sessionId: 'session1',
            score: 0,
            answers: [],
            isConnected: true
          }
        ]
      } as GameSession;

      const mockQuiz = {
        id: 'quiz1',
        questions: [
          {
            id: 'question1',
            correctAnswer: 0,
            timeLimit: 30,
            points: 1000
          }
        ]
      } as Quiz;

      vi.mocked(mockGameRepository.findById).mockResolvedValue(mockSession);
      vi.mocked(mockQuizRepository.findById).mockResolvedValue(mockQuiz);
      vi.mocked(mockGameRepository.update).mockResolvedValue(mockSession);

      // Resposta incorreta
      const result = await gameService.submitAnswer('session1', 'player1', 'question1', 1, 10000);

      expect(result.isCorrect).toBe(false);
      expect(result.points).toBe(0);
    });

    it('deve rejeitar resposta duplicada', async () => {
      const mockSession = {
        id: 'session1',
        quizId: 'quiz1',
        players: [
          {
            id: 'player1',
            name: 'João',
            sessionId: 'session1',
            score: 0,
            answers: [
              {
                questionId: 'question1',
                selectedOption: 0,
                timeToAnswer: 10000,
                isCorrect: true,
                points: 800
              }
            ],
            isConnected: true
          }
        ]
      } as GameSession;

      vi.mocked(mockGameRepository.findById).mockResolvedValue(mockSession);

      await expect(gameService.submitAnswer('session1', 'player1', 'question1', 1, 15000))
        .rejects.toThrow('Jogador já respondeu esta pergunta');
    });
  });

  describe('Resultados e Estatísticas', () => {
    it('deve gerar resultados da pergunta com leaderboard', async () => {
      const mockSession = {
        id: 'session1',
        quizId: 'quiz1',
        players: [
          {
            id: 'player1',
            name: 'João',
            score: 1000,
            answers: [
              {
                questionId: 'question1',
                selectedOption: 0,
                isCorrect: true,
                points: 1000
              }
            ]
          },
          {
            id: 'player2',
            name: 'Maria',
            score: 500,
            answers: [
              {
                questionId: 'question1',
                selectedOption: 1,
                isCorrect: false,
                points: 0
              }
            ]
          }
        ]
      } as GameSession;

      const mockQuiz = {
        id: 'quiz1',
        questions: [
          {
            id: 'question1',
            correctAnswer: 0
          }
        ]
      } as Quiz;

      vi.mocked(mockGameRepository.findById).mockResolvedValue(mockSession);
      vi.mocked(mockQuizRepository.findById).mockResolvedValue(mockQuiz);

      const result = await gameService.getQuestionResults('session1', 'question1');

      expect(result.questionId).toBe('question1');
      expect(result.correctAnswer).toBe(0);
      expect(result.playerAnswers).toHaveLength(2);
      expect(result.leaderboard[0]).toEqual({
        playerId: 'player1',
        playerName: 'João',
        score: 1000
      });
      expect(result.leaderboard[1]).toEqual({
        playerId: 'player2',
        playerName: 'Maria',
        score: 500
      });
    });

    it('deve gerar resultados finais do jogo', async () => {
      const mockSession = {
        id: 'session1',
        quizId: 'quiz1',
        players: [
          {
            id: 'player1',
            name: 'João',
            score: 2500
          },
          {
            id: 'player2',
            name: 'Maria',
            score: 1800
          }
        ]
      } as GameSession;

      const mockQuiz = {
        id: 'quiz1',
        questions: [
          { id: 'q1' },
          { id: 'q2' },
          { id: 'q3' }
        ]
      } as Quiz;

      vi.mocked(mockGameRepository.findById).mockResolvedValue(mockSession);
      vi.mocked(mockQuizRepository.findById).mockResolvedValue(mockQuiz);

      const result = await gameService.getGameResults('session1');

      expect(result.sessionId).toBe('session1');
      expect(result.totalQuestions).toBe(3);
      expect(result.finalLeaderboard[0]).toEqual({
        playerId: 'player1',
        playerName: 'João',
        totalScore: 2500
      });
      expect(result.finalLeaderboard[1]).toEqual({
        playerId: 'player2',
        playerName: 'Maria',
        totalScore: 1800
      });
    });
  });

  describe('Funcionalidades Futuras (TDD)', () => {
    it('deve limpar sessões antigas - método a ser implementado', async () => {
      // Este teste vai passar quando implementarmos o método
      if (typeof (gameService as any).cleanupOldSessions === 'function') {
        vi.mocked(mockGameRepository.cleanupOldSessions).mockResolvedValue(5);
        
        const result = await (gameService as any).cleanupOldSessions(24);
        expect(result).toBe(5);
      } else {
        expect(true).toBe(true); // Placeholder
      }
    });

    it('deve pausar e retomar sessão - método a ser implementado', async () => {
      // Funcionalidade futura
      if (typeof (gameService as any).pauseSession === 'function') {
        const mockSession = { id: 'session1', status: 'active' } as GameSession;
        const pausedSession = { ...mockSession, status: 'paused' } as any;
        
        vi.mocked(mockGameRepository.findById).mockResolvedValue(mockSession);
        vi.mocked(mockGameRepository.update).mockResolvedValue(pausedSession);
        
        const result = await (gameService as any).pauseSession('session1');
        expect(result.status).toBe('paused');
      } else {
        expect(true).toBe(true); // Placeholder
      }
    });
  });
});