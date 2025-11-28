export type DocumentCategory = 'panduan' | 'qna' | 'peraturan';

export type SortOrder = 'asc' | 'desc' | '';

export interface UploadedDocument {
  id: number;
  created_at: string; 
  document_name: string;
  data_type: string; 
  staff: string;
  team: string;
  status: string | null; 
  filename: string; 
  category: DocumentCategory;
  is_approve: boolean | null;
}

export interface DocumentVersion {
  id: number;
  document_name: string;
  created_at: string;
  staff: string;
  filename: string;
  is_approve: boolean | null;
  status: string | null;
}

export interface PendingDocument {
  document_name: string;
  status: string | null;
}