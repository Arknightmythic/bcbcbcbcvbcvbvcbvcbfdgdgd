
type AgentStatus = 'aktif' | 'keluar' | 'tidak_aktif';

interface AgentSidebarSectionProps {
  agentName: string;
  agentStatus: AgentStatus;
}



export const AgentSidebarSection = ({
  agentName,
  agentStatus,
}: AgentSidebarSectionProps) => {
  
  const agentInitial = agentName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase() || "A";

  
  const statusConfig = {
    aktif: { text: "aktif", color: "bg-green-500", textColor: "text-green-600" },
    keluar: { text: "keluar", color: "bg-yellow-500", textColor: "text-yellow-600" },
    tidak_aktif: { text: "tidak aktif", color: "bg-red-500", textColor: "text-red-600" },
  };

  const currentStatus = statusConfig[agentStatus] || { text: 'Unknown', color: 'bg-gray-400', textColor: 'text-gray-600' };

  return (
    <div className="px-5 py-4 border-t border-gray-200 bg-gray-50 hidden md:block">
      <div className="flex items-center">
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

     
    </div>
  );
};