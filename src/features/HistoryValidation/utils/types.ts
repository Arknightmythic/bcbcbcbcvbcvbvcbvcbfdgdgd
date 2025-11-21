// [GANTI: src/features/HistoryValidation/utils/types.ts]

export type ValidationStatus = "Pending" | "Validated" | "Rejected";
export type AnswerStatus = "Answered" | "Unanswered";
// Update ActionType menjadi 3 aksi utama (+ revise)
export type ActionType = "view" | "approve" | "reject" | "revise";

export type SortOrder = "latest" | "oldest" | "";

export interface Filters {
  [key: string]: string; 
  aiAnswer: string;
  validationStatus: string;
  date: string; 
}

export interface ValidationHistoryItem {
  id: number; // question_id
  answerId: number; // answer_id
  tanggal: string;
  user: string;
  session_id: string;
  pertanyaan: string;
  jawaban_ai: string;
  tidak_terjawab: boolean;
  status_validasi: ValidationStatus;
}

export interface ChatPair {
  question_id: number;
  question_content: string;
  question_time: string;
  answer_id: number;
  answer_content: string;
  answer_time: string;
  category: string | null;
  question_category: string | null;
  feedback: boolean | null;
  is_cannot_answer: boolean | null;
  session_id: string;
  is_validated?: boolean | null;
  is_answered?: boolean | null;
  // Field Baru
  created_at: string;
}

export interface PaginatedChatPairsResponse {
  data: ChatPair[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

// --- TAMBAHAN BARU: Payload untuk endpoint /validate ---
// Sesuai dengan req struct di chat/handler.go
export interface ValidatePayload {
  question_id: number;
  question: string;
  answer_id: number;
  answer: string;
  revision: string;
  validate: boolean;
}

export interface BackendChatHistory {
  id: number;
  message: {
    role: "user" | "assistant";
    content: string;
  };
  created_at: string;
}

export interface ConversationHistory {
  id: string;
  chat_history: BackendChatHistory[];
}

export interface ChatMessage {
  id: string;
  sender: "user" | "agent"; 
  text: string;
}