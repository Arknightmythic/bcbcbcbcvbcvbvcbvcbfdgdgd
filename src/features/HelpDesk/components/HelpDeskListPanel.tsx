import React, { useState, useMemo, useEffect } from 'react'; 
import { useNavigate, useParams } from 'react-router';
import { MessageSquare, Clock, CheckCheck, RefreshCw, type LucideIcon } from 'lucide-react';
import type { ChatLists, HelpDeskChatListType, HelpDeskChat, ChatChannel } from '../utils/types';
import { ChatList } from '../../../shared/components/sidebar/ChatList';
import toast from 'react-hot-toast'; 
import CustomSelect from '../../../shared/components/CustomSelect'; 
import { useGetAllHelpDesks, useAcceptHelpDesk } from '../hooks/useHelpDesk';
import { useQueryClient } from '@tanstack/react-query';

const channelFilterOptions = [
  { value: "", label: "All channel" },
  { value: "web", label: "Web" },
  { value: "whatsapp", label: "WhatsApp" },
  { value: "instagram", label: "Instagram" },
  { value: "email", label: "Email" },
];

const TabButton = ({ label, count, isActive, onClick }: { label: string, count: number, isActive: boolean, onClick: () => void }) => {
  const activeStyle = "bg-bOss-red border-bOss-red-200 shadow-sm";
  const inactiveStyle = "bg-transparent border-transparent";
  
  return (
    <button
      onClick={onClick}
      className={`flex-1 rounded-md py-1 text-xs transition-all duration-200 ${isActive ? activeStyle : inactiveStyle}`}
    >
      <span className={`block font-bold text-lg ${isActive ? "text-white" : "text-gray-800"}`}>{count}</span>
      <span className={`capitalize ${isActive ? "text-white" : "text-gray-600"}`}>{label}</span>
    </button>
  );
};

