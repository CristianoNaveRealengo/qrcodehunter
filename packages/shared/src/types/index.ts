// Tipos compartilhados entre todos os pacotes
export interface Question {
  id: string;
  title: string;
  options: QuestionOption[];
  correctAnswer: number;
  timeLimit: number;
  points: number;
  backgroundColor?: string;
  shape?: 'circle' | 'square' | 'triangle' | 'diamond';
}

export interface QuestionOption {
  id: string;
  text: string;
  color: string;
  shape: 'circle' | 'square' | 'triangle' | 'diamond';
}

export interface Quiz {
  id: string;
  title: string;
  description: string;
  questions: Question[];
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
}

export interface GameSession {
  id: string;
  pin: string;
  quizId: string;
  hostId: string;
  status: 'waiting' | 'active' | 'finished';
  currentQuestionIndex: number;
  players: Player[];
  createdAt: Date;
}

export interface Player {
  id: string;
  name: string;
  sessionId: string;
  score: number;
  answers: PlayerAnswer[];
  isConnected: boolean;
}

export interface PlayerAnswer {
  questionId: string;
  selectedOption: number;
  timeToAnswer: number;
  isCorrect: boolean;
  points: number;
}

// WebSocket Events
export interface SocketEvents {
  // Admin events
  'admin:create-session': { quizId: string };
  'admin:start-session': { sessionId: string };
  'admin:next-question': { sessionId: string };
  'admin:end-session': { sessionId: string };
  
  // Player events
  'player:join': { pin: string; playerName: string };
  'player:answer': { sessionId: string; questionId: string; answer: number };
  
  // Broadcast events
  'session:created': { session: GameSession };
  'player:joined': { player: Player };
  'question:started': { question: Question; timeLimit: number };
  'question:ended': { results: QuestionResults };
  'game:ended': { finalResults: GameResults };
}

export interface QuestionResults {
  questionId: string;
  correctAnswer: number;
  playerAnswers: { playerId: string; answer: number; isCorrect: boolean }[];
  leaderboard: { playerId: string; playerName: string; score: number }[];
}

export interface GameResults {
  sessionId: string;
  finalLeaderboard: { playerId: string; playerName: string; totalScore: number }[];
  totalQuestions: number;
}