import { A } from '@solidjs/router';
import { clsx } from 'clsx';
import { Component, createSignal, For, onMount, Show } from 'solid-js';
import { useQuiz } from '../context/QuizContext';
import { useSocket } from '../context/SocketContext';

/**
 * Dashboard principal do Admin
 * Mostra estatísticas e ações rápidas
 */
export const Dashboard: Component = () => {
  const { quizzes, loadQuizzes, loading } = useQuiz();
  const { isConnected } = useSocket();
  const [stats, setStats] = createSignal({
    totalQuizzes: 0,
    activeQuizzes: 0,
    totalQuestions: 0,
    activeSessions: 0
  });

  onMount(async () => {
    await loadQuizzes();
    updateStats();
  });

  const updateStats = () => {
    const quizList = quizzes();
    const totalQuestions = quizList.reduce((sum, quiz) => sum + quiz.questions.length, 0);
    const activeQuizzes = quizList.filter(quiz => quiz.isActive).length;

    setStats({
      totalQuizzes: quizList.length,
      activeQuizzes,
      totalQuestions,
      activeSessions: 0 // TODO: Implementar contagem de sessões ativas
    });
  };

  return (
    <div class="space-y-8">
      {/* Header */}
      <div class="flex justify-between items-center">
        <div>
          <h1 class="text-3xl font-bold text-gray-900 dark:text-white">
            Dashboard
          </h1>
          <p class="text-gray-600 dark:text-gray-400 mt-1">
            Gerencie seus quizzes e sessões de jogo
          </p>
        </div>

        <div class="flex space-x-3">
          <A
            href="/quiz/new"
            class="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
          >
            <PlusIcon class="w-5 h-5" />
            <span>Novo Quiz</span>
          </A>
        </div>
      </div>

      {/* Status de Conexão */}
      <Show when={!isConnected()}>
        <div class="bg-warning-50 dark:bg-warning-900/20 border border-warning-200 dark:border-warning-800 rounded-lg p-4">
          <div class="flex items-center">
            <ExclamationIcon class="w-5 h-5 text-warning-600 dark:text-warning-400 mr-2" />
            <span class="text-warning-800 dark:text-warning-200">
              Conexão com servidor perdida. Algumas funcionalidades podem não funcionar.
            </span>
          </div>
        </div>
      </Show>

      {/* Cards de Estatísticas */}
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total de Quizzes"
          value={stats().totalQuizzes}
          icon={<QuizIcon class="w-8 h-8" />}
          color="blue"
          loading={loading()}
        />
        <StatCard
          title="Quizzes Ativos"
          value={stats().activeQuizzes}
          icon={<ActiveIcon class="w-8 h-8" />}
          color="green"
          loading={loading()}
        />
        <StatCard
          title="Total de Perguntas"
          value={stats().totalQuestions}
          icon={<QuestionIcon class="w-8 h-8" />}
          color="purple"
          loading={loading()}
        />
        <StatCard
          title="Sessões Ativas"
          value={stats().activeSessions}
          icon={<SessionIcon class="w-8 h-8" />}
          color="orange"
          loading={loading()}
        />
      </div>

      {/* Quizzes Recentes */}
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div class="flex justify-between items-center">
            <h2 class="text-lg font-semibold text-gray-900 dark:text-white">
              Quizzes Recentes
            </h2>
            <A
              href="/quizzes"
              class="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 text-sm font-medium"
            >
              Ver todos
            </A>
          </div>
        </div>

        <div class="p-6">
          <Show
            when={!loading() && quizzes().length > 0}
            fallback={
              <div class="text-center py-8">
                <Show
                  when={loading()}
                  fallback={
                    <div class="text-gray-500 dark:text-gray-400">
                      <QuizIcon class="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>Nenhum quiz encontrado</p>
                      <A
                        href="/quiz/new"
                        class="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium mt-2 inline-block"
                      >
                        Criar primeiro quiz
                      </A>
                    </div>
                  }
                >
                  <div class="animate-pulse space-y-4">
                    <For each={[1, 2, 3]}>
                      {() => (
                        <div class="flex items-center space-x-4">
                          <div class="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-lg" />
                          <div class="flex-1 space-y-2">
                            <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
                            <div class="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
                          </div>
                        </div>
                      )}
                    </For>
                  </div>
                </Show>
              </div>
            }
          >
            <div class="space-y-4">
              <For each={quizzes().slice(0, 5)}>
                {(quiz) => (
                  <div class="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <div class="flex items-center space-x-4">
                      <div class={clsx(
                        'w-12 h-12 rounded-lg flex items-center justify-center',
                        quiz.isActive 
                          ? 'bg-success-100 dark:bg-success-900/20' 
                          : 'bg-gray-100 dark:bg-gray-700'
                      )}>
                        <QuizIcon class={clsx(
                          'w-6 h-6',
                          quiz.isActive 
                            ? 'text-success-600 dark:text-success-400' 
                            : 'text-gray-500 dark:text-gray-400'
                        )} />
                      </div>
                      <div>
                        <h3 class="font-medium text-gray-900 dark:text-white">
                          {quiz.title}
                        </h3>
                        <p class="text-sm text-gray-600 dark:text-gray-400">
                          {quiz.questions.length} pergunta{quiz.questions.length !== 1 ? 's' : ''}
                          {quiz.isActive && (
                            <span class="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-success-100 dark:bg-success-900/20 text-success-800 dark:text-success-200">
                              Ativo
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                    <div class="flex items-center space-x-2">
                      <A
                        href={`/quiz/${quiz.id}/edit`}
                        class="text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 p-2 rounded-md transition-colors"
                        title="Editar quiz"
                      >
                        <EditIcon class="w-4 h-4" />
                      </A>
                      <button
                        class="text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 p-2 rounded-md transition-colors"
                        title="Iniciar sessão"
                      >
                        <PlayIcon class="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </For>
            </div>
          </Show>
        </div>
      </div>
    </div>
  );
};

// Componente de Card de Estatística
interface StatCardProps {
  title: string;
  value: number;
  icon: any;
  color: 'blue' | 'green' | 'purple' | 'orange';
  loading: boolean;
}

const StatCard: Component<StatCardProps> = (props) => {
  const colorClasses = {
    blue: 'text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/20',
    green: 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/20',
    purple: 'text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-900/20',
    orange: 'text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-900/20'
  };

  return (
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div class="flex items-center">
        <div class={clsx('p-3 rounded-lg', colorClasses[props.color])}>
          {props.icon}
        </div>
        <div class="ml-4">
          <p class="text-sm font-medium text-gray-600 dark:text-gray-400">
            {props.title}
          </p>
          <Show
            when={!props.loading}
            fallback={
              <div class="h-8 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mt-1" />
            }
          >
            <p class="text-2xl font-bold text-gray-900 dark:text-white">
              {props.value.toLocaleString()}
            </p>
          </Show>
        </div>
      </div>
    </div>
  );
};

// Ícones SVG
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
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);

const ActiveIcon: Component<{ class?: string }> = (props) => (
  <svg class={props.class} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
  </svg>
);

const QuestionIcon: Component<{ class?: string }> = (props) => (
  <svg class={props.class} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const SessionIcon: Component<{ class?: string }> = (props) => (
  <svg class={props.class} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
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