import React, { useState } from 'react';
import { ThumbsUp, ThumbsDown } from 'lucide-react'; // <-- Hapus 'Copy' dari import
import type { ChatMessage } from '../utils/types';

interface MessageActionsProps {
  message: ChatMessage;
  // --- START: Hapus props 'previousMessage' dan 'onCopy' ---
  // previousMessage?: ChatMessage; // Tidak diperlukan lagi di sini
  onFeedback: (messageId: string, feedback: 'like' | 'dislike') => void;
  // onCopy: (question?: ChatMessage, answer?: ChatMessage) => void; // Tidak diperlukan lagi di sini
  // --- END: Hapus props 'previousMessage' dan 'onCopy' ---
}

const MessageActions: React.FC<MessageActionsProps> = ({ message, onFeedback }) => { // <-- Hapus props yang tidak dipakai
  const [feedbackGiven, setFeedbackGiven] = useState<'like' | 'dislike' | null>(null);

  const handleFeedback = (feedback: 'like' | 'dislike') => {
    if (feedbackGiven) return;
    setFeedbackGiven(feedback);
    onFeedback(message.id, feedback);
  };

  // --- START: Hapus handler 'handleCopyClick' ---
  // const handleCopyClick = () => {
  //   onCopy(previousMessage, message);
  // };
  // --- END: Hapus handler 'handleCopyClick' ---

  return (
    <div className="mt-4 pt-3 border-t border-gray-200">
      <div className="flex items-center justify-between text-sm text-gray-600">
        <span className="italic">Apakah ini menjawab pertanyaan Anda?</span>
        <div className="flex items-center gap-2">
          {/* --- START: Hapus Tombol Copy dari JSX --- */}
          {/* <button
            onClick={handleCopyClick}
            className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
            title="Salin percakapan"
          >
            <Copy className="w-4 h-4" />
          </button> */}
          {/* --- END: Hapus Tombol Copy dari JSX --- */}

          {/* Tombol Thumbs Up */}
          <button
            onClick={() => handleFeedback('like')}
            disabled={!!feedbackGiven}
            className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold border rounded-full transition-colors ${
              feedbackGiven === 'like'
                ? 'bg-green-100 text-green-700 border-green-300'
                : feedbackGiven
                ? 'text-gray-400 border-gray-200 cursor-not-allowed'
                : 'text-gray-600 border-gray-300 hover:bg-green-50 hover:border-green-300'
            }`}
          >
            <ThumbsUp className="w-3.5 h-3.5" />
            Ya
          </button>

          {/* Tombol Thumbs Down */}
          <button
            onClick={() => handleFeedback('dislike')}
            disabled={!!feedbackGiven}
            className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold border rounded-full transition-colors ${
              feedbackGiven === 'dislike'
                ? 'bg-red-100 text-red-700 border-red-300'
                : feedbackGiven
                ? 'text-gray-400 border-gray-200 cursor-not-allowed'
                : 'text-gray-600 border-gray-300 hover:bg-red-50 hover:border-red-300'
            }`}
          >
            <ThumbsDown className="w-3.5 h-3.5" />
            Tidak
          </button>
        </div>
      </div>
    </div>
  );
};

export default MessageActions;
