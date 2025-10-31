import { useState, useCallback, useRef, useEffect } from "react";
import { useParams, useNavigate } from "react-router"; 
import type { ChatSession, ChatMessage, Citation, OpenCitationsState, ChatMode } from "../utils/types";


const dummySessions: ChatSession[] = [
  { id: 'session-123', agent_name: 'AI Assistant', created_at: new Date(Date.now() - 3600 * 1000).toISOString() },
  { id: 'session-456', agent_name: 'Customer Support Bot', created_at: new Date(Date.now() - 86400 * 1000 * 2).toISOString() },
  { id: 'session-123', agent_name: 'AI Assistant', created_at: new Date(Date.now() - 3600 * 1000).toISOString() },
  { id: 'session-456', agent_name: 'Customer Support Bot', created_at: new Date(Date.now() - 86400 * 1000 * 2).toISOString() },
  { id: 'session-123', agent_name: 'AI Assistant', created_at: new Date(Date.now() - 3600 * 1000).toISOString() },
  { id: 'session-456', agent_name: 'Customer Support Bot', created_at: new Date(Date.now() - 86400 * 1000 * 2).toISOString() },
  { id: 'session-123', agent_name: 'AI Assistant', created_at: new Date(Date.now() - 3600 * 1000).toISOString() },
  { id: 'session-456', agent_name: 'Customer Support Bot', created_at: new Date(Date.now() - 86400 * 1000 * 2).toISOString() },
  { id: 'session-123', agent_name: 'AI Assistant', created_at: new Date(Date.now() - 3600 * 1000).toISOString() },
  { id: 'session-456', agent_name: 'Customer Support Bot', created_at: new Date(Date.now() - 86400 * 1000 * 2).toISOString() },
  { id: 'session-123', agent_name: 'AI Assistant', created_at: new Date(Date.now() - 3600 * 1000).toISOString() },
  { id: 'session-456', agent_name: 'Customer Support Bot', created_at: new Date(Date.now() - 86400 * 1000 * 2).toISOString() },
  { id: 'session-123', agent_name: 'AI Assistant', created_at: new Date(Date.now() - 3600 * 1000).toISOString() },
  { id: 'session-456', agent_name: 'Customer Support Bot', created_at: new Date(Date.now() - 86400 * 1000 * 2).toISOString() },
  { id: 'session-123', agent_name: 'AI Assistant', created_at: new Date(Date.now() - 3600 * 1000).toISOString() },
  { id: 'session-456', agent_name: 'Customer Support Bot', created_at: new Date(Date.now() - 86400 * 1000 * 2).toISOString() },
  { id: 'session-123', agent_name: 'AI Assistant', created_at: new Date(Date.now() - 3600 * 1000).toISOString() },
  { id: 'session-456', agent_name: 'Customer Support Bot', created_at: new Date(Date.now() - 86400 * 1000 * 2).toISOString() },
  { id: 'session-123', agent_name: 'AI Assistant', created_at: new Date(Date.now() - 3600 * 1000).toISOString() },
  { id: 'session-456', agent_name: 'Customer Support Bot', created_at: new Date(Date.now() - 86400 * 1000 * 2).toISOString() },
];

const dummyMessages: Record<string, ChatMessage[]> = {
  'session-123': [
    { id: 'msg-1', sender: 'agent', text: 'Halo! Ada yang bisa saya bantu terkait sesi 123?' },
    { id: 'msg-2', sender: 'user', text: 'Ya, saya ingin bertanya tentang...' },
  ],
  'session-456': [
     { id: 'msg-3', sender: 'agent', text: 'Selamat datang di sesi 456. Silakan ajukan pertanyaan Anda.' },
  ],
  'new-session': [
     { id: 'msg-initial', sender: 'agent', text: `Halo User. Saya adalah AI Assistant dari Dokuprime. Ada yang bisa saya bantu?` },
  ]
};

const dummyCitations: Citation[] = [
  { messageId: 'msg-1', documentName: 'Panduan Pengguna V1.pdf', content: 'Untuk memulai, klik tombol "Start" di halaman utama...' },
  { messageId: 'msg-1', documentName: 'FAQ_Umum.pdf', content: 'Pertanyaan umum lainnya dapat ditemukan di bagian FAQ.' },
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
  const [selectedCitation, setSelectedCitation] = useState<Citation | null>(null);

  
  const [activeSessions, setActiveSessions] = useState<ChatSession[]>([]);
  const [isLoadingSessions, setIsLoadingSessions] = useState<boolean>(true); 
  const [isRestoringSession, setIsRestoringSession] = useState<boolean>(false);

  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  

  
   useEffect(() => {
    
    const timer = setTimeout(() => {
      setActiveSessions(dummySessions);
      setIsLoadingSessions(false);
    }, 1000); 
    return () => clearTimeout(timer);
  }, []);

  
  useEffect(() => {
    if (sessionId) {
      setIsRestoringSession(true);
      
      const timer = setTimeout(() => {
        const history = dummyMessages[sessionId] || dummyMessages['new-session'];
        setMessages(history);
        setCitations(sessionId === 'session-123' ? dummyCitations : []); 
        setChatMode("bot"); 
        setIsRestoringSession(false);
        
        setInput("");
        setOpenCitations({});
        setSelectedCitation(null);
      }, 500); 
       return () => clearTimeout(timer);
    }
  }, [sessionId]);


  
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isBotLoading]);

  

  
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    const textarea = e.target;
    textarea.style.height = 'auto'; 
    
    const maxHeight = 120; 
    textarea.style.height = `${Math.min(textarea.scrollHeight, maxHeight)}px`;
  }, []);

  
  const handleSendMessage = useCallback(() => {
    
    if (input.trim() === "" || isBotLoading) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: input,
    };
    setMessages((prev) => [...prev, userMessage]);
    const currentInput = input;
    setInput("");
    if (textareaRef.current) {
        textareaRef.current.style.height = 'auto'; 
    }


    
    setIsBotLoading(true);
    setTimeout(() => {
      const botMessageId = `bot-${Date.now()}`;
      const botMessage: ChatMessage = {
        id: botMessageId,
        sender: 'agent', 
        text: `Saya menerima pesan Anda: "${currentInput}". Ini adalah respons dummy.`,
      };
      setMessages((prev) => [...prev, botMessage]);

      
       // --- MODIFIKASI: Tambahkan dummy citation di sini ---
       const newCitation: Citation = {
         messageId: botMessageId,
         documentName: 'Dummy_Source_From_Hook.pdf',
         content: 'Ini adalah konten dari dokumen sumber tiruan yang ditambahkan dari dalam hook.'
       };
       setCitations(prev => [...prev, newCitation]);
       // --- AKHIR MODIFIKASI ---

      setIsBotLoading(false);
    }, 1500); 
  }, [input, isBotLoading]);

   
  const handleSelectSession = useCallback((session: ChatSession) => {
    setIsRestoringSession(true); 
    navigate(`/public-service/${session.id}`);
  }, [navigate]);

  
  const handleCreateNewSession = useCallback(() => {
     setIsRestoringSession(true); 
     
    const newSessionId = `new-${Date.now()}`;
    
    navigate(`/public-service/${newSessionId}`);
  }, [navigate]);

  
  const handleGoBackToIntro = useCallback(() => {
    navigate('/public-service');
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
    
    currentSessionId: sessionId
  };
};