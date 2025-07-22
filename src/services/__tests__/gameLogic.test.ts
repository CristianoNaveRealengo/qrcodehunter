import { GameSession, QRCode, Team } from '../../types';
import { GameLogicService } from '../gameLogic';

describe('GameLogicService', () => {
  let mockTeam: Team;
  let mockQRCode: QRCode;
  let mockGameSession: GameSession;

  beforeEach(() => {
    mockTeam = {
      id: 'team1',
      name: 'Test Team',
      participants: ['Player 1'],
      score: 0,
      scannedCodes: [],
      createdAt: new Date('2023-01-01'),
    };

    mockQRCode = {
      id: 'qr1',
      code: 'GINCANA_test123',
      points: 500,
      isActive: true,
      scannedBy: [],
      createdAt: new Date(),
    };

    mockGameSession = {
      id: 'session1',
      isActive: true,
      duration: 30,
      startTime: new Date(),
      endTime: null,
      teams: [mockTeam],
      qrCodes: [mockQRCode],
    };
  });

  describe('canTeamScanQRCode', () => {
    it('should allow scanning when conditions are met', () => {
      const result = GameLogicService.canTeamScanQRCode(mockTeam, mockQRCode, mockGameSession);
      expect(result.canScan).toBe(true);
    });

    it('should prevent scanning when game is not active', () => {
      const inactiveSession = { ...mockGameSession, isActive: false };
      const result = GameLogicService.canTeamScanQRCode(mockTeam, mockQRCode, inactiveSession);
      expect(result.canScan).toBe(false);
      expect(result.reason).toBe('O jogo não está ativo');
    });

    it('should prevent scanning when QR code is not active', () => {
      const inactiveQR = { ...mockQRCode, isActive: false };
      const result = GameLogicService.canTeamScanQRCode(mockTeam, inactiveQR, mockGameSession);
      expect(result.canScan).toBe(false);
      expect(result.reason).toBe('Este código QR não está ativo');
    });

    it('should prevent duplicate scanning', () => {
      const scannedQR = { ...mockQRCode, scannedBy: [mockTeam.id] };
      const result = GameLogicService.canTeamScanQRCode(mockTeam, scannedQR, mockGameSession);
      expect(result.canScan).toBe(false);
      expect(result.reason).toBe('Sua equipe já escaneou este código');
    });
  });

  describe('processScan', () => {
    it('should update team score and QR code scanned list', () => {
      const result = GameLogicService.processScan(mockTeam, mockQRCode);
      
      expect(result.pointsEarned).toBe(500);
      expect(result.updatedTeam.score).toBe(500);
      expect(result.updatedTeam.scannedCodes).toContain(mockQRCode.id);
      expect(result.updatedQRCode.scannedBy).toContain(mockTeam.id);
    });
  });

  describe('calculateRanking', () => {
    it('should sort teams by score descending', () => {
      const team1 = { ...mockTeam, id: 'team1', score: 300 };
      const team2 = { ...mockTeam, id: 'team2', score: 500 };
      const team3 = { ...mockTeam, id: 'team3', score: 200 };

      const ranking = GameLogicService.calculateRanking([team1, team2, team3]);

      expect(ranking[0].id).toBe('team2'); // 500 pontos
      expect(ranking[1].id).toBe('team1'); // 300 pontos
      expect(ranking[2].id).toBe('team3'); // 200 pontos
    });

    it('should handle tied scores by creation time', () => {
      const team1 = { ...mockTeam, id: 'team1', score: 300, createdAt: new Date('2023-01-01') };
      const team2 = { ...mockTeam, id: 'team2', score: 300, createdAt: new Date('2023-01-02') };

      const ranking = GameLogicService.calculateRanking([team1, team2]);

      expect(ranking[0].id).toBe('team1'); // Cadastrado primeiro
    });
  });

  describe('shouldGameEnd', () => {
    it('should return true when time is up', () => {
      const startTime = new Date('2023-01-01T10:00:00');
      const currentTime = new Date('2023-01-01T10:31:00'); // 31 minutos depois
      const session = { ...mockGameSession, startTime };

      const result = GameLogicService.shouldGameEnd(session, currentTime);
      expect(result).toBe(true);
    });

    it('should return false when time is not up', () => {
      const startTime = new Date('2023-01-01T10:00:00');
      const currentTime = new Date('2023-01-01T10:15:00'); // 15 minutos depois
      const session = { ...mockGameSession, startTime };

      const result = GameLogicService.shouldGameEnd(session, currentTime);
      expect(result).toBe(false);
    });
  });

  describe('getTimeLeft', () => {
    it('should calculate remaining time correctly', () => {
      const startTime = new Date('2023-01-01T10:00:00');
      const currentTime = new Date('2023-01-01T10:15:00'); // 15 minutos depois
      const session = { ...mockGameSession, startTime, duration: 30 };

      const timeLeft = GameLogicService.getTimeLeft(session, currentTime);
      expect(timeLeft).toBe(900); // 15 minutos = 900 segundos restantes
    });

    it('should return 0 when time is up', () => {
      const startTime = new Date('2023-01-01T10:00:00');
      const currentTime = new Date('2023-01-01T10:35:00'); // 35 minutos depois
      const session = { ...mockGameSession, startTime, duration: 30 };

      const timeLeft = GameLogicService.getTimeLeft(session, currentTime);
      expect(timeLeft).toBe(0);
    });
  });

  describe('isValidGincanaQRCode', () => {
    it('should validate correct QR code format', () => {
      expect(GameLogicService.isValidGincanaQRCode('GINCANA_abc123')).toBe(true);
      expect(GameLogicService.isValidGincanaQRCode('GINCANA_xyz789')).toBe(true);
    });

    it('should reject invalid QR code formats', () => {
      expect(GameLogicService.isValidGincanaQRCode('INVALID_abc123')).toBe(false);
      expect(GameLogicService.isValidGincanaQRCode('gincana_test')).toBe(false);
      expect(GameLogicService.isValidGincanaQRCode('GINCANA_')).toBe(false);
      expect(GameLogicService.isValidGincanaQRCode('')).toBe(false);
    });
  });

  describe('getScoreFeedback', () => {
    it('should return appropriate feedback for different scores', () => {
      const highScore = GameLogicService.getScoreFeedback(4500);
      expect(highScore.emoji).toBe('🏆');
      expect(highScore.message).toContain('Incrível');

      const lowScore = GameLogicService.getScoreFeedback(500);
      expect(lowScore.emoji).toBe('💪');
      expect(lowScore.message).toContain('Continue');
    });
  });
});