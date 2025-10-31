import { Loader2, Send, ArrowLeft, Copy } from 'lucide-react';
import toast from 'react-hot-toast';
import type { ChatMessage, Citation } from '../utils/types';
import MessageActions from '../components/MessageAction';
import { usePublicServiceChat } from '../hooks/useServicePublicChat';
import CitationModal from '../components/CitationModal';

interface MessageBubbleProps {
  message: ChatMessage;
  previousMessage?: ChatMessage;
  citations: Citation[];
  isOpen: boolean;
  onToggleCitation: (messageId: string) => void;
  onOpenCitationModal: (citation: Citation) => void;
  onFeedback: (messageId: string, feedback: 'like' | 'dislike') => void;
  onCopy: (question?: ChatMessage, answer?: ChatMessage) => void;
  userInitial: string;
}

// --- START: MODIFIED MessageBubble COMPONENT ---
const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  previousMessage,
  citations,
  isOpen,
  onToggleCitation,
  onOpenCitationModal,
  onFeedback,
  onCopy,
  userInitial
}) => {
  const messageCitations = citations.filter(c => c.messageId === message.id);
  const hasCitations = messageCitations.length > 0;

  const handleCopyClick = () => {
    if (message.sender === 'user') {
      onCopy(undefined, message);
    } else if (message.sender === 'agent') {
      onCopy(previousMessage, message);
    }
  };
  
  // Conditionally render nothing for system messages
  if (message.sender === 'system') {
    return (
        <div key={message.id} className="mb-4 flex justify-center">
            <div className="p-3 rounded-lg bg-gray-100 text-gray-600 text-xs text-center mx-auto">
                 <p className="whitespace-pre-wrap m-0 text-sm">{message.text}</p>
            </div>
        </div>
    );
  }

  return (
    <div key={message.id} className={`relative group mb-4 flex gap-3 ${message.sender === 'user' ? 'flex-row-reverse' : ''}`}>
      {/* Avatar */}
      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0 text-white ${message.sender === 'user' ? 'bg-bOss-blue' : 'bg-bOss-red'}`}>
        {message.sender === 'user' ? userInitial : 'AI'}
      </div>

      {/* Wrapper for Bubble + Actions */}
      <div className="flex flex-col max-w-[75%] items-start">
        {/* The Bubble */}
        <div className={`relative p-3 rounded-lg leading-relaxed shadow-sm w-fit ${
            message.sender === 'user' ? 'bg-bOss-blue text-white rounded-br-none' : 'bg-gray-100 text-gray-800 rounded-bl-none'
        }`}>
          <p className="whitespace-pre-wrap m-0 text-sm">{message.text}</p>
          
          {message.sender === 'agent' && hasCitations && (
            <div className="mt-3 pt-2 border-t text-xs border-gray-200">
              <button onClick={() => onToggleCitation(message.id)} className="w-full flex justify-between items-center text-left font-semibold text-gray-500 mb-1 focus:outline-none">
                <span>Sumber ({messageCitations.length})</span>
                <span className={`transform transition-transform duration-200 ${isOpen ? 'rotate-180' : 'rotate-0'}`}>▼</span>
              </button>
              <div className={`overflow-hidden transition-all ease-in-out duration-300 ${isOpen ? 'max-h-40 pt-1' : 'max-h-0'}`}>
                <div className="flex flex-col gap-1.5">
                  {messageCitations.map((citation, index) => (
                    <div key={index} onClick={() => onOpenCitationModal(citation)} className="bg-gray-200 text-gray-700 px-2 py-1 rounded cursor-pointer hover:bg-gray-300 transition-colors truncate" title={citation.documentName}>
                      {citation.documentName}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          <button
              onClick={handleCopyClick}
              className={`absolute top-0 z-10 p-1 text-gray-400 bg-white border border-gray-200 rounded-full shadow-sm
                          opacity-0 group-hover:opacity-100 focus:opacity-100 transition-all duration-200
                          hover:text-blue-600 hover:bg-blue-100 hover:border-blue-200 focus:outline-none focus:ring-1 focus:ring-blue-300
                          ${message.sender === 'user' ? '-left-4 -mr-7 transform -translate-y-1/4' : '-right-4 -ml-7 transform -translate-y-1/4'}`}
              title="Salin pesan"
          >
              <Copy className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Actions, now correctly constrained by the wrapper's max-width */}
        {message.sender === 'agent' && (
          <div className="mt-2 w-full">
            <MessageActions message={message} onFeedback={onFeedback} />
          </div>
        )}
      </div>
    </div>
  );
};
// --- END: MODIFIED MessageBubble COMPONENT ---


const PublicServiceChatPage: React.FC = () => {
  const {
    messages, input, setInput, chatMode, isBotLoading, citations, openCitations,
    selectedCitation, toggleCitations, handleOpenModal, handleCloseModal,
    handleSendMessage: sendMessageFromHook, 
    handleGoBackToIntro, messagesEndRef,
    textareaRef, isRestoringSession,
  } = usePublicServiceChat();

  
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const textarea = e.target;
    setInput(textarea.value);

    
    textarea.style.height = 'auto';

    
    const maxHeight = 160; 
    textarea.style.height = `${Math.min(textarea.scrollHeight, maxHeight)}px`;
  };

  const handleSendMessage = (e: React.FormEvent | React.KeyboardEvent) => {
    e.preventDefault(); 
    if (!input.trim() || isBotLoading) return; 

    sendMessageFromHook(); 

    
    if (textareaRef.current) {
        textareaRef.current.style.height = 'auto'; 
    }
  };
  

  const handleFeedback = (messageId: string, feedback: 'like' | 'dislike') => {
    console.log(`Feedback for message ${messageId}: ${feedback}`);
    const feedbackText = feedback === 'like' ? 'Suka' : 'Tidak Suka';
    toast.success(`Terima kasih atas masukan Anda! (${feedbackText})`);
  };

  const handleCopy = (question?: ChatMessage, answer?: ChatMessage) => {
     let textToCopy = "";
     if (question && answer) {
         textToCopy = `Pertanyaan:\n${question.text}\n\nJawaban:\n${answer.text}`;
     } else if (answer) {
        textToCopy = answer.sender === 'user' ? `Pesan Pengguna:\n${answer.text}` : `Jawaban:\n${answer.text}`;
     } else {
         return;
     }

    navigator.clipboard.writeText(textToCopy).then(() => {
      toast.success('Pesan berhasil disalin!');
    }).catch(err => {
      try {
        const textArea = document.createElement("textarea");
        textArea.value = textToCopy;
        textArea.style.position = "fixed";
        textArea.style.top = "-9999px";
        textArea.style.left = "-9999px";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        toast.success('Pesan berhasil disalin! (fallback)');
      } catch (fallbackErr) {
        toast.error('Gagal menyalin pesan.');
        console.error('Copy error:', err, fallbackErr);
      }
    });
  };


  const userInitial = 'U';

  if (isRestoringSession) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <Loader2 className="w-12 h-12 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col mx-auto w-full bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
      <div className="p-3 border-b border-gray-200 flex items-center bg-gray-50">
          <button onClick={handleGoBackToIntro} className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded-full mr-3" aria-label="Kembali ke pemilihan sesi" title="Kembali">
              <ArrowLeft className="w-5 h-5"/>
          </button>
          <h2 className="text-md font-semibold text-gray-800">Sesi Chatbot</h2>
      </div>

      <div className="flex-1 p-4 overflow-y-auto custom-scrollbar">
        {messages.map((msg, index) => {
          const previousMsg = index > 0 && messages[index - 1].sender === 'user' ? messages[index - 1] : undefined;
          return (
            <MessageBubble
              key={msg.id}
              message={msg}
              previousMessage={previousMsg}
              citations={citations}
              isOpen={!!openCitations[msg.id]}
              onToggleCitation={toggleCitations}
              onOpenCitationModal={handleOpenModal}
              onFeedback={handleFeedback}
              onCopy={handleCopy}
              userInitial={userInitial}
            />
          );
        })}
        {isBotLoading && (
          <div className="mb-4 flex gap-3">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0 bg-bOss-red text-white">AI</div>
            <div className="p-3 rounded-lg max-w-[75%] leading-relaxed bg-gray-100 shadow-sm rounded-bl-none">
              <div className="flex items-center justify-center h-full gap-1.5 py-1">
                <div className="loading-dot"></div><div className="loading-dot animation-delay-200"></div><div className="loading-dot animation-delay-400"></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Area Input Pesan */}
      <div className="p-4 bg-white border-t border-gray-200">
        <form onSubmit={handleSendMessage} className="flex gap-3 items-end">
          {/* --- START MARK: Modifikasi Textarea --- */}
          <textarea
            ref={textareaRef}
            value={input}
            onChange={handleInputChange} 
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                handleSendMessage(e); 
              }
            }}
            
            className="flex-1 py-2.5 px-4 border border-gray-300 rounded-lg text-sm resize-none min-h-[44px] overflow-y-auto focus:outline-none focus:ring-2 focus:ring-bOss-blue focus:border-transparent custom-scrollbar"
            placeholder={chatMode === 'bot' ? "Ketik pertanyaan Anda..." : "Ketik balasan untuk agen..."}
            rows={1}
            style={{ height: '44px' }} 
            disabled={isBotLoading}
          />
          {/* --- END MARK: Modifikasi Textarea --- */}
          <button
            type="submit"
            className="w-11 h-11 bg-bOss-blue rounded-full text-white cursor-pointer flex items-center justify-center self-end hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-bOss-blue focus:ring-offset-2 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors" 
            disabled={isBotLoading || input.trim() === ""}
            aria-label="Kirim pesan"
          >
            {isBotLoading ? <Loader2 className="w-5 h-5 animate-spin"/> : <Send className="w-5 h-5"/>}
          </button>
        </form>
      </div>

      <CitationModal citation={selectedCitation} onClose={handleCloseModal} />

      <style>{`
        /* ... styles lama tidak berubah ... */
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