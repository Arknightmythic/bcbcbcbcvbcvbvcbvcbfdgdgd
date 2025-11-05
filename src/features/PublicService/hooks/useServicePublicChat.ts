import { useState, useCallback, useRef, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import type {
  ChatSession,
  ChatMessage,
  Citation,
  OpenCitationsState,
  ChatMode,
} from "../utils/types";

const dummySessions: ChatSession[] = [
  {
    id: "session-123",
    agent_name: "AI Assistant",
    created_at: new Date(Date.now() - 3600 * 1000).toISOString(),
  },
  {
    id: "session-456",
    agent_name: "Customer Support Bot",
    created_at: new Date(Date.now() - 86400 * 1000 * 2).toISOString(),
  },
  {
    id: "session-123",
    agent_name: "AI Assistant",
    created_at: new Date(Date.now() - 3600 * 1000).toISOString(),
  },
  {
    id: "session-456",
    agent_name: "Customer Support Bot",
    created_at: new Date(Date.now() - 86400 * 1000 * 2).toISOString(),
  },
  {
    id: "session-123",
    agent_name: "AI Assistant",
    created_at: new Date(Date.now() - 3600 * 1000).toISOString(),
  },
  {
    id: "session-456",
    agent_name: "Customer Support Bot",
    created_at: new Date(Date.now() - 86400 * 1000 * 2).toISOString(),
  },
  {
    id: "session-123",
    agent_name: "AI Assistant",
    created_at: new Date(Date.now() - 3600 * 1000).toISOString(),
  },
  {
    id: "session-456",
    agent_name: "Customer Support Bot",
    created_at: new Date(Date.now() - 86400 * 1000 * 2).toISOString(),
  },
  {
    id: "session-123",
    agent_name: "AI Assistant",
    created_at: new Date(Date.now() - 3600 * 1000).toISOString(),
  },
  {
    id: "session-456",
    agent_name: "Customer Support Bot",
    created_at: new Date(Date.now() - 86400 * 1000 * 2).toISOString(),
  },
  {
    id: "session-123",
    agent_name: "AI Assistant",
    created_at: new Date(Date.now() - 3600 * 1000).toISOString(),
  },
  {
    id: "session-456",
    agent_name: "Customer Support Bot",
    created_at: new Date(Date.now() - 86400 * 1000 * 2).toISOString(),
  },
  {
    id: "session-123",
    agent_name: "AI Assistant",
    created_at: new Date(Date.now() - 3600 * 1000).toISOString(),
  },
  {
    id: "session-456",
    agent_name: "Customer Support Bot",
    created_at: new Date(Date.now() - 86400 * 1000 * 2).toISOString(),
  },
  {
    id: "session-123",
    agent_name: "AI Assistant",
    created_at: new Date(Date.now() - 3600 * 1000).toISOString(),
  },
  {
    id: "session-456",
    agent_name: "Customer Support Bot",
    created_at: new Date(Date.now() - 86400 * 1000 * 2).toISOString(),
  },
  {
    id: "session-123",
    agent_name: "AI Assistant",
    created_at: new Date(Date.now() - 3600 * 1000).toISOString(),
  },
  {
    id: "session-456",
    agent_name: "Customer Support Bot",
    created_at: new Date(Date.now() - 86400 * 1000 * 2).toISOString(),
  },
  {
    id: "session-123",
    agent_name: "AI Assistant",
    created_at: new Date(Date.now() - 3600 * 1000).toISOString(),
  },
  {
    id: "session-456",
    agent_name: "Customer Support Bot",
    created_at: new Date(Date.now() - 86400 * 1000 * 2).toISOString(),
  },
];

// <-- MODIFIKASI DIMULAI: Menggunakan 'system' untuk pesan intro -->
const dummyMessages: Record<string, ChatMessage[]> = {
  "session-123": [
    {
      id: "msg-1",
      sender: "user",
      text: "sebuah perusahaan asing (pma) ingin membuka pabrik perakitan laptop dengan nilai investasi Rp 8 miliar di luar tanah dan bangunan. apakah investasi ini memenuhi kebutuhan minimum bkpm?",
    },
    {
      id: "msg-2",
      sender: "agent", // 'agent' karena ini balasan AI dan punya citation
      text: 'Saya menerima pesan Anda: "sebuah perusahaan asing (pma) ingin membuka pabrik perakitan laptop dengan nilai investasi Rp 8 miliar di luar tanah dan bangunan. apakah investasi ini memenuhi kebutuhan minimum bkpm?". Ini adalah respons dummy.',
    },
  ],
  "session-456": [
    {
      id: "msg-3",
      sender: "system", // 'system' untuk intro, tidak akan ada tombol
      text: "Selamat datang di sesi 456. Silakan ajukan pertanyaan Anda.",
    },
  ],
  "new-session": [
    {
      id: "msg-initial",
      sender: "system", // 'system' untuk intro, tidak akan ada tombol
      text: `Halo! Selamat Datang di layanan pelanggan Dokuprime. Ada yang bisa saya bantu?`,
    },
  ],
};
// <-- MODIFIKASI SELESAI -->

const dummyCitations: Citation[] = [
  {
    messageId: "msg-2", // Terhubung ke pesan 'agent' di session-123
    documentName: "Peraturan_BKPM_No_4_Tahun_2021.pdf",
    content:
      "Berdasarkan Peraturan BKPM No. 4 Tahun 2021 tentang Pedoman dan Tata Cara Pelayanan Perizinan Berusaha Berbasis Risiko, nilai investasi minimum untuk Penanaman Modal Asing (PMA) adalah lebih besar dari Rp 10.000.000.000 (sepuluh miliar Rupiah) di luar nilai tanah dan bangunan per 5-digit KBLI.",
  },
  {
    messageId: "msg-2", // Terhubung ke pesan 'agent' di session-123
    documentName: "FAQ_Investasi_PMA.pdf",
    content:
      "Pertanyaan: Berapa minimum investasi untuk PMA? Jawaban: Untuk PMA, total nilai investasi wajib lebih besar dari Rp 10 Miliar (di luar tanah dan bangunan). Investasi senilai Rp 8 Miliar belum memenuhi syarat minimum sebagai PMA dan mungkin dapat dipertimbangkan sebagai Penanaman Modal Dalam Negeri (PMDN) jika memenuhi kriteria lain.",
  },
];

export const usePublicServiceChat = () => {
  const navigate = useNavigate();
  const { sessionId } = useParams<{ sessionId: string }>();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState<string>("");
  const [chatMode, setChatMode] = useState<ChatMode>("bot");
  const [isBotLoading, setIsBotLoading] = useState<boolean>(false);
  const [citations, setCitations] = useState<Citation[]>([]);
  const [openCitations, setOpenCitations] = useState<OpenCitationsState>({});
  const [selectedCitation, setSelectedCitation] = useState<Citation | null>(
    null
  );

  const [activeSessions, setActiveSessions] =
    useState<ChatSession[]>(dummySessions);
  const [isLoadingSessions, setIsLoadingSessions] = useState<boolean>(true);
  const [isRestoringSession, setIsRestoringSession] = useState<boolean>(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoadingSessions(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (sessionId) {
      setIsRestoringSession(true);

      const timer = setTimeout(() => {
        // Logika ini sekarang akan memuat pesan 'system' atau 'agent' dengan benar
        const history =
          dummyMessages[sessionId] || dummyMessages["new-session"];
        setMessages(history);
        
        setCitations(sessionId === "session-123" ? dummyCitations : []);
        setChatMode("bot");
        setIsRestoringSession(false);

        setInput("");
        setOpenCitations({});
        setSelectedCitation(null);
      }, 500);
      return () => clearTimeout(timer);
    } else {
       // Pastikan state bersih saat tidak ada sessionId
       setMessages([]);
       setCitations([]);
       setInput("");
       setOpenCitations({});
       setSelectedCitation(null);
       setChatMode("bot");
    }
  }, [sessionId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isBotLoading]);

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

  const handleSendMessage = useCallback(() => {
    if (input.trim() === "" || isBotLoading) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: "user",
      text: input,
    };
    setMessages((prev) => [...prev, userMessage]);
    const currentInput = input;
    setInput("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }

    setIsBotLoading(true);
    setTimeout(() => {
      const botMessageId = `bot-${Date.now()}`;
      const botMessage: ChatMessage = {
        id: botMessageId,
        sender: "agent", // Balasan dinamis akan selalu 'agent' agar punya tombol
        text: `Saya menerima pesan Anda: "${currentInput}". Ini adalah respons dummy.`,
      };
      setMessages((prev) => [...prev, botMessage]);

      const newCitation: Citation = {
        messageId: botMessageId,
        documentName: "Pedoman_Investasi_Dasar.pdf",
        content:
          'Dokumen ini berisi informasi dasar mengenai prosedur investasi. Jawaban spesifik akan diproses oleh sistem kami berdasarkan dokumen yang relevan dengan pertanyaan Anda: "' + currentInput + '"',
      };
      setCitations((prev) => [...prev, newCitation]);

      setIsBotLoading(false);
    }, 1500);
  }, [input, isBotLoading]);

  const handleSelectSession = useCallback(
    (session: ChatSession) => {
      setIsRestoringSession(true);
      navigate(`/public-service/${session.id}`);
    },
    [navigate]
  );

  const handleCreateNewSession = useCallback(() => {
    setIsRestoringSession(true);
    const newSessionId = `new-${Date.now()}`;
    navigate(`/public-service/${newSessionId}`);
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

    activeSessions,
    isLoadingSessions,
    isRestoringSession,
    handleSelectSession,
    handleCreateNewSession,
    handleGoBackToIntro,

    messagesEndRef,
    textareaRef,

    currentSessionId: sessionId,
  };
};