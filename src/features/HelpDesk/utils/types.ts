// --- PERUBAHAN DI SINI ---
// Impor tipe ChatChannel dan Chat yang sudah diperbarui
import type { Chat, ChatChannel } from "../../../shared/types/types";

// Ekspor ChatChannel agar bisa dipakai di komponen HelpDesk
export type { ChatChannel };
// --- AKHIR PERUBAHAN ---


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