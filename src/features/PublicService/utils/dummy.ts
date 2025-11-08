import type { ChatMessage, ChatSession, Citation } from "./types";

export const dummySessions: ChatSession[] = [
  {
    id: "session-123",
    agent_name: "AI Assistant",
    created_at: new Date(Date.now() - 3600 * 1000).toISOString(),
  },
  {
    id: "session-456",
    agent_name: "Customer Support Bot",
    created_at: new Date(Date.now() - 86400 * 1000 * 2).toISOString(),
  },
  {
    id: "session-123",
    agent_name: "AI Assistant",
    created_at: new Date(Date.now() - 3600 * 1000).toISOString(),
  },
  {
    id: "session-456",
    agent_name: "Customer Support Bot",
    created_at: new Date(Date.now() - 86400 * 1000 * 2).toISOString(),
  },
  {
    id: "session-123",
    agent_name: "AI Assistant",
    created_at: new Date(Date.now() - 3600 * 1000).toISOString(),
  },
  {
    id: "session-456",
    agent_name: "Customer Support Bot",
    created_at: new Date(Date.now() - 86400 * 1000 * 2).toISOString(),
  },
  {
    id: "session-123",
    agent_name: "AI Assistant",
    created_at: new Date(Date.now() - 3600 * 1000).toISOString(),
  },
  {
    id: "session-456",
    agent_name: "Customer Support Bot",
    created_at: new Date(Date.now() - 86400 * 1000 * 2).toISOString(),
  },
  {
    id: "session-123",
    agent_name: "AI Assistant",
    created_at: new Date(Date.now() - 3600 * 1000).toISOString(),
  },
  {
    id: "session-456",
    agent_name: "Customer Support Bot",
    created_at: new Date(Date.now() - 86400 * 1000 * 2).toISOString(),
  },
  {
    id: "session-123",
    agent_name: "AI Assistant",
    created_at: new Date(Date.now() - 3600 * 1000).toISOString(),
  },
  {
    id: "session-456",
    agent_name: "Customer Support Bot",
    created_at: new Date(Date.now() - 86400 * 1000 * 2).toISOString(),
  },
  {
    id: "session-123",
    agent_name: "AI Assistant",
    created_at: new Date(Date.now() - 3600 * 1000).toISOString(),
  },
  {
    id: "session-456",
    agent_name: "Customer Support Bot",
    created_at: new Date(Date.now() - 86400 * 1000 * 2).toISOString(),
  },
  {
    id: "session-123",
    agent_name: "AI Assistant",
    created_at: new Date(Date.now() - 3600 * 1000).toISOString(),
  },
  {
    id: "session-456",
    agent_name: "Customer Support Bot",
    created_at: new Date(Date.now() - 86400 * 1000 * 2).toISOString(),
  },
  {
    id: "session-123",
    agent_name: "AI Assistant",
    created_at: new Date(Date.now() - 3600 * 1000).toISOString(),
  },
  {
    id: "session-456",
    agent_name: "Customer Support Bot",
    created_at: new Date(Date.now() - 86400 * 1000 * 2).toISOString(),
  },
  {
    id: "session-123",
    agent_name: "AI Assistant",
    created_at: new Date(Date.now() - 3600 * 1000).toISOString(),
  },
  {
    id: "session-456",
    agent_name: "Customer Support Bot",
    created_at: new Date(Date.now() - 86400 * 1000 * 2).toISOString(),
  },
];


export const dummyMessages: Record<string, ChatMessage[]> = {
  "session-123": [
    {
      id: "msg-1",
      sender: "user",
      text: "sebuah perusahaan asing (pma) ingin membuka pabrik perakitan laptop dengan nilai investasi Rp 8 miliar di luar tanah dan bangunan. apakah investasi ini memenuhi kebutuhan minimum bkpm?",
    },
    {
      id: "msg-2",
      sender: "agent", 
      text: 'Saya menerima pesan Anda: "sebuah perusahaan asing (pma) ingin membuka pabrik perakitan laptop dengan nilai investasi Rp 8 miliar di luar tanah dan bangunan. apakah investasi ini memenuhi kebutuhan minimum bkpm?". Ini adalah respons dummy.',
    },
  ],
  "session-456": [
    {
      id: "msg-3",
      sender: "system", 
      text: "Selamat datang di sesi 456. Silakan ajukan pertanyaan Anda.",
    },
  ],
  "new-session": [
    {
      id: "msg-initial",
      sender: "system", 
      text: `Halo! Selamat Datang di layanan pelanggan Dokuprime. Ada yang bisa saya bantu?`,
    },
  ],
};


export const dummyCitations: Citation[] = [
  {
    messageId: "msg-2", 
    documentName: "Peraturan_BKPM_No_4_Tahun_2021.pdf",
    content:
      "Berdasarkan Peraturan BKPM No. 4 Tahun 2021 tentang Pedoman dan Tata Cara Pelayanan Perizinan Berusaha Berbasis Risiko, nilai investasi minimum untuk Penanaman Modal Asing (PMA) adalah lebih besar dari Rp 10.000.000.000 (sepuluh miliar Rupiah) di luar nilai tanah dan bangunan per 5-digit KBLI.",
  },
  {
    messageId: "msg-2", 
    documentName: "FAQ_Investasi_PMA.pdf",
    content:
      "Pertanyaan: Berapa minimum investasi untuk PMA? Jawaban: Untuk PMA, total nilai investasi wajib lebih besar dari Rp 10 Miliar (di luar tanah dan bangunan). Investasi senilai Rp 8 Miliar belum memenuhi syarat minimum sebagai PMA dan mungkin dapat dipertimbangkan sebagai Penanaman Modal Dalam Negeri (PMDN) jika memenuhi kriteria lain.",
  },
];
