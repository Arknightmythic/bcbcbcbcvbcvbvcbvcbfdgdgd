// Interface untuk sesi chat yang ditampilkan di halaman intro
export interface ChatSession {
  id: string; // ID unik sesi
  agent_name?: string; // Nama agen atau bot (opsional)
  created_at: string; // Timestamp ISO string kapan sesi dibuat
  // Tambahkan properti lain jika diperlukan, misal: last_message_preview
}

// Interface untuk pesan dalam chat
export interface ChatMessage {
  id: string; // ID unik pesan
  sender: 'user' | 'agent' | 'system'; // Pengirim pesan
  text: string; // Isi pesan
  timestamp?: string; // Timestamp ISO string (opsional)
}

// Interface untuk sitasi/sumber
export interface Citation {
  messageId: string; // ID pesan yang terkait dengan sitasi ini
  documentName: string; // Nama dokumen sumber
  content: string; // Kutipan konten dari dokumen
  // Tambahkan properti lain jika diperlukan, misal: page_number
}

// Tipe untuk mode chat
export type ChatMode = 'bot' | 'agent';

// Tipe untuk state sitasi yang terbuka
export type OpenCitationsState = Record<string, boolean>; // { [messageId: string]: boolean }
