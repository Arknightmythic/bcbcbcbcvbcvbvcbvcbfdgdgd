
export interface ChatSession {
  id: string; 
  agent_name?: string; 
  created_at: string; 
  
}


export interface ChatMessage {
  id: string; 
  sender: 'user' | 'agent' | 'system'; 
  text: string; 
  timestamp?: string; 
}


export interface Citation {
  messageId: string; 
  documentName: string; 
  content: string; 
  
}


export type ChatMode = 'bot' | 'agent';


export type OpenCitationsState = Record<string, boolean>; 
