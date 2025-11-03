// [File: src/features/HelpDesk/pages/HelpDeskChatPage.tsx]

import React, { useState, useRef } from 'react'; // <-- 1. Impor 'useRef'
import { useParams, useNavigate } from 'react-router';
import { Send, CornerDownLeft, Check } from 'lucide-react'; // Hapus 'ArrowLeft' jika tidak dipakai
import type { HelpDeskMessage } from '../utils/types';
import toast from 'react-hot-toast';

// (DUMMY_MESSAGES tetap sama)
const DUMMY_MESSAGES: Record<string, HelpDeskMessage[]> = {
  'active-1': [
    { id: 'm1', sender: 'user', text: 'sebuah perusahaan asing (pma) ingin membuka pabrik perakitan laptop dengan nilai investasi Rp 8 miliar di luar tanah dan bangunan. apakah investasi ini memenuhi kebutuhan minimum bkpm?', timestamp: '...'},
    { id: 'm2', sender: 'agent', text: 'Saya menerima pesan Anda: "...". Ini adalah respons dummy.', timestamp: '...'},
  ],
  'queue-1': [
    { id: 'm3', sender: 'user', text: 'Halo, saya butuh bantuan untuk antrian 1.', timestamp: '...'},
  ],
  'resolve-1': [
    { id: 'm4', sender: 'user', text: 'Masalah saya sudah selesai, terima kasih.', timestamp: '...'},
    { id: 'm5', sender: 'agent', text: 'Sama-sama, senang bisa membantu!', timestamp: '...'},
  ],
};

// (QuickResponseButton tetap sama)
const QuickResponseButton = ({ text }: { text: string }) => (
  <button className="text-xs font-medium text-blue-600 border border-blue-200 bg-blue-50 rounded-full px-3 py-1.5 hover:bg-blue-100">
    {text}
  </button>
);

const HelpDeskChatPage: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const [input, setInput] = useState('');
  
  // 2. Tambahkan ref untuk textarea
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  const isResolved = sessionId?.startsWith('resolve-');
  const messages = DUMMY_MESSAGES[sessionId || ''] || [];
  const currentChatUser = sessionId ? `Chat dengan ${sessionId}` : 'Sesi Chatbot';

  // 3. Tambahkan handler input dari PublicServiceChatPage
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const textarea = e.target;
    setInput(textarea.value);

    // Atur tinggi otomatis
    textarea.style.height = 'auto'; // Reset tinggi
    const maxHeight = 160; // Tentukan batas tinggi maks (misal 160px)
    // Atur tinggi baru, tapi tidak melebihi maxHeight
    textarea.style.height = `${Math.min(textarea.scrollHeight, maxHeight)}px`;
  };

  // 4. Perbarui handleSend
  const handleSend = () => {
    if (!input.trim()) return;
    toast.success(`Pesan terkirim ke ${sessionId}: ${input}`);
    setInput('');

    // Reset tinggi textarea setelah mengirim
    if (textareaRef.current) {
        textareaRef.current.style.height = '44px'; // Kembali ke tinggi awal
    }
  };

  const handleResolveChat = () => {
    toast.success(`Chat ${sessionId} ditandai Selesai (Resolved).`);
    navigate('/helpdesk');
  };

  return (
    <div className="flex flex-col h-full min-h-0 bg-white">
      {/* Header Chat Panel (tetap sama) */}
      <div className="p-3 border-b border-gray-200 flex items-center justify-between bg-gray-50">
        <div className="flex items-center gap-3">
          <h2 className="text-md font-semibold text-gray-800">{currentChatUser}</h2>
        </div>
        <div>
          {!isResolved && (
            <button
              onClick={handleResolveChat}
              className="flex items-center gap-2 px-3 py-1.5 bg-green-100 text-green-700 rounded-md hover:bg-green-200 text-sm font-semibold"
            >
              <Check className="w-4 h-4" />
              Resolve
            </button>
          )}
        </div>
      </div>

      {/* Area Bubble Chat (tetap sama) */}
      <div className="flex-1 py-4 px-12 overflow-y-auto custom-scrollbar space-y-4">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-start' : 'justify-end'}`}>
            <div className={`relative p-3 rounded-lg max-w-[75%] shadow-sm ${
                msg.sender === 'user' ? 'bg-blue-600 text-white rounded-bl-none' : 'bg-gray-100 text-gray-800 rounded-br-none'
            }`}>
              <p className="text-sm">{msg.text}</p>
              <div className={`absolute w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold text-white ${
                  msg.sender === 'user' ? 'bg-blue-700 -left-10 bottom-0' : 'bg-red-600 -right-10 bottom-0'
              }`}>
                {msg.sender === 'user' ? 'U' : 'Ai'}
              </div>
            </div>
          </div>
        ))}
        {/* {sessionId === 'active-1' && (
             <div className="flex justify-start">
                <button className="bg-blue-100 text-blue-700 font-semibold px-4 py-2 rounded-lg text-sm flex items-center gap-2">
                    <CornerDownLeft className="w-4 h-4" />
                    Talk to Agent
                </button>
             </div>
        )} */}
      </div>

      {/* Input Area (Hanya tampil jika TIDAK resolved) */}
      {!isResolved && (
        <div className="p-4 border-t border-gray-200 bg-gray-50 space-y-3">
          {/* Quick Response (tetap sama) */}
          <div className="flex gap-2">
            <QuickResponseButton text="Greeting" />
            <QuickResponseButton text="Checking" />
            <QuickResponseButton text="Followup" />
          </div>

          {/* --- 5. GANTI <input> DENGAN <textarea> --- */}
          {/* Ganti 'items-center' menjadi 'items-end' agar tombol Send sejajar bawah */}
          <div className="flex gap-3 items-end"> 
            <textarea
              ref={textareaRef}
              value={input}
              onChange={handleInputChange} // Gunakan handler baru
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault(); // Mencegah baris baru
                  handleSend(); 
                }
              }}
              // Tambahkan 'resize-none', 'overflow-y-auto' dan 'custom-scrollbar'
              className="flex-1 py-2.5 px-4 border border-gray-300 rounded-lg text-sm resize-none min-h-[44px] overflow-y-auto focus:outline-none focus:ring-2 focus:ring-blue-500 custom-scrollbar" 
              placeholder="Ketik pertanyaan Anda..."
              rows={1}
              style={{ height: '44px' }} // Tinggi awal (sesuai min-h-[44px])
            />
            <button
              onClick={handleSend}
              className="w-11 h-11 bg-gray-700 rounded-full text-white cursor-pointer flex items-center justify-center hover:bg-gray-900" 
              aria-label="Kirim pesan"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default HelpDeskChatPage;