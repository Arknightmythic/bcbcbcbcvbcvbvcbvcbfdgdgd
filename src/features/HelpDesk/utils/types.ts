export interface ApiResponse<T> {
  status: string;
  message: string;
  data: T;
}

export type ChatChannel = 'web' | 'whatsapp' | 'instagram' | 'email';

export type HelpDeskStatus = 'queue' | 'open' | 'in_progress' | 'pending' | 'resolved' | 'closed';

export type HelpDeskChatListType = 'active' | 'queue' | 'pending' | 'resolve';

export interface HelpDesk {
  id: number;
  session_id: string;
  platform: ChatChannel;
  platform_unique_id: string | null;
  status: HelpDeskStatus;
  user_id: number;
  created_at: string;
}

export interface HelpDeskChat {
  id: string;
  user_name: string;
  last_message: string;
  timestamp: string;
  channel: ChatChannel;
  status?: HelpDeskStatus;
  helpdesk_id?: number;
}

export interface ChatLists {
  active: HelpDeskChat[];
  queue: HelpDeskChat[];
  pending: HelpDeskChat[];
  resolve: HelpDeskChat[];
}

export interface HelpDeskPayload {
  session_id: string;
  platform: ChatChannel;
  platform_unique_id?: string | null;
  status: HelpDeskStatus;
  user_id: number;
}

export interface SendHelpdeskMessagePayload {
  session_id: string;
  message: string;
  user_type: "user" | "agent";
  start_timestamp?: string; // Tambahan yang diminta
}

export interface HelpDeskStatusUpdate {
  status: HelpDeskStatus;
}

export interface PaginatedHelpDeskResponse {
  helpdesks: HelpDesk[];
  total: number;
  limit: number;
  offset: number;
  search?: string;
}

export interface HelpDeskFilterParams {
  limit?: number;
  offset?: number;
  search?: string;
  status?: HelpDeskStatus;
  platform?: ChatChannel;
}

export type ActionType = 'view' | 'accept' | 'resolve' | 'delete';

// Chat History Types
export type MessageType = 'human' | 'ai';

export interface MessageData {
  additional_kwargs: Record<string, any>;
  content: string;
  id: string | null;
  name: string | null;
  response_metadata: Record<string, any>;
  type: MessageType;
  tool_calls?: any[];
  invalid_tool_calls?: any[];
  usage_metadata?: {
    input_tokens: number;
    output_tokens: number;
    total_tokens: number;
  };
}

export interface ChatMessage {
  data: MessageData;
  type: MessageType;
}

export interface ChatHistoryItem {
  id: number;
  session_id: string;
  message: ChatMessage;
  created_at: string;
  question_category?: string;
  question_sub_category?: string;
  is_validated: boolean | null;
}

export interface ChatHistoryResponse {
  data: ChatHistoryItem[] | null;
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface HelpDeskMessage {
  id: string;
  sender: 'user' | 'agent';
  text: string;
  timestamp: string;
}

export interface HelpDeskSwitchStatus {
  id: number;
  status: boolean;
}
