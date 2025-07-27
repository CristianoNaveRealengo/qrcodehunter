import { Quiz } from '@qrcode-hunter/shared';
import { fireEvent, render, screen, waitFor } from '@solidjs/testing-library';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { QuizProvider, useQuiz } from '../../context/QuizContext';

// Mock do QuizService
vi.mock('../../services/QuizService', () => ({
  QuizService: vi.fn().mockImplementation(() => ({
    getAllQuizzes: vi.fn(),
    getQuizById: vi.fn(),
    createQuiz: vi.fn(),
    updateQuiz: vi.fn(),
    deleteQuiz: vi.fn(),
    addQuestion: vi.fn(),
    removeQuestion: vi.fn()
  }))
}));

// Componente de teste para usar o contexto
const TestComponent = () => {
  const {
    quizzes,
    currentQuiz,
    loading,
    error,
    loadQuizzes,
    loadQuiz,
    createQuiz,
    updateQuiz,
    deleteQuiz,
    clearError
  } = useQuiz();

  return (
    <div>
      <div data-testid="loading">{loading() ? 'loading' : 'not-loading'}</div>
      <div data-testid="error">{error() || 'no-error'}</div>
      <div data-testid="quizzes-count">{quizzes().length}</div>
      <div data-testid="current-quiz">{currentQuiz()?.title || 'no-quiz'}</div>
      
      <button onClick={loadQuizzes} data-testid="load-quizzes">Load Quizzes</button>
      <button onClick={() => loadQuiz('quiz1')} data-testid="load-quiz">Load Quiz</button>
      <button onClick={() => createQuiz({
        title: 'New Quiz',
        description: 'Test',
        questions: [],
        isActive: true
      })} data-testid="create-quiz">Create Quiz</button>
      <button onClick={() => updateQuiz('quiz1', { title: 'Updated' })} data-testid="update-quiz">Update Quiz</button>
      <button onClick={() => deleteQuiz('quiz1')} data-testid="delete-quiz">Delete Quiz</button>
      <button onClick={clearError} data-testid="clear-error">Clear Error</button>
    </div>
  );
};

