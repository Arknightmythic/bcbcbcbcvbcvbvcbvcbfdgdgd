import type { Chat, ChatChannel } from "../../types/types";
// --- PERUBAHAN DI SINI: Hapus MessageSquare, kita akan pakai SVG kustom ---
import { Globe, Instagram, Mail, type LucideIcon } from 'lucide-react';

interface ChatListItemProps {
  chat: Chat;
  isActive: boolean;
  onClick: () => void;
  type: 'active' | 'queue' | 'history' | 'pending' | 'resolve';
  actionType?: 'accept'; 
  onActionClick?: (chatId: string) => void;
}

const typeMessages = {
  active: "Percakapan sedang berlangsung...",
  queue: "Menunggu di antrian...",
  history: "Percakapan telah selesai.",
  pending: "Menunggu tindakan agen...",
  resolve: "Percakapan telah selesai.",
};

// --- PERUBAHAN DI SINI: Komponen Ikon Kanal Dimodifikasi ---
// Pisahkan ikon Lucide ke konstanta terpisah
const lucideIcons: Record<'web' | 'instagram' | 'email', { icon: LucideIcon, color: string, label: string }> = {
  web: { icon: Globe, color: 'text-blue-500', label: 'Web' },
  instagram: { icon: Instagram, color: 'text-pink-500', label: 'Instagram' },
  email: { icon: Mail, color: 'text-red-500', label: 'Email' },
};

const ChannelIcon: React.FC<{ channel: ChatChannel }> = ({ channel }) => {
  // 1. Buat kasus khusus untuk WhatsApp
  if (channel === 'whatsapp') {
    return (
      <div title="WhatsApp">
        <img 
          src="/whatsapp-svgrepo-com.svg" 
          alt="WhatsApp" 
          className="w-3.5 h-3.5 text-green-500" // Samakan ukuran dengan ikon Lucide
        />
      </div>
    );
  }

  // 2. Gunakan ikon Lucide untuk kasus lainnya
  const { icon: Icon, color, label } = lucideIcons[channel as keyof typeof lucideIcons] || lucideIcons.web;
  
  return (
    <div title={label}>
      <Icon className={`w-3.5 h-3.5 ${color}`} />
    </div>
  );
};
// --- AKHIR PERUBAHAN ---


export const ChatListItem = ({ chat, isActive, onClick, type, actionType, onActionClick }: ChatListItemProps) => {
  
  const handleAction = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onActionClick) {
      onActionClick(chat.id);
    }
  };
  
  return (
    <div
      onClick={onClick}
      className={`group relative cursor-pointer border-b border-gray-100 p-4 flex flex-col transition-colors duration-150 ease-in-out ${
        isActive ? "bg-blue-50" : "hover:bg-gray-50"
      }`}
    >
      <div
        className={`absolute left-0 top-0 h-full w-1 bg-bOss-red transition-transform duration-200 ease-in-out ${
          isActive ? 'scale-y-100' : 'scale-y-0'
        }`}
        style={{ transformOrigin: 'center' }}
      />

      <div className="flex justify-between items-center mb-1">
        <p className="font-semibold text-sm text-gray-800 truncate transition-colors duration-150 group-hover:text-bOss-red">{chat.user_name}</p>
        
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <ChannelIcon channel={chat.channel} />
          <p className="text-xs text-gray-500 transition-colors duration-150 group-hover:text-bOss-red">
            {new Date(chat.timestamp).toLocaleTimeString("id-ID", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        </div>
      </div>

      <p className="text-xs text-gray-600 line-clamp-2 transition-colors duration-150 group-hover:text-bOss-red">
        {typeMessages[type]}
      </p>

      {actionType === 'accept' && (
        <button
          onClick={handleAction}
          className="mt-2 text-xs font-semibold bg-green-100 text-green-700 px-3 py-1 rounded-full hover:bg-green-200 self-start"
        >
          Accept Chat
        </button>
      )}
    </div>
  );
};