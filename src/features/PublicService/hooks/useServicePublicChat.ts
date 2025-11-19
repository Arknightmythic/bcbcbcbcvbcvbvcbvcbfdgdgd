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


const mapBackendHistoryToFrontend = (
  history: BackendChatHistory[] 
): ChatMessage[] => {
  
  return (history || []).map((msg: any) => ({
    id: msg.id.toString(),
  
    sender: msg.message.type === "human" ? "user" : "agent",
    text: msg.message.data.content,
    timestamp: msg.created_at,
        
    feedback: msg.feedback === true ? "like" : msg.feedback === false ? "dislike" : null,
    
    is_answered: msg.is_cannot_answer === null ? null : !msg.is_cannot_answer,
  }));
  
};
/**
 * Helper function untuk memetakan respons API 'ask'
 * ke tipe Citation yang digunakan oleh UI.
 */
const mapAskResponseToCitations = (
  data: AskResponse,
  botMessageId: string
): Citation[] => {
  if (!data.citations || data.citations.length === 0) {
    return [];
  }
  return data.citations.map((docName) => ({
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
  const [selectedCitation, setSelectedCitation] = useState<Citation | null>(
    null
  );
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const loadingToastRef = useRef<string | null>(null);
  const loadingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  
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
    if (historyData) {
      const mappedHistory = mapBackendHistoryToFrontend(
        historyData.chat_history || []
      );
      setMessages(mappedHistory);
      
      setCitations([]); 
      setIsHistoryLoaded(true);
    }
  }, [historyData]);

  
  useEffect(() => {
    if (isHistoryError && historyError) {
      toast.error(`Gagal memuat riwayat: ${(historyError as Error).message}`);
      setIsHistoryLoaded(true);
    }
  }, [isHistoryError, historyError]);

  
  useEffect(() => {
    if (sessionId === "new" && !isHistoryLoaded) {
      setMessages([
        {
          id: "msg-initial",
          sender: "system",
          text: "Halo! Selamat Datang di layanan pelanggan Dokuprime. Ada yang bisa saya bantu?",
        },
      ]);
      setIsHistoryLoaded(true);
      setCitations([]);
      setInput("");
    }
  }, [sessionId, isHistoryLoaded]);

   // --- TAMBAHAN BARU: Fungsi untuk show/hide toast loading ---
  const showLoadingToast = () => {
    // Set timer untuk menampilkan toast setelah 30 detik
    loadingTimerRef.current = setTimeout(() => {
      loadingToastRef.current = toast.loading(
        "AI sedang memproses, mohon tunggu beberapa saat lagi...",
        {
          duration: Infinity, // Toast tidak hilang otomatis
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
    // Clear timer jika belum 30 detik
    if (loadingTimerRef.current) {
      clearTimeout(loadingTimerRef.current);
      loadingTimerRef.current = null;
    }
    
    // Dismiss toast jika sudah muncul
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
    onSuccess: (data: AskResponse) => {
      hideLoadingToast();
      const botMessageId = `bot-${Date.now()}`;
      const botMessage: ChatMessage = {
        id: botMessageId,
        sender: "agent",
        text: data.answer,
        timestamp: new Date().toISOString(),
        feedback: null,
        
        is_answered: data.is_answered,
        
      };
      setMessages((prev) => [...prev, botMessage]);

      const newCitations = mapAskResponseToCitations(data, botMessageId);
      setCitations((prev) => [...prev, ...newCitations]);

      if (sessionId === "new") {
        navigate(`/public-service/${data.conversation_id}`, { replace: true });
      }

      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
    onError: (err: any) => {
      hideLoadingToast();
      const errorMsg =
        err.response?.data?.message ||
        "Gagal mengirim pesan. Silakan coba lagi.";
      toast.error(errorMsg);
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

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: "user",
      text: input,
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMessage]);

    const payload: AskPayload = {
      query: input,
      platform: "web",
      platform_unique_id: user?.email || "anonymous_user",
      conversation_id: (sessionId === "new" ? "" : sessionId) || "",
    };

    performAsk(payload);

    setInput("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  }, [input, isBotLoading, user, sessionId, performAsk, navigate, queryClient]);

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
      setIsHistoryLoaded(false);
      navigate(`/public-service/${session.id}`);
    },
    [navigate]
  );

  const handleCreateNewSession = useCallback(() => {
    setIsHistoryLoaded(false);
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