describe('QuizContext - TDD Tests', () => {
  let mockQuizService: any;

  beforeEach(() => {
    vi.clearAllMocks();
    const { QuizService } = require('../../services/QuizService');
    mockQuizService = new QuizService();
  });

  describe('Estado Inicial', () => {
    it('deve ter estado inicial correto', () => {
      render(() => (
        <QuizProvider>
          <TestComponent />
        </QuizProvider>
      ));

      expect(screen.getByTestId('loading')).toHaveTextContent('not-loading');
      expect(screen.getByTestId('error')).toHaveTextContent('no-error');
      expect(screen.getByTestId('quizzes-count')).toHaveTextContent('0');
      expect(screen.getByTestId('current-quiz')).toHaveTextContent('no-quiz');
    });
  });

  describe('Carregamento de Quizzes', () => {
    it('deve carregar quizzes com sucesso', async () => {
      const mockQuizzes: Quiz[] = [
        {
          id: 'quiz1',
          title: 'Quiz 1',
          description: 'Desc 1',
          questions: [],
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 'quiz2',
          title: 'Quiz 2',
          description: 'Desc 2',
          questions: [],
          isActive: false,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];

      mockQuizService.getAllQuizzes.mockResolvedValue(mockQuizzes);

      render(() => (
        <QuizProvider>
          <TestComponent />
        </QuizProvider>
      ));

      fireEvent.click(screen.getByTestId('load-quizzes'));

      // Deve mostrar loading
      expect(screen.getByTestId('loading')).toHaveTextContent('loading');

      // Aguardar carregamento
      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('not-loading');
      });

      expect(screen.getByTestId('quizzes-count')).toHaveTextContent('2');
      expect(screen.getByTestId('error')).toHaveTextContent('no-error');
    });

    it('deve tratar erro no carregamento de quizzes', async () => {
      mockQuizService.getAllQuizzes.mockRejectedValue(new Error('Erro de rede'));

      render(() => (
        <QuizProvider>
          <TestComponent />
        </QuizProvider>
      ));

      fireEvent.click(screen.getByTestId('load-quizzes'));

      await waitFor(() => {
        expect(screen.getByTestId('error')).toHaveTextContent('Erro de rede');
      });

      expect(screen.getByTestId('loading')).toHaveTextContent('not-loading');
      expect(screen.getByTestId('quizzes-count')).toHaveTextContent('0');
    });
  });

  describe('Carregamento de Quiz Individual', () => {
    it('deve carregar quiz específico', async () => {
      const mockQuiz: Quiz = {
        id: 'quiz1',
        title: 'Quiz Específico',
        description: 'Descrição',
        questions: [],
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      mockQuizService.getQuizById.mockResolvedValue(mockQuiz);

      render(() => (
        <QuizProvider>
          <TestComponent />
        </QuizProvider>
      ));

      fireEvent.click(screen.getByTestId('load-quiz'));

      await waitFor(() => {
        expect(screen.getByTestId('current-quiz')).toHaveTextContent('Quiz Específico');
      });

      expect(mockQuizService.getQuizById).toHaveBeenCalledWith('quiz1');
    });

    it('deve tratar erro ao carregar quiz específico', async () => {
      mockQuizService.getQuizById.mockRejectedValue(new Error('Quiz não encontrado'));

      render(() => (
        <QuizProvider>
          <TestComponent />
        </QuizProvider>
      ));

      fireEvent.click(screen.getByTestId('load-quiz'));

      await waitFor(() => {
        expect(screen.getByTestId('error')).toHaveTextContent('Quiz não encontrado');
      });
    });
  });

  describe('Criação de Quiz', () => {
    it('deve criar quiz e adicionar à lista', async () => {
      const newQuiz: Quiz = {
        id: 'quiz-new',
        title: 'New Quiz',
        description: 'Test',
        questions: [],
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      mockQuizService.createQuiz.mockResolvedValue(newQuiz);

      render(() => (
        <QuizProvider>
          <TestComponent />
        </QuizProvider>
      ));

      fireEvent.click(screen.getByTestId('create-quiz'));

      await waitFor(() => {
        expect(screen.getByTestId('quizzes-count')).toHaveTextContent('1');
      });

      expect(mockQuizService.createQuiz).toHaveBeenCalledWith({
        title: 'New Quiz',
        description: 'Test',
        questions: [],
        isActive: true
      });
    });

    it('deve tratar erro na criação de quiz', async () => {
      mockQuizService.createQuiz.mockRejectedValue(new Error('Dados inválidos'));

      render(() => (
        <QuizProvider>
          <TestComponent />
        </QuizProvider>
      ));

      fireEvent.click(screen.getByTestId('create-quiz'));

      await waitFor(() => {
        expect(screen.getByTestId('error')).toHaveTextContent('Dados inválidos');
      });
    });
  });

  describe('Atualização de Quiz', () => {
    it('deve atualizar quiz na lista', async () => {
      const existingQuiz: Quiz = {
        id: 'quiz1',
        title: 'Quiz Original',
        description: 'Desc',
        questions: [],
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const updatedQuiz: Quiz = {
        ...existingQuiz,
        title: 'Updated',
        updatedAt: new Date()
      };

      // Primeiro carregar quiz existente
      mockQuizService.getAllQuizzes.mockResolvedValue([existingQuiz]);
      mockQuizService.updateQuiz.mockResolvedValue(updatedQuiz);

      render(() => (
        <QuizProvider>
          <TestComponent />
        </QuizProvider>
      ));

      // Carregar quizzes primeiro
      fireEvent.click(screen.getByTestId('load-quizzes'));
      await waitFor(() => {
        expect(screen.getByTestId('quizzes-count')).toHaveTextContent('1');
      });

      // Atualizar quiz
      fireEvent.click(screen.getByTestId('update-quiz'));

      await waitFor(() => {
        expect(mockQuizService.updateQuiz).toHaveBeenCalledWith('quiz1', { title: 'Updated' });
      });
    });
  });

  describe('Exclusão de Quiz', () => {
    it('deve remover quiz da lista', async () => {
      const existingQuiz: Quiz = {
        id: 'quiz1',
        title: 'Quiz para deletar',
        description: 'Desc',
        questions: [],
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Primeiro carregar quiz existente
      mockQuizService.getAllQuizzes.mockResolvedValue([existingQuiz]);
      mockQuizService.deleteQuiz.mockResolvedValue(true);

      render(() => (
        <QuizProvider>
          <TestComponent />
        </QuizProvider>
      ));

      // Carregar quizzes primeiro
      fireEvent.click(screen.getByTestId('load-quizzes'));
      await waitFor(() => {
        expect(screen.getByTestId('quizzes-count')).toHaveTextContent('1');
      });

      // Deletar quiz
      fireEvent.click(screen.getByTestId('delete-quiz'));

      await waitFor(() => {
        expect(screen.getByTestId('quizzes-count')).toHaveTextContent('0');
      });

      expect(mockQuizService.deleteQuiz).toHaveBeenCalledWith('quiz1');
    });
  });

  describe('Gerenciamento de Erro', () => {
    it('deve limpar erro quando clearError é chamado', async () => {
      mockQuizService.getAllQuizzes.mockRejectedValue(new Error('Erro teste'));

      render(() => (
        <QuizProvider>
          <TestComponent />
        </QuizProvider>
      ));

      // Gerar erro
      fireEvent.click(screen.getByTestId('load-quizzes'));
      await waitFor(() => {
        expect(screen.getByTestId('error')).toHaveTextContent('Erro teste');
      });

      // Limpar erro
      fireEvent.click(screen.getByTestId('clear-error'));
      expect(screen.getByTestId('error')).toHaveTextContent('no-error');
    });
  });

  describe('Estados de Loading', () => {
    it('deve mostrar loading durante operações assíncronas', async () => {
      // Simular delay na resposta
      mockQuizService.getAllQuizzes.mockImplementation(() => 
        new Promise(resolve => setTimeout(() => resolve([]), 100))
      );

      render(() => (
        <QuizProvider>
          <TestComponent />
        </QuizProvider>
      ));

      fireEvent.click(screen.getByTestId('load-quizzes'));

      // Deve mostrar loading imediatamente
      expect(screen.getByTestId('loading')).toHaveTextContent('loading');

      // Aguardar conclusão
      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('not-loading');
      });
    });
  });

  describe('Integração com Quiz Atual', () => {
    it('deve atualizar currentQuiz quando quiz é atualizado', async () => {
      const quiz: Quiz = {
        id: 'quiz1',
        title: 'Quiz Original',
        description: 'Desc',
        questions: [],
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const updatedQuiz: Quiz = {
        ...quiz,
        title: 'Quiz Atualizado'
      };

      mockQuizService.getQuizById.mockResolvedValue(quiz);
      mockQuizService.updateQuiz.mockResolvedValue(updatedQuiz);

      render(() => (
        <QuizProvider>
          <TestComponent />
        </QuizProvider>
      ));

      // Carregar quiz atual
      fireEvent.click(screen.getByTestId('load-quiz'));
      await waitFor(() => {
        expect(screen.getByTestId('current-quiz')).toHaveTextContent('Quiz Original');
      });

      // Atualizar quiz
      fireEvent.click(screen.getByTestId('update-quiz'));
      await waitFor(() => {
        expect(screen.getByTestId('current-quiz')).toHaveTextContent('Quiz Atualizado');
      });
    });

    it('deve limpar currentQuiz quando quiz é deletado', async () => {
      const quiz: Quiz = {
        id: 'quiz1',
        title: 'Quiz para deletar',
        description: 'Desc',
        questions: [],
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      mockQuizService.getQuizById.mockResolvedValue(quiz);
      mockQuizService.deleteQuiz.mockResolvedValue(true);

      render(() => (
        <QuizProvider>
          <TestComponent />
        </QuizProvider>
      ));

      // Carregar quiz atual
      fireEvent.click(screen.getByTestId('load-quiz'));
      await waitFor(() => {
        expect(screen.getByTestId('current-quiz')).toHaveTextContent('Quiz para deletar');
      });

      // Deletar quiz
      fireEvent.click(screen.getByTestId('delete-quiz'));
      await waitFor(() => {
        expect(screen.getByTestId('current-quiz')).toHaveTextContent('no-quiz');
      });
    });
  });
});