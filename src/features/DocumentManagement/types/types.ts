// src/features/DocumentManagement/types/types.ts

export type DocumentCategory = 'panduan' | 'uraian' | 'peraturan';
export type ActionType = 'approve' | 'reject' | 'delete';

// Tipe ini diperbarui agar cocok dengan respons API
export interface Document {
  id: number;
  created_at: string;
  document_name: string;
  staff: string;
  data_type: string;
  team: string;
  is_approve: boolean | null; // null = pending, true = approved, false = rejected
  filename: string;
  category: DocumentCategory;
}