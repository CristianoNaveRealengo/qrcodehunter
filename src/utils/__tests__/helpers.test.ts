import {
  generateUniqueId,
  generateQRCodeData,
  createNewTeam,
  createNewQRCode,
  createNewGameSession,
  sortTeamsByScore,
  formatTime,
  getTeamRanking,
  isGameTimeUp,
  getRemainingTime
} from '../helpers';
import { Team } from '../../types';

describe('Helpers Utils', () => {
  describe('generateUniqueId', () => {
    it('deve gerar um ID único', () => {
      const id1 = generateUniqueId();
      const id2 = generateUniqueId();
      
      expect(id1).toBeDefined();
      expect(id2).toBeDefined();
      expect(id1).not.toBe(id2);
      expect(typeof id1).toBe('string');
      expect(id1.length).toBeGreaterThan(0);
    });
  });

  describe('generateQRCodeData', () => {
    it('deve gerar dados de QR code com código e pontos', () => {
      const data = generateQRCodeData();
      
      expect(data).toHaveProperty('code');
      expect(data).toHaveProperty('points');
      expect(data.code).toMatch(/^GINCANA_/);
      expect(data.points).toBeGreaterThanOrEqual(100);
      expect(data.points).toBeLessThanOrEqual(5000);
    });

    it('deve gerar códigos únicos', () => {
      const data1 = generateQRCodeData();
      const data2 = generateQRCodeData();
      
      expect(data1.code).not.toBe(data2.code);
    });
  });

  describe('createNewTeam', () => {
    it('deve criar uma nova equipe com dados válidos', () => {
      const team = createNewTeam('Equipe A', ['João', 'Maria']);
      
      expect(team).toHaveProperty('id');
      expect(team).toHaveProperty('name', 'Equipe A');
      expect(team).toHaveProperty('participants', ['João', 'Maria']);
      expect(team).toHaveProperty('score', 0);
      expect(team).toHaveProperty('scannedCodes', []);
      expect(team).toHaveProperty('createdAt');
      expect(team.createdAt).toBeInstanceOf(Date);
    });

    it('deve remover espaços em branco do nome e participantes', () => {
      const team = createNewTeam('  Equipe B  ', ['  João  ', '  Maria  ']);
      
      expect(team.name).toBe('Equipe B');
      expect(team.participants).toEqual(['João', 'Maria']);
    });
  });

  describe('createNewQRCode', () => {
    it('deve criar um novo QR code com dados válidos', () => {
      const qrCode = createNewQRCode();
      
      expect(qrCode).toHaveProperty('id');
      expect(qrCode).toHaveProperty('code');
      expect(qrCode).toHaveProperty('points');
      expect(qrCode).toHaveProperty('isActive', true);
      expect(qrCode).toHaveProperty('scannedBy', []);
      expect(qrCode).toHaveProperty('createdAt');
      expect(qrCode.createdAt).toBeInstanceOf(Date);
      expect(qrCode.code).toMatch(/^GINCANA_/);
    });
  });

  describe('createNewGameSession', () => {
    it('deve criar uma nova sessão de jogo', () => {
      const session = createNewGameSession(30);
      
      expect(session).toHaveProperty('id');
      expect(session).toHaveProperty('isActive', false);
      expect(session).toHaveProperty('duration', 30);
      expect(session).toHaveProperty('startTime', null);
      expect(session).toHaveProperty('endTime', null);
      expect(session).toHaveProperty('teams', []);
      expect(session).toHaveProperty('qrCodes', []);
    });
  });

  describe('sortTeamsByScore', () => {
    it('deve ordenar equipes por pontuação (maior para menor)', () => {
      const teams: Team[] = [
        { id: '1', name: 'Equipe A', score: 100, participants: [], scannedCodes: [], createdAt: new Date() },
        { id: '2', name: 'Equipe B', score: 300, participants: [], scannedCodes: [], createdAt: new Date() },
        { id: '3', name: 'Equipe C', score: 200, participants: [], scannedCodes: [], createdAt: new Date() }
      ];
      
      const sorted = sortTeamsByScore(teams);
      
      expect(sorted[0].score).toBe(300);
      expect(sorted[1].score).toBe(200);
      expect(sorted[2].score).toBe(100);
    });

    it('não deve modificar o array original', () => {
      const teams: Team[] = [
        { id: '1', name: 'Equipe A', score: 100, participants: [], scannedCodes: [], createdAt: new Date() },
        { id: '2', name: 'Equipe B', score: 300, participants: [], scannedCodes: [], createdAt: new Date() }
      ];
      
      const original = [...teams];
      sortTeamsByScore(teams);
      
      expect(teams).toEqual(original);
    });
  });

  describe('formatTime', () => {
    it('deve formatar tempo em MM:SS', () => {
      expect(formatTime(0)).toBe('00:00');
      expect(formatTime(30)).toBe('00:30');
      expect(formatTime(60)).toBe('01:00');
      expect(formatTime(90)).toBe('01:30');
      expect(formatTime(3661)).toBe('61:01');
    });
  });

  describe('getTeamRanking', () => {
    const teams: Team[] = [
      { id: '1', name: 'Equipe A', score: 100, participants: [], scannedCodes: [], createdAt: new Date() },
      { id: '2', name: 'Equipe B', score: 300, participants: [], scannedCodes: [], createdAt: new Date() },
      { id: '3', name: 'Equipe C', score: 200, participants: [], scannedCodes: [], createdAt: new Date() }
    ];

    it('deve retornar a posição correta da equipe', () => {
      expect(getTeamRanking(teams, '2')).toBe(1); // Maior pontuação
      expect(getTeamRanking(teams, '3')).toBe(2); // Segunda maior
      expect(getTeamRanking(teams, '1')).toBe(3); // Menor pontuação
    });

    it('deve retornar 0 se a equipe não for encontrada', () => {
      expect(getTeamRanking(teams, 'inexistente')).toBe(0);
    });
  });

  describe('isGameTimeUp', () => {
    it('deve retornar false se startTime for null', () => {
      expect(isGameTimeUp(null, 30)).toBe(false);
    });

    it('deve retornar true se o tempo acabou', () => {
      const pastTime = new Date(Date.now() - 31 * 60 * 1000); // 31 minutos atrás
      expect(isGameTimeUp(pastTime, 30)).toBe(true);
    });

    it('deve retornar false se ainda há tempo', () => {
      const recentTime = new Date(Date.now() - 10 * 60 * 1000); // 10 minutos atrás
      expect(isGameTimeUp(recentTime, 30)).toBe(false);
    });
  });

  describe('getRemainingTime', () => {
    it('deve retornar tempo total se startTime for null', () => {
      expect(getRemainingTime(null, 30)).toBe(1800); // 30 * 60
    });

    it('deve retornar tempo restante correto', () => {
      const startTime = new Date(Date.now() - 10 * 60 * 1000); // 10 minutos atrás
      const remaining = getRemainingTime(startTime, 30);
      
      expect(remaining).toBeGreaterThan(1100); // Aproximadamente 20 minutos
      expect(remaining).toBeLessThan(1210); // Com margem para execução
    });

    it('deve retornar 0 se o tempo acabou', () => {
      const pastTime = new Date(Date.now() - 31 * 60 * 1000); // 31 minutos atrás
      expect(getRemainingTime(pastTime, 30)).toBe(0);
    });
  });
});