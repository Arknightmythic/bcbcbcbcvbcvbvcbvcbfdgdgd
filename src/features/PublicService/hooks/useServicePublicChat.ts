

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
  AskResponse,
  ChatSession,
} from "../utils/types";
import {
  askQuestion,
  getConversationById,
  sendFeedback,     
  generateViewUrlByDocId,  
} from "../api/chatApi";
import { getWebSocketService } from "../../../shared/utils/WebsocketService";


const cleanText = (text: string): string => {
  if (!text) return "";
  let cleaned = text.replace(/^None\s*/i, "");
  return cleaned.trim();
};

const extractMessageContent = (msg: any): string => {
  let text = "";
  if (msg.message.data?.content) {
    text = msg.message.data.content;
  } else if (msg.message.content) {
    text = msg.message.content;
  }
  return cleanText(text);
};


const determineSender = (msg: any): "user" | "agent" => {
  if (
    msg.message.type === "human" || 
    msg.message.data?.type === "human" || 
    msg.message.role === "user"
  ) {
    return "user";
  }
  
  return "agent";
};


const checkIsHumanAgent = (sender: string, msg: any): boolean => {
  if (sender !== "agent") return false;

  const data = msg.message.data || {};
  const responseMetadata = data.response_metadata || {};
  
  
  return Object.keys(responseMetadata).length === 0 && !responseMetadata.model;
};


const mapBackendHistoryToFrontend = (
  history: BackendChatHistory[] 
): ChatMessage[] => {
  if (!history) return [];

  return history
    .map((msg: any) => {
      const text = extractMessageContent(msg);
      if (!text) return null;
      
      const sender = determineSender(msg);
      const isHumanAgent = checkIsHumanAgent(sender, msg);
      const messageId = `${sender}-${msg.id}`;
      
      const chatMessage: ChatMessage = {
        id: messageId,
        dbId: msg.id, 
        sender: sender,
        text: text,
        timestamp: msg.created_at,
        feedback: msg.feedback === true ? "like" : msg.feedback === false ? "dislike" : null,
        is_answered: msg.is_cannot_answer === null ? null : !msg.is_cannot_answer,
        isHumanAgent: isHumanAgent, 
      };
      
      return chatMessage;
    })
    .filter((msg): msg is ChatMessage => msg !== null);
};

const mapAskResponseToCitations = (
  data: AskResponse, 
  botMessageId: string
): Citation[] => {
  if (!data.citations || data.citations.length === 0) {
    return [];
  }
  
  return data.citations.map((citeArray) => {
    
    
    const fileId = Array.isArray(citeArray) ? citeArray[0] : "";
    const fileName = Array.isArray(citeArray) ? citeArray[1] : (citeArray as string);

    return {
      messageId: botMessageId,
      fileId: fileId,       
      documentName: fileName,
      content: "", 
    };
  });
};

