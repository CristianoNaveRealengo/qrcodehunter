import { A } from '@solidjs/router';
import { Component, For, onMount, Show } from 'solid-js';
import { QuizFilters } from '../components/QuizFilters';
import { QuizItem } from '../components/QuizItem';
import { useQuiz } from '../context/QuizContext';
import { useQuizActions } from '../hooks/useQuizActions';
import { useQuizFilters } from '../hooks/useQuizFilters';

/**
 * Página de listagem de quizzes refatorada
 * Implementa Clean Architecture com separação clara de responsabilidades
 * 
 * Camadas:
 * - Presentation Layer: Este componente (UI)
 * - Application Layer: Hooks customizados (casos de uso)
 * - Domain Layer: Context (entidades e regras de negócio)
 * - Infrastructure Layer: Serviços de API (não mostrados aqui)
 */
export const QuizListRefactored: Component = () => {
  // Hooks de contexto para gerenciamento de estado global
  const { quizzes, loadQuizzes, loading, error } = useQuiz();
  
  // Hooks customizados para separar responsabilidades
  const filters = useQuizFilters();
  const actions = useQuizActions();

  // Carregamento inicial dos dados
  onMount(() => {
    loadQuizzes();
  });

  // Aplicação dos filtros aos quizzes
  const filteredQuizzes = () => filters.applyFilters(quizzes());

  // Cálculos para estatísticas dos filtros
  const quizStats = () => ({
    total: quizzes().length,
    active: quizzes().filter(q => q.isActive).length,
    inactive: quizzes().filter(q => !q.isActive).length
  });

  return (
    <div class="space-y-6">
      {/* Cabeçalho da Página */}
      <PageHeader />

      {/* Filtros de Busca e Status */}
      <QuizFilters
        searchTerm={filters.searchTerm}
        setSearchTerm={filters.setSearchTerm}
        filterActive={filters.filterActive}
        setFilterActive={filters.setFilterActive}
        totalQuizzes={quizStats().total}
        activeQuizzes={quizStats().active}
        inactiveQuizzes={quizStats().inactive}
      />

      {/* Mensagem de Erro */}
      <ErrorMessage error={error()} />

      {/* Lista de Quizzes */}
      <QuizList
        loading={loading()}
        quizzes={filteredQuizzes()}
        searchTerm={filters.searchTerm()}
        filterActive={filters.filterActive()}
        onToggleActive={actions.handleToggleActive}
        onDelete={actions.openDeleteModal}
        actionLoading={actions.actionLoading}
      />

      {/* Modal de Confirmação de Exclusão */}
      <DeleteConfirmationModal
        show={actions.showDeleteModal()}
        onConfirm={actions.handleDeleteQuiz}
        onCancel={actions.closeDeleteModal}
      />
    </div>
  );
};

/**
 * Componente de cabeçalho da página
 * Implementa Single Responsibility Principle
 */
const PageHeader: Component = () => (
  <div class="flex justify-between items-start">
    <div>
      <h1 class="text-3xl font-bold text-gray-900 dark:text-white">
        Meus Quizzes
      </h1>
      <p class="text-gray-600 dark:text-gray-400 mt-1">
        Gerencie seus quizzes e perguntas
      </p>
    </div>

    <A
      href="/quiz/new"
      class="btn-primary"
    >
      <PlusIcon class="w-5 h-5 mr-2" />
      Novo Quiz
    </A>
  </div>
);

/**
 * Componente de mensagem de erro
 */
const ErrorMessage: Component<{ error: string | null }> = (props) => (
  <Show when={props.error}>
    <div class="bg-danger-50 dark:bg-danger-900/20 border border-danger-200 dark:border-danger-800 rounded-lg p-4">
      <div class="flex items-center">
        <ExclamationIcon class="w-5 h-5 text-danger-600 dark:text-danger-400 mr-2" />
        <span class="text-danger-700 dark:text-danger-300">{props.error}</span>
      </div>
    </div>
  </Show>
);

