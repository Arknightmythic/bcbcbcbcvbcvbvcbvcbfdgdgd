// [GANTI: src/features/PublicService/pages/PublicServiceIntroPage.tsx]

import React, { useMemo } from "react";
import { Loader2, MessageSquarePlus, MessageSquareText } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

// Impor tipe DAN API
import type { Conversation, ChatSession } from "../utils/types";
import { getConversations } from "../api/chatApi";
import { useServicePublicChat } from "../hooks/useServicePublicChat";
import { useAuthStore } from "../../../shared/store/authStore"; // 1. Impor AuthStore

// Komponen SessionCard (Tidak Berubah)
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
        <p className="font-semibold text-gray-800 text-sm">Lanjutkan Sesi</p>
        <p className="text-[10px] text-gray-500 mt-1">
          Dimulai pada:{" "}
          {new Date(session.created_at).toLocaleString("id-ID", {
            dateStyle: "medium",
            timeStyle: "short",
          })}
        </p>
      </div>
      <MessageSquareText className="w-4 h-4 text-blue-500 flex-shrink-0 ml-4" />
    </button>
  );
};

// Komponen Halaman Intro (Modifikasi)
const PublicServiceIntroPage: React.FC = () => {
  // 2. Ambil user dari AuthStore
  const user = useAuthStore((state) => state.user);
  const platformUniqueId = user?.email || "anonymous_user"; // Gunakan email sebagai ID

  const {
    isRestoringSession,
    handleSelectSession,
    handleCreateNewSession,
  } = useServicePublicChat();

  // 3. Gunakan React Query untuk mengambil data sesi
  const { data: conversationsData, isLoading: isLoadingSessions } = useQuery({
    // Tambahkan platformUniqueId ke queryKey agar unik per user
    queryKey: ["conversations", platformUniqueId],
    queryFn: () => {
      // 4. Tambahkan platform_unique_id ke parameter API
      const params = new URLSearchParams("page=1&page_size=10");
      params.set("platform_unique_id", platformUniqueId);
      return getConversations(params);
    },
    // Hanya jalankan query jika platformUniqueId sudah ada
    enabled: !!platformUniqueId,
  });

  // 5. Map data API (Conversation[]) ke data UI (ChatSession[])
  const activeSessions: ChatSession[] = useMemo(
    () =>
      conversationsData?.data?.map((convo: Conversation) => ({
        id: convo.id,
        created_at: convo.start_timestamp,
        agent_name: convo.is_helpdesk ? "Agent" : "AI Assistant",
      })) || [],
    [conversationsData]
  );
  // --- Akhir blok React Query ---

  const isLoading = isLoadingSessions || isRestoringSession;

  return (
    <div className="flex h-full flex-col bg-gray-50">
      <div className="flex-1 flex flex-col justify-center bg-white w-full rounded-xl shadow-lg border border-gray-200 p-8 text-center">
        {isLoading ? (
          <div className="flex justify-center items-center py-10">
            <Loader2 className="w-12 h-full animate-spin text-blue-500" />
          </div>
        ) : (
          <>
            <h2 className="text-lg font-bold text-gray-800 mb-3">
              Selamat Datang!
            </h2>
            <p className="text-gray-600 mb-6 text-sm">
              Mulai percakapan baru atau lanjutkan sesi Anda dengan AI Assistant
              kami.
            </p>

            {activeSessions && activeSessions.length > 0 && (
              <>
                <h3 className="text-xs font-semibold text-gray-500 mb-3 text-left uppercase tracking-wide">
                  Sesi Tersimpan
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                  {activeSessions.map((session) => (
                    <SessionCard
                      key={session.id}
                      session={session}
                      onSelect={handleSelectSession}
                    />
                  ))}
                </div>
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

            <div className="w-full flex justify-center">
              <button
                onClick={handleCreateNewSession}
                disabled={isLoading}
                className="w-md bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center justify-center transition-colors duration-150 disabled:bg-gray-400"
              >
                <MessageSquarePlus className="w-5 h-5 mr-2" />
                Buat Sesi Baru
              </button>
            </div>
          </>
        )}
      </div>
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