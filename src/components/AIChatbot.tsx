import React, { useState, useCallback } from 'react';
import { ChatbotIcon } from './ChatbotIcon';
import { ChatModal } from './ChatModal';
import { useAI } from '../hooks/useAI';
import { ChatMessage, ChatSuggestion, ChatState } from '../types/chatbot';

export const AIChatbot: React.FC = () => {
  const { getAIResponse, isLoading } = useAI();
  const [chatState, setChatState] = useState<ChatState>({
    isOpen: false,
    messages: [],
    isTyping: false
  });
  const [inputValue, setInputValue] = useState('');
  const [currentSuggestions, setCurrentSuggestions] = useState<ChatSuggestion[]>([
    { id: '1', text: 'Show me around the dashboard' },
    { id: '2', text: 'Help with assignments' },
    { id: '3', text: 'Where is my schedule?' },
    { id: '4', text: 'How to pay fees?' }
  ]);

  const toggleChat = useCallback(() => {
    setChatState(prev => ({ ...prev, isOpen: !prev.isOpen }));
  }, []);

  const addMessage = useCallback((content: string, isBot: boolean = false): ChatMessage => {
    const message: ChatMessage = {
      id: Date.now().toString() + Math.random(),
      content,
      isBot,
      timestamp: new Date()
    };
    
    setChatState(prev => ({
      ...prev,
      messages: [...prev.messages, message]
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
      
      // Add bot message
      addMessage(aiResponse.content, true);
      
      // Update suggestions
      if (aiResponse.suggestions) {
        setCurrentSuggestions(aiResponse.suggestions);
      }
    } catch (error) {
      console.error('Error getting AI response:', error);
      addMessage('Sorry, I encountered an error. Please try again.', true);
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

  return (
    <>
      <ChatbotIcon 
        onClick={toggleChat} 
        isOpen={chatState.isOpen} 
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
      />
    </>
  );
};
