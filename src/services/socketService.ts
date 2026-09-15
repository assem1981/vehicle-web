import { Message } from './chatService';

type MessageCallback = (msg: Message) => void;
type UnreadCallback = (count: number) => void;

class SocketService {
  private ws: WebSocket | null = null;
  private roomCallbacks: Map<string, Set<MessageCallback>> = new Map();
  private unreadCallbacks: Set<UnreadCallback> = new Set();
  private broadcastChannel: BroadcastChannel | null = null;

  constructor() {
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      try {
        this.broadcastChannel = new BroadcastChannel('vehicle_realtime_chat_room');
        this.broadcastChannel.onmessage = (event) => {
          if (event.data && event.data.type === 'CHAT_MESSAGE') {
            this.handleIncomingMessage(event.data.message);
          } else if (event.data && event.data.type === 'UNREAD_UPDATE') {
            this.notifyUnreadListeners(event.data.count);
          }
        };
      } catch (err) {
        console.warn('BroadcastChannel initialization notice:', err);
      }
    }
  }

  public connect(userId: number) {
    if (typeof window === 'undefined') return;

    try {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const host = process.env.NEXT_PUBLIC_API_URL?.replace(/^https?:\/\//, '') || 'localhost:8080';
      const wsUrl = `${protocol}//${host}/ws-raw`;

      if (!this.ws || this.ws.readyState === WebSocket.CLOSED) {
        this.ws = new WebSocket(wsUrl);

        this.ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data.content && data.senderId) {
              this.handleIncomingMessage(data);
            }
          } catch {
            // raw text ignore
          }
        };

        this.ws.onerror = () => {
          // Fallback to local room broadcast channel
        };
      }
    } catch (err) {
      console.warn('WebSocket connection notice (fallback enabled):', err);
    }
  }

  public subscribeToRoom(myUserId: number, otherUserId: number, callback: MessageCallback): () => void {
    const roomKey = this.getRoomKey(myUserId, otherUserId);
    if (!this.roomCallbacks.has(roomKey)) {
      this.roomCallbacks.set(roomKey, new Set());
    }
    this.roomCallbacks.get(roomKey)!.add(callback);

    this.connect(myUserId);

    return () => {
      const set = this.roomCallbacks.get(roomKey);
      if (set) {
        set.delete(callback);
      }
    };
  }

  public subscribeToUnreadCount(callback: UnreadCallback): () => void {
    this.unreadCallbacks.add(callback);
    return () => {
      this.unreadCallbacks.delete(callback);
    };
  }

  public publishMessage(message: Message) {
    // 1. Deliver to local room listeners instantly
    this.handleIncomingMessage(message);

    // 2. Broadcast across browser tabs via BroadcastChannel
    if (this.broadcastChannel) {
      try {
        this.broadcastChannel.postMessage({ type: 'CHAT_MESSAGE', message });
      } catch {
        // ignore
      }
    }

    // 3. Send over WebSocket if open
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      try {
        this.ws.send(JSON.stringify(message));
      } catch {
        // ignore
      }
    }
  }

  public publishUnreadUpdate(count: number) {
    this.notifyUnreadListeners(count);
    if (this.broadcastChannel) {
      try {
        this.broadcastChannel.postMessage({ type: 'UNREAD_UPDATE', count });
      } catch {
        // ignore
      }
    }
  }

  private handleIncomingMessage(msg: Message) {
    const key1 = this.getRoomKey(msg.senderId, msg.receiverId);
    const key2 = this.getRoomKey(msg.receiverId, msg.senderId);

    const listeners1 = this.roomCallbacks.get(key1);
    if (listeners1) {
      listeners1.forEach(cb => cb(msg));
    }

    const listeners2 = this.roomCallbacks.get(key2);
    if (listeners2 && key2 !== key1) {
      listeners2.forEach(cb => cb(msg));
    }
  }

  private notifyUnreadListeners(count: number) {
    this.unreadCallbacks.forEach(cb => cb(count));
  }

  private getRoomKey(userA: number, userB: number): string {
    const min = Math.min(userA, userB);
    const max = Math.max(userA, userB);
    return `room_${min}_${max}`;
  }
}

export const socketService = new SocketService();
