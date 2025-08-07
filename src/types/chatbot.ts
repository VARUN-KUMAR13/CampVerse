export interface ChatMessage {
  id: string;
  content: string;
  isBot: boolean;
  timestamp: Date;
}

export interface ChatSuggestion {
  id: string;
  text: string;
  action?: () => void;
}

export interface ChatState {
  isOpen: boolean;
  messages: ChatMessage[];
  isTyping: boolean;
}

export interface AIResponse {
  content: string;
  suggestions?: ChatSuggestion[];
}
