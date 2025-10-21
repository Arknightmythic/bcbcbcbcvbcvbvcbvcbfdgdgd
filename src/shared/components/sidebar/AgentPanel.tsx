// src/layouts/components/AgentPanel.tsx

import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router';
import { Clock, MessageSquare, History, GripVertical } from 'lucide-react';

import { ChatList } from './ChatList';
import type { Chat } from '../../types/types';
import { AgentSidebarSection } from './AgentSidebarSection';
import { useDraggable } from '../../hooks/useDraggable';

// Tipe data yang dibutuhkan
type ChatListType = 'active' | 'queue' | 'history' | 'pending';
type AgentStatus = 'online' | 'away' | 'offline';

interface AgentPanelProps {
  agentName: string;
  agentStatus: AgentStatus;
  chats: {
    queue: Chat[];
    active: Chat[];
    history: Chat[];
    pending: Chat[];
  };
  panelRef: React.RefObject<HTMLDivElement | null>;
  onDrag: (deltaY: number) => void;
  chatListHeight: number;
}

export const AgentPanel = ({
  agentName,
  agentStatus,
  chats,
  panelRef,
  onDrag,
  chatListHeight,
}: AgentPanelProps) => {
  const location = useLocation();
  const [activeList, setActiveList] = useState<ChatListType>('queue');
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const dragHandleRef = useRef<HTMLDivElement>(null);

  useDraggable(panelRef, dragHandleRef, onDrag);


  // EFEK UNTUK MENGATUR TAB AKTIF BERDASARKAN URL
  useEffect(() => {
    if (location.pathname.startsWith('/agent-dashboard/history')) {
      setActiveList('history');
    }
  }, [location.pathname]);

  const handleItemClick = (id: string) => {
    console.log(`Chat with id ${id} selected.`);
    setSelectedChatId(id);
  };

  const listConfig = {
    queue: { icon: Clock, title: "Antrian Chat", empty: "Tidak ada antrian." },
    active: { icon: MessageSquare, title: "Sesi Aktif", empty: "Tidak ada sesi aktif." },
    history: { icon: History, title: "Riwayat Chat", empty: "Tidak ada riwayat." },
    pending: { icon: Clock, title: "Pending Chat", empty: "Tidak ada chat pending." },
  };

  const currentList = listConfig[activeList];

  return (
    <div ref={panelRef} className="flex flex-col min-h-0 border-t border-gray-200">
       <div
        ref={dragHandleRef}
        className="flex justify-center items-center h-4 bg-gray-100 cursor-ns-resize"
      >
        <GripVertical className="w-4 h-4 text-gray-400" />
      </div>
      {/* Gunakan komponen baru dengan props yang sesuai */}
      <AgentSidebarSection
        agentName={agentName}
        agentStatus={agentStatus}
        onTabChange={setActiveList}
        activeList={activeList}
        counts={{
          queue: chats.queue.length,
          active: chats.active.length,
          history: chats.history.length,
          pending: chats.pending.length,
        }}
      />

      <div className="overflow-y-auto hidden md:block" style={{ height: `${chatListHeight}px` }}>
        <ChatList
          title={currentList.title}
          icon={currentList.icon}
          chats={chats[activeList]}
          onItemClick={handleItemClick}
          emptyMessage={currentList.empty}
          type={activeList}
          selectedChatId={selectedChatId ?? undefined}
        />
      </div>
    </div>
  );
};