/**
 * Componente principal da lista de quizzes
 */
interface QuizListProps {
  loading: boolean;
  quizzes: any[];
  searchTerm: string;
  filterActive: string;
  onToggleActive: (quiz: any) => void;
  onDelete: (quizId: string) => void;
  actionLoading: () => string | null;
}

const QuizList: Component<QuizListProps> = (props) => (
  <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
    <Show
      when={!props.loading && props.quizzes.length > 0}
      fallback={<EmptyState loading={props.loading} searchTerm={props.searchTerm} filterActive={props.filterActive} />}
    >
      <div class="divide-y divide-gray-200 dark:divide-gray-700">
        <For each={props.quizzes}>
          {(quiz) => (
            <QuizItem
              quiz={quiz}
              onToggleActive={props.onToggleActive}
              onDelete={props.onDelete}
              loading={props.actionLoading() === quiz.id}
            />
          )}
        </For>
      </div>
    </Show>
  </div>
);

/**
 * Componente de estado vazio
 */
const EmptyState: Component<{ loading: boolean; searchTerm: string; filterActive: string }> = (props) => (
  <div class="p-8 text-center">
    <Show
      when={props.loading}
      fallback={<EmptyStateContent searchTerm={props.searchTerm} filterActive={props.filterActive} />}
    >
      <LoadingState />
    </Show>
  </div>
);

/**
 * Conteúdo do estado vazio
 */
const EmptyStateContent: Component<{ searchTerm: string; filterActive: string }> = (props) => {
  const hasFilters = props.searchTerm || props.filterActive !== 'all';
  
  return (
    <div class="text-gray-500 dark:text-gray-400">
      <QuizIcon class="w-16 h-16 mx-auto mb-4 opacity-50" />
      <h3 class="text-lg font-medium mb-2">
        {hasFilters ? 'Nenhum quiz encontrado' : 'Nenhum quiz criado ainda'}
      </h3>
      <p class="mb-4">
        {hasFilters
          ? 'Tente ajustar os filtros de busca'
          : 'Comece criando seu primeiro quiz'
        }
      </p>
      <Show when={!hasFilters}>
        <A href="/quiz/new" class="btn-primary">
          Criar Primeiro Quiz
        </A>
      </Show>
    </div>
  );
};

/**
 * Estado de carregamento
 */
const LoadingState: Component = () => (
  <div class="space-y-4">
    <For each={[1, 2, 3, 4, 5]}>
      {() => (
        <div class="flex items-center space-x-4 p-4">
          <div class="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
          <div class="flex-1 space-y-2">
            <div class="h-5 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-1/3" />
            <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-1/2" />
            <div class="h-3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-1/4" />
          </div>
          <div class="flex space-x-2">
            <div class="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            <div class="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            <div class="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          </div>
        </div>
      )}
    </For>
  </div>
);

/**
 * Modal de confirmação de exclusão
 */
const DeleteConfirmationModal: Component<{
  show: string | null;
  onConfirm: (quizId: string) => void;
  onCancel: () => void;
}> = (props) => (
  <Show when={props.show}>
    <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Confirmar Exclusão
        </h3>
        <p class="text-gray-600 dark:text-gray-400 mb-6">
          Tem certeza que deseja excluir este quiz? Esta ação não pode ser desfeita.
        </p>
        <div class="flex justify-end space-x-3">
          <button onClick={props.onCancel} class="btn-outline">
            Cancelar
          </button>
          <button
            onClick={() => props.onConfirm(props.show!)}
            class="btn-danger"
          >
            Excluir
          </button>
        </div>
      </div>
    </div>
  </Show>
);

// Ícones
const PlusIcon: Component<{ class?: string }> = (props) => (
  <svg class={props.class} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width={2} d="M12 4v16m8-8H4" />
  </svg>
);

const ExclamationIcon: Component<{ class?: string }> = (props) => (
  <svg class={props.class} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
  </svg>
);

const QuizIcon: Component<{ class?: string }> = (props) => (
  <svg class={props.class} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);