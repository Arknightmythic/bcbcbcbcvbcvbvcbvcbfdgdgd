// [MODIFIKASI: src/features/PublicService/pages/PublicServiceChatPage.tsx]

import React, { useState, useEffect } from "react"; // Impor useEffect
import { Loader2, Send, ArrowLeft, Copy } from "lucide-react";
import toast from "react-hot-toast";
import type { ChatMessage, Citation } from "../utils/types";
import MessageActions from "../components/MessageAction";
import CitationModal from "../components/CitationModal";
import { useServicePublicChat } from "../hooks/useServicePublicChat";
import { useAuthStore } from "../../../shared/store/authStore";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { normalizeMarkdown } from "../utils/helper";

// --- KOMPONEN BANNER (Request 1) ---
// (Tetap sama, hanya dipindahkan ke sini untuk kerapian)
interface ConnectToAgentBannerProps {
  onYes: () => void;
  onNo: () => void;
}
const ConnectToAgentBanner: React.FC<ConnectToAgentBannerProps> = ({
  onYes,
  onNo,
}) => (
  // Diberi style agar pas di tengah
  <div className="mt-2 w-full max-w-lg p-3 bg-gray-100 rounded-lg animate-fade-in-up shadow-sm border border-gray-200">
    <p className="text-sm text-gray-800 mb-3 text-center">
      silahkan pilih "ya, hubungkan" untuk berbicara ke Agent Layanan atau
      "Tidak" untuk membatalkan
    </p>
    <div className="flex gap-3">
      <button
        onClick={onYes}
        className="flex-1 bg-blue-600 text-white text-sm font-semibold py-2 px-4 rounded-lg hover:bg-blue-700"
      >
        Ya, hubungkan
      </button>
      <button
        onClick={onNo}
        className="flex-1 bg-gray-200 text-gray-800 text-sm font-semibold py-2 px-4 rounded-lg hover:bg-gray-300"
      >
        Tidak
      </button>
    </div>
  </div>
);
// --- AKHIR KOMPONEN BANNER ---

interface MessageBubbleProps {
  message: ChatMessage;
  previousMessage?: ChatMessage;
  citations: Citation[];
  isOpen: boolean;
  onToggleCitation: (messageId: string) => void;
  onOpenCitationModal: (citation: Citation) => void;
  onFeedback: (messageId: string, feedback: "like" | "dislike" | null) => void;
  onCopy: (question?: ChatMessage, answer?: ChatMessage) => void;
  userInitial: string;
  isLastMessage: boolean;
}

