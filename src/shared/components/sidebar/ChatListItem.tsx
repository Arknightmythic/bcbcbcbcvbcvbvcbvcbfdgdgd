import type { Chat, ChatChannel } from "../../types/types";
import { Globe, Camera, Mail, Phone, type LucideIcon } from "lucide-react";

interface ChatListItemProps {
  chat: Chat;
  isActive: boolean;
  onClick: () => void;
  type: "active" | "queue" | "history" | "pending" | "resolve";
  actionType?: "accept";
  onActionClick?: (chatId: string) => void;
}

const typeMessages = {
  active: "Dalam sesi aktif...",
  queue: "menunggu antrian...",
  history: "Percakapan ditutup..",
  pending: "Menunggu Agen...",
  resolve: "Percakapan terselesaikan.",
};

const lucideIcons: Record<
  "web" | "instagram" | "email" | "whatsapp",
  { icon: LucideIcon; color: string; label: string }
> = {
  web: { icon: Globe, color: "text-blue-500", label: "Web" },
  instagram: { icon: Camera, color: "text-pink-500", label: "Instagram" },
  email: { icon: Mail, color: "text-red-500", label: "Email" },
  whatsapp: { icon: Phone, color: "text-green-500", label: "WhatsApp" },
};

const ChannelIcon: React.FC<{ channel: ChatChannel }> = ({ channel }) => {
  const {
    icon: Icon,
    color,
    label,
  } = lucideIcons[channel as keyof typeof lucideIcons] || lucideIcons.web;

  return (
    <div title={label}>
      <Icon className={`w-3.5 h-3.5 ${color}`} />
    </div>
  );
};

export const ChatListItem = ({
  chat,
  isActive,
  onClick,
  type,
  actionType,
  onActionClick,
}: ChatListItemProps) => {
  const handleAction = (e: React.MouseEvent) => {
    e.stopPropagation(); // Mencegah klik tembus ke parent
    if (onActionClick) {
      onActionClick(chat.id);
    }
  };

  // Handler baru untuk aksesibilitas keyboard pada parent container
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onClick();
    }
  };

  const dateObj = new Date(chat.timestamp);

  return (
    <button
      type="button"
      onClick={onClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      className={`w-full text-left group relative cursor-pointer border-b border-gray-100 p-4 flex flex-col transition-colors duration-150 ease-in-out ${
        isActive ? "bg-blue-50" : "hover:bg-gray-50"
      }`}
    >
      <div
        className={`absolute left-0 top-0 h-full w-1 bg-bOss-red transition-transform duration-200 ease-in-out ${
          isActive ? "scale-y-100" : "scale-y-0"
        }`}
        style={{ transformOrigin: "center" }}
      />

      <div className="flex justify-between items-start mb-1">
        <p className="font-semibold text-sm text-gray-800 truncate transition-colors duration-150 group-hover:text-bOss-red mt-0.5">
          {chat.user_name}
        </p>

        {/* Container Kanan: Dibuat flex-col agar Tanggal bisa dibawah Jam */}
        <div className="flex flex-col items-end flex-shrink-0 ml-2">
          {/* Baris 1: Ikon Channel + Jam */}
          <div className="flex items-center gap-1.5">
            <ChannelIcon channel={chat.channel} />
            <p className="text-xs text-gray-500 transition-colors duration-150 group-hover:text-bOss-red">
              {dateObj.toLocaleTimeString("id-ID", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>

          {/* Baris 2: Tanggal (Baru) */}
          <p className="text-[10px] text-gray-400 mt-0.5">
            {dateObj.toLocaleDateString("id-ID", {
              day: "2-digit",
              month: "short", // Contoh: 29 Des
              year: "numeric", // Contoh: 2025
            })}
          </p>
        </div>
      </div>

      <p className="text-xs text-gray-600 line-clamp-2 transition-colors duration-150 group-hover:text-bOss-red">
        {typeMessages[type]}
      </p>

      {actionType === "accept" && (
        <input
          type="button"
          value="Hubungkan"
          onClick={handleAction}
          className="mt-2 text-xs font-semibold bg-green-100 text-green-700 px-3 py-1 rounded-full hover:bg-green-200 self-start cursor-pointer inline-block border-none"
        />
      )}
    </button>
  );
};
