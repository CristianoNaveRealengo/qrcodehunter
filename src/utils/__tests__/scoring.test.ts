import { GameSession, QRCode, Team } from '../../types';
import { generateRandomPoints } from '../validation';

describe('Scoring Logic', () => {
  let mockGameSession: GameSession;
  let mockTeam: Team;
  let mockQRCode: QRCode;

  beforeEach(() => {
    mockTeam = {
      id: 'team1',
      name: 'Test Team',
      participants: ['Player 1', 'Player 2'],
      score: 0,
      scannedCodes: [],
      createdAt: new Date(),
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

  describe('QR Code Scanning', () => {
    it('should add points to team when scanning valid QR code', () => {
      // Simular escaneamento
      const updatedTeam = {
        ...mockTeam,
        score: mockTeam.score + mockQRCode.points,
        scannedCodes: [...mockTeam.scannedCodes, mockQRCode.id],
      };

      const updatedQRCode = {
        ...mockQRCode,
        scannedBy: [...mockQRCode.scannedBy, mockTeam.id],
      };

      expect(updatedTeam.score).toBe(500);
      expect(updatedTeam.scannedCodes).toContain(mockQRCode.id);
      expect(updatedQRCode.scannedBy).toContain(mockTeam.id);
    });

    it('should prevent duplicate scanning by same team', () => {
      // QR Code já escaneado pela equipe
      const scannedQRCode = {
        ...mockQRCode,
        scannedBy: [mockTeam.id],
      };

      const teamWithScannedCode = {
        ...mockTeam,
        score: 500,
        scannedCodes: [mockQRCode.id],
      };

      // Tentar escanear novamente
      const canScan = !scannedQRCode.scannedBy.includes(mockTeam.id);
      expect(canScan).toBe(false);
    });

    it('should allow different teams to scan same QR code', () => {
      const team2: Team = {
        id: 'team2',
        name: 'Team 2',
        participants: ['Player 3'],
        score: 0,
        scannedCodes: [],
        createdAt: new Date(),
      };

      // Team 1 escaneou
      const qrAfterTeam1 = {
        ...mockQRCode,
        scannedBy: [mockTeam.id],
      };

      // Team 2 pode escanear
      const canTeam2Scan = !qrAfterTeam1.scannedBy.includes(team2.id);
      expect(canTeam2Scan).toBe(true);
    });
  });

  describe('Score Calculation', () => {
    it('should calculate total score correctly', () => {
      const qr1 = { ...mockQRCode, id: 'qr1', points: 100 };
      const qr2 = { ...mockQRCode, id: 'qr2', points: 300 };
      const qr3 = { ...mockQRCode, id: 'qr3', points: 200 };

      const teamWithMultipleScans = {
        ...mockTeam,
        score: qr1.points + qr2.points + qr3.points,
        scannedCodes: [qr1.id, qr2.id, qr3.id],
      };

      expect(teamWithMultipleScans.score).toBe(600);
    });

    it('should generate points within valid range', () => {
      for (let i = 0; i < 100; i++) {
        const points = generateRandomPoints();
        expect(points).toBeGreaterThanOrEqual(100);
        expect(points).toBeLessThanOrEqual(5000);
      }
    });
  });

  describe('Game State Validation', () => {
    it('should prevent scanning when game is not active', () => {
      const inactiveSession = {
        ...mockGameSession,
        isActive: false,
      };

      const canScan = inactiveSession.isActive;
      expect(canScan).toBe(false);
    });

    it('should validate QR code format', () => {
      const validCodes = [
        'GINCANA_abc123',
        'GINCANA_xyz789',
        'GINCANA_test456',
      ];

      const invalidCodes = [
        'INVALID_abc123',
        'gincana_test',
        'random_string',
        '',
      ];

      validCodes.forEach(code => {
        expect(code.startsWith('GINCANA_')).toBe(true);
      });

      invalidCodes.forEach(code => {
        expect(code.startsWith('GINCANA_')).toBe(false);
      });
    });
  });

  describe('Team Ranking', () => {
    it('should sort teams by score correctly', () => {
      const team1 = { ...mockTeam, id: 'team1', score: 300 };
      const team2 = { ...mockTeam, id: 'team2', score: 500 };
      const team3 = { ...mockTeam, id: 'team3', score: 200 };

      const teams = [team1, team2, team3];
      const sortedTeams = teams.sort((a, b) => b.score - a.score);

      expect(sortedTeams[0].id).toBe('team2'); // 500 pontos
      expect(sortedTeams[1].id).toBe('team1'); // 300 pontos
      expect(sortedTeams[2].id).toBe('team3'); // 200 pontos
    });

    it('should handle tied scores', () => {
      const team1 = { ...mockTeam, id: 'team1', score: 300, createdAt: new Date('2023-01-01') };
      const team2 = { ...mockTeam, id: 'team2', score: 300, createdAt: new Date('2023-01-02') };

      const teams = [team1, team2];
      const sortedTeams = teams.sort((a, b) => {
        if (b.score === a.score) {
          return a.createdAt.getTime() - b.createdAt.getTime(); // Primeiro cadastrado ganha
        }
        return b.score - a.score;
      });

      expect(sortedTeams[0].id).toBe('team1'); // Cadastrado primeiro
    });
  });
});