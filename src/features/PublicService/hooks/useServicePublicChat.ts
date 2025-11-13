// [GANTI: src/features/PublicService/hooks/useServicePublicChat.ts]

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

/**
 * Helper function untuk memetakan riwayat chat dari backend
 * ke struktur ChatMessage yang digunakan oleh UI.
 */
const mapBackendHistoryToFrontend = (
  history: BackendChatHistory[] // Tipe ini di types.ts mungkin tidak sesuai dengan JSON asli
): ChatMessage[] => {
  // --- PERBAIKAN DI SINI ---
  // Gunakan 'any' untuk 'msg' agar kita bisa mengakses struktur JSON
  // yang benar (message.data.content dan message.type)
  // yang berbeda dari definisi tipe BackendChatHistory
  return (history || []).map((msg: any) => ({
    id: msg.id.toString(),
    // Ganti 'msg.message.role' -> 'msg.message.type'
    // Ganti 'user'/'assistant' -> 'human'/'ai'
    sender: msg.message.type === "human" ? "user" : "agent",
    // Ganti 'msg.message.content' -> 'msg.message.data.content'
    text: msg.message.data.content,
    timestamp: msg.created_at,
    feedback: msg.feedback === null ? null : msg.feedback ? "like" : "dislike",
    // --- TAMBAHAN: Muat status 'is_answered' dari riwayat ---
    is_answered: msg.is_cannot_answer === null ? null : !msg.is_cannot_answer,
  }));
  // --- AKHIR PERBAIKAN ---
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

  // State Inti
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState<string>("");
  const [chatMode, setChatMode] = useState<ChatMode>("bot");
  const [citations, setCitations] = useState<Citation[]>([]);
  const [isHistoryLoaded, setIsHistoryLoaded] = useState(false);

  // State UI
  const [openCitations, setOpenCitations] = useState<OpenCitationsState>({});
  const [selectedCitation, setSelectedCitation] = useState<Citation | null>(
    null
  );
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // --- LOGIKA Data Fetching (Flow 2: Membuka chat lama) ---
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

  // Effect untuk memuat riwayat setelah fetch berhasil
  useEffect(() => {
    if (historyData) {
      const mappedHistory = mapBackendHistoryToFrontend(
        historyData.chat_history || []
      );
      setMessages(mappedHistory);
      // (Sitasi dari riwayat belum didukung, jadi kita set kosong)
      setCitations([]); 
      setIsHistoryLoaded(true);
    }
  }, [historyData]);

  // Effect untuk error (Tidak berubah)
  useEffect(() => {
    if (isHistoryError && historyError) {
      toast.error(`Gagal memuat riwayat: ${(historyError as Error).message}`);
      setIsHistoryLoaded(true);
    }
  }, [isHistoryError, historyError]);

  // --- LOGIKA Inisialisasi Sesi Baru (Flow 1: URL /new) ---
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

  // --- LOGIKA Data Mutation (Mengirim pesan) ---
  const { mutate: performAsk, isPending: isBotLoading } = useMutation({
    mutationFn: askQuestion,
    onSuccess: (data: AskResponse) => {
      const botMessageId = `bot-${Date.now()}`;
      const botMessage: ChatMessage = {
        id: botMessageId,
        sender: "agent",
        text: data.answer,
        timestamp: new Date().toISOString(),
        feedback: null,
        // --- TAMBAHAN BARU: Simpan status 'is_answered' ---
        is_answered: data.is_answered,
        // ------------------------------------------------
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
      const errorMsg =
        err.response?.data?.message ||
        "Gagal mengirim pesan. Silakan coba lagi.";
      toast.error(errorMsg);
      setMessages((prev) => prev.slice(0, -1));
    },
  });

  // --- Handlers ---
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

  // Handlers UI (Tidak berubah)
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

    isRestoringSession: isLoadingHistory,
    handleSelectSession,
    handleCreateNewSession,
    handleGoBackToIntro,

    messagesEndRef,
    textareaRef,

    currentSessionId: sessionId,
  };
};