export type ValidationStatus = 'open' | 'closed';
export type ActionType = 'view';

export interface ValidationHistory {
  id: number;
  tanggal: string;
  user: string;
  session_id: string;
  konteks: string;
  status: ValidationStatus;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'agent';
  text: string;
}