import { Question } from '@qrcode-hunter/shared';
import { clsx } from 'clsx';
import { Component, For, Show } from 'solid-js';

interface QuestionCardProps {
  question: Question;
  index: number;
  onEdit?: () => void;
  onDelete?: () => void;
  readonly?: boolean;
}

/**
 * Componente de card de pergunta
 * Implementa design acessível com formas e cores
 */
export const QuestionCard: Component<QuestionCardProps> = (props) => {
  const getShapeClass = (shape: string) => {
    switch (shape) {
      case 'circle': return 'rounded-full';
      case 'square': return 'rounded-none';
      case 'triangle': return 'rounded-sm triangle-shape';
      case 'diamond': return 'rounded-sm diamond-shape';
      default: return 'rounded-lg';
    }
  };

  const getShapeIcon = (shape: string) => {
    switch (shape) {
      case 'circle': return '●';
      case 'square': return '■';
      case 'triangle': return '▲';
      case 'diamond': return '♦';
      default: return '●';
    }
  };

  return (
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      {/* Header da Pergunta */}
      <div class="flex justify-between items-start mb-4">
        <div class="flex-1">
          <div class="flex items-center space-x-3 mb-2">
            <span class="inline-flex items-center justify-center w-8 h-8 bg-primary-100 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 rounded-full text-sm font-semibold">
              {props.index + 1}
            </span>
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white" role="heading" aria-level="3">
              {props.question.title}
            </h3>
          </div>
          
          <div class="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
            <span class="flex items-center">
              <ClockIcon class="w-4 h-4 mr-1" />
              {props.question.timeLimit}s
            </span>
            <span class="flex items-center">
              <StarIcon class="w-4 h-4 mr-1" />
              {props.question.points} pts
            </span>
            <span class="flex items-center">
              <CheckIcon class="w-4 h-4 mr-1" />
              Resposta: {props.question.correctAnswer + 1}
            </span>
          </div>
        </div>

        {/* Ações */}
        <Show when={!props.readonly}>
          <div class="flex space-x-2">
            <Show when={props.onEdit}>
              <button
                onClick={props.onEdit}
                class="text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 p-2 rounded-md transition-colors"
                title="Editar pergunta"
              >
                <EditIcon class="w-4 h-4" />
              </button>
            </Show>
            <Show when={props.onDelete}>
              <button
                onClick={props.onDelete}
                class="text-gray-600 dark:text-gray-400 hover:text-danger-600 dark:hover:text-danger-400 p-2 rounded-md transition-colors"
                title="Remover pergunta"
              >
                <TrashIcon class="w-4 h-4" />
              </button>
            </Show>
          </div>
        </Show>
      </div>

      {/* Opções de Resposta */}
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <For each={props.question.options}>
          {(option, index) => (
            <div class={clsx(
              'relative p-4 rounded-lg border-2 transition-all',
              index() === props.question.correctAnswer
                ? 'border-success-300 dark:border-success-600 bg-success-50 dark:bg-success-900/20'
                : 'border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50'
            )}>
              {/* Indicador de Resposta Correta */}
              <Show when={index() === props.question.correctAnswer}>
                <div class="absolute -top-2 -right-2 w-6 h-6 bg-success-500 rounded-full flex items-center justify-center">
                  <CheckIcon class="w-4 h-4 text-white" />
                </div>
              </Show>

              <div class="flex items-center space-x-3">
                {/* Forma Geométrica */}
                <div class={clsx(
                  'w-8 h-8 flex items-center justify-center text-white font-bold text-sm',
                  getShapeClass(option.shape)
                )} style={{ 'background-color': option.color }}>
                  <span class="drop-shadow-sm">
                    {getShapeIcon(option.shape)}
                  </span>
                </div>

                {/* Texto da Opção */}
                <span class="flex-1 text-gray-900 dark:text-white font-medium">
                  {option.text}
                </span>

                {/* Letra da Opção */}
                <span class="text-xs font-semibold text-gray-500 dark:text-gray-400 bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded">
                  {String.fromCharCode(65 + index())}
                </span>
              </div>
            </div>
          )}
        </For>
      </div>

      {/* Background da Pergunta (se configurado) */}
      <Show when={props.question.backgroundColor}>
        <div class="mt-4 p-3 rounded-lg border border-gray-200 dark:border-gray-600">
          <div class="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
            <PaletteIcon class="w-4 h-4" />
            <span>Cor de fundo:</span>
            <div 
              class="w-6 h-6 rounded border border-gray-300 dark:border-gray-600"
              style={{ 'background-color': props.question.backgroundColor }}
            />
            <code class="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
              {props.question.backgroundColor}
            </code>
          </div>
        </div>
      </Show>
    </div>
  );
};

// Ícones SVG
const ClockIcon: Component<{ class?: string }> = (props) => (
  <svg class={props.class} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const StarIcon: Component<{ class?: string }> = (props) => (
  <svg class={props.class} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
  </svg>
);

const CheckIcon: Component<{ class?: string }> = (props) => (
  <svg class={props.class} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width={2} d="M5 13l4 4L19 7" />
  </svg>
);

const EditIcon: Component<{ class?: string }> = (props) => (
  <svg class={props.class} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
  </svg>
);

const TrashIcon: Component<{ class?: string }> = (props) => (
  <svg class={props.class} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);

const PaletteIcon: Component<{ class?: string }> = (props) => (
  <svg class={props.class} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z" />
  </svg>
);