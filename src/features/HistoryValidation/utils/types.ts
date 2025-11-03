// Ubah ValidationStatus dari 'open' | 'closed'
export type ValidationStatus = 'Pending' | 'Validated' | 'Not Validated';
// Tambahkan tipe baru untuk filter
export type AnswerStatus = 'Answered' | 'Unanswered';
export type ActionType = 'view' | 'approve' | 'reject';

// Ganti interface ValidationHistory
export interface ValidationHistoryItem {
  id: number;
  tanggal: string;
  user: string;
  session_id: string;
  pertanyaan: string;
  jawaban_ai: string;
  tidak_terjawab: boolean;
  status_validasi: ValidationStatus;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'agent';
  text: string;
}