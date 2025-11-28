import type { LucideIcon } from "lucide-react";

export interface MenuItem {
  path: string;
  title: string;
  icon: LucideIcon | string;
  identifier: string;
}

export type ChatChannel = 'web' | 'whatsapp' | 'instagram' | 'email';

export interface Chat {
  id: string;
  user_name: string;
  last_message: string;
  timestamp: string;
  channel: ChatChannel;
}

export type DocumentCategory = "panduan" | "qna" | "peraturan";

export interface PdfViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  url: string | null;      
  isLoading: boolean;  
  title: string;
}
