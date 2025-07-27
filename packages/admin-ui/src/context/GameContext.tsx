import { GameResults, GameSession, Player, QuestionResults } from '@qrcode-hunter/shared';
import { createContext, createSignal, onMount, ParentComponent, useContext } from 'solid-js';
import { GameService } from '../services/GameService';
import { useSocket } from './SocketContext';

interface GameContextType {
  currentSession: () => GameSession | null;
  players: () => Player[];
  questionResults: () => QuestionResults | null;
  gameResults: () => GameResults | null;
  loading: () => boolean;
  error: () => string | null;
  
  // Actions
  createSession: (quizId: string) => Promise<GameSession>;
  startSession: (sessionId: string) => Promise<void>;
  nextQuestion: (sessionId: string) => Promise<void>;
  endSession: (sessionId: string) => Promise<void>;
  clearError: () => void;
}

const GameContext = createContext<GameContextType>();

/**
 * Provider de estado global para sessões de jogo
 * Integra WebSocket para atualizações em tempo real
 */
export const GameProvider: ParentComponent = (props) => {
  const [currentSession, setCurrentSession] = createSignal<GameSession | null>(null);
  const [players, setPlayers] = createSignal<Player[]>([]);
  const [questionResults, setQuestionResults] = createSignal<QuestionResults | null>(null);
  const [gameResults, setGameResults] = createSignal<GameResults | null>(null);
  const [loading, setLoading] = createSignal(false);
  const [error, setError] = createSignal<string | null>(null);

  const { emit, on, off } = useSocket();
  const gameService = new GameService();

  onMount(() => {
    // Configurar listeners de WebSocket
    setupSocketListeners();
  });

  const setupSocketListeners = () => {
    // Sessão criada
    on('session:created', (data) => {
      setCurrentSession(data.session);
      setPlayers(data.session.players);
    });

    // Jogador entrou
    on('player:joined', (data) => {
      const session = currentSession();
      if (session) {
        const updatedPlayers = [...session.players, data.player];
        setCurrentSession({ ...session, players: updatedPlayers });
        setPlayers(updatedPlayers);
      }
    });

    // Sessão iniciada
    on('session:started', (data) => {
      setCurrentSession(data.session);
    });

    // Pergunta iniciada
    on('question:started', (data) => {
      setQuestionResults(null); // Limpar resultados anteriores
    });

    // Resposta recebida
    on('answer:received', (data) => {
      // Atualizar indicador visual de que jogador respondeu
      console.log('Resposta recebida:', data);
    });

    // Pergunta finalizada
    on('question:ended', (data) => {
      setQuestionResults(data.results);
    });

    // Jogo finalizado
    on('game:ended', (data) => {
      setGameResults(data.finalResults);
      const session = currentSession();
      if (session) {
        setCurrentSession({ ...session, status: 'finished' });
      }
    });

    // Erro
    on('error', (data) => {
      setError(data.message);
    });
  };

  const createSession = async (quizId: string): Promise<GameSession> => {
    try {
      setLoading(true);
      setError(null);
      
      const hostId = 'admin-' + Date.now(); // Simplificado para demo
      const session = await gameService.createSession(quizId, hostId);
      
      // Emitir evento WebSocket para criar sessão
      emit('admin:create-session', { quizId });
      
      return session;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao criar sessão';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const startSession = async (sessionId: string): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      
      await gameService.startSession(sessionId);
      
      // Emitir evento WebSocket para iniciar sessão
      emit('admin:start-session', { sessionId });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao iniciar sessão';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const nextQuestion = async (sessionId: string): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      
      // Emitir evento WebSocket para próxima pergunta
      emit('admin:next-question', { sessionId });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao avançar pergunta';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const endSession = async (sessionId: string): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      
      await gameService.endSession(sessionId);
      
      // Emitir evento WebSocket para finalizar sessão
      emit('admin:end-session', { sessionId });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao finalizar sessão';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const clearError = () => {
    setError(null);
  };

  const contextValue: GameContextType = {
    currentSession,
    players,
    questionResults,
    gameResults,
    loading,
    error,
    createSession,
    startSession,
    nextQuestion,
    endSession,
    clearError
  };

  return (
    <GameContext.Provider value={contextValue}>
      {props.children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame deve ser usado dentro de GameProvider');
  }
  return context;
};