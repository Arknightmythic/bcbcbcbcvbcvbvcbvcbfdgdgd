import type { Chat } from "../types/types";


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
    className={`px-4 py-3 border-b border-gray-100 cursor-pointer transition-all duration-200 relative ${
      isActive ? "bg-blue-50 border-l-4 border-l-blue-500" : "hover:bg-gray-50"
    }`}
  >
    <div className="flex justify-between items-center mb-1">
      <p className="font-semibold text-sm text-gray-800 truncate">{chat.user_name}</p>
      <p className="text-xs text-gray-500">
        {new Date(chat.timestamp).toLocaleTimeString("id-ID", {
          hour: "2-digit",
          minute: "2-digit",
        })}
      </p>
    </div>
    <p className="text-xs text-gray-600 line-clamp-2">
      {typeMessages[type]}
    </p>
  </div>
);