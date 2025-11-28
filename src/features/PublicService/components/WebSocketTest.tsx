import React, { useEffect, useState } from 'react';
import { getWebSocketService } from '../../../shared/utils/WebsocketService';

export const WebSocketTest: React.FC = () => {
  const [status, setStatus] = useState<'connecting' | 'connected' | 'disconnected'>('connecting');
  const [messages, setMessages] = useState<any[]>([]);
  const [testChannel] = useState('test-channel-123');

  useEffect(() => {
    const wsService = getWebSocketService();

    const connect = async () => {
      try {
        await wsService.connect();
        setStatus('connected');
        console.log('✅ WebSocket Test: Connected');

        
        wsService.subscribe(testChannel, '$');

        
        const unsubscribe = wsService.onMessage(testChannel, (data) => {
          console.log('📨 WebSocket Test: Received message', data);
          setMessages(prev => [...prev, { timestamp: new Date().toISOString(), data }]);
        });

        return unsubscribe;
      } catch (error) {
        console.error('❌ WebSocket Test: Connection failed', error);
        setStatus('disconnected');
      }
    };

    const cleanup = connect();

    return () => {
      cleanup.then(unsubscribe => {
        if (unsubscribe) unsubscribe();
      });
    };
  }, [testChannel]);

  const sendTestMessage = () => {
    const wsService = getWebSocketService();
    if (wsService.isConnected()) {
      const testData = {
        test: true,
        message: 'Test message from frontend',
        timestamp: new Date().toISOString(),
      };
      wsService.publish(testChannel, testData);
      console.log('📤 WebSocket Test: Sent message', testData);
    } else {
      console.error('❌ WebSocket Test: Not connected');
    }
  };

  return (
    <div style={{ 
      position: 'fixed', 
      bottom: 20, 
      right: 20, 
      background: 'white', 
      border: '2px solid #ccc', 
      borderRadius: 8,
      padding: 16,
      maxWidth: 400,
      maxHeight: 400,
      overflow: 'auto',
      zIndex: 9999,
      boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
    }}>
      <h3 style={{ margin: '0 0 12px 0', fontSize: 14, fontWeight: 'bold' }}>
        WebSocket Test
      </h3>
      
      <div style={{ marginBottom: 12 }}>
        <strong>Status:</strong>{' '}
        <span style={{ 
          color: status === 'connected' ? 'green' : status === 'connecting' ? 'orange' : 'red' 
        }}>
          {status.toUpperCase()}
        </span>
      </div>

      <div style={{ marginBottom: 12 }}>
        <strong>Channel:</strong> {testChannel}
      </div>

      <button
        onClick={sendTestMessage}
        disabled={status !== 'connected'}
        style={{
          padding: '8px 16px',
          background: status === 'connected' ? '#3B82F6' : '#ccc',
          color: 'white',
          border: 'none',
          borderRadius: 4,
          cursor: status === 'connected' ? 'pointer' : 'not-allowed',
          marginBottom: 12,
          width: '100%'
        }}
      >
        Send Test Message
      </button>

      <div style={{ 
        maxHeight: 200, 
        overflow: 'auto', 
        fontSize: 12,
        background: '#f5f5f5',
        padding: 8,
        borderRadius: 4
      }}>
        <strong>Messages ({messages.length}):</strong>
        {messages.length === 0 && (
          <div style={{ color: '#666', marginTop: 8 }}>No messages yet...</div>
        )}
        {messages.map((msg, i) => (
          <div key={i} style={{ marginTop: 8, borderBottom: '1px solid #ddd', paddingBottom: 8 }}>
            <div style={{ fontSize: 10, color: '#666' }}>{msg.timestamp}</div>
            <pre style={{ margin: '4px 0 0 0', fontSize: 11, whiteSpace: 'pre-wrap' }}>
              {JSON.stringify(msg.data, null, 2)}
            </pre>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WebSocketTest;