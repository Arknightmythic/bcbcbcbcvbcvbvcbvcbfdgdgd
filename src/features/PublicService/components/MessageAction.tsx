import React, { useState } from 'react';
import { ThumbsUp, ThumbsDown } from 'lucide-react'; // <-- Hapus 'Copy' dari import
import type { ChatMessage } from '../utils/types';

interface MessageActionsProps {
  message: ChatMessage;
  onFeedback: (messageId: string, feedback: 'like' | 'dislike') => void;
 
}

const MessageActions: React.FC<MessageActionsProps> = ({ message, onFeedback }) => { // <-- Hapus props yang tidak dipakai
  const [feedbackGiven, setFeedbackGiven] = useState<'like' | 'dislike' | null>(null);

  const handleFeedback = (feedback: 'like' | 'dislike') => {
    if (feedbackGiven) return;
    setFeedbackGiven(feedback);
    onFeedback(message.id, feedback);
  };

  return (
    <div className="pt-3 border-t border-gray-200">
      <div className="flex items-center justify-between text-sm text-gray-600 gap-2">
        <span className="italic">Apakah ini menjawab pertanyaan Anda?</span>
        <div className="flex items-center gap-2">
        
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
