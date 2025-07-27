import { A } from '@solidjs/router';
import { clsx } from 'clsx';
import { Component, createSignal, For, onMount, Show } from 'solid-js';
import { useQuiz } from '../context/QuizContext';

/**
 * Página de listagem de quizzes
 * Implementa CRUD básico com filtros e busca
 * 
 * Responsabilidades:
 * - Exibir lista de quizzes com paginação
 * - Filtrar quizzes por status e termo de busca
 * - Gerenciar ações de CRUD (criar, editar, deletar, ativar/desativar)
 * - Controlar modais de confirmação
 */
export const QuizList: Component = () => {
  // Hooks de contexto para gerenciamento de estado
  const { quizzes, loadQuizzes, deleteQuiz, updateQuiz, loading, error } = useQuiz();
  
  // Estados locais para filtros e controle de UI
  const [searchTerm, setSearchTerm] = createSignal('');
  const [filterActive, setFilterActive] = createSignal<'all' | 'active' | 'inactive'>('all');
  const [showDeleteModal, setShowDeleteModal] = createSignal<string | null>(null);

  onMount(() => {
    loadQuizzes();
  });

  /**
   * Função computada para filtrar quizzes baseado nos critérios de busca e status
   * Aplica filtros de forma sequencial para otimizar performance
   */
  const filteredQuizzes = () => {
    let filtered = quizzes();
    
    // Filtro por termo de busca - busca em título e descrição
    if (searchTerm()) {
      const searchLower = searchTerm().toLowerCase();
      filtered = filtered.filter(quiz => 
        quiz.title.toLowerCase().includes(searchLower) ||
        (quiz.description?.toLowerCase() || '').includes(searchLower)
      );
    }
    
    // Filtro por status ativo/inativo
    if (filterActive() !== 'all') {
      const isActiveFilter = filterActive() === 'active';
      filtered = filtered.filter(quiz => quiz.isActive === isActiveFilter);
    }
    
    return filtered;
  };

  /**
   * Alterna o status ativo/inativo de um quiz
   * Implementa tratamento de erro e feedback visual
   */
  const handleToggleActive = async (quiz: any) => {
    try {
      await updateQuiz(quiz.id, { isActive: !quiz.isActive });
      // TODO: Adicionar notificação de sucesso
    } catch (error) {
      console.error('Erro ao alterar status do quiz:', error);
      // TODO: Adicionar notificação de erro para o usuário
    }
  };

  /**
   * Remove um quiz após confirmação
   * Fecha o modal e atualiza a lista automaticamente
   */
  const handleDeleteQuiz = async (quizId: string) => {
    try {
      await deleteQuiz(quizId);
      setShowDeleteModal(null);
      // TODO: Adicionar notificação de sucesso
    } catch (error) {
      console.error('Erro ao deletar quiz:', error);
      // TODO: Adicionar notificação de erro para o usuário
    }
  };

  return (
    <div class="space-y-6">
      {/* Header */}
      <div class="flex justify-between items-center">
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
          class="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
        >
          <PlusIcon class="w-5 h-5" />
          <span>Novo Quiz</span>
        </A>
      </div>

      {/* Filtros e Busca */}
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div class="flex flex-col sm:flex-row gap-4">
          {/* Busca */}
          <div class="flex-1">
            <div class="relative">
              <SearchIcon class="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar quizzes..."
                value={searchTerm()}
                onInput={(e) => setSearchTerm(e.currentTarget.value)}
                class="input pl-10"
              />
            </div>
          </div>

          {/* Filtro por Status */}
          <div class="flex space-x-2">
            <button
              onClick={() => setFilterActive('all')}
              class={clsx(
                'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                filterActive() === 'all'
                  ? 'bg-primary-100 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
              )}
            >
              Todos ({quizzes().length})
            </button>
            <button
              onClick={() => setFilterActive('active')}
              class={clsx(
                'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                filterActive() === 'active'
                  ? 'bg-success-100 dark:bg-success-900/20 text-success-700 dark:text-success-300'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
              )}
            >
              Ativos ({quizzes().filter(q => q.isActive).length})
            </button>
            <button
              onClick={() => setFilterActive('inactive')}
              class={clsx(
                'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                filterActive() === 'inactive'
                  ? 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
              )}
            >
              Inativos ({quizzes().filter(q => !q.isActive).length})
            </button>
          </div>
        </div>
      </div>

      {/* Mensagem de Erro */}
      <Show when={error()}>
        <div class="bg-danger-50 dark:bg-danger-900/20 border border-danger-200 dark:border-danger-800 rounded-lg p-4">
          <div class="flex items-center">
            <ExclamationIcon class="w-5 h-5 text-danger-600 dark:text-danger-400 mr-2" />
            <span class="text-danger-800 dark:text-danger-200">{error()}</span>
          </div>
        </div>
      </Show>

      {/* Lista de Quizzes */}
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <Show
          when={!loading() && filteredQuizzes().length > 0}
          fallback={
            <div class="p-8 text-center">
              <Show
                when={loading()}
                fallback={
                  <div class="text-gray-500 dark:text-gray-400">
                    <QuizIcon class="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <h3 class="text-lg font-medium mb-2">
                      {searchTerm() || filterActive() !== 'all' 
                        ? 'Nenhum quiz encontrado' 
                        : 'Nenhum quiz criado ainda'
                      }
                    </h3>
                    <p class="mb-4">
                      {searchTerm() || filterActive() !== 'all'
                        ? 'Tente ajustar os filtros de busca'
                        : 'Comece criando seu primeiro quiz'
                      }
                    </p>
                    <Show when={!searchTerm() && filterActive() === 'all'}>
                      <A
                        href="/quiz/new"
                        class="btn-primary"
                      >
                        Criar Primeiro Quiz
                      </A>
                    </Show>
                  </div>
                }
              >
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
              </Show>
            </div>
          }
        >
          <div class="divide-y divide-gray-200 dark:divide-gray-700">
            <For each={filteredQuizzes()}>
              {(quiz) => (
                <div class="p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <div class="flex items-center justify-between">
                    <div class="flex items-center space-x-4">
                      {/* Ícone do Quiz */}
                      <div class={clsx(
                        'w-16 h-16 rounded-lg flex items-center justify-center',
                        quiz.isActive 
                          ? 'bg-success-100 dark:bg-success-900/20' 
                          : 'bg-gray-100 dark:bg-gray-700'
                      )}>
                        <QuizIcon class={clsx(
                          'w-8 h-8',
                          quiz.isActive 
                            ? 'text-success-600 dark:text-success-400' 
                            : 'text-gray-500 dark:text-gray-400'
                        )} />
                      </div>

                      {/* Informações do Quiz */}
                      <div class="flex-1">
                        <div class="flex items-center space-x-3">
                          <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
                            {quiz.title}
                          </h3>
                          <span class={clsx(
                            'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                            quiz.isActive
                              ? 'bg-success-100 dark:bg-success-900/20 text-success-800 dark:text-success-200'
                              : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                          )}>
                            {quiz.isActive ? 'Ativo' : 'Inativo'}
                          </span>
                        </div>
                        
                        <p class="text-gray-600 dark:text-gray-400 mt-1">
                          {quiz.description || 'Sem descrição'}
                        </p>
                        
                        <div class="flex items-center space-x-4 mt-2 text-sm text-gray-500 dark:text-gray-400">
                          <span class="flex items-center">
                            <QuestionIcon class="w-4 h-4 mr-1" />
                            {quiz.questions.length} pergunta{quiz.questions.length !== 1 ? 's' : ''}
                          </span>
                          <span class="flex items-center">
                            <CalendarIcon class="w-4 h-4 mr-1" />
                            {new Date(quiz.createdAt).toLocaleDateString('pt-BR')}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Ações */}
                    <div class="flex items-center space-x-2">
                      {/* Toggle Ativo/Inativo */}
                      <button
                        onClick={() => handleToggleActive(quiz)}
                        class={clsx(
                          'p-2 rounded-md transition-colors',
                          quiz.isActive
                            ? 'text-success-600 dark:text-success-400 hover:bg-success-100 dark:hover:bg-success-900/20'
                            : 'text-gray-400 hover:text-success-600 dark:hover:text-success-400 hover:bg-success-100 dark:hover:bg-success-900/20'
                        )}
                        title={quiz.isActive ? 'Desativar quiz' : 'Ativar quiz'}
                      >
                        {quiz.isActive ? <EyeIcon class="w-5 h-5" /> : <EyeOffIcon class="w-5 h-5" />}
                      </button>

                      {/* Editar */}
                      <A
                        href={`/quiz/${quiz.id}/edit`}
                        class="text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 p-2 rounded-md transition-colors"
                        title="Editar quiz"
                      >
                        <EditIcon class="w-5 h-5" />
                      </A>

                      {/* Iniciar Sessão */}
                      <Show when={quiz.isActive}>
                        <button
                          class="text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 p-2 rounded-md transition-colors"
                          title="Iniciar sessão"
                        >
                          <PlayIcon class="w-5 h-5" />
                        </button>
                      </Show>

                      {/* Deletar */}
                      <button
                        onClick={() => setShowDeleteModal(quiz.id)}
                        class="text-gray-600 dark:text-gray-400 hover:text-danger-600 dark:hover:text-danger-400 p-2 rounded-md transition-colors"
                        title="Deletar quiz"
                      >
                        <TrashIcon class="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </For>
          </div>
        </Show>
      </div>

      {/* Modal de Confirmação de Exclusão */}
      <Show when={showDeleteModal()}>
        <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div class="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Confirmar Exclusão
            </h3>
            <p class="text-gray-600 dark:text-gray-400 mb-6">
              Tem certeza que deseja excluir este quiz? Esta ação não pode ser desfeita.
            </p>
            <div class="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteModal(null)}
                class="btn-outline"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleDeleteQuiz(showDeleteModal()!)}
                class="btn-danger"
              >
                Excluir
              </button>
            </div>
          </div>
        </div>
      </Show>
    </div>
  );
};

