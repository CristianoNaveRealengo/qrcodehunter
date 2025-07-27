import { Quiz } from '@qrcode-hunter/shared';
import { DatabaseConnection } from '../database/DatabaseConnection';

/**
 * Repository para operações de Quiz no banco de dados
 * Implementa Repository Pattern e Dependency Inversion Principle
 */
export class QuizRepository {
  constructor(private database: DatabaseConnection) {}

  /**
   * Cria um novo quiz
   */
  async create(quiz: Quiz): Promise<Quiz> {
    try {
      // Simulação de persistência - substituir por implementação real do banco
      const savedQuiz = await this.database.quiz.create({
        data: {
          id: quiz.id,
          title: quiz.title,
          description: quiz.description,
          questions: JSON.stringify(quiz.questions),
          isActive: quiz.isActive,
          createdAt: quiz.createdAt,
          updatedAt: quiz.updatedAt
        }
      });

      return this.mapToQuiz(savedQuiz);
    } catch (error) {
      throw new Error(`Erro ao criar quiz: ${error}`);
    }
  }

  /**
   * Busca quiz por ID
   */
  async findById(id: string): Promise<Quiz | null> {
    try {
      const quiz = await this.database.quiz.findUnique({
        where: { id }
      });

      return quiz ? this.mapToQuiz(quiz) : null;
    } catch (error) {
      throw new Error(`Erro ao buscar quiz: ${error}`);
    }
  }

  /**
   * Lista todos os quizzes
   */
  async findAll(): Promise<Quiz[]> {
    try {
      const quizzes = await this.database.quiz.findMany({
        orderBy: { createdAt: 'desc' }
      });

      return quizzes.map(quiz => this.mapToQuiz(quiz));
    } catch (error) {
      throw new Error(`Erro ao listar quizzes: ${error}`);
    }
  }

  /**
   * Atualiza um quiz
   */
  async update(id: string, quiz: Quiz): Promise<Quiz> {
    try {
      const updatedQuiz = await this.database.quiz.update({
        where: { id },
        data: {
          title: quiz.title,
          description: quiz.description,
          questions: JSON.stringify(quiz.questions),
          isActive: quiz.isActive,
          updatedAt: quiz.updatedAt
        }
      });

      return this.mapToQuiz(updatedQuiz);
    } catch (error) {
      throw new Error(`Erro ao atualizar quiz: ${error}`);
    }
  }

  /**
   * Remove um quiz
   */
  async delete(id: string): Promise<boolean> {
    try {
      await this.database.quiz.delete({
        where: { id }
      });
      return true;
    } catch (error) {
      console.error(`Erro ao deletar quiz: ${error}`);
      return false;
    }
  }

  /**
   * Busca quizzes ativos
   */
  async findActive(): Promise<Quiz[]> {
    try {
      const quizzes = await this.database.quiz.findMany({
        where: { isActive: true },
        orderBy: { createdAt: 'desc' }
      });

      return quizzes.map(quiz => this.mapToQuiz(quiz));
    } catch (error) {
      throw new Error(`Erro ao buscar quizzes ativos: ${error}`);
    }
  }

  /**
   * Mapeia dados do banco para o modelo Quiz
   */
  private mapToQuiz(data: any): Quiz {
    return {
      id: data.id,
      title: data.title,
      description: data.description,
      questions: JSON.parse(data.questions || '[]'),
      isActive: data.isActive,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt
    };
  }
}