const addMessageOrdered = (prevMessages: ChatMessage[], newMessage: ChatMessage): ChatMessage[] => {
  
  if (prevMessages.some((m) => m.id === newMessage.id)) return prevMessages;

  let finalTimestamp = new Date(newMessage.timestamp || new Date()).getTime();
  
  
  if (prevMessages.length > 0) {
    const lastMsg = prevMessages[prevMessages.length - 1];
    const lastTime = new Date(lastMsg.timestamp || 0).getTime();
    if (finalTimestamp <= lastTime) {
      finalTimestamp = lastTime + 1;
    }
  }

  const adjustedMessage = { 
    ...newMessage, 
    timestamp: new Date(finalTimestamp).toISOString() 
  };
  
  const updated = [...prevMessages, adjustedMessage];
  return updated.sort((a, b) => new Date(a.timestamp || 0).getTime() - new Date(b.timestamp || 0).getTime());
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

  
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [pdfTitle, setPdfTitle] = useState<string>("");
  const [isLoadingPdf, setIsLoadingPdf] = useState(false);
  

  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const processedMessageIdsRef = useRef<Set<string>>(new Set());
  const loadingToastRef = useRef<string | null>(null);
  const loadingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  
  const wsService = useRef(getWebSocketService());
  const unsubscribeRef = useRef<(() => void) | null>(null);
  const currentConversationIdRef = useRef<string | null>(null);
  const wsEnabledRef = useRef(false);

  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const hasLoadedHistoryRef = useRef(false);

  
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
    if (!wsEnabledRef.current || !sessionId || sessionId === "new") return;

    if (unsubscribeRef.current) {
      unsubscribeRef.current();
      unsubscribeRef.current = null;
    }

    if (!wsService.current.isConnected()) return;

    currentConversationIdRef.current = sessionId;

    // --- Helper 1: Handle Standard Answer ---
    const handleWsAnswer = (data: any) => {
      const botMessageId = `agent-${data.chat_history_id}`;
      
      if (processedMessageIdsRef.current.has(botMessageId)) return;
      processedMessageIdsRef.current.add(botMessageId);
      
      const cleanedAnswer = cleanText(data.answer);
      if (!cleanedAnswer) return;
      
      const botMessage: ChatMessage = {
        id: botMessageId,
        dbId: data.answer_id, 
        sender: "agent",
        text: cleanedAnswer,
        timestamp: new Date().toISOString(),
        feedback: null,
        is_answered: data.is_answered,
      };
      
      setMessages((prev) => addMessageOrdered(prev, botMessage));
    };

    // --- Helper 2: Handle Agent Message ---
    const handleWsAgentMessage = (data: any) => {
      const agentMessageId = data.chat_history_id 
        ? `agent-${data.chat_history_id}` 
        : `agent-ws-${Date.now()}`;
      
      if (processedMessageIdsRef.current.has(agentMessageId)) return;
      processedMessageIdsRef.current.add(agentMessageId);
      
      const cleanedMessage = cleanText(data.message);
      if (!cleanedMessage) return;
      
      const agentMessage: ChatMessage = {
        id: agentMessageId,
        dbId: data.chat_history_id,
        sender: "agent",
        text: cleanedMessage,
        timestamp: data.timestamp 
          ? new Date(data.timestamp * 1000).toISOString() 
          : new Date().toISOString(),
        feedback: null,
        isHumanAgent: true,
      };
      
      setMessages((prev) => addMessageOrdered(prev, agentMessage));
    };

    // --- Main Callback (Simplified) ---
    const unsubscribe = wsService.current.onMessage(sessionId, (data) => {
      console.log('📨 WebSocket message received:', data);
      
      if (data.answer && data.chat_history_id) {
        handleWsAnswer(data);
      } else if (data.user_type === 'agent' && data.message) {
        handleWsAgentMessage(data);
      }
    });

    unsubscribeRef.current = unsubscribe;
    wsService.current.subscribe(sessionId, '$');

    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
    };
  }, [sessionId, wsEnabledRef.current]);

  
  useEffect(() => {
    if (historyData && !hasLoadedHistoryRef.current && sessionId !== "new") {
      processedMessageIdsRef.current.clear();
      
      const mappedHistory = mapBackendHistoryToFrontend(
        historyData.chat_history || []
      );
      
      
      const uniqueMessages = Array.from(
        new Map(mappedHistory.map(msg => [msg.id, msg])).values()
      );
      
      const sortedMessages = uniqueMessages.sort((a, b) => {
        return new Date(a.timestamp || 0).getTime() - new Date(b.timestamp || 0).getTime();
      });
      
      sortedMessages.forEach(msg => {
        processedMessageIdsRef.current.add(msg.id);
      });
      
      setMessages(sortedMessages);
      setCitations([]); 
      setIsHistoryLoaded(true);
      hasLoadedHistoryRef.current = true;
      
      setTimeout(() => {
        setIsInitialLoad(false);
        wsEnabledRef.current = true;
      }, 500);
    }
  }, [historyData, sessionId]);

  
  useEffect(() => {
    if (sessionId === "new") {
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
    }
  }, [sessionId, isHistoryLoaded]);

  
  const showLoadingToast = () => {
    loadingTimerRef.current = setTimeout(() => {
      loadingToastRef.current = toast.loading(
        "AI sedang memproses, mohon tunggu beberapa saat lagi...",
        {
          duration: Infinity,
          style: { background: '#3B82F6', color: '#fff' },
          iconTheme: { primary: '#fff', secondary: '#3B82F6' },
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

  useEffect(() => {
    return () => hideLoadingToast();
  }, []);

  
  const { mutate: performAsk, isPending: isBotLoading } = useMutation({
    mutationFn: askQuestion,
    onMutate: () => {
      showLoadingToast();
    },
    onSuccess: async (data: AskResponse) => {
      hideLoadingToast();
      
      
      if (data.is_helpdesk && !data.answer) {
        if (sessionId === "new") {
          wsEnabledRef.current = true;
          navigate(`/public-service/${data.conversation_id}`, { replace: true });
        } else {
          wsEnabledRef.current = true;
        }
        queryClient.invalidateQueries({ queryKey: ["conversations"] });
        return;
      }
      
      const cleanedAnswer = cleanText(data.answer);
      if (!cleanedAnswer) return;
      
      
      const botMessageId = `agent-api-${data.answer_id}`;
      processedMessageIdsRef.current.add(botMessageId);
      
      const botMessage: ChatMessage = {
        id: botMessageId,
        dbId: data.answer_id, 
        sender: "agent",
        text: cleanedAnswer,
        timestamp: new Date().toISOString(),
        feedback: null,
        is_answered: data.is_answered,
      };
      
      setMessages((prev) => addMessageOrdered(prev, botMessage));
      
      
      const newCitations = mapAskResponseToCitations(data, botMessageId);
      setCitations((prev) => [...prev, ...newCitations]);

      if (sessionId === "new") {
        wsEnabledRef.current = true;
        navigate(`/public-service/${data.conversation_id}`, { replace: true });
      } else {
        wsEnabledRef.current = true;
      }

      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
    onError: (err: any) => {
      hideLoadingToast();
      toast.error(err.response?.data?.message || "Gagal mengirim pesan.");
      setMessages((prev) => prev.slice(0, -1)); 
    },
  });

  
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
    
    setMessages((prev) => {
      const messagesWithoutSystem = prev.filter((msg) => msg.sender !== "system");
      return addMessageOrdered(messagesWithoutSystem, userMessage);
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

  
  const handleFeedbackUpdate = useCallback(async (messageId: string, feedback: 'like' | 'dislike' | null) => {
    
    const targetMsg = messages.find(m => m.id === messageId);
    
    if (!targetMsg || !targetMsg.dbId) {
      console.warn("Cannot send feedback: Message DB ID missing");
      return;
    }

    
    setMessages(prevMessages => 
      prevMessages.map(msg => 
        msg.id === messageId ? { ...msg, feedback: feedback } : msg
      )
    );

    
    if (feedback !== null) {
      try {
        const isLike = feedback === 'like';
        await sendFeedback(targetMsg.dbId, isLike);
        
        if (isLike) {
          
          toast.success("Terima kasih! Kami senang ini membantu.");
        } else {
          
          toast.success("Terima kasih! Masukan Anda membantu kami untuk perbaikan."); 
        }
      } catch (error) {
        console.error("Feedback error:", error);
        toast.error("Gagal mengirim feedback");
        
      }
    }
  }, [messages]); 

  
  const handleOpenCitation = useCallback(async (citation: Citation) => {
    if (!citation.fileId) {
      toast.error("ID Dokumen tidak ditemukan");
      return;
    }

    setIsPdfModalOpen(true);
    setPdfTitle(citation.documentName);
    setPdfUrl(null); 
    setIsLoadingPdf(true);

    try {
      const url = await generateViewUrlByDocId(parseInt(citation.fileId));
      setPdfUrl(url);
    } catch (error) {
      console.error("Error fetching PDF URL:", error);
      toast.error("Gagal membuka dokumen");
      setIsPdfModalOpen(false);
    } finally {
      setIsLoadingPdf(false);
    }
  }, []);

  const handleClosePdfModal = useCallback(() => {
    setIsPdfModalOpen(false);
    setPdfUrl(null);
  }, []);

  
  const toggleCitations = useCallback((messageId: string) => {
    setOpenCitations((prev) => ({ ...prev, [messageId]: !prev[messageId] }));
  }, []);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    const textarea = e.target;
    textarea.style.height = "auto";
    const maxHeight = 120;
    textarea.style.height = `${Math.min(textarea.scrollHeight, maxHeight)}px`;
  }, []);

  const handleSelectSession = useCallback((session: ChatSession) => {
    setIsHistoryLoaded(false);
    hasLoadedHistoryRef.current = false;
    wsEnabledRef.current = false;
    navigate(`/public-service/${session.id}`);
  }, [navigate]);

  const handleCreateNewSession = useCallback(() => {
    setIsHistoryLoaded(false);
    hasLoadedHistoryRef.current = false;
    wsEnabledRef.current = false;
    setMessages([]);
    navigate("/public-service/new");
  }, [navigate]);

  const handleGoBackToIntro = useCallback(() => {
    navigate("/public-service");
  }, [navigate]);

  
  return {
    messages,
    input,
    setInput,
    chatMode,
    isBotLoading,
    citations,
    openCitations,
    toggleCitations,
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
    
    isPdfModalOpen,
    pdfUrl,
    pdfTitle,
    isLoadingPdf,
    handleOpenCitation,   
    handleClosePdfModal,
  };
};