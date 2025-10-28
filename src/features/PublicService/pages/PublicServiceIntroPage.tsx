import React from 'react';
import { Loader2, MessageSquarePlus, MessageSquareText } from 'lucide-react';
import { usePublicServiceChat } from '../hooks/useServicePublicChat'; // Import hook yang sudah dibuat
import type { ChatSession } from '../utils/types'; // Import tipe ChatSession

// Komponen untuk menampilkan satu kartu sesi
interface SessionCardProps {
  session: ChatSession;
  onSelect: (session: ChatSession) => void;
}

const SessionCard: React.FC<SessionCardProps> = ({ session, onSelect }) => {
  return (
    <button
      key={session.id}
      onClick={() => onSelect(session)}
      className="text-left p-4 border border-gray-200 rounded-lg hover:bg-gray-50 flex items-center justify-between transition-colors duration-150 shadow-sm hover:shadow-md"
    >
      <div>
        <p className="font-semibold text-gray-800">
          Lanjutkan Sesi
          {session.agent_name ? ` dengan ${session.agent_name}` : ''}
        </p>
        <p className="text-xs text-gray-500 mt-1">
          Dimulai pada: {new Date(session.created_at).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}
        </p>
      </div>
      <MessageSquareText className="w-5 h-5 text-blue-500 flex-shrink-0 ml-4" />
    </button>
  );
};


// Komponen Halaman Intro
const PublicServiceIntroPage: React.FC = () => {
  // Menggunakan hook untuk mendapatkan data sesi dan handler
  const {
    activeSessions,
    isLoadingSessions,
    isRestoringSession, // Mungkin ingin menampilkan loading saat membuat sesi baru juga
    handleSelectSession,
    handleCreateNewSession,
  } = usePublicServiceChat();

  // Menentukan state loading gabungan
  const isLoading = isLoadingSessions || isRestoringSession;

  return (
    // Container utama dibuat flex untuk centering dan styling
    <div className="flex h-full flex-col bg-gray-50">
      <div className="flex-1 flex flex-col justify-center bg-white w-full rounded-xl shadow-lg border border-gray-200 p-8 text-center">
        {/* Tampilkan loader jika sedang memuat sesi atau membuat/memulihkan sesi */}
        {isLoading ? (
          <div className="flex justify-center items-center py-10">
            <Loader2 className="w-12 h-full animate-spin text-blue-500" />
          </div>
        ) : (
          // Konten utama jika tidak loading
          <>
            <h2 className="text-2xl font-bold text-gray-800 mb-3">
              Selamat Datang!
            </h2>
            <p className="text-gray-600 mb-6 text-sm">
              Mulai percakapan baru atau lanjutkan sesi Anda dengan AI Assistant kami.
            </p>

            {/* Bagian menampilkan sesi yang ada */}
            {activeSessions && activeSessions.length > 0 && (
              <>
                <h3 className="text-sm font-semibold text-gray-500 mb-3 text-left uppercase tracking-wide">Sesi Tersimpan</h3>
                {/* Container untuk list sesi dengan scroll jika banyak */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                  {activeSessions.map(session => (
                    <SessionCard key={session.id} session={session} onSelect={handleSelectSession} />
                  ))}
                </div>
                {/* Pemisah "atau" */}
                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-gray-300"></span>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="bg-white px-2 text-gray-500">atau</span>
                  </div>
                </div>
              </>
            )}

            {/* Tombol untuk membuat sesi baru */}
            <button
              onClick={handleCreateNewSession}
              disabled={isLoading} // Disable tombol saat loading
              className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center justify-center transition-colors duration-150 disabled:bg-gray-400"
            >
              <MessageSquarePlus className="w-5 h-5 mr-2" />
              Buat Sesi Baru
            </button>
          </>
        )}
      </div>
      {/* Style tambahan untuk scrollbar jika diperlukan */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #f1f1f1; border-radius: 3px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #ccc; border-radius: 3px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #aaa; }
      `}</style>
    </div>
  );
};

export default PublicServiceIntroPage;
