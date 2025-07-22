import React from 'react';
import { InteractionManager } from 'react-native';

// Utilitário para executar tarefas após as interações
export const runAfterInteractions = (callback: () => void): void => {
  InteractionManager.runAfterInteractions(callback);
};

// Debounce para evitar execuções excessivas
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

// Throttle para limitar execuções
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

// Cleanup de timers e listeners
export class ResourceManager {
  private timers: NodeJS.Timeout[] = [];
  private intervals: NodeJS.Timeout[] = [];
  private listeners: (() => void)[] = [];

  addTimer(timer: NodeJS.Timeout): void {
    this.timers.push(timer);
  }

  addInterval(interval: NodeJS.Timeout): void {
    this.intervals.push(interval);
  }

  addListener(cleanup: () => void): void {
    this.listeners.push(cleanup);
  }

  cleanup(): void {
    // Limpar timers
    this.timers.forEach(timer => clearTimeout(timer));
    this.timers = [];

    // Limpar intervals
    this.intervals.forEach(interval => clearInterval(interval));
    this.intervals = [];

    // Executar cleanup de listeners
    this.listeners.forEach(cleanup => cleanup());
    this.listeners = [];
  }
}

// Hook para gerenciamento de recursos
export const useResourceManager = () => {
  const resourceManager = new ResourceManager();

  const cleanup = () => {
    resourceManager.cleanup();
  };

  return {
    addTimer: (timer: NodeJS.Timeout) => resourceManager.addTimer(timer),
    addInterval: (interval: NodeJS.Timeout) => resourceManager.addInterval(interval),
    addListener: (cleanup: () => void) => resourceManager.addListener(cleanup),
    cleanup,
  };
};

// Otimização de re-renders
export const areEqual = (prevProps: any, nextProps: any): boolean => {
  return JSON.stringify(prevProps) === JSON.stringify(nextProps);
};

// Lazy loading helper
export const createLazyComponent = <T extends React.ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>
) => {
  return React.lazy(importFunc);
};