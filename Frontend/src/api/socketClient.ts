import { io, Socket } from 'socket.io-client';
import { storage } from '../utils/storage';

type SocketEventListener = (data: any) => void;

class SocketClientManager {
  private socket: Socket | null = null;
  private listeners: Map<string, Set<SocketEventListener>> = new Map();

  public connect(): Socket | null {
    const token = storage.getToken();
    if (this.socket && this.socket.connected) {
      return this.socket;
    }

    // Connect to Socket.IO server
    const serverUrl = window.location.origin;
    this.socket = io(serverUrl, {
      auth: {
        token: token ? `Bearer ${token}` : '',
      },
      transports: ['websocket', 'polling'],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
    });

    this.socket.on('connect', () => {
      console.log('⚡ DAYFLOW Socket.IO connected:', this.socket?.id);
    });

    this.socket.on('connect_error', (err) => {
      console.warn('Socket connection warning (operating in fallback mode):', err.message);
    });

    // Register broadcast event forwarders
    const eventsToListen = [
      'leave:submitted',
      'leave:approved',
      'leave:rejected',
      'attendance:updated',
      'payroll:updated',
      'notification:new',
    ];

    eventsToListen.forEach((eventName) => {
      this.socket?.on(eventName, (data) => {
        this.notifySubscribers(eventName, data);
      });
    });

    return this.socket;
  }

  public disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  public subscribe(event: string, callback: SocketEventListener): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)?.add(callback);

    // Return unsubscribe function
    return () => {
      this.listeners.get(event)?.delete(callback);
    };
  }

  // Trigger mock local socket events for immediate visual updates during standalone demo
  public emitLocalEvent(event: string, data: any): void {
    if (this.socket && this.socket.connected) {
      this.socket.emit(event, data);
    }
    // Also notify local UI subscribers immediately
    this.notifySubscribers(event, data);
  }

  private notifySubscribers(event: string, data: any): void {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.forEach((cb) => cb(data));
    }
  }
}

export const socketClient = new SocketClientManager();
