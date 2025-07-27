import { describe, expect, it } from 'vitest';
import { GameSession, Player, PlayerAnswer, Question, QuestionOption, Quiz } from '../types/index';

/**
 * Testes para validação dos tipos compartilhados do sistema
 * Seguindo princípios de Clean Architecture - camada de Entities
 */
describe('Shared Types - Entities Layer', () => {
  
  /**
   * Testes para QuestionOption - Entidade que representa uma opção de resposta
   * Princípio da Responsabilidade Única: cada opção tem apenas dados relacionados à sua apresentação
   */
  describe('QuestionOption Entity', () => {
    // Factory method para criar opções válidas - facilita manutenção e reutilização
    const createValidOption = (overrides: Partial<QuestionOption> = {}): QuestionOption => ({
      id: 'opt1',
      text: 'Opção padrão',
      color: '#dc2626',
      shape: 'circle',
      ...overrides
    });

    it('deve criar opção com todas as propriedades obrigatórias', () => {
      const option = createValidOption({
        id: 'opt1',
        text: 'Opção 1',
        color: '#dc2626',
        shape: 'circle'
      });

      // Validação de integridade da entidade
      expect(option.id).toBe('opt1');
      expect(option.text).toBe('Opção 1');
      expect(option.color).toBe('#dc2626');
      expect(option.shape).toBe('circle');
    });

    it('deve aceitar todas as formas geométricas válidas', () => {
      const validShapes: Array<QuestionOption['shape']> = ['circle', 'square', 'triangle', 'diamond'];
      
      validShapes.forEach(shape => {
        const option = createValidOption({ shape });
        expect(option.shape).toBe(shape);
      });
    });

    it('deve validar formato de cor hexadecimal', () => {
      const validColors = ['#000000', '#ffffff', '#dc2626', '#2563eb'];
      
      validColors.forEach(color => {
        const option = createValidOption({ color });
        expect(option.color).toMatch(/^#[0-9a-fA-F]{6}$/);
      });
    });
  });

  /**
   * Testes para Question - Entidade agregada que contém opções de resposta
   * Princípio da Responsabilidade Única: gerencia apenas dados da pergunta e suas opções
   */
  describe('Question Entity', () => {
    // Factory method para criar perguntas válidas - reutilização e manutenibilidade
    const createValidQuestion = (overrides: Partial<Question> = {}): Question => ({
      id: 'q1',
      title: 'Pergunta padrão',
      options: [
        { id: 'opt1', text: 'Opção 1', color: '#dc2626', shape: 'circle' },
        { id: 'opt2', text: 'Opção 2', color: '#2563eb', shape: 'square' }
      ],
      correctAnswer: 0,
      timeLimit: 30,
      points: 1000,
      ...overrides
    });

    it('deve criar pergunta com propriedades obrigatórias válidas', () => {
      const question = createValidQuestion();

      // Validação de integridade da entidade agregada
      expect(question.id).toBe('q1');
      expect(question.title).toBe('Pergunta padrão');
      expect(question.options).toHaveLength(2);
      expect(question.correctAnswer).toBe(0);
      expect(question.timeLimit).toBe(30);
      expect(question.points).toBe(1000);
    });

    it('deve aceitar propriedades opcionais de apresentação', () => {
      const question = createValidQuestion({
        backgroundColor: '#f3f4f6',
        shape: 'triangle'
      });

      expect(question.backgroundColor).toBe('#f3f4f6');
      expect(question.shape).toBe('triangle');
    });

    it('deve validar que correctAnswer está dentro do range de opções', () => {
      const question = createValidQuestion({
        options: [
          { id: 'opt1', text: 'Opção 1', color: '#dc2626', shape: 'circle' },
          { id: 'opt2', text: 'Opção 2', color: '#2563eb', shape: 'square' }
        ],
        correctAnswer: 1
      });

      expect(question.correctAnswer).toBeLessThan(question.options.length);
      expect(question.correctAnswer).toBeGreaterThanOrEqual(0);
    });

    it('deve ter pontuação positiva', () => {
      const question = createValidQuestion({ points: 1500 });
      
      expect(question.points).toBeGreaterThan(0);
    });

    it('deve ter limite de tempo positivo', () => {
      const question = createValidQuestion({ timeLimit: 45 });
      
      expect(question.timeLimit).toBeGreaterThan(0);
    });
  });

  /**
   * Testes para Quiz - Entidade agregada que contém coleção de perguntas
   * Princípio da Responsabilidade Única: gerencia metadados do quiz e suas perguntas
   */
  describe('Quiz Entity', () => {
    // Factory method para criar quiz válido - facilita testes e manutenção
    const createValidQuiz = (overrides: Partial<Quiz> = {}): Quiz => {
      const now = new Date();
      return {
        id: 'quiz1',
        title: 'Quiz Padrão',
        description: 'Descrição padrão do quiz',
        questions: [],
        createdAt: now,
        updatedAt: now,
        isActive: true,
        ...overrides
      };
    };

    it('deve criar quiz com propriedades obrigatórias válidas', () => {
      const quiz = createValidQuiz({
        title: 'Quiz Teste',
        description: 'Descrição do quiz'
      });

      // Validação de integridade da entidade agregada
      expect(quiz.id).toBe('quiz1');
      expect(quiz.title).toBe('Quiz Teste');
      expect(quiz.description).toBe('Descrição do quiz');
      expect(quiz.questions).toEqual([]);
      expect(quiz.isActive).toBe(true);
      expect(quiz.createdAt).toBeInstanceOf(Date);
      expect(quiz.updatedAt).toBeInstanceOf(Date);
    });

    it('deve manter consistência temporal entre createdAt e updatedAt', () => {
      const quiz = createValidQuiz();
      
      // updatedAt deve ser maior ou igual a createdAt
      expect(quiz.updatedAt.getTime()).toBeGreaterThanOrEqual(quiz.createdAt.getTime());
    });

    it('deve permitir quiz inativo', () => {
      const quiz = createValidQuiz({ isActive: false });
      
      expect(quiz.isActive).toBe(false);
    });

    it('deve aceitar coleção de perguntas', () => {
      const questions: Question[] = [
        {
          id: 'q1',
          title: 'Pergunta 1',
          options: [
            { id: 'opt1', text: 'Opção 1', color: '#dc2626', shape: 'circle' }
          ],
          correctAnswer: 0,
          timeLimit: 30,
          points: 1000
        }
      ];

      const quiz = createValidQuiz({ questions });
      
      expect(quiz.questions).toHaveLength(1);
      expect(quiz.questions[0].id).toBe('q1');
    });
  });

  /**
   * Testes para Player - Entidade que representa um jogador na sessão
   * Princípio da Responsabilidade Única: gerencia apenas dados do jogador e suas respostas
   */
  describe('Player Entity', () => {
    // Factory method para criar jogador válido - facilita testes e manutenção
    const createValidPlayer = (overrides: Partial<Player> = {}): Player => ({
      id: 'player1',
      name: 'Jogador Padrão',
      sessionId: 'session1',
      score: 0,
      answers: [],
      isConnected: true,
      ...overrides
    });

    it('deve criar jogador com propriedades obrigatórias válidas', () => {
      const player = createValidPlayer({
        name: 'João',
        sessionId: 'session1'
      });

      // Validação de integridade da entidade
      expect(player.id).toBe('player1');
      expect(player.name).toBe('João');
      expect(player.sessionId).toBe('session1');
      expect(player.score).toBe(0);
      expect(player.answers).toEqual([]);
      expect(player.isConnected).toBe(true);
    });

    it('deve inicializar com pontuação zero', () => {
      const player = createValidPlayer();
      
      expect(player.score).toBe(0);
      expect(player.score).toBeGreaterThanOrEqual(0);
    });

    it('deve permitir jogador desconectado', () => {
      const player = createValidPlayer({ isConnected: false });
      
      expect(player.isConnected).toBe(false);
    });

    it('deve aceitar coleção de respostas', () => {
      const answers: PlayerAnswer[] = [
        {
          questionId: 'q1',
          selectedOption: 0,
          timeToAnswer: 15,
          isCorrect: true,
          points: 1000
        }
      ];

      const player = createValidPlayer({ 
        answers,
        score: 1000 
      });
      
      expect(player.answers).toHaveLength(1);
      expect(player.answers[0].questionId).toBe('q1');
      expect(player.score).toBe(1000);
    });

    it('deve manter consistência entre score e pontos das respostas', () => {
      const answers: PlayerAnswer[] = [
        {
          questionId: 'q1',
          selectedOption: 0,
          timeToAnswer: 15,
          isCorrect: true,
          points: 1000
        },
        {
          questionId: 'q2',
          selectedOption: 1,
          timeToAnswer: 20,
          isCorrect: false,
          points: 0
        }
      ];

      const expectedScore = answers.reduce((sum, answer) => sum + answer.points, 0);
      const player = createValidPlayer({ 
        answers,
        score: expectedScore 
      });
      
      expect(player.score).toBe(expectedScore);
    });
  });

  /**
   * Testes para GameSession - Entidade agregada que gerencia uma sessão de jogo
   * Princípio da Responsabilidade Única: coordena o estado do jogo e seus jogadores
   */
  describe('GameSession Entity', () => {
    // Factory method para criar sessão válida - facilita testes e manutenção
    const createValidGameSession = (overrides: Partial<GameSession> = {}): GameSession => ({
      id: 'session1',
      pin: '123456',
      quizId: 'quiz1',
      hostId: 'host1',
      status: 'waiting',
      currentQuestionIndex: 0,
      players: [],
      createdAt: new Date(),
      ...overrides
    });

    it('deve criar sessão com propriedades obrigatórias válidas', () => {
      const session = createValidGameSession();

      // Validação de integridade da entidade agregada
      expect(session.id).toBe('session1');
      expect(session.pin).toBe('123456');
      expect(session.quizId).toBe('quiz1');
      expect(session.hostId).toBe('host1');
      expect(session.status).toBe('waiting');
      expect(session.currentQuestionIndex).toBe(0);
      expect(session.players).toEqual([]);
      expect(session.createdAt).toBeInstanceOf(Date);
    });

    it('deve aceitar todos os status de jogo válidos', () => {
      const validStatuses: Array<GameSession['status']> = ['waiting', 'active', 'finished'];
      
      validStatuses.forEach(status => {
        const session = createValidGameSession({ status });
        expect(session.status).toBe(status);
      });
    });

    it('deve inicializar com índice de pergunta zero', () => {
      const session = createValidGameSession();
      
      expect(session.currentQuestionIndex).toBe(0);
      expect(session.currentQuestionIndex).toBeGreaterThanOrEqual(0);
    });

    it('deve ter PIN de 6 dígitos', () => {
      const session = createValidGameSession({ pin: '987654' });
      
      expect(session.pin).toMatch(/^\d{6}$/);
      expect(session.pin).toHaveLength(6);
    });

    it('deve aceitar coleção de jogadores', () => {
      const players: Player[] = [
        {
          id: 'player1',
          name: 'João',
          sessionId: 'session1',
          score: 0,
          answers: [],
          isConnected: true
        },
        {
          id: 'player2',
          name: 'Maria',
          sessionId: 'session1',
          score: 500,
          answers: [],
          isConnected: true
        }
      ];

      const session = createValidGameSession({ players });
      
      expect(session.players).toHaveLength(2);
      expect(session.players[0].name).toBe('João');
      expect(session.players[1].name).toBe('Maria');
    });

    it('deve manter consistência entre sessionId dos jogadores', () => {
      const players: Player[] = [
        {
          id: 'player1',
          name: 'João',
          sessionId: 'session1',
          score: 0,
          answers: [],
          isConnected: true
        }
      ];

      const session = createValidGameSession({ 
        id: 'session1',
        players 
      });
      
      // Todos os jogadores devem ter o mesmo sessionId da sessão
      session.players.forEach(player => {
        expect(player.sessionId).toBe(session.id);
      });
    });

    it('deve permitir progressão do índice de pergunta', () => {
      const session = createValidGameSession({ 
        currentQuestionIndex: 2,
        status: 'active'
      });
      
      expect(session.currentQuestionIndex).toBe(2);
      expect(session.status).toBe('active');
    });

    it('deve finalizar com status finished', () => {
      const session = createValidGameSession({ 
        status: 'finished',
        currentQuestionIndex: 5
      });
      
      expect(session.status).toBe('finished');
      expect(session.currentQuestionIndex).toBeGreaterThan(0);
    });
  });

  /**
   * Testes para PlayerAnswer - Value Object que representa uma resposta do jogador
   * Princípio da Responsabilidade Única: encapsula dados de uma resposta específica
   */
  describe('PlayerAnswer Value Object', () => {
    // Factory method para criar resposta válida
    const createValidPlayerAnswer = (overrides: Partial<PlayerAnswer> = {}): PlayerAnswer => ({
      questionId: 'q1',
      selectedOption: 0,
      timeToAnswer: 15,
      isCorrect: true,
      points: 1000,
      ...overrides
    });

    it('deve criar resposta com propriedades obrigatórias válidas', () => {
      const answer = createValidPlayerAnswer();

      // Validação de integridade do value object
      expect(answer.questionId).toBe('q1');
      expect(answer.selectedOption).toBe(0);
      expect(answer.timeToAnswer).toBe(15);
      expect(answer.isCorrect).toBe(true);
      expect(answer.points).toBe(1000);
    });

    it('deve ter tempo de resposta positivo', () => {
      const answer = createValidPlayerAnswer({ timeToAnswer: 25 });
      
      expect(answer.timeToAnswer).toBeGreaterThan(0);
    });

    it('deve ter pontuação zero para resposta incorreta', () => {
      const answer = createValidPlayerAnswer({ 
        isCorrect: false,
        points: 0 
      });
      
      expect(answer.isCorrect).toBe(false);
      expect(answer.points).toBe(0);
    });

    it('deve ter pontuação positiva para resposta correta', () => {
      const answer = createValidPlayerAnswer({ 
        isCorrect: true,
        points: 1500 
      });
      
      expect(answer.isCorrect).toBe(true);
      expect(answer.points).toBeGreaterThan(0);
    });

    it('deve ter índice de opção válido', () => {
      const answer = createValidPlayerAnswer({ selectedOption: 2 });
      
      expect(answer.selectedOption).toBeGreaterThanOrEqual(0);
      expect(Number.isInteger(answer.selectedOption)).toBe(true);
    });
  });
});