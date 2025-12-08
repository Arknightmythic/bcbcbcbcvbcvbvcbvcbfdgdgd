import React, { useState, useRef, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router";
import { Send, Check, ArrowLeft, Loader2, UserPlus } from "lucide-react";
import type { HelpDeskMessage } from "../utils/types";
import toast from "react-hot-toast";
import {
  useGetChatHistory,
  useGetHelpDeskBySessionId,
  useResolveHelpDesk,
  useSendHelpdeskMessage,
  useAcceptHelpDesk,
} from "../hooks/useHelpDesk";
import { getWebSocketService } from "../../../shared/utils/WebsocketService";
import { useQueryClient } from "@tanstack/react-query";

const QuickResponseButton = ({
  text,
  onClick,
}: {
  text: string;
  onClick: () => void;
}) => (
  <button
    onClick={onClick}
    className="text-xs font-medium text-blue-600 border border-blue-200 bg-blue-50 rounded-full px-3 py-1.5 hover:bg-blue-100 transition-colors"
  >
    {text}
  </button>
);

const HelpDeskChatPage: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const [input, setInput] = useState("");
  const queryClient = useQueryClient();

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const observerTarget = useRef<HTMLDivElement>(null);
  const [shouldScrollToBottom, setShouldScrollToBottom] = useState(true);
  const previousScrollHeight = useRef<number>(0);
  const wsService = useRef(getWebSocketService());

  // --- HOOKS ---
  const {
    data: chatHistory,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: isLoadingChat,
    isError,
    refetch: refetchChatHistory,
  } = useGetChatHistory(sessionId || "", 50, !!sessionId);

  const { data: helpdeskInfo, refetch: refetchInfo } =
    useGetHelpDeskBySessionId(sessionId || "", !!sessionId);

  const resolveMutation = useResolveHelpDesk();
  const sendMessageMutation = useSendHelpdeskMessage();
  const acceptMutation = useAcceptHelpDesk();

  // --- LOGIKA STATUS (PERBAIKAN CASE SENSITIVE) ---
  // Normalisasi status ke lowercase agar "Queue" terbaca sebagai "queue"
  const normalizedStatus = helpdeskInfo?.status?.toLowerCase();

  const isQueue =
    normalizedStatus === "queue" ||
    normalizedStatus === "open" ||
    normalizedStatus === "pending";

  const canInteract = normalizedStatus === "in_progress";

  const isResolved =
    normalizedStatus === "resolved" || normalizedStatus === "closed";

  const currentChatUser = sessionId
    ? helpdeskInfo?.platform_unique_id ||
      `Session ${sessionId.substring(0, 8)}...`
    : "Sesi Chatbot";

  let statusColorClass = "bg-gray-400"; // Default color
  if (isQueue) {
    statusColorClass = "bg-orange-500";
  } else if (canInteract) {
    statusColorClass = "bg-green-500";
  }
  // --- WEBSOCKET ---
 useEffect(() => {
    if (!sessionId) return;

    const ws = wsService.current;
    const agentChannel = `${sessionId}-agent`;

    // Fungsi wrapper untuk memastikan koneksi siap sebelum subscribe
    const initWebSocket = async () => {
      try {
        // 1. Cek status, jika belum connect, tunggu sampai connect selesai
        if (!ws.isConnected()) {
          console.log("⏳ Connecting to WebSocket...");
          await ws.connect();
        }

        // 2. Registrasi Handler untuk menerima pesan
        // Handler ini yang akan mengupdate data secara otomatis
        const unsubscribe = ws.onMessage(agentChannel, (data: any) => {
          console.log("📨 Received WebSocket message:", data);
          
          // Trigger refetch data chat history
          queryClient.invalidateQueries({ queryKey: ["chatHistory", sessionId] });

          // Jika ada update status (misal user menutup chat), refresh info helpdesk
          if (data?.type === "status_update") {
            queryClient.invalidateQueries({ queryKey: ["helpdesks", "session", sessionId] });
          }
        });

        // 3. Simpan fungsi cleanup ke ref agar bisa dibersihkan saat unmount
        // (Kita simpan manual karena onMessage di service Anda mengembalikan func unsubscribe)
        (ws as any)._tempUnsubscribe = unsubscribe; 

        // 4. Lakukan Subscribe SETELAH dipastikan koneksi aman
        ws.subscribe(agentChannel, "$");
        console.log(`✅ Subscribed to channel: ${agentChannel}`);

      } catch (error) {
        console.error("❌ Failed to initialize WebSocket:", error);
      }
    };

    initWebSocket();

    // Cleanup saat agent meninggalkan halaman
    return () => {
      console.log(`🔌 Unsubscribing from channel: ${agentChannel}`);
      if ((ws as any)._tempUnsubscribe) {
        (ws as any)._tempUnsubscribe();
      }
    };
  }, [sessionId, queryClient])
  // --- MEMOIZED MESSAGES ---
  const messages: HelpDeskMessage[] = useMemo(() => {
    if (!chatHistory) return [];

    const allMessages = chatHistory.pages
      .flatMap((page) => page.data || [])
      .filter(Boolean)
      .sort((a, b) => a.id - b.id)

    return allMessages.map((item) => ({
      id: `msg-${item.id}`,
      sender: item.message.type === "human" ? "user" : "agent",
      text: item.message.data.content,
      timestamp: item.created_at,
    }));
  }, [chatHistory]);

  // --- SCROLL HANDLING ---
  useEffect(() => {
    if (!observerTarget.current || !hasNextPage || isFetchingNextPage) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          if (chatContainerRef.current) {
            previousScrollHeight.current =
              chatContainerRef.current.scrollHeight;
          }
          fetchNextPage();
        }
      },
      { threshold: 1 }
    );

    observer.observe(observerTarget.current);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  useEffect(() => {
    if (chatContainerRef.current && previousScrollHeight.current > 0) {
      const newScrollHeight = chatContainerRef.current.scrollHeight;
      const scrollDiff = newScrollHeight - previousScrollHeight.current;
      chatContainerRef.current.scrollTop = scrollDiff;
      previousScrollHeight.current = 0;
    }
  }, [messages.length]);

  useEffect(() => {
    if (
      shouldScrollToBottom &&
      chatContainerRef.current &&
      messages.length > 0
    ) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
      setShouldScrollToBottom(false);
    }
  }, [messages, shouldScrollToBottom]);

  // --- HANDLERS ---

  const handleConnectChat = () => {
    if (!helpdeskInfo?.id) {
      toast.error("Data helpdesk tidak valid");
      return;
    }

    acceptMutation.mutate(
      { id: helpdeskInfo.id, userId: 1 },
      {
        onSuccess: () => {
          toast.success("Chat terhubung! Anda sekarang dapat membalas.");
          refetchInfo();
        },
      }
    );
  };

  const handleResolveChat = () => {
    if (!sessionId) {
      toast.error("Session ID tidak ditemukan");
      return;
    }
    const userAgentTime = new Date().toISOString();

    resolveMutation.mutate(
      { sessionId, timestamp: userAgentTime },
      {
        onSuccess: () => {
          toast.success("Percakapan telah diselesaikan.");
          navigate("/helpdesk");
        },
      }
    );
  };

  const handleSend = async () => {
    if (!input.trim() || !sessionId) return;

    if (!canInteract) {
      toast.error("Anda harus menghubungkan chat ini terlebih dahulu.");
      return;
    }

    const sendTime = new Date();
    const startTimestampString = sendTime
      .toISOString()
      .replace("T", " ")
      .replace("Z", "")
      .slice(0, 23);
    const messageText = input.trim();

    setInput("");
    if (textareaRef.current) textareaRef.current.style.height = "44px";

    try {
      await sendMessageMutation.mutateAsync({
        session_id: sessionId,
        message: messageText,
        user_type: "agent",
        start_timestamp: startTimestampString,
      });

      setShouldScrollToBottom(true);
    } catch (error) {
      console.error("Failed to send message:", error);
      setInput(messageText);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const textarea = e.target;
    setInput(textarea.value);
    textarea.style.height = "auto";
    textarea.style.height = `${Math.min(textarea.scrollHeight, 160)}px`;
  };

  const handleQuickResponse = (template: string) => {
    const quickResponses: Record<string, string> = {
     Greeting: // Sebelumnya "Salam"
        "Halo! Terima kasih telah menghubungi kami. Ada yang bisa saya bantu?",
      Checking: // Sebelumnya "Pengecekan"
        "Saya sedang memeriksa informasi yang Anda butuhkan. Mohon tunggu sebentar.",
      Followup: // Sebelumnya "Tindak Lanjut"
        "Apakah ada hal lain yang bisa saya bantu?",
    };
    setInput(quickResponses[template] || "");
    textareaRef.current?.focus();
  };

  const handleGoBack = () => {
    navigate("/helpdesk");
  };

  // --- RENDER ---

  if (isLoadingChat) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 text-gray-400 animate-spin" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-8">
        <p className="text-red-500 mb-4">Gagal memuat riwayat chat</p>
        <button
          onClick={handleGoBack}
          className="px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-900"
        >
          Kembali
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full min-h-0 bg-white">
      {/* Header Chat Panel */}
      <div className="p-3 border-b border-gray-200 flex items-center justify-between bg-gray-50">
        <div className="flex items-center gap-3">
          <button
            onClick={handleGoBack}
            className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded-full lg:hidden"
            title="Kembali"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-md font-semibold text-gray-800">
              {currentChatUser}
            </h2>
            {helpdeskInfo && (
              <div className="flex items-center gap-2 mt-0.5">
                <span className={`w-2 h-2 rounded-full ${statusColorClass}`} />
                <p className="text-xs text-gray-500 capitalize font-medium">
                  {helpdeskInfo.platform} •{" "}
                  {helpdeskInfo.status.replace("_", " ")}
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-2">
          {/* Tombol Hubungkan (Hanya jika Queue) */}
          {isQueue && (
            <button
              onClick={handleConnectChat}
              disabled={acceptMutation.isPending}
              className="flex items-center gap-2 px-4 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-semibold shadow-sm transition-colors disabled:opacity-50"
            >
              {acceptMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <UserPlus className="w-4 h-4" />
              )}
              Hubungkan
            </button>
          )}

          {/* Tombol Selesaikan (Hanya jika In Progress) */}
          {canInteract && (
            <button
              onClick={handleResolveChat}
              disabled={resolveMutation.isPending}
              className="flex items-center gap-2 px-3 py-1.5 bg-green-100 text-green-700 rounded-md hover:bg-green-200 text-sm font-semibold transition-colors disabled:opacity-50"
            >
              {resolveMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Check className="w-4 h-4" />
              )}
              Selesaikan
            </button>
          )}
        </div>
      </div>

      {/* Area Bubble Chat */}
      <div
        ref={chatContainerRef}
        className="flex-1 py-4 px-4 md:px-8 lg:px-12 overflow-y-auto custom-scrollbar space-y-4"
      >
        {hasNextPage && (
          <div ref={observerTarget} className="flex justify-center py-2">
            {isFetchingNextPage && (
              <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />
            )}
          </div>
        )}

        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-8">
            <div className="bg-gray-100 p-4 rounded-full mb-3">
              <Send className="w-8 h-8 text-gray-400 rotate-45" />
            </div>
            <p className="text-gray-500 font-medium">
              Belum ada riwayat percakapan
            </p>
            <p className="text-sm text-gray-400 mt-1">
              Riwayat chat AI sebelumnya akan muncul di sini
            </p>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${
                msg.sender === "user" ? "justify-start" : "justify-end"
              }`}
            >
              <div
                className={`relative p-3 rounded-xl max-w-[85%] md:max-w-[75%] shadow-sm text-sm leading-relaxed ${
                  msg.sender === "user"
                    ? "bg-gray-100 text-gray-800 rounded-bl-none"
                    : "bg-blue-600 text-white rounded-br-none"
                }`}
              >
                <p className="whitespace-pre-wrap">{msg.text}</p>
                <p
                  className={`text-[10px] mt-1 text-right opacity-70 ${
                    msg.sender === "user" ? "text-gray-500" : "text-blue-100"
                  }`}
                >
                  {new Date(msg.timestamp).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>
          ))
        )}

        {/* Indikator Status di Chat Area */}
        {isResolved && (
          <div className="flex justify-center pt-4 pb-2">
            <span className="px-4 py-1.5 bg-gray-100 text-gray-500 text-xs font-medium rounded-full border border-gray-200">
              Percakapan ini telah selesai
            </span>
          </div>
        )}
      </div>

      {/* Footer / Input Area */}

      {/* 1. Jika Queue -> Tampilkan Banner */}
      {isQueue && (
        <div className="p-4 border-t border-gray-200 bg-orange-50 text-center animate-in slide-in-from-bottom-2">
          <p className="text-sm text-orange-800 font-medium">
            Tiket ini masih dalam antrian. Klik{" "}
            <span className="font-bold">Hubungkan</span> di atas untuk mulai
            membalas.
          </p>
        </div>
      )}

      {/* 2. Jika In Progress -> Tampilkan Input */}
      {canInteract && (
        <div className="p-4 border-t border-gray-200 bg-gray-50 space-y-3">
          <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
            <QuickResponseButton
              text="Salam"
              onClick={() => handleQuickResponse("Greeting")}
            />
            <QuickResponseButton
              text="Cek"
              onClick={() => handleQuickResponse("Checking")}
            />
            <QuickResponseButton
              text="Bertanya"
              onClick={() => handleQuickResponse("Followup")}
            />
          </div>
          <div className="flex gap-3 items-end">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={handleInputChange}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              disabled={sendMessageMutation.isPending}
              className="flex-1 py-3 px-4 border border-gray-300 rounded-xl text-sm resize-none min-h-[48px] max-h-[160px] overflow-y-auto focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:opacity-70 transition-all shadow-sm"
              placeholder="Ketik balasan Anda..."
              rows={1}
              style={{ height: "48px" }}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || sendMessageMutation.isPending}
              className="w-12 h-12 bg-gray-900 rounded-xl text-white cursor-pointer flex items-center justify-center hover:bg-gray-800 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
              aria-label="Kirim pesan"
            >
              {sendMessageMutation.isPending ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default HelpDeskChatPage;
