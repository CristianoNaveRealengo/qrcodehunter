import { GameSession, QRCode, Team } from '@/types';

export const generateUniqueId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

export const generateQRCodeData = (): { code: string; points: number } => {
  const id = generateUniqueId();
  const points = Math.floor(Math.random() * (5000 - 100 + 1)) + 100;
  return {
    code: `GINCANA_${id}`,
    points
  };
};

export const createNewTeam = (name: string, participants: string[]): Team => {
  return {
    id: generateUniqueId(),
    name: name.trim(),
    participants: participants.map(p => p.trim()),
    score: 0,
    scannedCodes: [],
    createdAt: new Date()
  };
};

export const createNewQRCode = (): QRCode => {
  const { code, points } = generateQRCodeData();
  return {
    id: generateUniqueId(),
    code,
    points,
    isActive: true,
    scannedBy: [],
    createdAt: new Date()
  };
};

export const createNewGameSession = (duration: number): GameSession => {
  return {
    id: generateUniqueId(),
    isActive: false,
    duration,
    startTime: null,
    endTime: null,
    teams: [],
    qrCodes: []
  };
};

export const sortTeamsByScore = (teams: Team[]): Team[] => {
  return [...teams].sort((a, b) => b.score - a.score);
};

export const formatTime = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
};

export const getTeamRanking = (teams: Team[], teamId: string): number => {
  const sortedTeams = sortTeamsByScore(teams);
  return sortedTeams.findIndex(team => team.id === teamId) + 1;
};

export const isGameTimeUp = (startTime: Date | null, duration: number): boolean => {
  if (!startTime) return false;
  const now = new Date();
  const elapsedMinutes = (now.getTime() - startTime.getTime()) / (1000 * 60);
  return elapsedMinutes >= duration;
};

export const getRemainingTime = (startTime: Date | null, duration: number): number => {
  if (!startTime) return duration * 60;
  const now = new Date();
  const elapsedSeconds = (now.getTime() - startTime.getTime()) / 1000;
  const totalSeconds = duration * 60;
  return Math.max(0, totalSeconds - elapsedSeconds);
};