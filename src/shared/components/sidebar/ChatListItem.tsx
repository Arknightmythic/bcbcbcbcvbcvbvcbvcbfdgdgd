import type { Chat } from "../../types/types";

interface ChatListItemProps {
  chat: Chat;
  isActive: boolean;
  onClick: () => void;
  type: 'active' | 'queue' | 'history' | 'pending';
}

const typeMessages = {
  active: "Percakapan sedang berlangsung...",
  queue: "Menunggu di antrian...",
  history: "Percakapan telah selesai.",
  pending: "Menunggu tindakan agen...",
};

export const ChatListItem = ({ chat, isActive, onClick, type }: ChatListItemProps) => (
  <div
    onClick={onClick}
    className={`group relative cursor-pointer border-b border-gray-100 py-3 pl-5 pr-4 transition-colors duration-150 ease-in-out ${
      isActive ? "bg-blue-50" : "hover:bg-gray-50"
    }`}
  >
    {/* Indikator biru yang dianimasikan menggunakan transform */}
    <div
      className={`absolute left-0 top-0 h-full w-1 bg-bOss-red transition-transform duration-200 ease-in-out ${
        isActive ? 'scale-y-100' : 'scale-y-0'
      }`}
      style={{ transformOrigin: 'center' }}
    />

    {/* Konten Chat */}
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
  </div>
);