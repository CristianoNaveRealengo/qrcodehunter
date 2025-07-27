/**
 * Adaptador para WebSocket
 * Camada de Interface Adapters - Clean Architecture
 */

import { IWebSocketGateway } from '../../domain/usecases/GameUseCases';

/**
 * Adaptador que implementa a interface IWebSocketGateway
 * Responsabilidade única: Adaptar a interface do SocketContext para os use cases
 */
export class WebSocketAdapter implements IWebSocketGateway {
  constructor(
    private socketEmit: (event: string, data: any) => void,
    private socketOn: (event: string, callback: (data: any) => void) => void,
    private socketOff: (event: string, callback?: (data: any) => void) => void
  ) {}

  emit(event: string, data: any): void {
    this.socketEmit(event, data);
  }

  on(event: string, callback: (data: any) => void): void {
    this.socketOn(event, callback);
  }

  off(event: string, callback?: (data: any) => void): void {
    this.socketOff(event, callback);
  }
}