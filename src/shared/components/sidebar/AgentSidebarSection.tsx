import { TabCount } from "./TabButton";

// Tipe untuk props
type ChatListType = 'active' | 'queue' | 'history' | 'pending';
type AgentStatus = 'online' | 'away' | 'offline';

interface AgentSidebarSectionProps {
  activeList: ChatListType;
  onTabChange: (list: ChatListType) => void;
  counts: {
    active: number;
    queue: number;
    history: number;
    pending: number;
  };
  agentName: string;
  agentStatus: AgentStatus;
}

// Sub-komponen untuk menghindari repetisi

export const AgentSidebarSection = ({
  activeList,
  onTabChange,
  counts,
  agentName,
  agentStatus,
}: AgentSidebarSectionProps) => {
  // Logika untuk mendapatkan inisial nama
  const agentInitial = agentName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase() || "A";

  // Konfigurasi untuk styling status
  const statusConfig = {
    online: { text: "Online", color: "bg-green-500", textColor: "text-green-600" },
    away: { text: "Away", color: "bg-yellow-500", textColor: "text-yellow-600" },
    offline: { text: "Offline", color: "bg-red-500", textColor: "text-red-600" },
  };

  const currentStatus = statusConfig[agentStatus] || { text: 'Unknown', color: 'bg-gray-400', textColor: 'text-gray-600' };

  return (
    <div className="px-5 py-4 border-t border-gray-200 bg-gray-50 hidden md:block">
      {/* Profile Section */}
      <div className="flex items-center mb-3">
        <div className="w-8 h-8 bg-bOss-red rounded-full flex items-center justify-center text-white text-[12px] font-bold mr-3">
          {agentInitial}
        </div>
        <div className="flex-1">
          <div className="font-semibold text-xs text-gray-700">{agentName}</div>
          <div className={`text-[10px] font-semibold ${currentStatus.textColor}`}>
            {currentStatus.text}
          </div>
        </div>
        <div className={`w-2.5 h-2.5 rounded-full ${currentStatus.color}`} />
      </div>

      {/* Tabs Section */}
      <div className="flex justify-between text-center bg-gray-200 rounded-lg p-1 space-x-1">
        <TabCount label="Aktif" count={counts.active} />
        <TabCount label="Antrian" count={counts.queue}/>
        <TabCount label="Riwayat" count={counts.history}/>
        <TabCount label="Pending" count={counts.pending}/>
      </div>
    </div>
  );
};