const HelpDeskListPanel: React.FC = () => {
  const [activeList, setActiveList] = useState<HelpDeskChatListType>('queue');
  const [chatLists, setChatLists] = useState<ChatLists>({
    active: [],
    queue: [],
    pending: [],
    resolve: [],
  });
  
  const [selectedChannel, setSelectedChannel] = useState<ChatChannel | ''>('');
  
  const navigate = useNavigate();
  const { sessionId } = useParams<{ sessionId: string }>();
  const queryClient = useQueryClient();

  // Fetch all helpdesks from API
  const { data: helpdesks, isLoading, isError, refetch } = useGetAllHelpDesks();
  const acceptMutation = useAcceptHelpDesk();

  // Refetch data when component mounts or when returning to helpdesk page
  useEffect(() => {
    // Invalidate and refetch helpdesk data
    queryClient.invalidateQueries({ queryKey: ['helpdesks'] });
    refetch();
  }, []); // Empty dependency array means this runs only on mount

  // Auto-refresh when page becomes visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        queryClient.invalidateQueries({ queryKey: ['helpdesks'] });
        refetch();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [queryClient, refetch]);

  // Transform API data to ChatLists format
  useEffect(() => {
    if (helpdesks) {
      const transformedLists: ChatLists = {
        active: [],
        queue: [],
        pending: [],
        resolve: [],
      };

      const now = Date.now();
      const PENDING_THRESHOLD = 15 * 60 * 1000; // 15 minutes

      helpdesks.forEach((helpdesk) => {
        const chat: HelpDeskChat = {
          id: helpdesk.session_id,
          user_name: helpdesk.platform_unique_id || `User ${helpdesk.id}`,
          last_message: getLastMessageByStatus(helpdesk.status),
          timestamp: helpdesk.created_at,
          channel: helpdesk.platform,
          status: helpdesk.status,
          helpdesk_id: helpdesk.id,
        };

        const timeDiff = now - new Date(helpdesk.created_at).getTime();

        switch (helpdesk.status) {
          case 'in_progress':
            transformedLists.active.push(chat);
            break;
          case 'open':
            // Check if it should be in pending (15+ minutes old)
            if (timeDiff > PENDING_THRESHOLD) {
              transformedLists.pending.push(chat);
            } else {
              transformedLists.queue.push(chat);
            }
            break;
          case 'pending':
            transformedLists.pending.push(chat);
            break;
          case 'resolved':
          case 'closed':
            transformedLists.resolve.push(chat);
            break;
          default:
            transformedLists.queue.push(chat);
        }
      });

      setChatLists(transformedLists);
    }
  }, [helpdesks]);

  const getLastMessageByStatus = (status: string): string => {
    switch (status) {
      case 'open':
        return 'Menunggu...';
      case 'in_progress':
        return 'Sedang diproses...';
      case 'pending':
        return 'Menunggu lama...';
      case 'resolved':
      case 'closed':
        return 'Selesai';
      default:
        return '...';
    }
  };

  const listConfig: Record<HelpDeskChatListType, { icon: LucideIcon; title: string; empty: string }> = {
    active: { icon: MessageSquare, title: "Active Chats", empty: "Tidak ada chat aktif." },
    queue: { icon: Clock, title: "Queue", empty: "Antrian kosong." },
    pending: { icon: Clock, title: "Pending", empty: "Tidak ada chat pending." },
    resolve: { icon: CheckCheck, title: "Resolve (History)", empty: "Tidak ada riwayat chat." },
  };

  const handleSelectChat = (chatId: string) => {
    navigate(`/helpdesk/${chatId}`);
  };

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ['helpdesks'] });
    refetch();
    toast.success('Refreshing helpdesk data...');
  };

  const handleAcceptChat = (chatId: string) => {
    // Find the helpdesk_id from the chat
    const allChats = [...chatLists.queue, ...chatLists.pending];
    const chat = allChats.find((c) => c.id === chatId);
    
    if (!chat || !chat.helpdesk_id) {
      toast.error("Chat tidak ditemukan");
      return;
    }

    // TODO: Get current user_id from auth context or store
    const currentUserId = 1; // Replace with actual user ID

    acceptMutation.mutate(
      { id: chat.helpdesk_id, userId: currentUserId },
      {
        onSuccess: () => {
          setActiveList('active');
          navigate(`/helpdesk/${chatId}`);
        },
      }
    );
  };

  const currentListConfig = listConfig[activeList];

  const currentChats = useMemo(() => {
    const listByStatus = chatLists[activeList];
    if (!selectedChannel) {
      return listByStatus; 
    }
    
    return listByStatus.filter(chat => chat.channel === selectedChannel);
  }, [chatLists, activeList, selectedChannel]);
  
  const itemActionType = (activeList === 'queue' || activeList === 'pending') ? 'accept' : undefined;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-gray-500">memuat data...</div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-red-500">gagal memuat data</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full min-h-0">
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <h2 className="text-md font-bold text-gray-800">Help Desk</h2>
        <button
          onClick={handleRefresh}
          disabled={isLoading}
          className="p-1.5 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-50"
          title="Refresh data"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="flex justify-between text-center bg-gray-200 rounded-lg p-1 space-x-1 m-4">
        <TabButton label="Active" count={chatLists.active.length} isActive={activeList === 'active'} onClick={() => setActiveList('active')} />
        <TabButton label="Queue" count={chatLists.queue.length} isActive={activeList === 'queue'} onClick={() => setActiveList('queue')} />
        <TabButton label="Pending" count={chatLists.pending.length} isActive={activeList === 'pending'} onClick={() => setActiveList('pending')} />
        <TabButton label="Resolve" count={chatLists.resolve.length} isActive={activeList === 'resolve'} onClick={() => setActiveList('resolve')} />
      </div>

      <div className="px-4 pb-2 border-b border-gray-200">
        <CustomSelect
          selectedType="default"
          value={selectedChannel}
          onChange={(value) => setSelectedChannel(value as ChatChannel | '')}
          options={channelFilterOptions}
        />
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <ChatList
          title={currentListConfig.title}
          icon={currentListConfig.icon}
          chats={currentChats} 
          onItemClick={handleSelectChat}
          emptyMessage={currentListConfig.empty}
          type={activeList}
          selectedChatId={sessionId}
          itemActionType={itemActionType}
          onItemActionClick={handleAcceptChat}
        />
      </div>
    </div>
  );
};

export default HelpDeskListPanel;