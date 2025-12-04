import { useRef } from "react";
import { AgentSidebarSection } from "./AgentSidebarSection";
import { useDraggable } from "../../hooks/useDraggable";
import Tooltip from "../Tooltip";

type AgentStatus = "aktif" | "keluar" | "tidak_aktif";

interface AgentPanelProps {
  agentName: string;
  agentStatus: AgentStatus;
  panelRef: React.RefObject<HTMLDivElement | null>;
  isCollapsed: boolean;
}

export const AgentPanel = ({
  agentName,
  agentStatus,
  panelRef,
  isCollapsed,
}: AgentPanelProps) => {
  const dragHandleRef = useRef<HTMLDivElement>(null);

  // Fitur drag dinonaktifkan secara permanen
  useDraggable(panelRef, dragHandleRef, () => {}, false);

  const agentInitial =
    agentName
      .split(" ")
      .map((n) => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase() || "A";

  const statusConfig = {
    aktif: { color: "bg-green-500" },
    keluar: { color: "bg-yellow-500" },
    tidak_aktif: { color: "bg-red-500" },
  };

  const currentStatus = statusConfig[agentStatus] || { color: "bg-gray-400" };

  if (isCollapsed) {
    return (
      <div className="flex flex-col items-center py-2 space-y-4 rounded rounded-t-md">
        {/* Ikon Agen (Budi Santoso) */}
        <Tooltip text={`${agentName} (${agentStatus})`}>
          <div className="relative cursor-pointer">
            <div className="w-8 h-8 bg-bOss-red rounded-full flex items-center justify-center text-white text-sm font-bold">
              {agentInitial}
            </div>
            <span
              className={`absolute bottom-0 right-0 block h-3 w-3 rounded-full ${currentStatus.color} border-2 border-white`}
            />
          </div>
        </Tooltip>
      </div>
    );
  }

  // Tampilan "Expanded" (tidak berubah)
  return (
    <div
      ref={panelRef}
      className="flex flex-col min-h-0 border-t border-gray-200"
    >
      <AgentSidebarSection
        agentName={agentName}
        agentStatus={agentStatus}
      />
    </div>
  );
};
