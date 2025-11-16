import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router';
import { Clock, MessageSquare, History, MessageSquareWarning, MessageSquareDiff } from 'lucide-react';


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

const CollapsedTabButton = ({ 
  icon: Icon, 
  count, 
  tooltipText, 
}: { 
  icon: LucideIcon, 
  count: number, 
  tooltipText: string, 

}) => (
  <Tooltip text={`${tooltipText} (${count})`}>
    <div
     
      className="relative flex items-center justify-center w-8 h-10 bg-gray-100 rounded-lg text-gray-600 hover:bg-bOss-red-50 hover:text-bOss-red transition-colors"
    >
      <Icon className="w-4 h-4" />
      {count > 0 && (
        <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-bOss-red text-white text-[10px] font-bold">
          {count}
        </span>
      )}
    </div>
  </Tooltip>
);


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
      <div className="flex flex-col items-center py-2 space-y-4 rounded rounded-t-md">
        
        {/* Tab Vertikal
        <div className="flex flex-col items-center space-y-2 mt-2">
          <CollapsedTabButton
            icon={MessageSquare}
            count={chats.active.length}
            tooltipText="Active Chats"
          
          />
          <CollapsedTabButton
            icon={MessageSquareDiff}
            count={chats.queue.length}
            tooltipText="Queue"
            
          />
          <CollapsedTabButton
            icon={MessageSquareWarning} // Anda bisa ganti ikon jika mau
            count={chats.pending.length}
            tooltipText="Pending"
           
          />
        </div> */}

        {/* Ikon Agen (Budi Santoso) */}
        <Tooltip text={`${agentName} (${agentStatus})`}>
          <div className="relative cursor-pointer">
            <div className="w-8 h-8 bg-bOss-red rounded-full flex items-center justify-center text-white text-sm font-bold">
              {agentInitial}
            </div>
            <span className={`absolute bottom-0 right-0 block h-3 w-3 rounded-full ${currentStatus.color} border-2 border-white`} />
          </div>
        </Tooltip>

       
      </div>
    );
  }

  // Tampilan "Expanded" (tidak berubah)
  return (
    <div ref={panelRef} className="flex flex-col min-h-0 border-t border-gray-200">
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