// [File: src/features/HelpDesk/utils/types.ts]

import type { Chat } from "../../../shared/types/types";

// Tipe untuk tab yang aktif
export type HelpDeskChatListType = 'active' | 'queue' | 'pending' | 'resolve';

// Tipe untuk data chat, bisa menggunakan tipe Chat yang sudah ada
export type HelpDeskChat = Chat;

// Tipe untuk data dummy
export type ChatLists = Record<HelpDeskChatListType, HelpDeskChat[]>;

// Tipe untuk pesan di dalam chat panel
export interface HelpDeskMessage {
  id: string;
  sender: 'user' | 'agent';
  text: string;
  timestamp: string;
}