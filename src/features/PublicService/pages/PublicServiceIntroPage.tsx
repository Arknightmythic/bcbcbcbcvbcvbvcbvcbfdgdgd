
// 1. Impor useEffect
import React, { useMemo, useRef, useCallback, useEffect } from "react";
import { Loader2, MessageSquarePlus, MessageSquareText } from "lucide-react";
// 2. Impor useInfiniteQuery dan useQueryClient
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";

// Impor tipe DAN API
import type { Conversation, ChatSession } from "../utils/types";
import { getConversations } from "../api/chatApi";
import { useServicePublicChat } from "../hooks/useServicePublicChat";
import { useAuthStore } from "../../../shared/store/authStore";

// Komponen SessionCard (Tidak Berubah)
interface SessionCardProps {
  session: ChatSession;
  onSelect: (session: ChatSession) => void;
}
const SessionCard: React.FC<SessionCardProps> = ({ session, onSelect}) => {
  return (
    <button
      key={session.id}
      onClick={() => onSelect(session)}
      className="text-left p-4 border border-gray-200 rounded-lg hover:bg-gray-50 flex items-center justify-between transition-colors duration-150 shadow-sm hover:shadow-md"
    >
      <div>
        <p className="font-semibold text-gray-800 text-sm">{session.cardContext}</p>
        <p className="text-[10px] text-gray-500 mt-1">
          created at:{" "}
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
  const user = useAuthStore((state) => state.user);
  const platformUniqueId = user?.email || "anonymous_user";

  const {
    isRestoringSession,
    handleSelectSession,
    handleCreateNewSession,
  } = useServicePublicChat();

  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // 3. Dapatkan queryClient
  const queryClient = useQueryClient();

  const {
    data: infiniteData,
    isLoading: isLoadingSessions,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ["conversations", platformUniqueId],
    queryFn: ({ pageParam = 1 }) =>
      getConversations(platformUniqueId, pageParam as number),
    getNextPageParam: (lastPage) => {
      if (lastPage.page < lastPage.total_pages) {
        return lastPage.page + 1;
      }
      return undefined;
    },
    initialPageParam: 1,
    enabled: !!platformUniqueId,
  });

  // 4. Tambahkan useEffect ini untuk mereset query saat unmount
  useEffect(() => {
    // Fungsi 'return' dari useEffect akan dijalankan saat
    // komponen 'unmount' (ditinggalkan)
    return () => {
      queryClient.resetQueries({
        queryKey: ["conversations", platformUniqueId],
        exact: true, // Pastikan hanya query ini yang direset
      });
    };
  }, [queryClient, platformUniqueId]); // <-- Akhir blok useEffect

  const activeSessions: ChatSession[] = useMemo(
    () =>
      infiniteData?.pages.flatMap((page) =>
        (page.data || []).map((convo: Conversation) => ({
        id: convo.id,
        created_at: convo.start_timestamp,
        agent_name: convo.is_helpdesk ? "Agent" : "AI Assistant",
        cardContext: convo.context || "lanjutkan sesi",
      }))
    ) || [],
  [infiniteData]
  );

  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleScroll = useCallback(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      const container = scrollContainerRef.current;
      if (container) {
        const { scrollHeight, scrollTop, clientHeight } = container;
        if (scrollHeight - scrollTop - clientHeight < 50) {
          if (hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
          }
        }
      }
    }, 200);
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const isLoading = isLoadingSessions || isRestoringSession;

  return (
    <div className="flex h-full flex-col bg-gray-50">
      <div className="flex-1 flex flex-col justify-center bg-white w-full rounded-xl shadow-lg border border-gray-200 p-8 text-center">
        {isLoading && !isFetchingNextPage ? (
          <div className="flex justify-center items-center py-10">
            <Loader2 className="w-12 h-full animate-spin text-blue-500" />
          </div>
        ) : (
          <>
            <h2 className="text-lg font-bold text-gray-800 mb-3">
              Welcome
            </h2>
            <p className="text-gray-600 mb-6 text-sm">
              Start a new conversation or continue your session with our AI Assistant.
            </p>

            {activeSessions && activeSessions.length > 0 && (
              <>
                <h3 className="text-xs font-semibold text-gray-500 mb-3 text-left uppercase tracking-wide">
                  Previous Conversations
                </h3>
                <div
                  ref={scrollContainerRef}
                  onScroll={handleScroll}
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6 max-h-60 overflow-y-auto pr-2 custom-scrollbar"
                >
                  {activeSessions.map((session) => (
                    <SessionCard
                      key={session.id}
                      session={session}
                      onSelect={handleSelectSession}
                    />
                  ))}

                  {isFetchingNextPage && (
                    <div className="flex justify-center items-center py-4 md:col-span-2 lg:col-span-3">
                      <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
                    </div>
                  )}
                </div>

                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-gray-300"></span>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="bg-white px-2 text-gray-500">or</span>
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
                New Conversation
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