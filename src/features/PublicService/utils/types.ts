// Tipe ini digunakan oleh UI
export interface ChatMessage {
  id: string; // ID unik untuk key React (misal: "agent-123")
  dbId?: number; // ID asli dari database (question_id atau answer_id) untuk keperluan API
  sender: "user" | "agent" | "system";
  text: string;
  timestamp?: string;
  feedback?: "like" | "dislike" | null;
  is_answered?: boolean | null;
  isHumanAgent?: boolean;
  isHelpdesk?: boolean;
  questionId?: number;
  answerId?: number;
  hasCategory?: boolean;
}

export interface Citation {
  messageId: string;
  fileId: string; // ID File untuk fetch URL
  documentName: string; // Nama File untuk display
}

export type ChatMode = "bot" | "agent";
export type OpenCitationsState = Record<string, boolean>;

// --- TIPE BARU DARI BACKEND GO ---

export interface AskPayload {
  platform_unique_id: string;
  query: string;
  conversation_id: string;
  platform: string;
  start_timestamp?: string;
}

export interface AskResponse {
  user: string;
  conversation_id: string;
  query: string;
  rewritten_query: string;
  category: string;
  question_category: string[];
  answer: string;
  // Struktur baru: Array of Arrays [["id", "filename"], ...]
  citations: string[][]; 
  is_helpdesk: boolean;
  is_answered: boolean | null;
  platform: string;
  platform_unique_id: string;
  question_id: number;
  answer_id: number;
}
/**
 * Struktur pesan dari riwayat (database)
 * (Sesuai dengan 'chat.ChatHistory' di backend)
 */
export interface BackendChatHistory {
  id: number;
  session_id: string;
  message: {
    type?: "human" | "ai";
    role?: "user" | "assistant";
    content?: string;
    data?: {
      content: string;
      type?: string;
      [key: string]: any;
    };
    [key: string]: any;
  };
  created_at: string;
  user_id: number | null;
  is_cannot_answer: boolean | null;
  category: string | null;
  feedback: boolean | null;
  question_category: string | null;
  question_sub_category: string | null;
}

/**
 * Struktur percakapan (database)
 * (Sesuai dengan 'chat.Conversation' di backend)
 */
export interface Conversation {
  id: string; // UUID
  start_timestamp: string;
  end_timestamp: string | null;
  platform: string;
  platform_unique_id: string;
  is_helpdesk: boolean;
  context: string | null;
  chat_history: BackendChatHistory[];
}

/**
 * Struktur untuk daftar percakapan
 * (Sesuai dengan 'chat.ConversationWithPagination' di backend)
 */
export interface ConversationWithPagination {
  data: Conversation[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

/**
 * Tipe yang digunakan oleh UI Intro Page (dummy.ts)
 * Kita akan map 'Conversation' ke tipe ini agar UI tidak rusak.
 */
export interface ChatSession {
  id: string;
  agent_name?: string;
  created_at: string;
  cardContext?: string;
}