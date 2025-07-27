// Utilitários de Teste - Princípio Single Responsibility
// Cada função tem uma responsabilidade específica nos testes

import { screen } from '@solidjs/testing-library';
import { OPTION_LETTERS, SHAPE_SYMBOLS } from '../constants/TestConstants';

/**
 * Utilitários para testes do QuestionCard
 * Cada função tem uma responsabilidade específica - Princípio Single Responsibility
 */
export class QuestionCardTestUtils {
  /**
   * Verifica se todas as letras das opções estão presentes
   * Responsabilidade: Validar exibição das letras A, B, C, D
   */
  static verifyOptionLettersAreDisplayed(): void {
    OPTION_LETTERS.forEach(letter => {
      expect(screen.getByText(letter)).toBeInTheDocument();
    });
  }

  /**
   * Verifica se todos os símbolos de formas estão presentes
   * Responsabilidade: Validar exibição dos símbolos geométricos
   */
  static verifyShapeSymbolsAreDisplayed(): void {
    Object.values(SHAPE_SYMBOLS).forEach(symbol => {
      expect(screen.getByText(symbol)).toBeInTheDocument();
    });
  }

  /**
   * Verifica se textos específicos estão presentes no documento
   * Responsabilidade: Validar presença de textos específicos
   */
  static verifyTextsAreDisplayed(texts: string[]): void {
    texts.forEach(text => {
      expect(screen.getByText(text)).toBeInTheDocument();
    });
  }

  /**
   * Verifica se um elemento tem as classes CSS esperadas
   * Responsabilidade: Validar aplicação de classes CSS
   */
  static verifyElementHasClasses(element: HTMLElement, expectedClasses: string[]): void {
    expectedClasses.forEach(className => {
      expect(element).toHaveClass(className);
    });
  }

  /**
   * Verifica se um botão com título específico existe
   * Responsabilidade: Validar presença de botões com acessibilidade
   */
  static verifyButtonWithTitleExists(title: string): HTMLElement {
    const button = screen.getByTitle(title);
    expect(button).toBeInTheDocument();
    return button;
  }

  /**
   * Verifica se um botão com título específico NÃO existe
   * Responsabilidade: Validar ausência de botões em modo readonly
   */
  static verifyButtonWithTitleDoesNotExist(title: string): void {
    expect(screen.queryByTitle(title)).not.toBeInTheDocument();
  }

  /**
   * Verifica se elementos com test-id específico existem
   * Responsabilidade: Validar presença de elementos por test-id
   */
  static verifyElementsWithTestIdExist(testId: string, expectedCount?: number): HTMLElement[] {
    const elements = screen.getAllByTestId(testId);
    
    if (expectedCount !== undefined) {
      expect(elements).toHaveLength(expectedCount);
    } else {
      expect(elements.length).toBeGreaterThan(0);
    }
    
    return elements;
  }

  /**
   * Verifica se um elemento tem o estilo CSS esperado
   * Responsabilidade: Validar aplicação de estilos inline
   */
  static verifyElementHasStyle(element: HTMLElement, property: string, expectedValue: string): void {
    expect(element).toHaveStyle({ [property]: expectedValue });
  }

  /**
   * Verifica se um heading com nível específico existe
   * Responsabilidade: Validar estrutura semântica de headings
   */
  static verifyHeadingExists(level: number, text?: string): HTMLElement {
    const heading = screen.getByRole('heading', { level });
    expect(heading).toBeInTheDocument();
    
    if (text) {
      expect(heading).toHaveTextContent(text);
    }
    
    return heading;
  }

  /**
   * Verifica se elementos coloridos existem com cores específicas
   * Responsabilidade: Validar aplicação de cores de fundo
   */
  static verifyColoredElementsExist(): HTMLElement[] {
    const options = screen.getAllByRole('generic');
    const coloredOptions = options.filter(el => 
      el.style.backgroundColor && el.style.backgroundColor !== ''
    );
    
    expect(coloredOptions.length).toBeGreaterThan(0);
    return coloredOptions;
  }
}