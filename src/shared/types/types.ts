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

export type DocumentCategory = "panduan" | "uraian" | "peraturan";
