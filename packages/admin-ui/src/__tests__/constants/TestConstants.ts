// Constantes de Teste - Princípio Open/Closed
// Centraliza valores constantes usados nos testes
// Facilita manutenção e extensão sem modificar código existente

/**
 * Constantes relacionadas às formas geométricas das opções
 * Segue o princípio Open/Closed - extensível para novas formas sem modificar código existente
 */
export const SHAPE_SYMBOLS = {
  CIRCLE: '●',
  SQUARE: '■',
  TRIANGLE: '▲',
  DIAMOND: '♦'
} as const;

/**
 * Letras das opções de resposta
 * Facilita testes que verificam a exibição das letras A, B, C, D
 */
export const OPTION_LETTERS = ['A', 'B', 'C', 'D'] as const;

/**
 * Classes CSS esperadas para diferentes estados
 * Centraliza as classes CSS para facilitar manutenção
 */
export const CSS_CLASSES = {
  CORRECT_ANSWER: 'border-success-300',
  GRID_RESPONSIVE: ['grid-cols-1', 'sm:grid-cols-2'],
  SHAPE_CLASSES: {
    CIRCLE: 'rounded-full',
    SQUARE: 'rounded-none',
    TRIANGLE: 'rounded-sm triangle-shape',
    DIAMOND: 'rounded-sm diamond-shape'
  }
} as const;

/**
 * Mensagens de acessibilidade esperadas
 * Centraliza textos de acessibilidade para facilitar testes
 */
export const ACCESSIBILITY_LABELS = {
  EDIT_BUTTON: 'Editar pergunta',
  DELETE_BUTTON: 'Remover pergunta',
  CHECK_ICON_TEST_ID: 'check-icon'
} as const;

/**
 * Cores padrão usadas nos testes
 * Facilita testes de cores e contraste
 */
export const TEST_COLORS = {
  RED: '#dc2626',
  BLUE: '#2563eb',
  GREEN: '#16a34a',
  YELLOW: '#ca8a04',
  BACKGROUND_GRAY: '#f3f4f6'
} as const;

/**
 * Valores de teste para diferentes cenários
 * Centraliza valores numéricos usados nos testes
 */
export const TEST_VALUES = {
  DEFAULT_TIME_LIMIT: 30,
  DEFAULT_POINTS: 1000,
  EXTREME_TIME_LIMIT: 999,
  EXTREME_POINTS: 999999,
  MINIMAL_TIME_LIMIT: 5,
  MINIMAL_POINTS: 1,
  INVALID_ANSWER_INDEX: 10
} as const;