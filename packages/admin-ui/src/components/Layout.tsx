import { A } from '@solidjs/router';
import { clsx } from 'clsx';
import { Component, ParentComponent } from 'solid-js';
import { useSocket } from '../context/SocketContext';
import { useTheme } from '../context/ThemeContext';

/**
 * Layout principal da aplicação
 * Implementa navegação e indicadores de status
 */
export const Layout: ParentComponent = (props) => {
  const { theme, toggleTheme } = useTheme();
  const { isConnected } = useSocket();

  return (
    <div class="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      {/* Header */}
      <header class="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex justify-between items-center h-16">
            {/* Logo e Navegação */}
            <div class="flex items-center space-x-8">
              <div class="flex items-center">
                <div class="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
                  <span class="text-white font-bold text-lg">Q</span>
                </div>
                <span class="ml-2 text-xl font-bold text-gray-900 dark:text-white">
                  Quiz Admin
                </span>
              </div>

              <nav class="hidden md:flex space-x-6">
                <A 
                  href="/" 
                  class="text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                  activeClass="text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20"
                >
                  Dashboard
                </A>
                <A 
                  href="/quizzes" 
                  class="text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                  activeClass="text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20"
                >
                  Quizzes
                </A>
              </nav>
            </div>

            {/* Status e Controles */}
            <div class="flex items-center space-x-4">
              {/* Status de Conexão */}
              <div class="flex items-center space-x-2">
                <div class={clsx(
                  'w-2 h-2 rounded-full',
                  isConnected() ? 'bg-success-500' : 'bg-danger-500'
                )} />
                <span class="text-sm text-gray-600 dark:text-gray-300">
                  {isConnected() ? 'Conectado' : 'Desconectado'}
                </span>
              </div>

              {/* Toggle de Tema */}
              <button
                onClick={toggleTheme}
                class="p-2 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                aria-label="Alternar tema"
              >
                {theme() === 'light' ? (
                  <MoonIcon class="w-5 h-5" />
                ) : (
                  <SunIcon class="w-5 h-5" />
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Conteúdo Principal */}
      <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {props.children}
      </main>

      {/* Footer */}
      <footer class="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-auto">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div class="text-center text-sm text-gray-600 dark:text-gray-400">
            Quiz Online - Sistema de Quiz em Tempo Real inspirado no Kahoot
          </div>
        </div>
      </footer>
    </div>
  );
};

// Ícones SVG
const MoonIcon: Component<{ class?: string }> = (props) => (
  <svg class={props.class} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
  </svg>
);

const SunIcon: Component<{ class?: string }> = (props) => (
  <svg class={props.class} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
  </svg>
);