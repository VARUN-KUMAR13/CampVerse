import React, { useState, useCallback, useEffect } from 'react';
import { ChatbotIcon } from './ChatbotIcon';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../lib/api';

declare global {
  interface Window {
    chatbase?: any;
  }
}

export const AIChatbot: React.FC = () => {
  const { userData, currentUser } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  // Initialize Chatbase Script
  useEffect(() => {
    if (!window.chatbase) {
      (function(){
        const chatbot = (...args: any[]) => {
          if (!chatbot.q) { chatbot.q = []; }
          chatbot.q.push(args);
        };
        chatbot.q = [] as any[];
        window.chatbase = new Proxy(chatbot, {
          get(target, prop) {
            if (prop === "q") { return target.q; }
            return (...args: any[]) => (target as any)[prop](...args);
          }
        });
        const onLoad = function() {
          const script = document.createElement("script");
          script.src = "https://www.chatbase.co/embed.min.js";
          script.id = "hT0ZVaHT1raLPftpo9ddq";
          script.setAttribute("domain", "www.chatbase.co");
          document.body.appendChild(script);
        };
        if (document.readyState === "complete") {
          onLoad();
        } else {
          window.addEventListener("load", onLoad);
        }
      })();
    }
  }, []);

  // Handle Identity Verification
  useEffect(() => {
    const identifyUser = async () => {
      if (currentUser && window.chatbase) {
        try {
          const response = await api.get('/chatbot/token');
          if (response.token) {
            window.chatbase('identify', { token: response.token });
          }
        } catch (error) {
          console.error('Failed to identify user for chatbot:', error);
        }
      }
    };
    
    if (currentUser && window.chatbase) {
        identifyUser();
    }
  }, [currentUser]);

  const toggleChat = useCallback(() => {
    if (window.chatbase) {
      if (isOpen) {
        window.chatbase('close');
      } else {
        window.chatbase('open');
      }
      setIsOpen(!isOpen);
    }
  }, [isOpen]);

  // Sync state with widget visibility
  useEffect(() => {
    const checkState = setInterval(() => {
      if (window.chatbase) {
        try {
          const state = window.chatbase('getState');
          if (state === 'closed' && isOpen) setIsOpen(false);
          if (state === 'open' && !isOpen) setIsOpen(true);
        } catch (e) {
          // Some versions of Chatbase might not support getState
        }
      }
    }, 500);
    return () => clearInterval(checkState);
  }, [isOpen]);

  // Manage body class for animations and hide default launcher via config
  useEffect(() => {
    if (window.chatbase) {
      // Try to disable default launcher via config as well
      window.chatbase('setConfig', {
        launcher: false,
        autoShow: false
      });
    }

    if (isOpen) {
      document.body.classList.add('chat-widget-open');
    } else {
      document.body.classList.remove('chat-widget-open');
    }
  }, [isOpen]);

  return (
    <ChatbotIcon
      onClick={toggleChat}
      isOpen={isOpen}
      hasNewMessage={false}
    />
  );
};
