import React from 'react';
import { MessageCircle, Sparkles, X } from 'lucide-react';

interface ChatbotIconProps {
  onClick: () => void;
  isOpen: boolean;
}

export const ChatbotIcon: React.FC<ChatbotIconProps> = ({ onClick, isOpen }) => {
  return (
    <div className="fixed bottom-6 right-6 z-50">
      <button
        onClick={onClick}
        className={`
          group relative w-14 h-14 bg-primary border-2 border-background
          rounded-full shadow-lg hover:shadow-xl transition-all duration-300
          transform hover:scale-110 active:scale-95
          ${isOpen ? 'scale-95' : 'animate-bounce'}
        `}
        style={{
          animation: isOpen ? 'none' : 'float 3s ease-in-out infinite'
        }}
      >
        {/* Overlay for extra shine */}
        <div className="absolute inset-0 bg-accent rounded-full opacity-0 group-hover:opacity-20 transition-opacity duration-300" />

        {/* Main icon */}
        <div className="relative flex items-center justify-center w-full h-full">
          {isOpen ? (
            <X className="w-5 h-5 text-primary-foreground" />
          ) : (
            <MessageCircle className="w-6 h-6 text-primary-foreground" />
          )}
        </div>

        {/* Sparkle effect */}
        <Sparkles
          className={`
            absolute -top-1 -right-1 w-4 h-4 text-yellow-400
            transition-all duration-300
            ${isOpen ? 'opacity-0 scale-0' : 'opacity-100 scale-100'}
          `}
          style={{
            animation: isOpen ? 'none' : 'sparkle 2s ease-in-out infinite'
          }}
        />

        {/* Notification pulse */}
        <div
          className={`
            absolute inset-0 rounded-full bg-primary/50
            transition-all duration-1000
            ${isOpen ? 'opacity-0 scale-100' : 'opacity-30 scale-150'}
          `}
          style={{
            animation: isOpen ? 'none' : 'pulse-ring 2s ease-out infinite'
          }}
        />
      </button>

      {/* Floating tooltip */}
      <div
        className={`
          absolute bottom-16 right-0 bg-popover text-popover-foreground text-sm px-3 py-2
          rounded-md whitespace-nowrap transition-all duration-300 transform border shadow-md
          ${isOpen ? 'opacity-0 translate-y-2 pointer-events-none' : 'opacity-0 group-hover:opacity-100 translate-y-0'}
        `}
      >
        Ask me anything!
        <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-popover" />
      </div>
    </div>
  );
};
