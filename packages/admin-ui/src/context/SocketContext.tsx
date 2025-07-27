import { SocketEvents } from '@qrcode-hunter/shared';
import { io, Socket } from 'socket.io-client';
import { createContext, createSignal, onCleanup, onMount, ParentComponent, useContext } from 'solid-js';

interface SocketContextType {
  socket: () => Socket | null;
  isConnected: () => boolean;
  emit: <K extends keyof SocketEvents>(event: K, data: SocketEvents[K]) => void;
  on: <K extends keyof SocketEvents>(event: K, callback: (data: SocketEvents[K]) => void) => void;
  off: <K extends keyof SocketEvents>(event: K, callback?: (data: SocketEvents[K]) => void) => void;
}

const SocketContext = createContext<SocketContextType>();

/**
 * Provider de WebSocket para comunicação em tempo real
 * Implementa reconexão automática e gerenciamento de eventos
 */
export const SocketProvider: ParentComponent = (props) => {
  const [socket, setSocket] = createSignal<Socket | null>(null);
  const [isConnected, setIsConnected] = createSignal(false);

  onMount(() => {
    // Conectar ao servidor WebSocket
    const socketInstance = io('http://localhost:3001', {
      transports: ['websocket', 'polling'],
      timeout: 20000,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    });

    setSocket(socketInstance);

    // Eventos de conexão
    socketInstance.on('connect', () => {
      console.log('🔌 WebSocket conectado');
      setIsConnected(true);
    });

    socketInstance.on('disconnect', (reason) => {
      console.log('🔌 WebSocket desconectado:', reason);
      setIsConnected(false);
    });

    socketInstance.on('connect_error', (error) => {
      console.error('❌ Erro de conexão WebSocket:', error);
      setIsConnected(false);
    });

    socketInstance.on('reconnect', (attemptNumber) => {
      console.log(`🔄 WebSocket reconectado (tentativa ${attemptNumber})`);
      setIsConnected(true);
    });

    socketInstance.on('reconnect_error', (error) => {
      console.error('❌ Erro de reconexão WebSocket:', error);
    });

    // Cleanup na desmontagem
    onCleanup(() => {
      socketInstance.disconnect();
    });
  });

  const emit = <K extends keyof SocketEvents>(event: K, data: SocketEvents[K]) => {
    const socketInstance = socket();
    if (socketInstance && isConnected()) {
      socketInstance.emit(event, data);
    } else {
      console.warn('⚠️ Tentativa de emitir evento sem conexão WebSocket:', event);
    }
  };

  const on = <K extends keyof SocketEvents>(event: K, callback: (data: SocketEvents[K]) => void) => {
    const socketInstance = socket();
    if (socketInstance) {
      socketInstance.on(event as string, callback);
    }
  };

  const off = <K extends keyof SocketEvents>(event: K, callback?: (data: SocketEvents[K]) => void) => {
    const socketInstance = socket();
    if (socketInstance) {
      if (callback) {
        socketInstance.off(event as string, callback);
      } else {
        socketInstance.off(event as string);
      }
    }
  };

  const contextValue: SocketContextType = {
    socket,
    isConnected,
    emit,
    on,
    off
  };

  return (
    <SocketContext.Provider value={contextValue}>
      {props.children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket deve ser usado dentro de SocketProvider');
  }
  return context;
};