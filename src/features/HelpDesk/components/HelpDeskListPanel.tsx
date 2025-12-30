import React, { useState, useEffect, useMemo } from 'react'; 
import { useNavigate, useParams } from 'react-router';
import { MessageSquare, Clock, CheckCheck, RefreshCw, type LucideIcon, Loader2 } from 'lucide-react';
import type { HelpDeskChatListType, ChatChannel, HelpDeskChat } from '../utils/types';
import { ChatList } from '../../../shared/components/sidebar/ChatList';
import toast from 'react-hot-toast'; 
import CustomSelect from '../../../shared/components/CustomSelect'; 
import { useAcceptHelpDesk, useGetHelpDesksInfinite, useGetHelpDeskSummary } from '../hooks/useHelpDesk';
import { useQueryClient } from '@tanstack/react-query';
import HelpDeskSwitch from './HelpDeskSwitch';
import { formatIndonesianShortNumber } from '../../../shared/utils/numberformatter';

const channelFilterOptions = [
  { value: "", label: "Semua Channel" },
  { value: "web", label: "Situs" },
  { value: "whatsapp", label: "WhatsApp" },
  { value: "instagram", label: "Instagram" },
  { value: "email", label: "Email" },
];

const TabButton = ({ label, count, isActive, onClick }: { label: string, count: number, isActive: boolean, onClick: () => void }) => {
  const activeStyle = "bg-bOss-red border-bOss-red-200 shadow-sm";
  const inactiveStyle = "bg-transparent border-transparent";
  const displayCount = formatIndonesianShortNumber(count);
  const fullCount = new Intl.NumberFormat('id-ID').format(count);

  return (
    <button
      onClick={onClick}
      
      title={`Total: ${fullCount} tiket`} 
      className={`flex-1 rounded-md py-1 text-xs transition-all duration-200 group relative ${isActive ? activeStyle : inactiveStyle}`}
    >
      <span className={`block font-bold text-lg ${isActive ? "text-white" : "text-gray-800"}`}>
        {displayCount}
      </span>
      <span className={`capitalize ${isActive ? "text-white" : "text-gray-600"}`}>
        {label}
      </span>
    </button>
  );
};

const getStatusFromTab = (tab: HelpDeskChatListType): string => {
  const statusMap: Record<string, string> = {
    active: 'in_progress',
    pending: 'pending',
    resolve: 'resolved',
    queue: 'queue',
  };
  return statusMap[tab] || 'queue';
};

const HelpDeskListPanel: React.FC = () => {

  const [activeList, setActiveList] = useState<HelpDeskChatListType>('queue');
  const [selectedChannel, setSelectedChannel] = useState<ChatChannel | ''>('');
  
  const navigate = useNavigate();
  const { sessionId } = useParams<{ sessionId: string }>();
  const queryClient = useQueryClient();


const { data: summaryData } = useGetHelpDeskSummary();


const counts = {
    active: summaryData?.active || 0,
    queue: summaryData?.queue || 0,
    pending: summaryData?.pending || 0,
    resolve: summaryData?.resolved || 0,
  };


  const currentStatus = getStatusFromTab(activeList);
  const currentSearch = selectedChannel || "";

  const { 
    data, 
    fetchNextPage, 
    hasNextPage, 
    isFetchingNextPage, 
    isLoading,
    isError,
    refetch 
  } = useGetHelpDesksInfinite(currentStatus, currentSearch);

  const currentChats: HelpDeskChat[] = useMemo(() => {
    if (!data?.pages) return [];

    const allHelpdesks = data.pages.flatMap((page) => page.helpdesks);

    return allHelpdesks.map((helpdesk) => ({
      id: helpdesk.session_id,
      user_name: helpdesk.platform_unique_id || `User ${helpdesk.id}`,
      
      last_message: helpdesk.platform_unique_id ? `ID: ${helpdesk.platform_unique_id}` : `Status: ${helpdesk.status}`, 
      timestamp: helpdesk.created_at,
      channel: helpdesk.platform,
      status: helpdesk.status,
      helpdesk_id: helpdesk.id,
    }));
  }, [data]);

  const acceptMutation = useAcceptHelpDesk();


  useEffect(() => {
    queryClient.invalidateQueries({ queryKey: ['helpdesks', 'summary'] });
  }, [activeList, queryClient]);


  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        refetch();
        queryClient.invalidateQueries({ queryKey: ['helpdesks', 'summary'] });      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [refetch, queryClient]);



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
    queryClient.invalidateQueries({ queryKey: ['helpdesks', 'summary'] }); 
    toast.success('Memuat ulang data berhasil');
  };

  const handleAcceptChat = (chatId: string) => {
    const chat = currentChats.find((c) => c.id === chatId);
    
    if (!chat?.helpdesk_id) {
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
          queryClient.invalidateQueries({ queryKey: ['helpdesks', 'summary'] });
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
        <h2 className="text-md font-bold text-gray-800">Layanan Bantuan</h2>
        <div className="flex items-center gap-3">
          <HelpDeskSwitch />
          
          <div className="h-4 w-px bg-gray-300 mx-1"></div> {/* Divider */}

          <button
            onClick={handleRefresh}
            disabled={isLoading}
            className="p-1.5 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-50"
            title="Refresh data"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>

      </div>

      {/* Tabs dengan Counter */}
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

     <div className="flex-1 overflow-y-auto custom-scrollbar" id="scrollable-chat-list">
        {isLoading ? (
          <div className="flex items-center justify-center h-32">
             <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
          </div>
        ) : (
          <>
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
            
            {/* Tombol Load More Manual (Lebih aman & mudah daripada auto scroll observer untuk list sidebar) */}
            {hasNextPage && (
              <div className="p-2 flex justify-center">
                <button
                  onClick={() => fetchNextPage()}
                  disabled={isFetchingNextPage}
                  className="text-xs text-blue-600 hover:text-blue-800 font-medium py-2 px-4 bg-blue-50 hover:bg-blue-100 rounded-full transition-colors flex items-center gap-2"
                >
                  {isFetchingNextPage ? (
                    <>
                      <Loader2 className="w-3 h-3 animate-spin" /> Memuat...
                    </>
                  ) : (
                    "Muat Lebih Banyak"
                  )}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default HelpDeskListPanel;