// Exportar todos os tipos
export * from './types/index';

// Versão do pacote
export const VERSION = '1.0.0';

// Utilitários de validação
export const validateQuiz = (quiz: any): boolean => {
  return !!(quiz.title && quiz.questions && Array.isArray(quiz.questions));
};

export const validateQuestion = (question: any): boolean => {
  return !!(
    question.title &&
    question.options &&
    Array.isArray(question.options) &&
    question.options.length >= 2 &&
    typeof question.correctAnswer === 'number' &&
    question.correctAnswer >= 0 &&
    question.correctAnswer < question.options.length
  );
};