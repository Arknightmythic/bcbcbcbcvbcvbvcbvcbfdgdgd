import React from "react";
import { Loader2 } from "lucide-react";
import { useGetHelpDeskSwitchStatus, useUpdateHelpDeskSwitchStatus } from "../hooks/useHelpDesk";

const HelpDeskSwitch: React.FC = () => {
  const { data, isLoading } = useGetHelpDeskSwitchStatus();
  const mutation = useUpdateHelpDeskSwitchStatus();

  const handleToggle = () => {
    if (data) {
      mutation.mutate(!data.status);
    }
  };

  if (isLoading) {
    return <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />;
  }

  const isActive = data?.status || false;

  return (
    <div className="flex items-center gap-2">
      <span className={`text-xs font-medium ${isActive ? "text-green-600" : "text-gray-500"}`}>
        {isActive ? "Online" : "Offline"}
      </span>
      
      <button
        onClick={handleToggle}
        disabled={mutation.isPending}
        className={`
          relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2
          ${isActive ? "bg-green-500" : "bg-gray-300"}
          ${mutation.isPending ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
        `}
        title={isActive ? "Matikan Layanan Helpdesk" : "Aktifkan Layanan Helpdesk"}
      >
        <span
          className={`
            inline-block h-4 w-4 transform rounded-full bg-white transition duration-200 ease-in-out shadow-sm
            ${isActive ? "translate-x-6" : "translate-x-1"}
          `}
        />
      </button>
    </div>
  );
};

export default HelpDeskSwitch;