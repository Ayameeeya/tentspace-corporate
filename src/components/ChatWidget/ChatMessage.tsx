import React from 'react';
import { Bot, User } from 'lucide-react';

interface ChatMessageProps {
  message: string;
  isBot: boolean;
  timestamp: string;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message, isBot, timestamp }) => {
  return (
    <div className={`flex gap-3 ${isBot ? '' : 'flex-row-reverse'}`}>
      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isBot ? 'bg-primary text-white' : 'bg-gray-100'
        }`}>
        {isBot ? <Bot size={18} /> : <User size={18} />}
      </div>
      <div className={`max-w-[80%] ${isBot ? 'items-start' : 'items-end'}`}>
        <div className={`rounded-2xl px-4 py-2 ${isBot ? 'bg-gray-100' : 'bg-primary text-white'
          }`}>
          <p className="text-sm">{message}</p>
        </div>
        <span className="text-xs text-gray-500 mt-1">{timestamp}</span>
      </div>
    </div>
  );
};

export default ChatMessage;