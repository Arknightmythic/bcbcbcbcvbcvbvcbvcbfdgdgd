// [GANTI: src/features/PublicService/utils/types.ts]

// Tipe ini (ChatMessage, Citation, dll) sudah ada dan digunakan oleh UI.
// Kita akan tetap menggunakannya agar UI tidak berubah.
export interface ChatMessage {
  id: string;
  sender: "user" | "agent" | "system";
  text: string;
  timestamp?: string;
  feedback?: "like" | "dislike" | null;
  // --- TAMBAHAN BARU ---
  is_answered?: boolean | null;
  // ---------------------
  isHumanAgent?: boolean;
}

export interface Citation {
  messageId: string;
  documentName: string;
  content: string;
}

export type ChatMode = "bot" | "agent";
export type OpenCitationsState = Record<string, boolean>;

// --- TIPE BARU DARI BACKEND GO ---

/**
 * Payload untuk dikirim ke POST /api/chat/ask
 * (Sesuai dengan 'external.ChatRequest' di backend)
 */
export interface AskPayload {
  platform_unique_id: string;
  query: string;
  conversation_id: string; // Kirim string kosong untuk sesi baru
  platform: string;
  start_timestamp?: string;
}

/**
 * Respons yang diterima dari POST /api/chat/ask
 * (Sesuai dengan 'external.ChatResponse' di backend)
 */
export interface AskResponse {
  user: string;
  conversation_id: string;
  query: string;
  rewritten_query: string;
  category: string;
  question_category: string[];
  answer: string;
  citations: string[]; // Backend mengirim array of string
  is_helpdesk: boolean;
  is_answered: boolean | null;
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