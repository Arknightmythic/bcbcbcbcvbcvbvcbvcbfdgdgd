import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router';
import { Clock, MessageSquare, History, X } from 'lucide-react';

import { ChatList } from './ChatList';
import type { Chat } from '../../types/types';
import { AgentSidebarSection } from './AgentSidebarSection';
import { useDraggable } from '../../hooks/useDraggable';
import Tooltip from '../Tooltip';
import type { LucideIcon } from 'lucide-react';

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
  isCollapsed: boolean;
  setOutletBlurred: (isBlurred: boolean) => void;
}

export const AgentPanel = ({
  agentName,
  agentStatus,
  chats,
  panelRef,
  isCollapsed,
  setOutletBlurred,
}: AgentPanelProps) => {
  const location = useLocation();
  const [activeList, setActiveList] = useState<ChatListType>('queue');
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const dragHandleRef = useRef<HTMLDivElement>(null);
  const [isCollapsedPanelOpen, setIsCollapsedPanelOpen] = useState(false);

  // Fitur drag dinonaktifkan secara permanen
  useDraggable(panelRef, dragHandleRef, () => {}, false);

  useEffect(() => {
    if (location.pathname.startsWith('/agent-dashboard/history')) {
      setActiveList('history');
    }
  }, [location.pathname]);
  
  useEffect(() => {
    setOutletBlurred(isCollapsedPanelOpen);
  }, [isCollapsedPanelOpen, setOutletBlurred]);


  const handleItemClick = (id: string) => {
    console.log(`Chat with id ${id} selected.`);
    setSelectedChatId(id);
  };

  const listConfig: Record<ChatListType, { icon: LucideIcon; title: string; empty: string }> = {
    queue: { icon: Clock, title: "Antrian Chat", empty: "Tidak ada antrian." },
    active: { icon: MessageSquare, title: "Sesi Aktif", empty: "Tidak ada sesi aktif." },
    history: { icon: History, title: "Riwayat Chat", empty: "Tidak ada riwayat." },
    pending: { icon: Clock, title: "Pending Chat", empty: "Tidak ada chat pending." },
  };

  const currentList = listConfig[activeList];
  
  const agentInitial = agentName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase() || "A";

  const statusConfig = {
    online: { color: "bg-green-500" },
    away: { color: "bg-yellow-500" },
    offline: { color: "bg-red-500" },
  };

  const currentStatus = statusConfig[agentStatus] || { color: 'bg-gray-400' };

  if (isCollapsed) {
    return (
      <div className="flex flex-col items-center py-4 space-y-4">
        <Tooltip text={agentName}>
          <div className="relative">
            <div className="w-10 h-10 bg-bOss-red rounded-full flex items-center justify-center text-white text-lg font-bold">
              {agentInitial}
            </div>
            <span className={`absolute bottom-0 right-0 block h-3 w-3 rounded-full ${currentStatus.color} border-2 border-white`} />
          </div>
        </Tooltip>

        <div className="relative">
          {/* <button
            onClick={() => setIsCollapsedPanelOpen(!isCollapsedPanelOpen)}
            className="flex items-center justify-center w-10 h-10 bg-gray-100 rounded-full"
          >
            <MessageSquare className="w-5 h-5 text-gray-600" />
          </button> */}
          {isCollapsedPanelOpen && (
             <div className="absolute bottom-0 left-full ml-10 bg-white rounded-lg shadow-lg border w-72 flex flex-col">
              <div className="p-2 border-b flex justify-between items-center">
                <h3 className="text-sm font-semibold">{listConfig[activeList].title}</h3>
                <button onClick={() => setIsCollapsedPanelOpen(false)}><X className="w-4 h-4" /></button>
              </div>
               <div className="flex justify-around p-1 bg-gray-100">
                 {(Object.keys(listConfig) as ChatListType[]).map((key) => {
                   const Icon = listConfig[key].icon;
                   return (
                     <button
                       key={key}
                       onClick={() => setActiveList(key)}
                       className={`p-1 rounded-md ${activeList === key ? 'bg-bOss-red text-white' : ''}`}
                     >
                       <Icon className="w-5 h-5" />
                     </button>
                   );
                 })}
               </div>
               <div className="overflow-y-auto" style={{ height: '220px' }}>
                 <div style={{minHeight: '220px'}}>
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
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div ref={panelRef} className="flex flex-col min-h-0 border-t border-gray-200">
      {/* Drag handle dan ChatList dihilangkan */}
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
    </div>
  );
};