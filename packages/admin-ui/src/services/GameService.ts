import { GameResults, GameSession, Player, QuestionResults } from '@qrcode-hunter/shared';

/**
 * Serviço para comunicação com API de Game
 * Implementa padrão Repository para abstração da API
 */
export class GameService {
  private baseUrl = '/api/game';

  /**
   * Cria nova sessão de jogo
   */
  async createSession(quizId: string, hostId: string): Promise<GameSession> {
    const response = await fetch(`${this.baseUrl}/session`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ quizId, hostId })
    });
    
    const data = await this.handleResponse(response);
    return data.data;
  }

  /**
   * Inicia uma sessão de jogo
   */
  async startSession(sessionId: string): Promise<GameSession> {
    const response = await fetch(`${this.baseUrl}/session/${sessionId}/start`, {
      method: 'POST'
    });
    
    const data = await this.handleResponse(response);
    return data.data;
  }

  /**
   * Avança para próxima pergunta
   */
  async nextQuestion(sessionId: string): Promise<GameSession> {
    const response = await fetch(`${this.baseUrl}/session/${sessionId}/next`, {
      method: 'POST'
    });
    
    const data = await this.handleResponse(response);
    return data.data;
  }

  /**
   * Finaliza uma sessão
   */
  async endSession(sessionId: string): Promise<GameSession> {
    const response = await fetch(`${this.baseUrl}/session/${sessionId}/end`, {
      method: 'POST'
    });
    
    const data = await this.handleResponse(response);
    return data.data;
  }

  /**
   * Jogador entra na sessão
   */
  async joinSession(pin: string, playerName: string): Promise<{ session: GameSession; player: Player }> {
    const response = await fetch(`${this.baseUrl}/join`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ pin, playerName })
    });
    
    const data = await this.handleResponse(response);
    return data.data;
  }

  /**
   * Submete resposta do jogador
   */
  async submitAnswer(
    sessionId: string,
    playerId: string,
    questionId: string,
    selectedOption: number,
    timeToAnswer: number
  ): Promise<any> {
    const response = await fetch(`${this.baseUrl}/answer`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        sessionId,
        playerId,
        questionId,
        selectedOption,
        timeToAnswer
      })
    });
    
    const data = await this.handleResponse(response);
    return data.data;
  }

  /**
   * Obtém resultados de uma pergunta
   */
  async getQuestionResults(sessionId: string, questionId: string): Promise<QuestionResults> {
    const response = await fetch(`${this.baseUrl}/session/${sessionId}/results/${questionId}`);
    const data = await this.handleResponse(response);
    return data.data;
  }

  /**
   * Obtém resultados finais do jogo
   */
  async getFinalResults(sessionId: string): Promise<GameResults> {
    const response = await fetch(`${this.baseUrl}/session/${sessionId}/final-results`);
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