// --- MessageBubble (Disederhanakan) ---
const MessageBubble: React.FC<MessageBubbleProps> = React.memo(({
  message,
  previousMessage,
  citations,
  isOpen,
  onToggleCitation,
  onOpenCitationModal,
  onFeedback,
  onCopy,
  userInitial,
  isLastMessage,
}) => {
  const messageCitations = citations.filter((c) => c.messageId === message.id);
  const hasCitations = messageCitations.length > 0;

  const [displayedLines, setDisplayedLines] = useState<string[]>([]);
  const [isTextComplete, setIsTextComplete] = useState(false);
  const [isCitationVisible, setIsCitationVisible] = useState(false);
  const [isActionVisible, setIsActionVisible] = useState(false);

  const handleCopyClick = () => {
    if (message.sender === "user") {
      onCopy(undefined, message);
    } else if (message.sender === "agent") {
      onCopy(previousMessage, message);
    }
  };

  useEffect(() => {
    const textToDisplay = message.text || "";

    if (message.sender !== "agent" || !isLastMessage) {
      setDisplayedLines(textToDisplay.split("\n"));
      setIsTextComplete(true);
      setIsCitationVisible(true);
      setIsActionVisible(true);
      return;
    }

    setDisplayedLines([]);
    setIsTextComplete(false);
    setIsCitationVisible(false);
    setIsActionVisible(false);

    const timeouts: ReturnType<typeof setTimeout>[] = [];

    timeouts.push(
      setTimeout(() => {
        setDisplayedLines(textToDisplay.split("\n"));
        setIsTextComplete(true);
      }, 100)
    );

    return () => {
      timeouts.forEach(clearTimeout);
    };
  }, [message.id, message.text, message.sender, isLastMessage]);

  useEffect(() => {
    if (isTextComplete) {
      const delay = hasCitations ? 200 : 0;
      const timer = setTimeout(() => setIsCitationVisible(true), delay);
      return () => clearTimeout(timer);
    }
  }, [isTextComplete, hasCitations]);

  useEffect(() => {
    if (isCitationVisible) {
      const timer = setTimeout(() => {
        setIsActionVisible(true);
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [isCitationVisible, message.is_answered]);

  if (!message.text && message.sender !== "system") {
    return null;
  }

  if (message.sender === "system") {
    return (
      <div className="mb-4 flex justify-center">
        <div className="p-3 rounded-lg bg-gray-100 text-gray-600 text-xs text-center mx-auto">
          <p className="whitespace-pre-wrap m-0 text-sm">{message.text}</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`relative group mb-4 flex gap-3 ${
        message.sender === "user" ? "flex-row-reverse" : ""
      }`}
    >
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0 text-white ${
          message.sender === "user" ? "bg-bOss-blue" : "bg-bOss-red"
        }`}
      >
        {message.sender === "user" ? userInitial : "AI"}
      </div>

      <div className="flex flex-col max-w-[75%] items-start">
        <div
          className={`relative p-3 rounded-lg leading-relaxed shadow-sm w-fit ${
            message.sender === "user"
              ? "bg-bOss-blue text-white rounded-bl-none"
              : "bg-gray-100 text-gray-800 rounded-br-none"
          }`}
        >
          <div className="m-0 text-sm">
            {message.sender === "agent" ? (
              <div className="prose prose-sm max-w-none prose-ol:list-decimal prose-ol:list-inside prose-ol:pl-4 prose-li:before:hidden hover:prose-a:text-blue-700 hover:prose-a:underline prose-p:my-1 prose-ol:my-1 prose-li:my-0.5 [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    a: ({ node, ...props }) => (
                      <a {...props} target="_blank" rel="noopener noreferrer" />
                    ),
                  }}
                >
                  {/* Gabungkan kembali baris-baris untuk di-parse oleh Markdown */}
                  {normalizeMarkdown(displayedLines.join("\n"))}
                </ReactMarkdown>
              </div>
            ) : (
              <div className="whitespace-pre-wrap">
                {displayedLines.map((line, index) => (
                  <p
                    key={index}
                    className={isLastMessage ? "animate-fade-in-up" : ""}
                  >
                    {line || "\u200B"}
                  </p>
                ))}
              </div>
            )}
          </div>

          <div
            className={`transition-opacity duration-300 ${
              isCitationVisible ? "opacity-100" : "opacity-0"
            }`}
          >
            {message.sender === "agent" && hasCitations && (
              <div className="mt-3 pt-2 border-t text-xs border-gray-200">
                <button
                  onClick={() => onToggleCitation(message.id)}
                  className="w-full flex justify-between items-center text-left font-semibold text-gray-800 mb-1 focus:outline-none"
                >
                  <span>Sumber ({messageCitations.length})</span>
                  <span
                    className={`transform transition-transform duration-200 ${
                      isOpen ? "rotate-180" : "rotate-0"
                    }`}
                  >
                    ▼
                  </span>
                </button>
                <div
                  className={`overflow-hidden transition-all ease-in-out duration-300 ${
                    isOpen ? "max-h-40 pt-1" : "max-h-0"
                  }`}
                >
                  <div className="flex flex-col gap-1.5">
                    {messageCitations.map((citation, index) => (
                      <div
                        key={index}
                        onClick={() => onOpenCitationModal(citation)}
                        className="bg-gray-200 text-gray-700 px-2 py-1 rounded cursor-pointer hover:bg-gray-300 transition-colors truncate"
                        title={citation.documentName}
                      >
                        {citation.documentName}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          <button
            onClick={handleCopyClick}
            className={`absolute top-0 z-10 p-1 text-gray-400 bg-white border border-gray-200 rounded-full shadow-sm
                          opacity-0 group-hover:opacity-100 focus:opacity-100 transition-all duration-200
                          hover:text-blue-600 hover:bg-blue-100 hover:border-blue-200 focus:outline-none focus:ring-1 focus:ring-blue-300
                          ${
                            message.sender === "user"
                              ? "-left-4 -mr-7 transform -translate-y-1/4"
                              : "-right-4 -ml-7 transform -translate-y-1/4"
                          }`}
            title="Salin pesan"
          >
            <Copy className="w-3.5 h-3.5" />
          </button>
        </div>

        <div
          className={`transition-opacity duration-300 w-full ${
            isActionVisible ? "opacity-100" : "opacity-0"
          }`}
        >
          {message.sender === "agent" && (
            <div className="mt-2 w-full">
              <MessageActions message={message} onFeedback={onFeedback} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}, (prevProps, nextProps) => {
  // Custom comparison to prevent unnecessary re-renders
  return (
    prevProps.message.id === nextProps.message.id &&
    prevProps.message.text === nextProps.message.text &&
    prevProps.message.feedback === nextProps.message.feedback &&
    prevProps.isLastMessage === nextProps.isLastMessage &&
    prevProps.isOpen === nextProps.isOpen &&
    prevProps.citations.length === nextProps.citations.length &&
    prevProps.previousMessage?.id === nextProps.previousMessage?.id
  );
});

// Add display name for debugging
MessageBubble.displayName = 'MessageBubble';
// --- AKHIR MessageBubble ---

const PublicServiceChatPage: React.FC = () => {
  const {
    messages,
    input,
    setInput,
    chatMode,
    isBotLoading,
    citations,
    openCitations,
    selectedCitation,
    toggleCitations,
    handleOpenModal,
    handleCloseModal,
    handleSendMessage: sendMessageFromHook,
    handleGoBackToIntro,
    messagesEndRef,
    textareaRef,
    isRestoringSession,
    handleFeedbackUpdate,
  } = useServicePublicChat();

  // --- State Baru: Visibilitas Banner (Request 1) ---
  const [isBannerVisible, setIsBannerVisible] = useState(false);
  // -------------------------------------------------

  // --- Effect Baru: Kontrol Visibilitas Banner (Request 1) ---
  useEffect(() => {
    if (messages.length === 0) {
      setIsBannerVisible(false);
      return;
    }
    const lastMessage = messages[messages.length - 1];

    // Tampilkan banner HANYA JIKA pesan terakhir dari AI dan tidak terjawab
    if (
      lastMessage.sender === "agent" &&
      (lastMessage.is_answered === false || lastMessage.is_answered === null)
    ) {
      // Tunggu sebentar setelah animasi teks selesai
      const timer = setTimeout(() => setIsBannerVisible(true), 600); // 600ms = 100ms (mulai) + 100ms (teks) + 200ms (sitasi) + 200ms (action)
      return () => clearTimeout(timer);
    } else {
      // Sembunyikan banner jika pesan terakhir dari user,
      // atau jika pesan AI tapi terjawab
      setIsBannerVisible(false);
    }
  }, [messages]); // Dijalankan setiap kali 'messages' array berubah
  // -------------------------------------------------------

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const textarea = e.target;
    setInput(textarea.value);
    textarea.style.height = "auto";
    const maxHeight = 160;
    textarea.style.height = `${Math.min(textarea.scrollHeight, maxHeight)}px`;
  };

  const handleSendMessage = (e: React.FormEvent | React.KeyboardEvent) => {
    e.preventDefault();
    if (!input.trim() || isBotLoading) return;
    sendMessageFromHook();
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
    setIsBannerVisible(false); // Sembunyikan banner saat kirim pesan baru
  };

  // --- PERBAIKAN FUNGSI COPY (Request 2) ---
  const handleCopy = (question?: ChatMessage, answer?: ChatMessage) => {
    let textToCopy = "";
    if (question && answer) {
      // Hanya salin teks, tanpa prefix
      textToCopy = `${question.text}\n\n${answer.text}`;
    } else if (answer) {
      // Hanya salin teks, tanpa prefix
      textToCopy = answer.text;
    } else {
      return;
    }

    navigator.clipboard
      .writeText(textToCopy)
      .then(() => {
        toast.success("Pesan berhasil disalin!");
      })
      .catch((err) => {
        try {
          const textArea = document.createElement("textarea");
          textArea.value = textToCopy;
          textArea.style.position = "fixed";
          textArea.style.top = "-9999px";
          textArea.style.left = "-9999px";
          document.body.appendChild(textArea);
          textArea.focus();
          textArea.select();
          document.execCommand("copy");
          document.body.removeChild(textArea);
          toast.success("Pesan berhasil disalin! (fallback)");
        } catch (fallbackErr) {
          toast.error("Gagal menyalin pesan.");
          console.error("Copy error:", err, fallbackErr);
        }
      });
  };
  // --- AKHIR PERBAIKAN COPY ---

  // --- Handler untuk Banner (Request 1) ---
  const handleConnectToAgent = () => {
    toast.success("Fitur 'Connect to Agent' sedang dalam pengembangan.");
    // TODO: Panggil API "connect to agent" di sini
  };
  // -------------------------------------

  const userInitial =
    useAuthStore((state) => state.user?.name.charAt(0).toUpperCase()) || "U";

  if (isRestoringSession) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <Loader2 className="w-12 h-12 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    // --- PERUBAHAN DI SINI: Ganti 'flex-1' menjadi 'h-full' ---
    <div className="h-full flex flex-col mx-auto w-full bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
      <div className="p-3 border-b border-gray-200 flex items-center bg-gray-50">
        <button
          onClick={handleGoBackToIntro}
          className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded-full mr-3"
          aria-label="Kembali ke pemilihan sesi"
          title="Kembali"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h2 className="text-md font-semibold text-gray-800">Sesi Chatbot</h2>
      </div>

      <div className="flex-1 p-4 overflow-y-auto custom-scrollbar">
        {messages.map((msg, index) => {
          const previousMsg =
            index > 0 && messages[index - 1].sender === "user"
              ? messages[index - 1]
              : undefined;
          const isLastMessage = index === messages.length - 1;

          return (
            <MessageBubble
              key={msg.id} // Use msg.id as key, not index
              message={msg}
              previousMessage={previousMsg}
              isLastMessage={isLastMessage}
              citations={citations}
              isOpen={!!openCitations[msg.id]}
              onToggleCitation={toggleCitations}
              onOpenCitationModal={handleOpenModal}
              onFeedback={handleFeedbackUpdate}
              onCopy={handleCopy}
              userInitial={userInitial}
            />
          );
        })}

        {isBotLoading && (
          <div className="mb-4 flex gap-3">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0 bg-bOss-red text-white">
              AI
            </div>
            <div className="p-3 rounded-lg max-w-[75%] leading-relaxed bg-gray-100 shadow-sm rounded-bl-none">
              <div className="flex items-center justify-center h-full gap-1.5 py-1">
                <div className="loading-dot"></div>
                <div className="loading-dot animation-delay-200"></div>
                <div className="loading-dot animation-delay-400"></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 bg-white border-t border-gray-200">
        <form onSubmit={handleSendMessage} className="flex gap-3 items-end">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={handleInputChange}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                handleSendMessage(e);
              }
            }}
            className="flex-1 py-2.5 px-4 border border-gray-300 rounded-lg text-sm resize-none min-h-[44px] overflow-y-auto focus:outline-none focus:ring-2 focus:ring-bOss-blue focus:border-transparent custom-scrollbar"
            placeholder={
              chatMode === "bot"
                ? "Ketik pertanyaan Anda..."
                : "Ketik balasan untuk agen..."
            }
            rows={1}
            style={{ height: "44px" }}
            disabled={isBotLoading}
          />
          <button
            type="submit"
            className="w-11 h-11 bg-bOss-blue rounded-full text-white cursor-pointer flex items-center justify-center self-end hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-bOss-blue focus:ring-offset-2 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            disabled={isBotLoading || input.trim() === ""}
            aria-label="Kirim pesan"
          >
            {isBotLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </form>
      </div>

      <CitationModal citation={selectedCitation} onClose={handleCloseModal} />

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fadeIn 0.4s ease-out forwards;
        }
        .animate-fade-in-up {
          animation: fadeInUp 0.4s ease-out forwards; 
          animation-fill-mode: forwards;
        }

        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #ccc; border-radius: 3px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #aaa; }
        @keyframes bounce { 0%, 80%, 100% { transform: scale(0); opacity: 0; } 40% { transform: scale(1.0); opacity: 1; } }
        .loading-dot { height: 7px; width: 7px; background-color: #9ca3af; border-radius: 9999px; animation: bounce 1.2s infinite ease-in-out both; }
        .animation-delay-200 { animation-delay: 0.2s; }
        .animation-delay-400 { animation-delay: 0.4s; }
      `}</style>
    </div>
  );
};

export default PublicServiceChatPage;