// Ícones SVG
const PlusIcon: Component<{ class?: string }> = (props) => (
  <svg class={props.class} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width={2} d="M12 4v16m8-8H4" />
  </svg>
);

const SearchIcon: Component<{ class?: string }> = (props) => (
  <svg class={props.class} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

const ExclamationIcon: Component<{ class?: string }> = (props) => (
  <svg class={props.class} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
  </svg>
);

const QuizIcon: Component<{ class?: string }> = (props) => (
  <svg class={props.class} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);

const QuestionIcon: Component<{ class?: string }> = (props) => (
  <svg class={props.class} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const CalendarIcon: Component<{ class?: string }> = (props) => (
  <svg class={props.class} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

const EyeIcon: Component<{ class?: string }> = (props) => (
  <svg class={props.class} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
  </svg>
);

const EyeOffIcon: Component<{ class?: string }> = (props) => (
  <svg class={props.class} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
  </svg>
);

const EditIcon: Component<{ class?: string }> = (props) => (
  <svg class={props.class} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
  </svg>
);

const PlayIcon: Component<{ class?: string }> = (props) => (
  <svg class={props.class} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1.586a1 1 0 01.707.293L12 11l.707-.707A1 1 0 0113.414 10H15M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const TrashIcon: Component<{ class?: string }> = (props) => (
  <svg class={props.class} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);