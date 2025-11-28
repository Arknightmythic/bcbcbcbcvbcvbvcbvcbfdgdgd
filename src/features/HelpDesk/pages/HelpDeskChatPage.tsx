import React, { useState, useRef, useEffect } from 'react'; 
import { useParams, useNavigate } from 'react-router';
import { Send, Check, ArrowLeft, Loader2 } from 'lucide-react'; 
import type { HelpDeskMessage } from '../utils/types';
import toast from 'react-hot-toast';
import { 
  useGetChatHistory, 
  useGetHelpDeskBySessionId, 
  useResolveHelpDesk,
  useSendHelpdeskMessage 
} from '../hooks/useHelpDesk';
import { getWebSocketService } from '../../../shared/utils/WebsocketService';

const QuickResponseButton = ({ text, onClick }: { text: string; onClick: () => void }) => (
  <button 
    onClick={onClick}
    className="text-xs font-medium text-blue-600 border border-blue-200 bg-blue-50 rounded-full px-3 py-1.5 hover:bg-blue-100"
  >
    {text}
  </button>
);

const HelpDeskChatPage: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const [input, setInput] = useState('');
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const observerTarget = useRef<HTMLDivElement>(null);
  const [shouldScrollToBottom, setShouldScrollToBottom] = useState(true);
  const previousScrollHeight = useRef<number>(0);
  const wsService = useRef(getWebSocketService());

  // Fetch chat history with infinite scroll
  const {
    data: chatHistory,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    refetch: refetchChatHistory,
  } = useGetChatHistory(sessionId || '', 50, !!sessionId);

  // Fetch helpdesk info to check status
  const { data: helpdeskInfo } = useGetHelpDeskBySessionId(sessionId || '', !!sessionId);
  
  const resolveMutation = useResolveHelpDesk();
  const sendMessageMutation = useSendHelpdeskMessage();

  const isResolved = helpdeskInfo?.status === 'resolved' || helpdeskInfo?.status === 'closed';

  // WebSocket setup for real-time messages
  useEffect(() => {
  if (!sessionId) return;

  const ws = wsService.current;
  
  // Connect to WebSocket if not connected
  if (!ws.isConnected()) {
    ws.connect().catch((error) => {
      console.error('Failed to connect to WebSocket:', error);
    });
  }

  // Subscribe to agent channel to receive user messages
  const agentChannel = `${sessionId}-agent`;
  
  const unsubscribe = ws.onMessage(agentChannel, (data: any) => {
    console.log('📨 Received WebSocket message:', data);
    
    // Immediately invalidate and refetch to get the latest messages
    refetchChatHistory();
  });

  // Subscribe to the agent channel
  ws.subscribe(agentChannel, '$');
  console.log(`✅ Subscribed to channel: ${agentChannel}`);

  // Cleanup
  return () => {
    console.log(`🔌 Unsubscribing from channel: ${agentChannel}`);
    unsubscribe();
  };
}, [sessionId, refetchChatHistory]);


  // Transform chat history to messages
  const messages: HelpDeskMessage[] = React.useMemo(() => {
    if (!chatHistory) return [];

    const allMessages = chatHistory.pages
      .flatMap((page) => page.data || [])
      .filter(Boolean)
      .reverse();

    return allMessages.map((item) => ({
      id: `msg-${item.id}`,
      sender: item.message.type === 'human' ? 'user' : 'agent',
      text: item.message.data.content,
      timestamp: item.created_at,
    }));
  }, [chatHistory]);

  const currentChatUser = sessionId 
    ? helpdeskInfo?.platform_unique_id || `Session ${sessionId.substring(0, 8)}...`
    : 'Sesi Chatbot';

  // Intersection Observer for infinite scroll
  useEffect(() => {
    if (!observerTarget.current || !hasNextPage || isFetchingNextPage) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          if (chatContainerRef.current) {
            previousScrollHeight.current = chatContainerRef.current.scrollHeight;
          }
          fetchNextPage();
        }
      },
      { threshold: 1.0 }
    );

    observer.observe(observerTarget.current);

    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  // Maintain scroll position after loading more messages
  useEffect(() => {
    if (chatContainerRef.current && previousScrollHeight.current > 0) {
      const newScrollHeight = chatContainerRef.current.scrollHeight;
      const scrollDiff = newScrollHeight - previousScrollHeight.current;
      chatContainerRef.current.scrollTop = scrollDiff;
      previousScrollHeight.current = 0;
    }
  }, [messages.length]);

  // Auto scroll to bottom on initial load
  useEffect(() => {
    if (shouldScrollToBottom && chatContainerRef.current && messages.length > 0) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
      setShouldScrollToBottom(false);
    }
  }, [messages, shouldScrollToBottom]);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const textarea = e.target;
    setInput(textarea.value);
    textarea.style.height = 'auto'; 
    const maxHeight = 160; 
    textarea.style.height = `${Math.min(textarea.scrollHeight, maxHeight)}px`;
  };

  const handleSend = async () => {
    if (!input.trim() || !sessionId) return;

    const sendTime = new Date();
    // Format timestamp menjadi string: "YYYY-MM-DD HH:mm:ss.sss"
    const startTimestampString = sendTime.toISOString().replace('T', ' ').replace('Z', '').slice(0, 23);
    
    const messageText = input.trim();
    setInput('');
    
    if (textareaRef.current) {
      textareaRef.current.style.height = '44px'; 
    }

    try {
      // Send message to backend
      await sendMessageMutation.mutateAsync({
        session_id: sessionId,
        message: messageText,
        user_type: "agent",
        start_timestamp: startTimestampString,
      });
      
      // Scroll to bottom after sending
      setTimeout(() => {
        if (chatContainerRef.current) {
          chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
      }, 100);
    } catch (error) {
      console.error('Failed to send message:', error);
      // Restore input if failed
      setInput(messageText);
    }
  };

  const handleQuickResponse = (template: string) => {
    const quickResponses: Record<string, string> = {
      'Greeting': 'Halo! Terima kasih telah menghubungi kami. Ada yang bisa saya bantu?',
      'Checking': 'Saya sedang memeriksa informasi yang Anda butuhkan. Mohon tunggu sebentar.',
      'Followup': 'Apakah ada hal lain yang bisa saya bantu?',
    };
    
    setInput(quickResponses[template] || '');
    textareaRef.current?.focus();
  };

  const handleResolveChat = () => {
    if (!helpdeskInfo?.id) {
      toast.error("Helpdesk info not found");
      return;
    }

    resolveMutation.mutate(helpdeskInfo.id, {
      onSuccess: () => {
        navigate('/helpdesk');
      },
    });
  };

  const handleGoBack = () => {
    navigate('/helpdesk');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 text-gray-400 animate-spin" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-8">
        <p className="text-red-500 mb-4">Failed to load chat history</p>
        <button
          onClick={handleGoBack}
          className="px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-900"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full min-h-0 bg-white">
      {/* Header Chat Panel */}
      <div className="p-3 border-b border-gray-200 flex items-center justify-between bg-gray-50">
        <div className="flex items-center gap-3">
          <button
            onClick={handleGoBack}
            className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded-full lg:hidden"
            aria-label="Kembali ke daftar chat"
            title="Kembali"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-md font-semibold text-gray-800">{currentChatUser}</h2>
            {helpdeskInfo && (
              <p className="text-xs text-gray-500 capitalize">
                {helpdeskInfo.platform} • {helpdeskInfo.status}
              </p>
            )}
          </div>
        </div>
        <div>
          {!isResolved && (
            <button
              onClick={handleResolveChat}
              disabled={resolveMutation.isPending}
              className="flex items-center gap-2 px-3 py-1.5 bg-green-100 text-green-700 rounded-md hover:bg-green-200 text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {resolveMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Check className="w-4 h-4" />
              )}
              Resolve
            </button>
          )}
        </div>
      </div>

      {/* Area Bubble Chat */}
      <div 
        ref={chatContainerRef}
        className="flex-1 py-4 px-12 overflow-y-auto custom-scrollbar space-y-4"
      >
        {hasNextPage && (
          <div ref={observerTarget} className="flex justify-center py-2">
            {isFetchingNextPage && (
              <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />
            )}
          </div>
        )}

        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full">
            <p className="text-gray-400 mb-2">No messages in this conversation yet</p>
            <p className="text-sm text-gray-300">Start by sending a message below</p>
          </div>
        ) : (
          messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-start' : 'justify-end'}`}>
              <div className={`relative p-3 rounded-lg max-w-[75%] shadow-sm ${
                  msg.sender === 'user' 
                    ? 'bg-gray-100 text-gray-800 rounded-br-none' 
                    : 'bg-blue-600 text-white rounded-bl-none'
              }`}>
                <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                <div className={`absolute w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold text-white ${
                    msg.sender === 'user' 
                      ? 'bg-blue-700 -left-10 bottom-0' 
                      : 'bg-red-600 -right-10 bottom-0'
                }`}>
                  {msg.sender === 'user' ? 'U' : 'A'}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Input Area */}
      {!isResolved && (
        <div className="p-4 border-t border-gray-200 bg-gray-50 space-y-3">
          <div className="flex gap-2">
            <QuickResponseButton text="Greeting" onClick={() => handleQuickResponse('Greeting')} />
            <QuickResponseButton text="Checking" onClick={() => handleQuickResponse('Checking')} />
            <QuickResponseButton text="Followup" onClick={() => handleQuickResponse('Followup')} />
          </div>
          <div className="flex gap-3 items-end"> 
            <textarea
              ref={textareaRef}
              value={input}
              onChange={handleInputChange} 
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault(); 
                  handleSend(); 
                }
              }}
              disabled={sendMessageMutation.isPending}
              className="flex-1 py-2.5 px-4 border border-gray-300 rounded-lg text-sm resize-none min-h-[44px] overflow-y-auto focus:outline-none focus:ring-2 focus:ring-blue-500 custom-scrollbar disabled:opacity-50 disabled:cursor-not-allowed" 
              placeholder="Ketik pesan Anda..."
              rows={1}
              style={{ height: '44px' }} 
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || sendMessageMutation.isPending}
              className="w-11 h-11 bg-gray-700 rounded-full text-white cursor-pointer flex items-center justify-center hover:bg-gray-900 disabled:opacity-50 disabled:cursor-not-allowed" 
              aria-label="Kirim pesan"
            >
              {sendMessageMutation.isPending ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default HelpDeskChatPage;