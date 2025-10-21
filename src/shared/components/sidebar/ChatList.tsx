// src/components/ChatList.tsx

import type { LucideIcon } from 'lucide-react';

import { ChatListItem } from './ChatListItem';
import type { Chat } from '../../types/types';

interface ChatListProps {
  title: string;
  icon: LucideIcon;
  chats: Chat[];
  onItemClick: (id: string) => void;
  emptyMessage: string;
  type: 'active' | 'queue' | 'history' | 'pending';
  selectedChatId?: string;
}

export const ChatList = ({ title, icon: Icon, chats, onItemClick, emptyMessage, type, selectedChatId }: ChatListProps) => (
  <>
    <div className="px-4 py-2 bg-gray-50 border-y border-gray-200 text-xs font-bold text-gray-600 flex items-center">
      <Icon className="w-4 h-4 mr-2" />
      {title} ({chats.length})
    </div>
    {chats.length > 0 ? (
      chats.map((chat) => (
        <ChatListItem
          key={chat.id}
          chat={chat}
          isActive={chat.id === selectedChatId}
          onClick={() => onItemClick(chat.id)}
          type={type}
        />
      ))
    ) : (
      <p className="p-4 text-center text-xs text-gray-400">{emptyMessage}</p>
    )}
  </>
);