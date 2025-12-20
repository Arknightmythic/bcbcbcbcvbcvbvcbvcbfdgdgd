import React, { useState, useEffect } from "react";
import { Loader2, Send, ArrowLeft, Copy } from "lucide-react";
import toast from "react-hot-toast";
import type { ChatMessage, Citation } from "../utils/types";
import MessageActions from "../components/MessageAction";
import { useServicePublicChat } from "../hooks/useServicePublicChat";
import { useAuthStore } from "../../../shared/store/authStore";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { normalizeMarkdown } from "../utils/helper";
import PdfViewModal from "../../../shared/components/PDFViewModal";

const MarkdownLink = ({ node, children, ...props }: any) => (
  <a {...props} target="_blank" rel="noopener noreferrer">
    {children}
  </a>
);

interface CitationListProps {
  citations: Citation[];
  isOpen: boolean;
  onToggle: () => void;
  onOpenCitation: (citation: Citation) => void;
}

const CitationList: React.FC<CitationListProps> = ({
  citations,
  isOpen,
  onToggle,
  onOpenCitation,
}) => {
  if (citations.length === 0) return null;

  return (
    <div className="mt-3 pt-2 border-t text-xs border-gray-200">
      <button
        onClick={onToggle}
        className="w-full flex justify-between items-center text-left font-semibold text-gray-800 mb-1 focus:outline-none hover:bg-black/5 p-1 rounded transition-colors"
      >
        <span>Sumber ({citations.length})</span>
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
          isOpen ? "max-h-60 pt-1" : "max-h-0"
        }`}
      >
        <div className="flex flex-col gap-1.5 mt-1">
          {citations.map((citation, index) => (
            <button
              type="button"
              key={`${citation.documentName}-${index}`}
              onClick={() => onOpenCitation(citation)}
              className="w-full text-left bg-white/50 border border-gray-200 text-gray-700 px-2 py-1.5 rounded cursor-pointer hover:bg-white hover:shadow-sm transition-all truncate flex items-center gap-2"
              title={citation.documentName}
            >
              <span className="text-xs">📄</span>
              <span className="truncate">{citation.documentName}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

interface MessageBubbleProps {
  message: ChatMessage;
  previousMessage?: ChatMessage;
  citations: Citation[];
  isOpen: boolean;
  onToggleCitation: (messageId: string) => void;
  onOpenCitation: (citation: Citation) => void;
  onFeedback: (messageId: string, feedback: "like" | "dislike" | null) => void;
  onCopy: (question?: ChatMessage, answer?: ChatMessage) => void;
  userInitial: string;
  isLastMessage: boolean;
}

const MessageBubble: React.FC<MessageBubbleProps> = React.memo(
  ({
    message,
    previousMessage,
    citations,
    isOpen,
    onToggleCitation,
    onOpenCitation,
    onFeedback,
    onCopy,
    userInitial,
    isLastMessage,
  }) => {
    const messageCitations = citations.filter(
      (c) => c.messageId === message.id
    );
    const hasCitations = messageCitations.length > 0;
    const [displayContent, setDisplayContent] = useState<string>("");
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

      // Jika bukan agent atau bukan pesan terakhir, tampilkan langsung
      if (message.sender !== "agent" || !isLastMessage) {
        setDisplayContent(textToDisplay);
        setIsCitationVisible(true);
        setIsActionVisible(true);
        return;
      }

      // Jika pesan agent terakhir:
      // 1. Reset visibility
      setIsCitationVisible(false);
      setIsActionVisible(false);

      // 2. Set Content
      setDisplayContent(textToDisplay);

      // 3. Trigger visibility ON setelah render
      const timer = setTimeout(() => {
        setIsCitationVisible(true);
      }, 150);

      return () => clearTimeout(timer);
    }, [message.id, message.text, message.sender, isLastMessage]);
    useEffect(() => {
      if (isCitationVisible) {
        const timer = setTimeout(() => setIsActionVisible(true), 200);
        return () => clearTimeout(timer);
      }
    }, [isCitationVisible]);

    if (!message.text && message.sender !== "system") {
      return null;
    }

    if (message.sender === "system") {
      return (
        <div className="mb-4 flex justify-center">
          <div className="p-3 rounded-lg bg-gray-100 text-gray-600 text-xs text-center mx-auto shadow-sm">
            <p className="whitespace-pre-wrap m-0 text-sm">{message.text}</p>
          </div>
        </div>
      );
    }

    const isZeroIds = message.questionId === 0 && message.answerId === 0;
    const isHelpdesk = message.isHelpdesk === true;

    const showFeedback =
      message.sender === "agent" &&
      !message.isHumanAgent &&
      !isHelpdesk &&
      !isZeroIds &&
      message.hasCategory === true;

    let avatarLabel = userInitial;
    if (message.sender !== "user") {
      avatarLabel = message.isHumanAgent ? "A" : "AI";
    }

    return (
      <div
        className={`relative group mb-4 flex gap-3 ${
          message.sender === "user" ? "flex-row-reverse" : ""
        }`}
      >
        <div
          className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0 text-white shadow-sm ${
            message.sender === "user" ? "bg-bOss-blue" : "bg-bOss-red"
          }`}
        >
          {avatarLabel}
        </div>

        <div className="flex flex-col max-w-[85%] md:max-w-[75%] items-start">
          <div
            className={`relative p-3 rounded-lg leading-relaxed shadow-sm w-fit ${
              message.sender === "user"
                ? "bg-bOss-blue text-white rounded-bl-none"
                : "bg-gray-100 text-gray-800 rounded-br-none"
            }`}
          >
            <div className="m-0 text-sm">
              {message.sender === "agent" ? (
                <div className="prose prose-sm max-w-none prose-ol:list-decimal prose-ol:list-inside prose-ol:pl-0 prose-li:pl-0 prose-li:before:hidden hover:prose-a:text-blue-700 hover:prose-a:underline prose-p:my-1 prose-ol:my-1 prose-li:my-0.5 [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
                  {" "}
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      a: MarkdownLink,
                    }}
                  >
                    {normalizeMarkdown(displayContent)}
                  </ReactMarkdown>
                </div>
              ) : (
                <div className="whitespace-pre-wrap">{displayContent}</div>
              )}
            </div>

            <div
              className={`transition-opacity duration-300 ${
                isCitationVisible ? "opacity-100" : "opacity-0"
              }`}
            >
              {message.sender === "agent" && hasCitations && (
                <CitationList
                  citations={messageCitations}
                  isOpen={isOpen}
                  onToggle={() => onToggleCitation(message.id)}
                  onOpenCitation={onOpenCitation}
                />
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
            {showFeedback && (
              <div className="mt-2 w-full">
                <MessageActions message={message} onFeedback={onFeedback} />
              </div>
            )}
          </div>
        </div>
      </div>
    );
  },
  (prevProps, nextProps) => {
    return (
      prevProps.message.id === nextProps.message.id &&
      prevProps.message.text === nextProps.message.text &&
      prevProps.message.feedback === nextProps.message.feedback &&
      prevProps.isLastMessage === nextProps.isLastMessage &&
      prevProps.isOpen === nextProps.isOpen &&
      prevProps.citations.length === nextProps.citations.length &&
      prevProps.previousMessage?.id === nextProps.previousMessage?.id
    );
  }
);

