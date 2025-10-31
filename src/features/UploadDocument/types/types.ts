// src/features/UploadDocument/types/types.ts

export type DocumentCategory = 'panduan' | 'uraian' | 'peraturan';

// Tipe ini disesuaikan agar cocok dengan respons dari backend
export interface UploadedDocument {
  id: number;
  created_at: string; // Sebelumnya 'upload_date'
  document_name: string;
  data_type: string; // Sebelumnya 'document_type'
  staff: string;
  team: string;
  status: string | null; // Status bisa null dari backend
  filename: string; // Nama file unik, sebelumnya 'file_path'
  category: DocumentCategory;
  is_approve: boolean | null;
}

// Tipe untuk detail versi dokumen, akan digunakan di modal riwayat
export interface DocumentVersion {
  id: number;
  document_name: string;
  created_at: string;
  staff: string;
  filename: string;
  is_approve: boolean | null;
}

// Tipe untuk dokumen yang sedang dalam proses approval
export interface PendingDocument {
  document_name: string;
  status: string | null;
}