import { Team } from '../../types';
import {
    formatTime,
    generateRandomPoints,
    generateUniqueId,
    validateGameDuration,
    validateParticipants,
    validateQRCode,
    validateTeamName
} from '../validation';

describe('Validation Utils', () => {
  const mockTeams: Team[] = [
    {
      id: '1',
      name: 'Equipe Teste',
      participants: ['João'],
      score: 0,
      scannedCodes: [],
      createdAt: new Date()
    }
  ];

  describe('validateTeamName', () => {
    it('should return error for short names', () => {
      expect(validateTeamName('AB', mockTeams)).toBe('Nome da equipe deve ter pelo menos 3 caracteres');
    });

    it('should return error for duplicate names', () => {
      expect(validateTeamName('Equipe Teste', mockTeams)).toBe('Já existe uma equipe com este nome');
    });

    it('should return null for valid names', () => {
      expect(validateTeamName('Nova Equipe', mockTeams)).toBeNull();
    });
  });

  describe('validateParticipants', () => {
    it('should return error for empty participants', () => {
      expect(validateParticipants([])).toBe('Adicione pelo menos 1 participante');
    });

    it('should return error for too many participants', () => {
      const manyParticipants = Array(11).fill('Participante');
      expect(validateParticipants(manyParticipants)).toBe('Máximo de 10 participantes por equipe');
    });

    it('should return null for valid participants', () => {
      expect(validateParticipants(['João', 'Maria'])).toBeNull();
    });
  });

  describe('validateQRCode', () => {
    it('should return false for empty code', () => {
      expect(validateQRCode('')).toBe(false);
    });

    it('should return true for valid code', () => {
      expect(validateQRCode('valid-code')).toBe(true);
    });
  });

  describe('validateGameDuration', () => {
    it('should return error for duration too short', () => {
      expect(validateGameDuration(3)).toBe('Duração mínima é de 5 minutos');
    });

    it('should return error for duration too long', () => {
      expect(validateGameDuration(150)).toBe('Duração máxima é de 120 minutos');
    });

    it('should return null for valid duration', () => {
      expect(validateGameDuration(30)).toBeNull();
    });
  });

  describe('generateRandomPoints', () => {
    it('should generate points between 100 and 5000', () => {
      const points = generateRandomPoints();
      expect(points).toBeGreaterThanOrEqual(100);
      expect(points).toBeLessThanOrEqual(5000);
    });
  });

  describe('generateUniqueId', () => {
    it('should generate unique IDs', () => {
      const id1 = generateUniqueId();
      const id2 = generateUniqueId();
      expect(id1).not.toBe(id2);
    });
  });

  describe('formatTime', () => {
    it('should format time correctly', () => {
      expect(formatTime(65)).toBe('01:05');
      expect(formatTime(3661)).toBe('61:01');
      expect(formatTime(0)).toBe('00:00');
    });
  });
});