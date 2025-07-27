import { Question, Quiz } from '@qrcode-hunter/shared';
import { v4 as uuidv4 } from 'uuid';
import { QuizRepository } from '../repositories/QuizRepository';

/**
 * Serviço responsável pela lógica de negócio dos quizzes
 * Implementa Single Responsibility Principle
 */
export class QuizService {
  constructor(private quizRepository: QuizRepository) {}

  /**
   * Cria um novo quiz
   */
  async createQuiz(quizData: Omit<Quiz, 'id' | 'createdAt' | 'updatedAt'>): Promise<Quiz> {
    const quiz: Quiz = {
      id: uuidv4(),
      ...quizData,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Validação de negócio
    this.validateQuiz(quiz);

    return await this.quizRepository.create(quiz);
  }

  /**
   * Busca quiz por ID
   */
  async getQuizById(id: string): Promise<Quiz | null> {
    return await this.quizRepository.findById(id);
  }

  /**
   * Lista todos os quizzes
   */
  async getAllQuizzes(): Promise<Quiz[]> {
    return await this.quizRepository.findAll();
  }

  /**
   * Atualiza um quiz existente
   */
  async updateQuiz(id: string, updates: Partial<Quiz>): Promise<Quiz | null> {
    const existingQuiz = await this.quizRepository.findById(id);
    if (!existingQuiz) {
      return null;
    }

    const updatedQuiz = {
      ...existingQuiz,
      ...updates,
      updatedAt: new Date()
    };

    this.validateQuiz(updatedQuiz);

    return await this.quizRepository.update(id, updatedQuiz);
  }

  /**
   * Remove um quiz
   */
  async deleteQuiz(id: string): Promise<boolean> {
    return await this.quizRepository.delete(id);
  }

  /**
   * Busca quizzes ativos
   */
  async getActiveQuizzes(): Promise<Quiz[]> {
    const allQuizzes = await this.quizRepository.findAll();
    return allQuizzes.filter(quiz => quiz.isActive);
  }

  /**
   * Duplica um quiz existente
   */
  async duplicateQuiz(id: string): Promise<Quiz | null> {
    const originalQuiz = await this.quizRepository.findById(id);
    if (!originalQuiz) {
      return null;
    }

    const duplicatedQuiz: Quiz = {
      id: uuidv4(),
      title: `${originalQuiz.title} (Cópia)`,
      description: originalQuiz.description,
      questions: originalQuiz.questions.map(question => ({
        ...question,
        id: uuidv4()
      })),
      isActive: false, // Cópia inicia inativa
      createdAt: new Date(),
      updatedAt: new Date()
    };

    return await this.quizRepository.create(duplicatedQuiz);
  }

  /**
   * Adiciona uma pergunta ao quiz
   */
  async addQuestion(quizId: string, questionData: Omit<Question, 'id'>): Promise<Quiz | null> {
    const quiz = await this.quizRepository.findById(quizId);
    if (!quiz) {
      return null;
    }

    const question: Question = {
      id: uuidv4(),
      ...questionData
    };

    this.validateQuestion(question);

    quiz.questions.push(question);
    quiz.updatedAt = new Date();

    return await this.quizRepository.update(quizId, quiz);
  }

  /**
   * Remove uma pergunta do quiz
   */
  async removeQuestion(quizId: string, questionId: string): Promise<Quiz | null> {
    const quiz = await this.quizRepository.findById(quizId);
    if (!quiz) {
      return null;
    }

    quiz.questions = quiz.questions.filter(q => q.id !== questionId);
    quiz.updatedAt = new Date();

    return await this.quizRepository.update(quizId, quiz);
  }

  /**
   * Valida os dados do quiz
   */
  private validateQuiz(quiz: Quiz): void {
    if (!quiz.title || quiz.title.trim().length === 0) {
      throw new Error('Título do quiz é obrigatório');
    }

    if (quiz.questions.length === 0) {
      throw new Error('Quiz deve ter pelo menos uma pergunta');
    }

    quiz.questions.forEach(question => this.validateQuestion(question));
  }

  /**
   * Valida os dados da pergunta
   */
  private validateQuestion(question: Question): void {
    if (!question.title || question.title.trim().length === 0) {
      throw new Error('Título da pergunta é obrigatório');
    }

    if (question.options.length < 2) {
      throw new Error('Pergunta deve ter pelo menos 2 opções');
    }

    if (question.options.length > 4) {
      throw new Error('Pergunta pode ter no máximo 4 opções');
    }

    if (question.correctAnswer < 0 || question.correctAnswer >= question.options.length) {
      throw new Error('Resposta correta deve ser um índice válido das opções');
    }

    if (question.timeLimit < 5 || question.timeLimit > 300) {
      throw new Error('Tempo limite deve estar entre 5 e 300 segundos');
    }

    if (question.points < 0) {
      throw new Error('Pontuação deve ser um valor positivo');
    }
  }
}