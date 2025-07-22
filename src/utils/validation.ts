import { Team } from '../types';

export const validateTeamName = (name: string, existingTeams: Team[]): string | null => {
  if (!name || name.trim().length < 3) {
    return 'Nome da equipe deve ter pelo menos 3 caracteres';
  }
  
  if (existingTeams.some(team => team.name.toLowerCase() === name.toLowerCase())) {
    return 'Já existe uma equipe com este nome';
  }
  
  return null;
};

export const validateParticipants = (participants: string[]): string | null => {
  const validParticipants = participants.filter(p => p.trim().length > 0);
  
  if (validParticipants.length === 0) {
    return 'Adicione pelo menos 1 participante';
  }
  
  if (validParticipants.length > 10) {
    return 'Máximo de 10 participantes por equipe';
  }
  
  return null;
};

export const validateQRCode = (code: string): boolean => {
  return !!(code && code.length > 0);
};

export const validateGameDuration = (duration: number): string | null => {
  if (duration < 5) {
    return 'Duração mínima é de 5 minutos';
  }
  
  if (duration > 120) {
    return 'Duração máxima é de 120 minutos';
  }
  
  return null;
};

export const generateRandomPoints = (): number => {
  return Math.floor(Math.random() * (5000 - 100 + 1)) + 100;
};

export const generateUniqueId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

export const formatTime = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
};