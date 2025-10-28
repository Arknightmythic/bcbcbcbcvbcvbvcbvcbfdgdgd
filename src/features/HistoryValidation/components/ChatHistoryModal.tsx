import React from 'react';
import { X, CheckCircle, XCircle } from 'lucide-react';
import type { ChatMessage } from '../utils/types';

interface ChatHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  chatHistory: ChatMessage[];
  userInitial?: string;
}

const ChatHistoryModal: React.FC<ChatHistoryModalProps> = ({ isOpen, onClose, chatHistory, userInitial = "U" }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 transition-opacity">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl p-6 m-4 animate-fade-in-up flex flex-col">
        <div className="flex justify-between items-center pb-4 border-b">
          <h2 className="text-xl font-bold text-gray-800">Chat History</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800"><X className="w-6 h-6" /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 my-4 space-y-4 max-h-[60vh] custom-scrollbar">
          {chatHistory.map(message => (
            <div key={message.id} className={`relative group mb-4 flex gap-3 ${message.sender === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0 text-white ${message.sender === 'user' ? 'bg-bOss-blue' : 'bg-bOss-red'}`}>
                {message.sender === 'user' ? userInitial : 'AI'}
              </div>
              <div className={`relative p-3 rounded-lg max-w-[85%] leading-relaxed shadow-sm ${
                  message.sender === 'user' ? 'bg-bOss-blue text-white rounded-br-none'
                  : 'bg-gray-100 text-gray-800 rounded-bl-none'
              }`}>
                <p className="whitespace-pre-wrap m-0 text-sm">{message.text}</p>
                {message.sender === 'agent' && (
                  <div className="flex justify-end gap-x-2 mt-2 pt-2 border-t border-gray-200">
                    <button
                      className="p-1 text-green-600 hover:bg-green-50 rounded-md transition-colors"
                      title="Approve"
                    >
                      <CheckCircle className="w-5 h-5" />
                    </button>
                    <button
                      className="p-1 text-orange-600 hover:bg-orange-50 rounded-md transition-colors"
                      title="Reject"
                    >
                      <XCircle className="w-5 h-5" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
        <div className="flex justify-end pt-4 border-t">
          <button onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">Close</button>
        </div>
      </div>
       <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #ccc; border-radius: 3px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #aaa; }
      `}</style>
    </div>
  );
};

export default ChatHistoryModal;