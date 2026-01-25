import React from 'react';
import { MessageCircle, X, Sparkles } from 'lucide-react';

interface ChatbotIconProps {
  onClick: () => void;
  isOpen: boolean;
  hasNewMessage?: boolean;
}

export const ChatbotIcon: React.FC<ChatbotIconProps> = ({ onClick, isOpen, hasNewMessage }) => {
  return (
    <button
      onClick={onClick}
      className={`
        fixed bottom-6 right-6 z-50
        w-14 h-14 rounded-full
        bg-blue-400 hover:bg-blue-500
        text-white
        shadow-lg hover:shadow-xl
        flex items-center justify-center
        transition-all duration-300 ease-out
        hover:scale-105 active:scale-95
        group
      `}
      aria-label={isOpen ? 'Close chat' : 'Open chat'}
    >
      {/* Sparkle decoration - positioned at top right */}
      <Sparkles
        className="absolute -top-0.5 -right-0.5 w-4 h-4 text-yellow-400 drop-shadow-md"
        fill="currentColor"
      />

      {/* Pulse animation for new message */}
      {hasNewMessage && !isOpen && (
        <span className="absolute -top-1 -right-1 flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500" />
        </span>
      )}

      {/* Icon */}
      <div className={`transition-transform duration-300 ${isOpen ? 'rotate-90' : 'rotate-0'}`}>
        {isOpen ? (
          <X className="w-6 h-6" />
        ) : (
          <MessageCircle className="w-6 h-6" fill="currentColor" />
        )}
      </div>
    </button>
  );
};
