// [File: src/shared/components/sidebar/ChatListItem.tsx]

import type { Chat } from "../../types/types";

interface ChatListItemProps {
  chat: Chat;
  isActive: boolean;
  onClick: () => void;
  // --- DIUBAH: Tambahkan 'resolve' ---
  type: 'active' | 'queue' | 'history' | 'pending' | 'resolve';
  
  // --- DIUBAH: Tambahkan prop baru ---
  actionType?: 'accept'; 
  onActionClick?: (chatId: string) => void;
}

const typeMessages = {
  active: "Percakapan sedang berlangsung...",
  queue: "Menunggu di antrian...",
  history: "Percakapan telah selesai.",
  pending: "Menunggu tindakan agen...",
  resolve: "Percakapan telah selesai.", // <-- Tambahkan ini
};

export const ChatListItem = ({ chat, isActive, onClick, type, actionType, onActionClick }: ChatListItemProps) => {
  
  // Handler untuk tombol aksi, menghentikan propagasi
  const handleAction = (e: React.MouseEvent) => {
    e.stopPropagation(); // Mencegah 'onClick' (navigasi) terpicu
    if (onActionClick) {
      onActionClick(chat.id);
    }
  };
  
  return (
    <div
      onClick={onClick}
      // --- DIUBAH: Hapus 'py-3', ganti 'pl-5 pr-4', tambahkan 'p-4' dan 'flex' ---
      className={`group relative cursor-pointer border-b border-gray-100 p-4 flex flex-col transition-colors duration-150 ease-in-out ${
        isActive ? "bg-blue-50" : "hover:bg-gray-50"
      }`}
    >
      {/* Indikator biru (tetap sama) */}
      <div
        className={`absolute left-0 top-0 h-full w-1 bg-bOss-red transition-transform duration-200 ease-in-out ${
          isActive ? 'scale-y-100' : 'scale-y-0'
        }`}
        style={{ transformOrigin: 'center' }}
      />

      {/* Konten Chat (tetap sama) */}
      <div className="flex justify-between items-center mb-1">
        <p className="font-semibold text-sm text-gray-800 truncate transition-colors duration-150 group-hover:text-bOss-red">{chat.user_name}</p>
        <p className="text-xs text-gray-500 transition-colors duration-150 group-hover:text-bOss-red">
          {new Date(chat.timestamp).toLocaleTimeString("id-ID", {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
      </div>
      <p className="text-xs text-gray-600 line-clamp-2 transition-colors duration-150 group-hover:text-bOss-red">
        {typeMessages[type]}
      </p>

      {/* --- DIUBAH: Tambahkan tombol "Accept" --- */}
      {actionType === 'accept' && (
        <button
          onClick={handleAction}
          className="mt-2 text-xs font-semibold bg-green-100 text-green-700 px-3 py-1 rounded-full hover:bg-green-200 self-start"
        >
          Accept Chat
        </button>
      )}
      {/* --- AKHIR PERUBAHAN --- */}
    </div>
  );
};