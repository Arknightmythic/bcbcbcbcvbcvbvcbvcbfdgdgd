interface WebSocketMessage {
  action: string;
  channel: string;
  data?: any;
  messageId?: string;
  lastMessageId?: string;
}

interface WebSocketResponse {
  event?: string;
  channel?: string;
  streamId?: string;
  data?: any;
  status?: string;
  message?: string;
  error?: string;
}

type MessageHandler = (data: any) => void;

class WebSocketService {
  private ws: WebSocket | null = null;
  private readonly url: string;
  private readonly token: string;
  private readonly messageHandlers: Map<string, MessageHandler[]> = new Map();
  private reconnectAttempts = 0;
  private readonly maxReconnectAttempts = 5;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private isConnecting = false;
  private readonly subscribedChannels: Set<string> = new Set();

  constructor(url: string, token: string) {
    this.url = url;
    this.token = token;
  }

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        resolve();
        return;
      }

      if (this.isConnecting) {
        reject(new Error('Connection already in progress'));
        return;
      }

      this.isConnecting = true;

      try {
        const wsUrl = `${this.url}?token=${this.token}`;
        this.ws = new WebSocket(wsUrl);

        this.ws.onopen = () => {
          this.reconnectAttempts = 0;
          this.isConnecting = false;
          
          
         for (const channel of this.subscribedChannels) {
            this.subscribe(channel, '$');
          }
          
          resolve();
        };

        this.ws.onmessage = (event) => {
          try {
            const message: WebSocketResponse = JSON.parse(event.data);
            this.handleMessage(message);
          } catch (error) {
            console.error('Failed to parse WebSocket message:', error);
          }
        };

        this.ws.onerror = (event) => {
          console.error('WebSocket error:', event);
          this.isConnecting = false;
          reject(new Error('WebSocket connection failed'));
        };

        this.ws.onclose = () => {
          this.isConnecting = false;
          this.ws = null;
          this.reconnect();
        };
      } catch (error) {
        this.isConnecting = false;
        reject(error instanceof Error ? error : new Error(String(error)));
      }
    });
  }

  private reconnect(): void {
    if (this.reconnectTimer) {
      return;
    }

    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = Math.min(1000 * this.reconnectAttempts, 5000);
      this.reconnectTimer = setTimeout(() => {
        this.reconnectTimer = null;
        this.connect().catch((error) => {
          console.error('Reconnection failed:', error);
        });
      }, delay);
    } else {
      console.error('Max reconnection attempts reached');
    }
  }

  private handleMessage(message: WebSocketResponse): void {
    const { event, channel, data } = message;

    if (event === 'message' && channel) {
      const handlers = this.messageHandlers.get(channel);
      if (handlers) {
        
        for (const handler of handlers) {
          try {
            handler(data);
          } catch (error) {
            console.error('Error in message handler:', error);
          }
        }
      }
    } 
  }

  subscribe(conversationId: string, lastMessageId = '$'): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.error('WebSocket is not connected');
      return;
    }

    const message: WebSocketMessage = {
      action: 'subscribe',
      channel: conversationId,
      lastMessageId: lastMessageId,
    };

    this.ws.send(JSON.stringify(message));
    this.subscribedChannels.add(conversationId);
    
  }

  publish(conversationId: string, data: any): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.error('WebSocket is not connected');
      return;
    }

    
    const array = new Uint32Array(1);
    crypto.getRandomValues(array);
    const randomPart = array[0].toString(36);
    const messageId = `${Date.now()}-${randomPart}`;

    const message: WebSocketMessage = {
      action: 'publish',
      channel: conversationId,
      data: data,
      messageId: messageId,
    };

    this.ws.send(JSON.stringify(message));
    
  }

  onMessage(conversationId: string, handler: MessageHandler): () => void {
    if (!this.messageHandlers.has(conversationId)) {
      this.messageHandlers.set(conversationId, []);
    }

    const handlers = this.messageHandlers.get(conversationId)!;
    handlers.push(handler);

    
    return () => {
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers.splice(index, 1);
      }
      
      
      if (handlers.length === 0) {
        this.messageHandlers.delete(conversationId);
        this.subscribedChannels.delete(conversationId);
      }
    };
  }

  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }

  disconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }

    this.messageHandlers.clear();
    this.subscribedChannels.clear();
    this.reconnectAttempts = 0;
    this.isConnecting = false;
  }
}


let wsServiceInstance: WebSocketService | null = null;

export const getWebSocketService = (): WebSocketService => {
  if (!wsServiceInstance) {
    const wsUrl = import.meta.env.VITE_WEBSOCKET_URL || 'wss://dev-bkpm.cloud-ioh.com/ws'
    const wsToken = import.meta.env.VITE_WEBSOCKET_SECRET_KEY || 'bkpm-secret445566';
    wsServiceInstance = new WebSocketService(wsUrl, wsToken);
  }
  return wsServiceInstance;
};

export const disconnectWebSocket = (): void => {
  if (wsServiceInstance) {
    wsServiceInstance.disconnect();
    wsServiceInstance = null;
  }
};

export default WebSocketService;