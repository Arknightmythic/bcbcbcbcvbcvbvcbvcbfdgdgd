import { useState, useCallback, useRef, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { useAuthStore } from "../../../shared/store/authStore";

import type {
  ChatMessage,
  Citation,
  OpenCitationsState,
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
  if (msg.message?.type === 'ai' || msg.message?.data?.type === 'ai') {
    return false;
  }
  const data = msg.message.data || {};
  const responseMetadata = data.response_metadata || {};
  return Object.keys(responseMetadata).length === 0 && !responseMetadata.model;
};


const mapBackendHistoryToFrontend = (history: BackendChatHistory[]): ChatMessage[] => {
  if (!history) return [];

  return history
    .map((msg: any, index: number) => { // Tambahkan parameter index
      const text = extractMessageContent(msg);
      if (!text) return null;
      
      const sender = determineSender(msg);
      // Gunakan fix deteksi human agent yang sudah kita bahas sebelumnya
      const isHumanAgent = checkIsHumanAgent(sender, msg); 
      const messageId = `${sender}-${msg.id}`;

      // --- LOGIKA BARU UNTUK KATEGORI ---
      let hasCategory = false;

      if (sender === "agent") {
        // Cek pesan sebelumnya (index - 1)
        // Apakah pesan sebelumnya dari User DAN memiliki kategori?
        if (index > 0) {
          const prevMsg = history[index - 1];
          const prevIsUser = prevMsg.message?.type === 'human' || prevMsg.message?.data?.type === 'human';
          
          // Cek field 'category' atau 'question_category' pada pesan user sebelumnya
          // Data JSON Anda menunjukkan field ada di root object history (prevMsg.category)
          if (prevIsUser && (prevMsg.category || prevMsg.question_category)) {
            hasCategory = true;
          }
        }
      }
      // ------------------------------------

      let feedbackStatus: "like" | "dislike" | null = null;
      if (msg.feedback === true) feedbackStatus = "like";
      else if (msg.feedback === false) feedbackStatus = "dislike";

      const chatMessage: ChatMessage = {
        id: messageId,
        dbId: msg.id,
        sender: sender,
        text: text,
        timestamp: msg.created_at,
        feedback: feedbackStatus,
        is_answered: msg.is_cannot_answer === null ? null : !msg.is_cannot_answer,
        isHumanAgent: isHumanAgent,
        isHelpdesk: false, // Set false default agar tidak memblokir feedback (kita filter pakai hasCategory nanti)
        questionId: msg.id,
        answerId: msg.id,
        
        hasCategory: hasCategory, // <--- Masukkan hasil cek tadi
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
    
    const lastMsg = prevMessages.at(-1);
    
    
    if (lastMsg) {
      const lastTime = new Date(lastMsg.timestamp || 0).getTime();
      if (finalTimestamp <= lastTime) {
        finalTimestamp = lastTime + 1;
      }
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

  const hasLoadedHistoryRef = useRef(false);

  
  const {
    data: historyData,
    isLoading: isLoadingHistory,
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

    const ws = wsService.current;
    
    
    let isMounted = true; 

    const initWebSocketSubscription = async () => {
      try {
        
        if (!ws.isConnected()) {
          
          await ws.connect();
        }
        
        if (!isMounted) return;

        currentConversationIdRef.current = sessionId;

        const handleWsAnswer = (data: any) => {
          const botMessageId = `agent-api-${data.answer_id}`; 
          
          const historyMsgId = `agent-${data.answer_id}`;
          const finalId = data.answer_id ? botMessageId : `agent-${data.chat_history_id}`;

          if (processedMessageIdsRef.current.has(finalId) || processedMessageIdsRef.current.has(historyMsgId)) {
            return;
          }
          
          processedMessageIdsRef.current.add(finalId);
          
          const cleanedAnswer = cleanText(data.answer);
          if (!cleanedAnswer) return;
          
          const botMessage: ChatMessage = {
            id: finalId,
            dbId: data.answer_id, 
            sender: "agent",
            text: cleanedAnswer,
            timestamp: new Date().toISOString(),
            feedback: null,
            is_answered: data.is_answered,
            isHelpdesk: false, 
            questionId: data.question_id,
            answerId: data.answer_id,
          };
          
          setMessages((prev) => addMessageOrdered(prev, botMessage));
        };

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

        
        if (unsubscribeRef.current) {
          unsubscribeRef.current();
        }

        
        const unsubscribe = ws.onMessage(sessionId, (data) => {
          
          
          if (data.answer && (data.chat_history_id || data.answer_id)) {
            handleWsAnswer(data);
          } else if (data.user_type === 'agent' && data.message) {
            handleWsAgentMessage(data);
          }
        });

        unsubscribeRef.current = unsubscribe;

        
        ws.subscribe(sessionId, '$');
        

      } catch (error) {
        console.error("[User] ❌ WebSocket subscription failed:", error);
      }
    };

    initWebSocketSubscription();

    
    return () => {
      isMounted = false;
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
      
      
      uniqueMessages.sort((a, b) => {
        return new Date(a.timestamp || 0).getTime() - new Date(b.timestamp || 0).getTime();
      });

      const sortedMessages = uniqueMessages;
      
      
      for (const msg of sortedMessages) {
        processedMessageIdsRef.current.add(msg.id);
      }
      
      setMessages(sortedMessages);
      setCitations([]); 
      setIsHistoryLoaded(true);
      hasLoadedHistoryRef.current = true;
      
      setTimeout(() => {
        wsEnabledRef.current = true;
      }, 500);
    }
  }, [historyData, sessionId]);

  
  useEffect(() => {
    if (sessionId === "new") {
      processedMessageIdsRef.current.clear();
      hasLoadedHistoryRef.current = false;
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
          text: "Halo! Selamat Datang di layanan pelanggan DokumenAI. Ada yang bisa saya bantu?",
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
      
      
      const isGenericResponse = data.answer_id === 0;
      const botMessageId = isGenericResponse 
        ? `agent-api-gen-${Date.now()}` 
        : `agent-api-${data.answer_id}`;

      
      const historyMsgId = `agent-${data.answer_id}`;

      
      if (processedMessageIdsRef.current.has(botMessageId) || (!isGenericResponse && processedMessageIdsRef.current.has(historyMsgId))) {
        return; 
      }
      processedMessageIdsRef.current.add(botMessageId);
      const hasCategory = !!(data.category || (data.question_category && data.question_category.length > 0));
      const botMessage: ChatMessage = {
        id: botMessageId,
        dbId: data.answer_id, 
        sender: "agent",
        text: cleanedAnswer,
        timestamp: new Date().toISOString(),
        feedback: null,
        is_answered: data.is_answered,
        isHelpdesk: data.is_helpdesk,
        questionId: data.question_id,
        answerId: data.answer_id,
        hasCategory: hasCategory,
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
    onError: () => {
      hideLoadingToast();
      toast.error("Gagal mengirim pesan.");
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
    
    
    if (!targetMsg?.dbId) {
      console.warn("Cannot send feedback: Message DB ID missing");
      return;
    }

    const previousFeedback = targetMsg.feedback;
    setMessages(prevMessages => 
      prevMessages.map(msg => 
        msg.id === messageId ? { ...msg, feedback: feedback } : msg
      )
    );
    let booleanToSend: boolean;

    
    if (feedback !== null) {
      booleanToSend = feedback === 'like';
    } else if (previousFeedback === 'like') {
       booleanToSend = true; 
    } else if (previousFeedback === 'dislike') {
       booleanToSend = false; 
    } else {
       return; 
    }

    try {
      
      await sendFeedback(targetMsg.dbId, booleanToSend);
      
      
      if (feedback === 'like') {
        toast.success("Terima kasih! Kami senang ini membantu.");
      } else if (feedback === 'dislike') {
        toast.success("Terima kasih! Masukan Anda membantu kami untuk perbaikan."); 
      }
      
    } catch (error) {
      console.error("Feedback error:", error);
      toast.error("Gagal mengirim feedback");
      setMessages(prevMessages => 
        prevMessages.map(msg => 
          msg.id === messageId ? { ...msg, feedback: previousFeedback } : msg
        )
      );
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
      
      const url = await generateViewUrlByDocId(Number.parseInt(citation.fileId));
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