// --- PERUBAHAN DI SINI ---
import React, { useState, useMemo } from 'react'; // Impor useMemo
import { useNavigate, useParams } from 'react-router';
import { MessageSquare, Clock, CheckCheck, type LucideIcon } from 'lucide-react';
// Impor ChatChannel dan CustomSelect
import type { ChatLists, HelpDeskChatListType, HelpDeskChat, ChatChannel } from '../utils/types';
import { ChatList } from '../../../shared/components/sidebar/ChatList';
import toast from 'react-hot-toast'; 
import CustomSelect from '../../../shared/components/CustomSelect'; // Impor CustomSelect
// --- AKHIR PERUBAHAN ---

// (DUMMY_CHAT_LISTS diperbarui dengan 'channel')
const DUMMY_CHAT_LISTS: ChatLists = {
  active: [
    { id: 'active-1', user_name: 'User Aktif 1', last_message: '...', timestamp: new Date().toISOString(), channel: 'web' },
  ],
  queue: [
    { id: 'queue-1', user_name: 'User Antrian 1', last_message: 'Menunggu...', timestamp: new Date().toISOString(), channel: 'whatsapp' },
    { id: 'queue-2', user_name: 'User Antrian 2', last_message: 'Menunggu...', timestamp: new Date(Date.now() - 300000).toISOString(), channel: 'instagram' },
  ],
  pending: [
     { id: 'pending-1', user_name: 'User Pending (15m+)', last_message: 'Menunggu lama...', timestamp: new Date(Date.now() - 900000).toISOString(), channel: 'email' },
  ],
  resolve: [
    { id: 'resolve-1', user_name: 'User Selesai 1', last_message: 'Selesai', timestamp: new Date(Date.now() - 86400000).toISOString(), channel: 'web' },
  ],
};

// Opsi untuk filter kanal
const channelFilterOptions = [
  { value: "", label: "Semua Kanal" },
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
  const [chatLists, setChatLists] = useState<ChatLists>(DUMMY_CHAT_LISTS);
  // --- PERUBAHAN DI SINI: State untuk filter kanal ---
  const [selectedChannel, setSelectedChannel] = useState<ChatChannel | ''>('');
  
  const navigate = useNavigate();
  const { sessionId } = useParams<{ sessionId: string }>();

  const listConfig: Record<HelpDeskChatListType, { icon: LucideIcon; title: string; empty: string }> = {
    active: { icon: MessageSquare, title: "Active Chats", empty: "Tidak ada chat aktif." },
    queue: { icon: Clock, title: "Queue", empty: "Antrian kosong." },
    pending: { icon: Clock, title: "Pending", empty: "Tidak ada chat pending." },
    resolve: { icon: CheckCheck, title: "Resolve (History)", empty: "Tidak ada riwayat chat." },
  };

  const handleSelectChat = (chatId: string) => {
    navigate(`/helpdesk/${chatId}`);
  };

  const handleAcceptChat = (chatId: string) => {
    let chatToMove: HelpDeskChat | undefined;

    setChatLists(prev => {
      const newQueue = prev.queue.filter(c => c.id !== chatId);
      const newPending = prev.pending.filter(c => c.id !== chatId);
      
      if (newQueue.length < prev.queue.length) {
        chatToMove = prev.queue.find(c => c.id === chatId);
      } else {
        chatToMove = prev.pending.find(c => c.id === chatId);
      }

      if (!chatToMove) return prev;

      chatToMove.timestamp = new Date().toISOString(); 
      const newActive = [chatToMove, ...prev.active];
      
      return {
        ...prev,
        active: newActive,
        queue: newQueue,
        pending: newPending,
      };
    });
    
    toast.success(`Chat ${chatId} diterima!`);
    setActiveList('active');
    navigate(`/helpdesk/${chatId}`);
  };

  const currentListConfig = listConfig[activeList];

  // --- PERUBAHAN DI SINI: Logika filtering ---
  const currentChats = useMemo(() => {
    const listByStatus = chatLists[activeList];
    if (!selectedChannel) {
      return listByStatus; // Tidak ada filter kanal
    }
    // Filter berdasarkan kanal yang dipilih
    return listByStatus.filter(chat => chat.channel === selectedChannel);
  }, [chatLists, activeList, selectedChannel]);
  // --- AKHIR PERUBAHAN ---
  
  const itemActionType = (activeList === 'queue' || activeList === 'pending') ? 'accept' : undefined;

  return (
    <div className="flex flex-col h-full min-h-0">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-xl font-bold text-gray-800">Help Desk</h2>
      </div>

      <div className="flex justify-between text-center bg-gray-200 rounded-lg p-1 space-x-1 m-4">
        <TabButton label="Active" count={chatLists.active.length} isActive={activeList === 'active'} onClick={() => setActiveList('active')} />
        <TabButton label="Queue" count={chatLists.queue.length} isActive={activeList === 'queue'} onClick={() => setActiveList('queue')} />
        <TabButton label="Pending" count={chatLists.pending.length} isActive={activeList === 'pending'} onClick={() => setActiveList('pending')} />
        <TabButton label="Resolve" count={chatLists.resolve.length} isActive={activeList === 'resolve'} onClick={() => setActiveList('resolve')} />
      </div>

      {/* --- PERUBAHAN DI SINI: Tambah Dropdown Filter --- */}
      <div className="px-4 pb-2 border-b border-gray-200">
        <CustomSelect
          selectedType="default"
          value={selectedChannel}
          onChange={(value) => setSelectedChannel(value as ChatChannel | '')}
          options={channelFilterOptions}
        />
      </div>
      {/* --- AKHIR PERUBAHAN --- */}


      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <ChatList
          title={currentListConfig.title}
          icon={currentListConfig.icon}
          chats={currentChats} // Gunakan data yang sudah difilter
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