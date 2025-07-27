import { Question, Quiz } from '@qrcode-hunter/shared';
import { createContext, createSignal, ParentComponent, useContext } from 'solid-js';
import { QuizService } from '../services/QuizService';

interface QuizContextType {
  quizzes: () => Quiz[];
  currentQuiz: () => Quiz | null;
  loading: () => boolean;
  error: () => string | null;
  
  // Actions
  loadQuizzes: () => Promise<void>;
  loadQuiz: (id: string) => Promise<void>;
  createQuiz: (quiz: Omit<Quiz, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Quiz>;
  updateQuiz: (id: string, updates: Partial<Quiz>) => Promise<Quiz>;
  deleteQuiz: (id: string) => Promise<void>;
  addQuestion: (quizId: string, question: Omit<Question, 'id'>) => Promise<void>;
  removeQuestion: (quizId: string, questionId: string) => Promise<void>;
  clearError: () => void;
}

const QuizContext = createContext<QuizContextType>();

/**
 * Provider de estado global para quizzes
 * Implementa gerenciamento de estado com Solid.js signals
 */
export const QuizProvider: ParentComponent = (props) => {
  const [quizzes, setQuizzes] = createSignal<Quiz[]>([]);
  const [currentQuiz, setCurrentQuiz] = createSignal<Quiz | null>(null);
  const [loading, setLoading] = createSignal(false);
  const [error, setError] = createSignal<string | null>(null);

  const quizService = new QuizService();

  const loadQuizzes = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await quizService.getAllQuizzes();
      setQuizzes(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar quizzes');
    } finally {
      setLoading(false);
    }
  };

  const loadQuiz = async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      const quiz = await quizService.getQuizById(id);
      setCurrentQuiz(quiz);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar quiz');
    } finally {
      setLoading(false);
    }
  };

  const createQuiz = async (quizData: Omit<Quiz, 'id' | 'createdAt' | 'updatedAt'>): Promise<Quiz> => {
    try {
      setLoading(true);
      setError(null);
      const newQuiz = await quizService.createQuiz(quizData);
      setQuizzes(prev => [newQuiz, ...prev]);
      return newQuiz;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao criar quiz';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const updateQuiz = async (id: string, updates: Partial<Quiz>): Promise<Quiz> => {
    try {
      setLoading(true);
      setError(null);
      const updatedQuiz = await quizService.updateQuiz(id, updates);
      
      // Atualizar na lista
      setQuizzes(prev => prev.map(quiz => quiz.id === id ? updatedQuiz : quiz));
      
      // Atualizar quiz atual se for o mesmo
      if (currentQuiz()?.id === id) {
        setCurrentQuiz(updatedQuiz);
      }
      
      return updatedQuiz;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao atualizar quiz';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const deleteQuiz = async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      await quizService.deleteQuiz(id);
      
      // Remover da lista
      setQuizzes(prev => prev.filter(quiz => quiz.id !== id));
      
      // Limpar quiz atual se for o mesmo
      if (currentQuiz()?.id === id) {
        setCurrentQuiz(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao deletar quiz');
    } finally {
      setLoading(false);
    }
  };

  const addQuestion = async (quizId: string, questionData: Omit<Question, 'id'>) => {
    try {
      setLoading(true);
      setError(null);
      const updatedQuiz = await quizService.addQuestion(quizId, questionData);
      
      // Atualizar na lista
      setQuizzes(prev => prev.map(quiz => quiz.id === quizId ? updatedQuiz : quiz));
      
      // Atualizar quiz atual se for o mesmo
      if (currentQuiz()?.id === quizId) {
        setCurrentQuiz(updatedQuiz);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao adicionar pergunta');
    } finally {
      setLoading(false);
    }
  };

  const removeQuestion = async (quizId: string, questionId: string) => {
    try {
      setLoading(true);
      setError(null);
      const updatedQuiz = await quizService.removeQuestion(quizId, questionId);
      
      // Atualizar na lista
      setQuizzes(prev => prev.map(quiz => quiz.id === quizId ? updatedQuiz : quiz));
      
      // Atualizar quiz atual se for o mesmo
      if (currentQuiz()?.id === quizId) {
        setCurrentQuiz(updatedQuiz);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao remover pergunta');
    } finally {
      setLoading(false);
    }
  };

  const clearError = () => {
    setError(null);
  };

  const contextValue: QuizContextType = {
    quizzes,
    currentQuiz,
    loading,
    error,
    loadQuizzes,
    loadQuiz,
    createQuiz,
    updateQuiz,
    deleteQuiz,
    addQuestion,
    removeQuestion,
    clearError
  };

  return (
    <QuizContext.Provider value={contextValue}>
      {props.children}
    </QuizContext.Provider>
  );
};

export const useQuiz = () => {
  const context = useContext(QuizContext);
  if (!context) {
    throw new Error('useQuiz deve ser usado dentro de QuizProvider');
  }
  return context;
};