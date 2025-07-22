export interface Team {
  id: string;
  name: string;
  participants: string[];
  score: number;
  scannedCodes: string[];
  createdAt: Date;
}

export interface QRCode {
  id: string;
  code: string;
  points: number;
  isActive: boolean;
  scannedBy: string[]; // team IDs
  createdAt: Date;
}

export interface GameSession {
  id: string;
  isActive: boolean;
  duration: number; // em minutos
  startTime: Date | null;
  endTime: Date | null;
  teams: Team[];
  qrCodes: QRCode[];
}

export interface GameState {
  currentSession: GameSession | null;
  currentTeam: Team | null;
  isAdmin: boolean;
  timer: {
    timeLeft: number;
    isRunning: boolean;
  };
}

export type RootStackParamList = {
  Welcome: undefined;
  TeamRegistration: undefined;
  MainGame: undefined;
  GameResults: undefined;
  AdminLogin: undefined;
  QRGeneration: undefined;
  GameControl: undefined;
};

export type MainTabParamList = {
  QRScanner: undefined;
  Scoreboard: undefined;
  Timer: undefined;
};