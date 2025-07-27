import { vi } from 'vitest';

// Mock global console para testes mais limpos
global.console = {
  ...console,
  log: vi.fn(),
  error: vi.fn(),
  warn: vi.fn(),
  info: vi.fn()
};

// Mock de Date.now para testes determinísticos
const mockDateNow = vi.fn(() => 1640995200000); // 2022-01-01 00:00:00
vi.stubGlobal('Date', {
  ...Date,
  now: mockDateNow
});

// Configurações globais para testes
process.env.NODE_ENV = 'test';