export type DocumentCategory = 'panduan' | 'qna' | 'peraturan';
export type ActionType = 'approve' | 'reject' | 'delete';

// Tambahkan tipe SortOrder
export type SortOrder = 'asc' | 'desc';

export interface Document {
  id: number;
  created_at: string;
  document_name: string;
  staff: string;
  data_type: string;
  team: string;
  is_approve: boolean | null; 
  filename: string;
  category: DocumentCategory;
  status: 'Pending' | 'Approved' | 'Rejected';
}