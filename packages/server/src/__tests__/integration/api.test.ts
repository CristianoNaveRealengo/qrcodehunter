import request from 'supertest';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { QuizServer } from '../../index';

describe('API Integration Tests', () => {
  let server: QuizServer;
  let app: any;

  beforeAll(async () => {
    server = new QuizServer(3002); // Usar porta diferente para testes
    // Não iniciar o servidor real, apenas obter a instância do app
    app = (server as any).app;
  });

  afterAll(async () => {
    if (server) {
      await server.stop();
    }
  });

  describe('Health Check', () => {
    it('deve retornar status OK', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body).toEqual({
        status: 'OK',
        timestamp: expect.any(String)
      });
    });
  });

  describe('Quiz API', () => {
    it('deve listar quizzes vazios inicialmente', async () => {
      const response = await request(app)
        .get('/api/quiz')
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        data: [],
        message: 'Quizzes listados com sucesso'
      });
    });

    it('deve criar um novo quiz', async () => {
      const newQuiz = {
        title: 'Quiz de Teste',
        description: 'Descrição do quiz de teste',
        questions: [
          {
            title: 'Pergunta teste',
            options: [
              { text: 'Opção 1', color: '#dc2626', shape: 'circle' },
              { text: 'Opção 2', color: '#2563eb', shape: 'square' }
            ],
            correctAnswer: 0,
            timeLimit: 30,
            points: 1000
          }
        ],
        isActive: true
      };

      const response = await request(app)
        .post('/api/quiz')
        .send(newQuiz)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toMatchObject({
        id: expect.any(String),
        title: newQuiz.title,
        description: newQuiz.description,
        isActive: newQuiz.isActive,
        createdAt: expect.any(String),
        updatedAt: expect.any(String)
      });
      expect(response.body.data.questions).toHaveLength(1);
    });

    it('deve rejeitar quiz sem título', async () => {
      const invalidQuiz = {
        description: 'Quiz sem título',
        questions: [],
        isActive: true
      };

      const response = await request(app)
        .post('/api/quiz')
        .send(invalidQuiz)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Dados inválidos');
    });

    it('deve rejeitar quiz sem perguntas', async () => {
      const invalidQuiz = {
        title: 'Quiz sem perguntas',
        description: 'Descrição',
        questions: [],
        isActive: true
      };

      const response = await request(app)
        .post('/api/quiz')
        .send(invalidQuiz)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('deve buscar quiz por ID', async () => {
      // Primeiro criar um quiz
      const newQuiz = {
        title: 'Quiz para buscar',
        description: 'Descrição',
        questions: [
          {
            title: 'Pergunta',
            options: [
              { text: 'A', color: '#dc2626', shape: 'circle' },
              { text: 'B', color: '#2563eb', shape: 'square' }
            ],
            correctAnswer: 0,
            timeLimit: 30,
            points: 1000
          }
        ],
        isActive: true
      };

      const createResponse = await request(app)
        .post('/api/quiz')
        .send(newQuiz);

      const quizId = createResponse.body.data.id;

      // Buscar o quiz criado
      const response = await request(app)
        .get(`/api/quiz/${quizId}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(quizId);
      expect(response.body.data.title).toBe(newQuiz.title);
    });

    it('deve retornar 404 para quiz inexistente', async () => {
      const response = await request(app)
        .get('/api/quiz/quiz-inexistente')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Quiz não encontrado');
    });

    it('deve atualizar quiz existente', async () => {
      // Criar quiz
      const newQuiz = {
        title: 'Quiz para atualizar',
        description: 'Descrição original',
        questions: [
          {
            title: 'Pergunta',
            options: [
              { text: 'A', color: '#dc2626', shape: 'circle' },
              { text: 'B', color: '#2563eb', shape: 'square' }
            ],
            correctAnswer: 0,
            timeLimit: 30,
            points: 1000
          }
        ],
        isActive: true
      };

      const createResponse = await request(app)
        .post('/api/quiz')
        .send(newQuiz);

      const quizId = createResponse.body.data.id;

      // Atualizar quiz
      const updates = {
        title: 'Quiz atualizado',
        description: 'Nova descrição',
        isActive: false
      };

      const response = await request(app)
        .put(`/api/quiz/${quizId}`)
        .send(updates)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe(updates.title);
      expect(response.body.data.description).toBe(updates.description);
      expect(response.body.data.isActive).toBe(updates.isActive);
    });

    it('deve deletar quiz existente', async () => {
      // Criar quiz
      const newQuiz = {
        title: 'Quiz para deletar',
        description: 'Será deletado',
        questions: [
          {
            title: 'Pergunta',
            options: [
              { text: 'A', color: '#dc2626', shape: 'circle' },
              { text: 'B', color: '#2563eb', shape: 'square' }
            ],
            correctAnswer: 0,
            timeLimit: 30,
            points: 1000
          }
        ],
        isActive: true
      };

      const createResponse = await request(app)
        .post('/api/quiz')
        .send(newQuiz);

      const quizId = createResponse.body.data.id;

      // Deletar quiz
      const response = await request(app)
        .delete(`/api/quiz/${quizId}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Quiz removido com sucesso');

      // Verificar se foi deletado
      await request(app)
        .get(`/api/quiz/${quizId}`)
        .expect(404);
    });
  });

  describe('Game API', () => {
    let quizId: string;

    beforeEach(async () => {
      // Criar um quiz para usar nos testes de game
      const newQuiz = {
        title: 'Quiz para Game',
        description: 'Quiz para testar sessões',
        questions: [
          {
            title: 'Pergunta do jogo',
            options: [
              { text: 'A', color: '#dc2626', shape: 'circle' },
              { text: 'B', color: '#2563eb', shape: 'square' },
              { text: 'C', color: '#16a34a', shape: 'triangle' },
              { text: 'D', color: '#ca8a04', shape: 'diamond' }
            ],
            correctAnswer: 2,
            timeLimit: 30,
            points: 1000
          }
        ],
        isActive: true
      };

      const response = await request(app)
        .post('/api/quiz')
        .send(newQuiz);

      quizId = response.body.data.id;
    });

    it('deve criar sessão de jogo', async () => {
      const sessionData = {
        quizId,
        hostId: 'host-123'
      };

      const response = await request(app)
        .post('/api/game/session')
        .send(sessionData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toMatchObject({
        id: expect.any(String),
        pin: expect.stringMatching(/^\d{6}$/), // PIN de 6 dígitos
        quizId,
        hostId: 'host-123',
        status: 'waiting',
        currentQuestionIndex: 0,
        players: [],
        createdAt: expect.any(String)
      });
    });

    it('deve rejeitar criação de sessão para quiz inexistente', async () => {
      const sessionData = {
        quizId: 'quiz-inexistente',
        hostId: 'host-123'
      };

      const response = await request(app)
        .post('/api/game/session')
        .send(sessionData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Quiz não encontrado');
    });

    it('deve permitir jogador entrar na sessão', async () => {
      // Criar sessão
      const sessionData = {
        quizId,
        hostId: 'host-123'
      };

      const sessionResponse = await request(app)
        .post('/api/game/session')
        .send(sessionData);

      const pin = sessionResponse.body.data.pin;

      // Jogador entrar
      const joinData = {
        pin,
        playerName: 'João'
      };

      const response = await request(app)
        .post('/api/game/join')
        .send(joinData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.player).toMatchObject({
        id: expect.any(String),
        name: 'João',
        sessionId: expect.any(String),
        score: 0,
        answers: [],
        isConnected: true
      });
    });

    it('deve rejeitar jogador com nome duplicado', async () => {
      // Criar sessão
      const sessionData = {
        quizId,
        hostId: 'host-123'
      };

      const sessionResponse = await request(app)
        .post('/api/game/session')
        .send(sessionData);

      const pin = sessionResponse.body.data.pin;

      // Primeiro jogador
      await request(app)
        .post('/api/game/join')
        .send({ pin, playerName: 'João' });

      // Segundo jogador com mesmo nome
      const response = await request(app)
        .post('/api/game/join')
        .send({ pin, playerName: 'João' })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Nome de jogador já existe nesta sessão');
    });
  });
});