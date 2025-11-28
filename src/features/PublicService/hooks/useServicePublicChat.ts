import { useState, useCallback, useRef, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { useAuthStore } from "../../../shared/store/authStore";

import type {
  ChatMessage,
  Citation,
  OpenCitationsState,
  ChatMode,
  BackendChatHistory,
  AskPayload,
  AskResponse,
  ChatSession,
} from "../utils/types";
import {
  askQuestion,
  getConversationById,
} from "../api/chatApi";
import { getWebSocketService } from "../../../shared/utils/WebsocketService";


const cleanText = (text: string): string => {
  if (!text) return "";
  
  let cleaned = text.replace(/^None\s*/i, "");
  return cleaned.trim();
};

const mapBackendHistoryToFrontend = (
  history: BackendChatHistory[] 
): ChatMessage[] => {
  const messages = (history || [])
    .map((msg: any) => {
      let sender: "user" | "agent" | "system" = "agent";
      let text = "";
      
      
      if (msg.message.data?.content) {
        text = msg.message.data.content;
      } else if (msg.message.content) {
        text = msg.message.content;
      }
      
      
      text = cleanText(text);
      
      
      if (!text) {
        return null;
      }
      
      
      if (msg.message.type === "human" || msg.message.data?.type === "human") {
        sender = "user";
      } else if (msg.message.type === "ai" || msg.message.data?.type === "ai") {
        sender = "agent";
      } else if (msg.message.role === "user") {
        sender = "user";
      } else if (msg.message.role === "assistant") {
        sender = "agent";
      }
      
      
      const messageId = `${sender}-${msg.id}`;
      
      const chatMessage: ChatMessage = {
        id: messageId,
        sender: sender,
        text: text,
        timestamp: msg.created_at,
        feedback: msg.feedback === true ? "like" : msg.feedback === false ? "dislike" : null,
        is_answered: msg.is_cannot_answer === null ? null : !msg.is_cannot_answer,
      };
      
      return chatMessage;
    })
    .filter((msg) => msg !== null) as ChatMessage[];
    
  return messages;
};

const mapAskResponseToCitations = (
  data: AskResponse | any, 
  botMessageId: string
): Citation[] => {
  if (!data.citations || data.citations.length === 0) {
    return [];
  }
  return data.citations.map((docName: string) => ({
    messageId: botMessageId,
    documentName: docName,
    content: `Konten placeholder untuk: "${docName}".`,
  }));
};

export const useServicePublicChat = () => {
  const navigate = useNavigate();
  const { sessionId } = useParams<{ sessionId: string }>();
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState<string>("");
  const [chatMode, setChatMode] = useState<ChatMode>("bot");
  const [citations, setCitations] = useState<Citation[]>([]);
  const [isHistoryLoaded, setIsHistoryLoaded] = useState(false);

  const [openCitations, setOpenCitations] = useState<OpenCitationsState>({});
  const [selectedCitation, setSelectedCitation] = useState<Citation | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const processedMessageIdsRef = useRef<Set<string>>(new Set());

  const loadingToastRef = useRef<string | null>(null);
  const loadingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  const wsService = useRef(getWebSocketService());
  const unsubscribeRef = useRef<(() => void) | null>(null);
  const currentConversationIdRef = useRef<string | null>(null);

  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const hasLoadedHistoryRef = useRef(false);
  const wsEnabledRef = useRef(false);

  const {
    data: historyData,
    isLoading: isLoadingHistory,
    isError: isHistoryError,
    error: historyError,
  } = useQuery({
    queryKey: ["conversation", sessionId],
    queryFn: () => getConversationById(sessionId!),
    enabled: !!sessionId && sessionId !== "new" && !isHistoryLoaded,
    retry: false,
  });

  
  useEffect(() => {
    const initWebSocket = async () => {
      try {
        await wsService.current.connect();
        console.log('🔌 WebSocket connected');
      } catch (error) {
        console.error('❌ WebSocket connection failed:', error);
      }
    };

    initWebSocket();

    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
    };
  }, []);

  
  useEffect(() => {
    if (sessionId === "new") {
      hasLoadedHistoryRef.current = false;
      setIsInitialLoad(true);
      wsEnabledRef.current = false;
    }
  }, [sessionId]);
  
  
  useEffect(() => {
    
    if (!wsEnabledRef.current || !sessionId || sessionId === "new") {
      console.log('⏸️ WebSocket subscription paused');
      return;
    }

    
    if (unsubscribeRef.current) {
      unsubscribeRef.current();
      unsubscribeRef.current = null;
    }

    if (!wsService.current.isConnected()) {
      console.log('❌ WebSocket not connected');
      return;
    }

    currentConversationIdRef.current = sessionId;
    
    const unsubscribe = wsService.current.onMessage(sessionId, (data) => {
      console.log('📨 WebSocket message received:', data);
      
      
      if (data.answer && data.chat_history_id) {
        const botMessageId = `agent-${data.chat_history_id}`;
        
        
        if (processedMessageIdsRef.current.has(botMessageId)) {
          console.log('⏭️ Skip WebSocket - already have this message from API:', botMessageId);
          return;
        }
        
        processedMessageIdsRef.current.add(botMessageId);
        
        const cleanedAnswer = cleanText(data.answer);
        
        if (!cleanedAnswer) {
          console.log('⏭️ Skip - empty answer after cleaning');
          return;
        }
        
        const botMessage: ChatMessage = {
          id: botMessageId,
          sender: "agent",
          text: cleanedAnswer,
          timestamp: new Date().toISOString(),
          feedback: null,
          is_answered: data.is_answered,
        };
        
        setMessages((prev) => {
          if (prev.some(m => m.id === botMessageId)) {
            console.log('⏭️ Skip in setState - already exists:', botMessageId);
            return prev;
          }
          
          console.log('✅ Adding WebSocket message:', botMessageId);
          const updated = [...prev, botMessage];
          return updated.sort((a, b) => 
            new Date(a.timestamp || 0).getTime() - new Date(b.timestamp || 0).getTime()
          );
        });

        setCitations((prev) => [...prev, ...mapAskResponseToCitations(data, botMessageId)]);
      }
      
      else if (data.user_type === 'agent' && data.message) {
        const agentMessageId = data.chat_history_id 
          ? `agent-${data.chat_history_id}` 
          : `agent-ws-${Date.now()}`;
        
        if (processedMessageIdsRef.current.has(agentMessageId)) {
          console.log('⏭️ Skip - already exists:', agentMessageId);
          return;
        }
        
        processedMessageIdsRef.current.add(agentMessageId);
        
        const cleanedMessage = cleanText(data.message);
        
        if (!cleanedMessage) {
          console.log('⏭️ Skip - empty message after cleaning');
          return;
        }
        
        const agentMessage: ChatMessage = {
          id: agentMessageId,
          sender: "agent",
          text: cleanedMessage,
          timestamp: data.timestamp 
            ? new Date(data.timestamp * 1000).toISOString() 
            : new Date().toISOString(),
          feedback: null,
        };
        
        setMessages((prev) => {
          if (prev.some(m => m.id === agentMessageId)) {
            console.log('⏭️ Skip in setState - already exists:', agentMessageId);
            return prev;
          }
          
          console.log('✅ Adding agent message:', agentMessageId);
          const updated = [...prev, agentMessage];
          return updated.sort((a, b) => 
            new Date(a.timestamp || 0).getTime() - new Date(b.timestamp || 0).getTime()
          );
        });
      }
    });

    unsubscribeRef.current = unsubscribe;
    wsService.current.subscribe(sessionId, '$');
    console.log(`✅ WebSocket subscribed to: ${sessionId}`);

    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
    };
  }, [sessionId, wsEnabledRef.current]);

  
  useEffect(() => {
    if (historyData && !hasLoadedHistoryRef.current && sessionId !== "new") {
      console.log('📦 Loading history from API');
      
      
      processedMessageIdsRef.current.clear();
      
      const mappedHistory = mapBackendHistoryToFrontend(
        historyData.chat_history || []
      );
      
      
      const uniqueMessages = Array.from(
        new Map(mappedHistory.map(msg => [msg.id, msg])).values()
      );
      
      
      const sortedMessages = uniqueMessages.sort((a, b) => {
        const timeA = new Date(a.timestamp || 0).getTime();
        const timeB = new Date(b.timestamp || 0).getTime();
        return timeA - timeB;
      });
      
      
      sortedMessages.forEach(msg => {
        processedMessageIdsRef.current.add(msg.id);
      });
      
      console.log(`✅ History loaded: ${sortedMessages.length} messages`);
      console.log('Message IDs:', sortedMessages.map(m => ({ id: m.id, text: m.text.substring(0, 30) })));
      
      
      setMessages(sortedMessages);
      setCitations([]);
      setIsHistoryLoaded(true);
      hasLoadedHistoryRef.current = true;
      
      
      setTimeout(() => {
        setIsInitialLoad(false);
        wsEnabledRef.current = true;
        console.log('✅ WebSocket enabled for future messages');
      }, 500);
    }
  }, [historyData, sessionId]);

  
  useEffect(() => {
    if (sessionId === "new") {
      console.log('🆕 Resetting for new session');
      processedMessageIdsRef.current.clear();
      hasLoadedHistoryRef.current = false;
      setIsInitialLoad(true);
      setIsHistoryLoaded(false);
      setMessages([]);
      setCitations([]);
      wsEnabledRef.current = false;
    }
  }, [sessionId]);

  
  useEffect(() => {
    if (isHistoryError && historyError) {
      toast.error(`Gagal memuat riwayat: ${(historyError as Error).message}`);
      setIsHistoryLoaded(true);
      wsEnabledRef.current = true;
    }
  }, [isHistoryError, historyError]);

  
  useEffect(() => {
    if (sessionId === "new" && !isHistoryLoaded) {
      const initialMessageId = "msg-initial";
      processedMessageIdsRef.current.add(initialMessageId);
      
      setMessages([
        {
          id: initialMessageId,
          sender: "system",
          text: "Halo! Selamat Datang di layanan pelanggan Dokuprime. Ada yang bisa saya bantu?",
          timestamp: new Date().toISOString(),
        },
      ]);
      setIsHistoryLoaded(true);
      setCitations([]);
      setInput("");
      console.log('✅ New session initialized');
    }
  }, [sessionId, isHistoryLoaded]);

  const showLoadingToast = () => {
    loadingTimerRef.current = setTimeout(() => {
      loadingToastRef.current = toast.loading(
        "AI sedang memproses, mohon tunggu beberapa saat lagi...",
        {
          duration: Infinity,
          style: {
            background: '#3B82F6',
            color: '#fff',
          },
          iconTheme: {
            primary: '#fff',
            secondary: '#3B82F6',
          },
        }
      );
    }, 5000);
  };

  const hideLoadingToast = () => {
    if (loadingTimerRef.current) {
      clearTimeout(loadingTimerRef.current);
      loadingTimerRef.current = null;
    }
    
    if (loadingToastRef.current) {
      toast.dismiss(loadingToastRef.current);
      loadingToastRef.current = null;
    }
  };

  const { mutate: performAsk, isPending: isBotLoading } = useMutation({
    mutationFn: askQuestion,
    onMutate: () => {
      showLoadingToast();
    },
    onSuccess: async (data: AskResponse) => {
      hideLoadingToast();
      console.log('📬 API Response received:', data);
      
      
      const cleanedAnswer = cleanText(data.answer);
      
      if (!cleanedAnswer) {
        console.log('⚠️ Empty answer from API');
        return;
      }
      
      
      
      const botMessageId = `agent-api-${Date.now()}`;
      
      console.log('➕ Adding API response message:', botMessageId);
      
      processedMessageIdsRef.current.add(botMessageId);
      
      const botMessage: ChatMessage = {
        id: botMessageId,
        sender: "agent",
        text: cleanedAnswer,
        timestamp: new Date().toISOString(),
        feedback: null,
        is_answered: data.is_answered,
      };
      
      setMessages((prev) => {
        const updated = [...prev, botMessage];
        return updated.sort((a, b) => 
          new Date(a.timestamp || 0).getTime() - new Date(b.timestamp || 0).getTime()
        );
      });
      
      setCitations((prev) => [...prev, ...mapAskResponseToCitations(data, botMessageId)]);

      
      if (sessionId === "new") {
        console.log('🔄 Navigating to new session:', data.conversation_id);
        
        wsEnabledRef.current = true;
        navigate(`/public-service/${data.conversation_id}`, { replace: true });
      } else {
        
        wsEnabledRef.current = true;
        console.log('✅ WebSocket enabled after API response');
      }

      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
    onError: (err: any) => {
      hideLoadingToast();
      toast.error(err.response?.data?.message || "Gagal mengirim pesan.");
      setMessages((prev) => prev.slice(0, -1));
    },
  });

  useEffect(() => {
    return () => {
      hideLoadingToast();
    };
  }, []);

  const handleSendMessage = useCallback(() => {
    if (input.trim() === "" || isBotLoading) return;

    
    const sendTime = new Date();
    
    
    
    const startTimestampString = sendTime.toISOString().replace('T', ' ').replace('Z', '').slice(0, 23); 
    
    const userMessageId = `user-${sendTime.getTime()}`;
    
    
    processedMessageIdsRef.current.add(userMessageId);
    
    const userMessage: ChatMessage = {
      id: userMessageId,
      sender: "user",
      text: input,
      timestamp: sendTime.toISOString(),
    };
    
    console.log('📤 Sending user message:', userMessageId);
    
    setMessages((prev) => {
      const updated = [...prev, userMessage];
      return updated.sort((a, b) => 
        new Date(a.timestamp || 0).getTime() - new Date(b.timestamp || 0).getTime()
      );
    });

    performAsk({
      query: input,
      platform: "web",
      platform_unique_id: user?.email || "anonymous_user",
      conversation_id: (sessionId === "new" ? "" : sessionId) || "",
      start_timestamp: startTimestampString,
      
    });

    setInput("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  }, [input, isBotLoading, user, sessionId, performAsk]);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setInput(e.target.value);
      const textarea = e.target;
      textarea.style.height = "auto";
      const maxHeight = 120;
      textarea.style.height = `${Math.min(
        textarea.scrollHeight,
        maxHeight
      )}px`;
    },
    []
  );

  const handleFeedbackUpdate = useCallback((messageId: string, feedback: 'like' | 'dislike' | null) => {
    setMessages(prevMessages => 
      prevMessages.map(msg => 
        msg.id === messageId ? { ...msg, feedback: feedback } : msg
      )
    );
    
    if (feedback === 'like') {
      toast.success("Terima kasih atas masukan Anda! (Suka)");
    } else if (feedback === 'dislike') {
      toast.success("Terima kasih atas masukan Anda! (Tidak Suka)");
    } else {
      toast.success("Feedback dibatalkan");
    }
  }, []); 

  const handleSelectSession = useCallback(
    (session: ChatSession) => {
      console.log('🔄 Selecting session:', session.id);
      setIsHistoryLoaded(false);
      hasLoadedHistoryRef.current = false;
      wsEnabledRef.current = false;
      navigate(`/public-service/${session.id}`);
    },
    [navigate]
  );

  const handleCreateNewSession = useCallback(() => {
    console.log('🆕 Creating new session');
    setIsHistoryLoaded(false);
    hasLoadedHistoryRef.current = false;
    wsEnabledRef.current = false;
    setMessages([]);
    navigate("/public-service/new");
  }, [navigate]);

  const handleGoBackToIntro = useCallback(() => {
    navigate("/public-service");
  }, [navigate]);

  const toggleCitations = useCallback((messageId: string) => {
    setOpenCitations((prev) => ({ ...prev, [messageId]: !prev[messageId] }));
  }, []);

  const handleOpenModal = useCallback((citation: Citation) => {
    setSelectedCitation(citation);
  }, []);

  const handleCloseModal = useCallback(() => {
    setSelectedCitation(null);
  }, []);

  return {
    messages,
    input,
    setInput,
    chatMode,
    isBotLoading,
    citations,
    openCitations,
    selectedCitation,
    toggleCitations,
    handleOpenModal,
    handleCloseModal,
    handleSendMessage,
    handleInputChange,
    handleFeedbackUpdate,
    isRestoringSession: isLoadingHistory,
    handleSelectSession,
    handleCreateNewSession,
    handleGoBackToIntro,
    messagesEndRef,
    textareaRef,
    currentSessionId: sessionId,
  };
};