import { Route, Router, Routes } from '@solidjs/router';
import { Component, onMount } from 'solid-js';
import { Layout } from './components/Layout';
import { GameProvider } from './context/GameContext';
import { QuizProvider } from './context/QuizContext';
import { SocketProvider } from './context/SocketContext';
import { ThemeProvider } from './context/ThemeContext';
import { Dashboard } from './pages/Dashboard';
import { GameResults } from './pages/GameResults';
import { GameSession } from './pages/GameSession';
import { QuizEditor } from './pages/QuizEditor';
import { QuizList } from './pages/QuizList';
import './styles/globals.css';

/**
 * Componente principal da aplicação Admin UI
 * Implementa roteamento e providers de contexto
 */
const App: Component = () => {
  onMount(() => {
    console.log('🎯 Admin UI inicializada');
  });

  return (
    <ThemeProvider>
      <SocketProvider>
        <QuizProvider>
          <GameProvider>
            <Router>
              <Layout>
                <Routes>
                  <Route path="/" component={Dashboard} />
                  <Route path="/quizzes" component={QuizList} />
                  <Route path="/quiz/new" component={QuizEditor} />
                  <Route path="/quiz/:id/edit" component={QuizEditor} />
                  <Route path="/session/:id" component={GameSession} />
                  <Route path="/results/:id" component={GameResults} />
                </Routes>
              </Layout>
            </Router>
          </GameProvider>
        </QuizProvider>
      </SocketProvider>
    </ThemeProvider>
  );
};

export default App;