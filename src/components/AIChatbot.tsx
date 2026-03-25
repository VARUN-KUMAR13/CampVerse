import React, { useState, useCallback, useEffect } from 'react';
import { ChatbotIcon } from './ChatbotIcon';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../lib/api';

declare global {
  interface Window {
    chatbase?: any;
    chatbaseConfig?: {
      chatbotId: string;
      [key: string]: any;
    };
  }
}

import { config } from '../config/environment';

export const AIChatbot: React.FC = () => {
  const { userData, currentUser } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  // Initialize Chatbase Script
  useEffect(() => {
    if (!window.chatbase) {
      // Set initial config to hide default launcher
      window.chatbaseConfig = {
        chatbotId: config.CHATBASE_ID,
      };

      (function(){
        const chatbot = (...args: any[]) => {
          if (!chatbot.q) { chatbot.q = []; }
          chatbot.q.push(args);
        };
        chatbot.q = [] as any[];
        window.chatbase = chatbot;

        const onLoad = function() {
          const script = document.createElement("script");
          script.src = "https://www.chatbase.co/embed.min.js";
          script.id = config.CHATBASE_ID;
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

  // Manage body class for animations
  useEffect(() => {

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
