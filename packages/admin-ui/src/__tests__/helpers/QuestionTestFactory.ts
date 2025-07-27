// Test Factory - Princípio Single Responsibility
// Responsável apenas por criar dados de teste para Question

import { Question } from '@qrcode-hunter/shared';

/**
 * Factory para criação de dados de teste de Question
 * Implementa o padrão Factory para centralizar a criação de objetos de teste
 * Segue o princípio Single Responsibility - responsável apenas por criar Questions de teste
 */
export class QuestionTestFactory {
  /**
   * Cria uma pergunta padrão para testes
   * @param overrides - Propriedades para sobrescrever os valores padrão
   * @returns Question configurada para teste
   */
  static createDefault(overrides: Partial<Question> = {}): Question {
    return {
      id: 'q1',
      title: 'Qual é a capital do Brasil?',
      options: [
        { id: 'opt1', text: 'São Paulo', color: '#dc2626', shape: 'circle' },
        { id: 'opt2', text: 'Rio de Janeiro', color: '#2563eb', shape: 'square' },
        { id: 'opt3', text: 'Brasília', color: '#16a34a', shape: 'triangle' },
        { id: 'opt4', text: 'Salvador', color: '#ca8a04', shape: 'diamond' }
      ],
      correctAnswer: 2,
      timeLimit: 30,
      points: 1000,
      ...overrides
    };
  }

  /**
   * Cria uma pergunta com dados mínimos
   * Útil para testar cenários de edge cases
   */
  static createMinimal(overrides: Partial<Question> = {}): Question {
    return {
      id: 'q-minimal',
      title: 'Pergunta mínima',
      options: [
        { id: 'opt1', text: 'A', color: '#000000', shape: 'circle' },
        { id: 'opt2', text: 'B', color: '#ffffff', shape: 'square' }
      ],
      correctAnswer: 0,
      timeLimit: 5,
      points: 1,
      ...overrides
    };
  }

  /**
   * Cria uma pergunta sem opções
   * Útil para testar robustez do componente
   */
  static createEmpty(overrides: Partial<Question> = {}): Question {
    return this.createDefault({
      options: [],
      ...overrides
    });
  }

  /**
   * Cria uma pergunta com valores extremos
   * Útil para testar limites do componente
   */
  static createExtreme(overrides: Partial<Question> = {}): Question {
    return this.createDefault({
      timeLimit: 999,
      points: 999999,
      correctAnswer: 10, // Índice inválido
      ...overrides
    });
  }

  /**
   * Cria uma pergunta com cor de fundo personalizada
   * Útil para testar funcionalidades opcionais
   */
  static createWithBackground(backgroundColor: string, overrides: Partial<Question> = {}): Question {
    return this.createDefault({
      backgroundColor,
      ...overrides
    });
  }
}