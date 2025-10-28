export type DocumentCategory = 'panduan' | 'uraian' | 'peraturan';

// This will represent a document in the main table
export interface UploadedDocument {
  id: number;
  upload_date: string;
  document_name: string;
  document_type: string;
  staff: string;
  team: string;
  status: 'completed' | 'pending' | 'failed' | string;
  file_path: string;
  category: DocumentCategory;
  version: number; // <-- ADDED: Current version number
}

// This will represent a single entry in the version history modal
export interface DocumentVersion {
  version: number;
  document_name: string;
  upload_date: string;
  staff: string;
  file_path: string;
}

export interface PendingDocument {
  document_name: string;
  status: 'pending' | string;
}