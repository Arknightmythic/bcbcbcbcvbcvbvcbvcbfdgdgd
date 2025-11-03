// [File: src/features/HelpDesk/pages/HelpDeskIntroPage.tsx]

import React from 'react';
import { MessageSquareText } from 'lucide-react';

const HelpDeskIntroPage: React.FC = () => {
  return (
    <div className="flex-1 flex flex-col justify-center items-center text-center p-8 bg-gray-50 h-full">
      <MessageSquareText className="w-16 h-16 text-gray-300 mb-4" />
      <h2 className="text-xl font-semibold text-gray-700">Selamat Datang, Agen!</h2>
      <p className="text-gray-500 mt-2">
        Pilih percakapan dari daftar 'Active' atau 'Queue' di sebelah kiri untuk memulai.
      </p>
    </div>
  );
};

export default HelpDeskIntroPage;