import { Question, Quiz } from '@qrcode-hunter/shared';

/**
 * Serviço para comunicação com API de Quiz
 * Implementa padrão Repository para abstração da API
 */
export class QuizService {
  private baseUrl = '/api/quiz';

  /**
   * Busca todos os quizzes
   */
  async getAllQuizzes(): Promise<Quiz[]> {
    const response = await fetch(this.baseUrl);
    const data = await this.handleResponse(response);
    return data.data;
  }

  /**
   * Busca quiz por ID
   */
  async getQuizById(id: string): Promise<Quiz> {
    const response = await fetch(`${this.baseUrl}/${id}`);
    const data = await this.handleResponse(response);
    return data.data;
  }

  /**
   * Cria novo quiz
   */
  async createQuiz(quiz: Omit<Quiz, 'id' | 'createdAt' | 'updatedAt'>): Promise<Quiz> {
    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(quiz)
    });
    
    const data = await this.handleResponse(response);
    return data.data;
  }

  /**
   * Atualiza quiz existente
   */
  async updateQuiz(id: string, updates: Partial<Quiz>): Promise<Quiz> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updates)
    });
    
    const data = await this.handleResponse(response);
    return data.data;
  }

  /**
   * Remove quiz
   */
  async deleteQuiz(id: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: 'DELETE'
    });
    
    await this.handleResponse(response);
  }

  /**
   * Adiciona pergunta ao quiz
   */
  async addQuestion(quizId: string, question: Omit<Question, 'id'>): Promise<Quiz> {
    const response = await fetch(`${this.baseUrl}/${quizId}/questions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(question)
    });
    
    const data = await this.handleResponse(response);
    return data.data;
  }

  /**
   * Remove pergunta do quiz
   */
  async removeQuestion(quizId: string, questionId: string): Promise<Quiz> {
    const response = await fetch(`${this.baseUrl}/${quizId}/questions/${questionId}`, {
      method: 'DELETE'
    });
    
    const data = await this.handleResponse(response);
    return data.data;
  }

  /**
   * Busca quizzes ativos
   */
  async getActiveQuizzes(): Promise<Quiz[]> {
    const response = await fetch(`${this.baseUrl}/active`);
    const data = await this.handleResponse(response);
    return data.data;
  }

  /**
   * Processa resposta da API e trata erros
   */
  private async handleResponse(response: Response): Promise<any> {
    if (!response.ok) {
      let errorMessage = `Erro HTTP: ${response.status}`;
      
      try {
        const errorData = await response.json();
        errorMessage = errorData.error || errorData.message || errorMessage;
      } catch {
        // Se não conseguir parsear JSON, usar mensagem padrão
      }
      
      throw new Error(errorMessage);
    }

    try {
      return await response.json();
    } catch (error) {
      throw new Error('Erro ao processar resposta do servidor');
    }
  }
}