import React, { useState, useCallback, useEffect } from 'react';
import { ChatbotIcon } from './ChatbotIcon';
import { ChatModal } from './ChatModal';
import { useAI } from '../hooks/useAI';
import { ChatMessage, ChatSuggestion, ChatState } from '../types/chatbot';
import { useAuth } from '../contexts/AuthContext';

export const AIChatbot: React.FC = () => {
  const { userData } = useAuth();
  const {
    getAIResponse,
    isLoading,
    initialSuggestions,
    growthData,
    clearHistory,
    submitFeedback
  } = useAI();

  const [chatState, setChatState] = useState<ChatState>({
    isOpen: false,
    messages: [],
    isTyping: false,
    sessionId: '',
    isInitialized: false,
  });
  const [inputValue, setInputValue] = useState('');
  const [currentSuggestions, setCurrentSuggestions] = useState<ChatSuggestion[]>([]);

  // Initialize suggestions when they're loaded
  useEffect(() => {
    if (initialSuggestions.length > 0 && currentSuggestions.length === 0) {
      setCurrentSuggestions(initialSuggestions);
    }
  }, [initialSuggestions, currentSuggestions.length]);

  // Get user greeting based on role
  const getWelcomeMessage = useCallback(() => {
    const name = userData?.name || 'there';
    const role = userData?.role || 'guest';

    const greetings: Record<string, string> = {
      student: `Hi ${name}! 👋 I'm your CampVerse AI Assistant. I can help you with:\n\n• 📱 Navigating the portal\n• 📚 Academic queries & assignments\n• 💻 Coding & DSA help\n• 🎯 Career guidance\n• 💰 Fee payments\n\nHow can I help you today?`,
      faculty: `Hello ${name}! 👋 I'm here to assist you with course management, student tracking, and platform features. What do you need help with?`,
      admin: `Welcome back ${name}! 👋 I can help you with system administration, reports, and managing the platform. How can I assist you?`,
      guest: `Hello! 👋 Welcome to CVR College of Engineering. I'm CampVerse AI Assistant. I can tell you about our college, courses, admissions, and facilities. What would you like to know?`,
    };

    return greetings[role] || greetings.guest;
  }, [userData]);

  const toggleChat = useCallback(() => {
    setChatState(prev => {
      const newIsOpen = !prev.isOpen;

      // Add welcome message when opening chat for the first time
      if (newIsOpen && prev.messages.length === 0) {
        const welcomeMessage: ChatMessage = {
          id: 'welcome_' + Date.now(),
          content: getWelcomeMessage(),
          isBot: true,
          timestamp: new Date(),
        };
        return {
          ...prev,
          isOpen: newIsOpen,
          messages: [welcomeMessage],
        };
      }

      return { ...prev, isOpen: newIsOpen };
    });
  }, [getWelcomeMessage]);

  const addMessage = useCallback((content: string, isBot: boolean = false, metadata?: ChatMessage['metadata']): ChatMessage => {
    const message: ChatMessage = {
      id: Date.now().toString() + Math.random(),
      content,
      isBot,
      timestamp: new Date(),
      metadata,
    };

    setChatState(prev => ({
      ...prev,
      messages: [...prev.messages, message],
    }));

    return message;
  }, []);

  const handleSendMessage = useCallback(async (content: string) => {
    // Add user message
    addMessage(content, false);

    // Set typing state
    setChatState(prev => ({ ...prev, isTyping: true }));

    try {
      // Get AI response
      const aiResponse = await getAIResponse(content);

      // Add bot message with metadata
      addMessage(aiResponse.content, true, {
        navigationTarget: aiResponse.navigationTarget?.path,
        suggestions: aiResponse.suggestions,
      });

      // Update suggestions
      if (aiResponse.suggestions && aiResponse.suggestions.length > 0) {
        setCurrentSuggestions(aiResponse.suggestions);
      }
    } catch (error) {
      console.error('Error getting AI response:', error);
      addMessage('I apologize, but I encountered an error. Please try again or rephrase your question.', true);
    } finally {
      setChatState(prev => ({ ...prev, isTyping: false }));
    }
  }, [addMessage, getAIResponse]);

  const handleSuggestionClick = useCallback((suggestion: ChatSuggestion) => {
    if (suggestion.action) {
      suggestion.action();
    } else {
      handleSendMessage(suggestion.text);
    }
  }, [handleSendMessage]);

  const handleInputChange = useCallback((value: string) => {
    setInputValue(value);
  }, []);

  const handleCloseChat = useCallback(() => {
    setChatState(prev => ({ ...prev, isOpen: false }));
  }, []);

  const handleClearChat = useCallback(() => {
    setChatState(prev => ({
      ...prev,
      messages: [{
        id: 'welcome_new_' + Date.now(),
        content: getWelcomeMessage(),
        isBot: true,
        timestamp: new Date(),
      }],
    }));
    setCurrentSuggestions(initialSuggestions);
    clearHistory();
  }, [getWelcomeMessage, initialSuggestions, clearHistory]);

  const handleNavigate = useCallback((path: string) => {
    // Use window.location for navigation instead of useNavigate
    window.location.href = path;
  }, []);

  const handleFeedback = useCallback((messageId: string, isPositive: boolean) => {
    submitFeedback(messageId, isPositive ? 5 : 1);
  }, [submitFeedback]);

  return (
    <>
      <ChatbotIcon
        onClick={toggleChat}
        isOpen={chatState.isOpen}
        hasNewMessage={false}
      />

      <ChatModal
        isOpen={chatState.isOpen}
        onClose={handleCloseChat}
        messages={chatState.messages}
        onSendMessage={handleSendMessage}
        onSuggestionClick={handleSuggestionClick}
        suggestions={currentSuggestions}
        isTyping={chatState.isTyping || isLoading}
        inputValue={inputValue}
        onInputChange={handleInputChange}
        onClearChat={handleClearChat}
        onNavigate={handleNavigate}
        onFeedback={handleFeedback}
        userRole={userData?.role || 'guest'}
        userName={userData?.name}
        growthData={growthData}
      />
    </>
  );
};
