// [GANTI: src/features/HistoryValidation/utils/types.ts]

// 1. Tipe Data yang Dibutuhkan oleh UI (dari file Page Anda)
// -------------------------------------------------------------
export type ValidationStatus = "Pending" | "Validated" | "Rejected";
export type AnswerStatus = "Answered" | "Unanswered";
export type ActionType = "view" | "approve" | "reject";

// --- TAMBAHAN BARU: Tipe untuk Sort Order ---
export type SortOrder = "latest" | "oldest" | "";
// --------------------------------------------

// --- UPDATE INTERFACE Filters ---
export interface Filters {
  // --- PERBAIKAN: Tambahkan index signature untuk memenuhi Record<string, string> ---
  [key: string]: string; 
  aiAnswer: string;
  validationStatus: string;
  // --- Filter Tanggal ---
  date: string; 
}
// ---------------------------------------------

// Tipe data yang digunakan oleh komponen tabel (Saya tambahkan 'answerId')
export interface ValidationHistoryItem {
  id: number; // question_id
  answerId: number; // answer_id (untuk update feedback)
  tanggal: string;
  user: string; // Akan di-dummy
  session_id: string;
  pertanyaan: string;
  jawaban_ai: string;
  tidak_terjawab: boolean;
  status_validasi: ValidationStatus;
}

// Tipe data dari API Backend (Sesuai 'chat/entity.go')
// -------------------------------------------------------------

// Tipe data dari GET /api/chat/pairs/all
export interface ChatPair {
  question_id: number;
  question_content: string;
  question_time: string;
  answer_id: number;
  answer_content: string;
  answer_time: string;
  category: string | null;
  question_category: string | null;
  feedback: boolean | null; // true=Validated, false=Rejected, null=Pending
  is_cannot_answer: boolean | null;
  session_id: string;
}

// Tipe wrapper untuk paginasi dari GET /api/chat/pairs/all
export interface PaginatedChatPairsResponse {
  data: ChatPair[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

// Tipe data dari GET /api/chat/conversations/:session_id
export interface BackendChatHistory {
  id: number;
  message: {
    role: "user" | "assistant"; // Tipe backend adalah 'assistant'
    content: string;
  };
  created_at: string;
}

export interface ConversationHistory {
  id: string; // UUID
  chat_history: BackendChatHistory[];
}

export interface ChatMessage {
  id: string;
  sender: "user" | "agent"; 
  text: string;
}