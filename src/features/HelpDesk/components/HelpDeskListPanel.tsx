import React, { useState, useEffect, useMemo } from 'react'; 
import { useNavigate, useParams } from 'react-router';
import { MessageSquare, Clock, CheckCheck, RefreshCw, type LucideIcon } from 'lucide-react';
import type { HelpDeskChatListType, ChatChannel, HelpDeskChat } from '../utils/types';
import { ChatList } from '../../../shared/components/sidebar/ChatList';
import toast from 'react-hot-toast'; 
import CustomSelect from '../../../shared/components/CustomSelect'; 
import { useGetHelpDesks, useAcceptHelpDesk, useGetAllHelpDesks } from '../hooks/useHelpDesk';
import { useQueryClient } from '@tanstack/react-query';

const channelFilterOptions = [
  { value: "", label: "Semua Channel" },
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
  // State untuk Tab Aktif (Default: queue)
  const [activeList, setActiveList] = useState<HelpDeskChatListType>('queue');
  const [selectedChannel, setSelectedChannel] = useState<ChatChannel | ''>('');
  
  const navigate = useNavigate();
  const { sessionId } = useParams<{ sessionId: string }>();
  const queryClient = useQueryClient();

  // --- DATA FETCHING UNTUK COUNTER (SEMUA DATA) ---
  const { data: allHelpDesks } = useGetAllHelpDesks();

  // Hitung statistik untuk angka di Tab
  const counts = useMemo(() => {
    const stats = { active: 0, queue: 0, pending: 0, resolve: 0 };
    
    if (!allHelpDesks) return stats;

    allHelpDesks.forEach((ticket) => {
      // Normalisasi status ke lowercase untuk keamanan
      const status = ticket.status?.toLowerCase();
      
      if (status === 'in_progress') {
        stats.active++;
      } else if (status === 'resolved' || status === 'closed') {
        stats.resolve++;
      } else if (status === 'pending') {
        stats.pending++;
      } else if (status === 'queue' || status === 'open') {
        // PERBAIKAN: Hapus logika waktu 15 menit. 
        // Semua status 'queue' atau 'open' masuk ke Antrian.
        stats.queue++;
      }
    });

    return stats;
  }, [allHelpDesks]);

  // --- DATA FETCHING UNTUK LIST (PAGINATED PER TAB) ---
  
  // Mapping Tab UI ke Status Backend API
  const getStatusFromTab = (tab: HelpDeskChatListType) => {
    switch (tab) {
      case 'active': return 'in_progress';
      case 'queue': return 'queue'; // Mengambil status queue/open dari backend
      case 'pending': return 'pending';
      case 'resolve': return 'resolved'; 
      default: return 'queue';
    }
  };

  // Membentuk Query Parameters untuk API List
  const queryParams = useMemo(() => {
    const params = new URLSearchParams();
    params.append('limit', '50');
    params.append('status', getStatusFromTab(activeList));
    
    if (selectedChannel) {
      params.append('search', selectedChannel);
    }
    
    return params;
  }, [activeList, selectedChannel]);

  // Fetch Data List (Hanya memuat data sesuai tab)
  const { data: responseData, isLoading, isError, refetch } = useGetHelpDesks(queryParams);
  const acceptMutation = useAcceptHelpDesk();

  // Refresh data saat tab berubah atau visibility berubah
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        refetch(); // Refresh list
        queryClient.invalidateQueries({ queryKey: ['helpdesks', 'all'] }); // Refresh counter
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [refetch, queryClient]);

  // Transformasi data backend ke format List UI
  const currentChats: HelpDeskChat[] = useMemo(() => {
    if (!responseData?.helpdesks) return [];

    return responseData.helpdesks.map((helpdesk) => ({
      id: helpdesk.session_id,
      user_name: helpdesk.platform_unique_id || `User ${helpdesk.id}`,
      last_message: `Status: ${helpdesk.status}`, 
      timestamp: helpdesk.created_at,
      channel: helpdesk.platform,
      status: helpdesk.status,
      helpdesk_id: helpdesk.id,
    }));
  }, [responseData]);

  // Konfigurasi UI
  const listConfig: Record<HelpDeskChatListType, { icon: LucideIcon; title: string; empty: string }> = {
    active: { icon: MessageSquare, title: "Chat Aktif", empty: "Tidak ada chat aktif." },
    queue: { icon: Clock, title: "Antrian", empty: "Antrian kosong." },
    pending: { icon: Clock, title: "Tertahan", empty: "Tidak ada chat pending." },
    resolve: { icon: CheckCheck, title: "Terselesaikan", empty: "Tidak ada riwayat chat." },
  };

  const currentListConfig = listConfig[activeList];

  const handleSelectChat = (chatId: string) => {
    navigate(`/helpdesk/${chatId}`);
  };

  const handleRefresh = () => {
    refetch();
    queryClient.invalidateQueries({ queryKey: ['helpdesks', 'all'] });
    toast.success('Refreshing helpdesk data...');
  };

  const handleAcceptChat = (chatId: string) => {
    const chat = currentChats.find((c) => c.id === chatId);
    
    if (!chat || !chat.helpdesk_id) {
      toast.error("Chat tidak ditemukan");
      return;
    }

    const currentUserId = 1; 

    acceptMutation.mutate(
      { id: chat.helpdesk_id, userId: currentUserId },
      {
        onSuccess: () => {
          toast.success("Chat berhasil dihubungkan!");
          refetch();
          queryClient.invalidateQueries({ queryKey: ['helpdesks', 'all'] });
          navigate(`/helpdesk/${chatId}`);
        },
      }
    );
  };

  const itemActionType = (activeList === 'queue' || activeList === 'pending') ? 'accept' : undefined;

  if (isError) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-red-500">Gagal memuat data</div>
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

      {/* Tabs dengan Counter yang dihitung dari useGetAllHelpDesks */}
      <div className="flex justify-between text-center bg-gray-200 rounded-lg p-1 space-x-1 m-4">
        <TabButton 
          label="Aktif" 
          count={counts.active} 
          isActive={activeList === 'active'} 
          onClick={() => setActiveList('active')} 
        />
        <TabButton 
          label="Antrian" 
          count={counts.queue} 
          isActive={activeList === 'queue'} 
          onClick={() => setActiveList('queue')} 
        />
        <TabButton 
          label="Tertahan" 
          count={counts.pending} 
          isActive={activeList === 'pending'} 
          onClick={() => setActiveList('pending')} 
        />
        <TabButton 
          label="Selesai" 
          count={counts.resolve} 
          isActive={activeList === 'resolve'} 
          onClick={() => setActiveList('resolve')} 
        />
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
        {isLoading ? (
          <div className="flex items-center justify-center h-32">
            <div className="text-gray-500 text-sm">Memuat data...</div>
          </div>
        ) : (
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
        )}
      </div>
    </div>
  );
};

export default HelpDeskListPanel;