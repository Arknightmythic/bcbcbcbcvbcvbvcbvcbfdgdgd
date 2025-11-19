export type DocumentCategory = 'panduan' | 'uraian' | 'peraturan';
export type ActionType = 'approve' | 'reject' | 'delete';

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