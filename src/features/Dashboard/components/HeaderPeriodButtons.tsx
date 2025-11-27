// components/DashboardHeader/HeaderPeriodButtons.tsx

import React from 'react';
import type { Period } from '../utils/types';


interface HeaderPeriodButtonsProps {
    activePeriod: Period;
    handlePeriodClick: (period: Period) => void;
    buttonBaseClasses: string;
    buttonInactiveClasses: string;
    buttonActiveClasses: string;
}

const periodOptions: Period[] = ['daily', 'monthly', 'yearly', 'custom'];

const periodLabels: Record<Period, string> = {
    daily: 'Harian',
    monthly: 'Bulanan',
    yearly: 'Tahunan',
    custom: 'Kustom',
};

const HeaderPeriodButtons: React.FC<HeaderPeriodButtonsProps> = ({
    activePeriod,
    handlePeriodClick,
    buttonBaseClasses,
    buttonInactiveClasses,
    buttonActiveClasses,
}) => (
    <div className="flex gap-2 bg-gray-50 p-1 rounded-md border border-gray-200 items-center w-full mb-2 md:mb-0">
        {periodOptions.map((period) => (
             <button
               key={period}
               onClick={() => handlePeriodClick(period)}
               className={`${buttonBaseClasses} ${
                 activePeriod === period ? buttonActiveClasses : buttonInactiveClasses
               }`}
             >
               {/* Menggunakan label yang dilokalisasi */}
               {periodLabels[period]} 
             </button>
        ))}
    </div>
);

export default HeaderPeriodButtons;