
import { useCurrentTime } from '../hooks/useCurrentTime';
import { useDateFilterLogic } from '../hooks/useDateFilterLogic';
import type { Period } from '../utils/types';

interface UseDashboardHeaderLogicProps {
  onPeriodChange: (period: Period) => void;
  onCustomDateApply: (dates: { startDate: string; endDate: string }) => void;
  defaultPeriod: Period;
  defaultStartDate: string;
  defaultEndDate: string;
}

// Extracted styles to constant to reduce cognitive load inside hook
const BUTTON_STYLES = {
  base: 'py-2 px-3 md:py-1.5 md:px-5 rounded font-medium transition-all duration-300 text-xs flex-1 whitespace-nowrap',
  inactive: 'bg-transparent text-gray-500 hover:text-gray-800 hover:bg-gray-200',
  active: 'bg-blue-600 text-white shadow-md',
};

export const useDashboardHeaderLogic = (props: UseDashboardHeaderLogicProps) => {
  // 1. Gunakan Shared Hook untuk Waktu
  const { currentTime, formattedTime } = useCurrentTime('id-ID');

  // 2. Gunakan Shared Hook untuk Logika Filter Tanggal
  const {
    activePeriod,
    isCustomDateVisible,
    startDate,
    endDate,
    handlePeriodClick,
    handleApplyClick,
    handleRangeChange
  } = useDateFilterLogic(props);

  return {
    currentTime,
    formattedTime,
    activePeriod,
    isCustomDateVisible,
    startDate,
    endDate,
    handlePeriodClick,
    handleApplyClick,
    handleRangeChange,
    buttonBaseClasses: BUTTON_STYLES.base,
    buttonInactiveClasses: BUTTON_STYLES.inactive,
    buttonActiveClasses: BUTTON_STYLES.active,
  };
};