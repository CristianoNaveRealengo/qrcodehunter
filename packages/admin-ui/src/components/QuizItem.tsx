import { A } from '@solidjs/router';
import { clsx } from 'clsx';
import { Component, Show } from 'solid-js';

/**
 * Componente para exibir um item de quiz na lista
 * Implementa Single Responsibility Principle - apenas renderização de um quiz
 */
interface QuizItemProps {
  quiz: any; // TODO: Tipar adequadamente com interface Quiz
  onToggleActive: (quiz: any) => void;
  onDelete: (quizId: string) => void;
  loading?: boolean;
}

export const QuizItem: Component<QuizItemProps> = (props) => {
  return (
    <div class="p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-4">
          {/* Ícone do Quiz com Status Visual */}
          <QuizStatusIcon isActive={props.quiz.isActive} />

          {/* Informações Principais do Quiz */}
          <QuizInfo quiz={props.quiz} />
        </div>

        {/* Ações do Quiz */}
        <QuizActions
          quiz={props.quiz}
          onToggleActive={props.onToggleActive}
          onDelete={props.onDelete}
          loading={props.loading}
        />
      </div>
    </div>
  );
};

/**
 * Componente para exibir o ícone com status do quiz
 */
const QuizStatusIcon: Component<{ isActive: boolean }> = (props) => (
  <div class={clsx(
    'w-16 h-16 rounded-lg flex items-center justify-center',
    props.isActive 
      ? 'bg-success-100 dark:bg-success-900/20' 
      : 'bg-gray-100 dark:bg-gray-700'
  )}>
    <QuizIcon class={clsx(
      'w-8 h-8',
      props.isActive 
        ? 'text-success-600 dark:text-success-400' 
        : 'text-gray-500 dark:text-gray-400'
    )} />
  </div>
);

/**
 * Componente para exibir informações do quiz
 */
const QuizInfo: Component<{ quiz: any }> = (props) => (
  <div class="flex-1">
    <div class="flex items-center space-x-3">
      <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
        {props.quiz.title}
      </h3>
      <StatusBadge isActive={props.quiz.isActive} />
    </div>
    
    <p class="text-gray-600 dark:text-gray-400 mt-1">
      {props.quiz.description || 'Sem descrição'}
    </p>
    
    <QuizMetadata quiz={props.quiz} />
  </div>
);

/**
 * Badge de status do quiz
 */
const StatusBadge: Component<{ isActive: boolean }> = (props) => (
  <span class={clsx(
    'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
    props.isActive
      ? 'bg-success-100 dark:bg-success-900/20 text-success-800 dark:text-success-200'
      : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
  )}>
    {props.isActive ? 'Ativo' : 'Inativo'}
  </span>
);

/**
 * Metadados do quiz (perguntas, data de criação)
 */
const QuizMetadata: Component<{ quiz: any }> = (props) => (
  <div class="flex items-center space-x-4 mt-2 text-sm text-gray-500 dark:text-gray-400">
    <span class="flex items-center">
      <QuestionIcon class="w-4 h-4 mr-1" />
      {props.quiz.questions.length} pergunta{props.quiz.questions.length !== 1 ? 's' : ''}
    </span>
    <span class="flex items-center">
      <CalendarIcon class="w-4 h-4 mr-1" />
      {new Date(props.quiz.createdAt).toLocaleDateString('pt-BR')}
    </span>
  </div>
);

/**
 * Componente de ações do quiz
 */
const QuizActions: Component<{
  quiz: any;
  onToggleActive: (quiz: any) => void;
  onDelete: (quizId: string) => void;
  loading?: boolean;
}> = (props) => (
  <div class="flex items-center space-x-2">
    {/* Toggle Ativo/Inativo */}
    <ActionButton
      onClick={() => props.onToggleActive(props.quiz)}
      variant={props.quiz.isActive ? 'success' : 'gray'}
      title={props.quiz.isActive ? 'Desativar quiz' : 'Ativar quiz'}
      disabled={props.loading}
    >
      {props.quiz.isActive ? <EyeIcon class="w-5 h-5" /> : <EyeOffIcon class="w-5 h-5" />}
    </ActionButton>

    {/* Editar */}
    <A
      href={`/quiz/${props.quiz.id}/edit`}
      class="text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 p-2 rounded-md transition-colors"
      title="Editar quiz"
    >
      <EditIcon class="w-5 h-5" />
    </A>

    {/* Iniciar Sessão (apenas se ativo) */}
    <Show when={props.quiz.isActive}>
      <ActionButton
        onClick={() => {/* TODO: Implementar iniciar sessão */}}
        variant="primary"
        title="Iniciar sessão"
        disabled={props.loading}
      >
        <PlayIcon class="w-5 h-5" />
      </ActionButton>
    </Show>

    {/* Deletar */}
    <ActionButton
      onClick={() => props.onDelete(props.quiz.id)}
      variant="danger"
      title="Deletar quiz"
      disabled={props.loading}
    >
      <TrashIcon class="w-5 h-5" />
    </ActionButton>
  </div>
);

/**
 * Botão de ação reutilizável
 */
const ActionButton: Component<{
  onClick: () => void;
  variant: 'success' | 'gray' | 'primary' | 'danger';
  title: string;
  disabled?: boolean;
  children: any;
}> = (props) => {
  const getVariantClasses = () => {
    const baseClasses = 'p-2 rounded-md transition-colors';
    
    switch (props.variant) {
      case 'success':
        return `${baseClasses} text-success-600 dark:text-success-400 hover:bg-success-100 dark:hover:bg-success-900/20`;
      case 'primary':
        return `${baseClasses} text-primary-600 dark:text-primary-400 hover:bg-primary-100 dark:hover:bg-primary-900/20`;
      case 'danger':
        return `${baseClasses} text-danger-600 dark:text-danger-400 hover:bg-danger-100 dark:hover:bg-danger-900/20`;
      case 'gray':
      default:
        return `${baseClasses} text-gray-400 hover:text-success-600 dark:hover:text-success-400 hover:bg-success-100 dark:hover:bg-success-900/20`;
    }
  };

  return (
    <button
      onClick={props.onClick}
      class={clsx(getVariantClasses(), props.disabled && 'opacity-50 cursor-not-allowed')}
      title={props.title}
      disabled={props.disabled}
    >
      {props.children}
    </button>
  );
};

// Ícones (reutilizados do arquivo original)
const QuizIcon: Component<{ class?: string }> = (props) => (
  <svg class={props.class} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
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