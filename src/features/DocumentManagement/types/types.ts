export type DocumentCategory = 'panduan' | 'uraian' | 'peraturan';
export type ActionType = 'approve' | 'reject' | 'delete';

export interface Document {
  id: number;
  upload_date: string;
  document_name: string;
  staff: string;
  document_type: string; // Tetap ada meskipun tidak difilter
  status: 'approved' | 'rejected' | 'pending';
  file_path: string;
  category: DocumentCategory; // <-- TAMBAHAN BARU
}