MessageBubble.displayName = "MessageBubble";

const PublicServiceChatPage: React.FC = () => {
  const {
    messages,
    input,
    setInput,
    isBotLoading,
    citations,
    openCitations,
    toggleCitations,
    handleSendMessage: sendMessageFromHook,
    handleGoBackToIntro,
    messagesEndRef,
    textareaRef,
    isRestoringSession,

    handleFeedbackUpdate,
    isPdfModalOpen,
    pdfUrl,
    pdfTitle,
    isLoadingPdf,
    handleOpenCitation,
    handleClosePdfModal,
  } = useServicePublicChat();

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
  };

  const handleCopy = (question?: ChatMessage, answer?: ChatMessage) => {
    let textToCopy = "";
    if (question && answer) {
      textToCopy = `${question.text}\n\n${answer.text}`;
    } else if (answer) {
      textToCopy = answer.text;
    } else {
      return;
    }

    if (navigator.clipboard?.writeText) {
      navigator.clipboard
        .writeText(textToCopy)
        .then(() => {
          toast.success("Pesan berhasil disalin!");
        })
        .catch((err) => {
          console.error("Copy failed:", err);
          toast.error("Gagal menyalin pesan.");
        });
    } else {
      toast.error("Fitur salin tidak didukung di browser ini.");
    }
  };

  const userInitial =
    useAuthStore((state) => state.user?.name.charAt(0).toUpperCase()) || "U";

  if (isRestoringSession) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-50">
        <Loader2 className="w-12 h-12 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col mx-auto w-full bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden relative">
      <div className="p-3 border-b border-gray-200 flex items-center bg-gray-50 z-10">
        <button
          onClick={handleGoBackToIntro}
          className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded-full mr-3 transition-colors"
          title="Kembali"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h2 className="text-md font-semibold text-gray-800">Sesi Chatbot</h2>
      </div>

      <div className="flex-1 p-4 overflow-y-auto custom-scrollbar bg-white scroll-smooth">
        {messages.map((msg, index) => {
          const previousMsg =
            index > 0 && messages[index - 1].sender === "user"
              ? messages[index - 1]
              : undefined;
          const isLastMessage = index === messages.length - 1;

          return (
            <React.Fragment key={msg.id}>
              <MessageBubble
                message={msg}
                previousMessage={previousMsg}
                isLastMessage={isLastMessage}
                citations={citations}
                isOpen={!!openCitations[msg.id]}
                onToggleCitation={toggleCitations}
                onOpenCitation={handleOpenCitation}
                onFeedback={handleFeedbackUpdate}
                onCopy={handleCopy}
                userInitial={userInitial}
              />
            </React.Fragment>
          );
        })}

        {isBotLoading && (
          <div className="mb-4 flex gap-3 animate-pulse">
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

      <div className="p-4 bg-white border-t border-gray-200 z-10">
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
            className="flex-1 py-2.5 px-4 border border-gray-300 rounded-lg text-sm resize-none min-h-[44px] overflow-y-auto focus:outline-none focus:ring-2 focus:ring-bOss-blue focus:border-transparent custom-scrollbar transition-all"
            placeholder="Ketik pertanyaan Anda..."
            rows={1}
            style={{ height: "44px" }}
            disabled={isBotLoading}
          />
          <button
            type="submit"
            className="w-11 h-11 bg-bOss-blue rounded-full text-white cursor-pointer flex items-center justify-center self-end hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-bOss-blue focus:ring-offset-2 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow-md"
            disabled={isBotLoading || input.trim() === ""}
            aria-label="Kirim pesan"
          >
            {isBotLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5 ml-0.5" />
            )}
          </button>
        </form>
      </div>

      <PdfViewModal
        isOpen={isPdfModalOpen}
        onClose={handleClosePdfModal}
        url={pdfUrl || ""}
        isLoading={isLoadingPdf}
        title={pdfTitle}
      />

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
        
        @keyframes bounce { 
          0%, 80%, 100% { transform: scale(0); opacity: 0.5; } 
          40% { transform: scale(1.0); opacity: 1; } 
        }
        .loading-dot { 
          height: 7px; width: 7px; 
          background-color: #6b7280; 
          border-radius: 9999px; 
          animation: bounce 1.4s infinite ease-in-out both; 
        }
        .animation-delay-200 { animation-delay: 0.2s; }
        .animation-delay-400 { animation-delay: 0.4s; }
      `}</style>
    </div>
  );
};

export default PublicServiceChatPage;
