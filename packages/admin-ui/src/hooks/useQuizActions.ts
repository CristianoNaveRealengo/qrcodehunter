import { createSignal } from 'solid-js';
import { useQuiz } from '../context/QuizContext';

/**
 * Hook customizado para gerenciar ações de quiz
 * Implementa Single Responsibility Principle separando a lógica de ações
 */
export const useQuizActions = () => {
  const { updateQuiz, deleteQuiz } = useQuiz();
  const [showDeleteModal, setShowDeleteModal] = createSignal<string | null>(null);
  const [actionLoading, setActionLoading] = createSignal<string | null>(null);

  /**
   * Alterna o status ativo/inativo de um quiz
   * Implementa tratamento de erro e feedback visual
   */
  const handleToggleActive = async (quiz: any) => {
    try {
      setActionLoading(quiz.id);
      await updateQuiz(quiz.id, { isActive: !quiz.isActive });
      // TODO: Adicionar sistema de notificações
      console.log(`Quiz ${quiz.title} ${quiz.isActive ? 'desativado' : 'ativado'} com sucesso`);
    } catch (error) {
      console.error('Erro ao alterar status do quiz:', error);
      // TODO: Adicionar notificação de erro para o usuário
    } finally {
      setActionLoading(null);
    }
  };

  /**
   * Remove um quiz após confirmação
   * Fecha o modal e atualiza a lista automaticamente
   */
  const handleDeleteQuiz = async (quizId: string) => {
    try {
      setActionLoading(quizId);
      await deleteQuiz(quizId);
      setShowDeleteModal(null);
      // TODO: Adicionar sistema de notificações
      console.log('Quiz deletado com sucesso');
    } catch (error) {
      console.error('Erro ao deletar quiz:', error);
      // TODO: Adicionar notificação de erro para o usuário
    } finally {
      setActionLoading(null);
    }
  };

  /**
   * Abre o modal de confirmação de exclusão
   */
  const openDeleteModal = (quizId: string) => {
    setShowDeleteModal(quizId);
  };

  /**
   * Fecha o modal de confirmação de exclusão
   */
  const closeDeleteModal = () => {
    setShowDeleteModal(null);
  };

  return {
    showDeleteModal,
    actionLoading,
    handleToggleActive,
    handleDeleteQuiz,
    openDeleteModal,
    closeDeleteModal
  };
};