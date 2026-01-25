export interface ChatMessage {
  id: string;
  content: string;
  isBot: boolean;
  timestamp: Date;
  metadata?: {
    intent?: string;
    confidence?: number;
    navigationTarget?: string;
    suggestions?: ChatSuggestion[];
  };
}

export interface ChatSuggestion {
  id: string;
  text: string;
  category?: string;
  action?: () => void;
}

export interface ChatState {
  isOpen: boolean;
  messages: ChatMessage[];
  isTyping: boolean;
  sessionId: string;
  isInitialized: boolean;
}

export interface AIResponse {
  content: string;
  suggestions?: ChatSuggestion[];
  navigationTarget?: {
    path: string;
    description: string;
  } | null;
  metadata?: {
    model?: string;
    role?: string;
  };
}

export interface ChatbotConfig {
  sessionId: string;
  userId?: string;
  userRole: 'student' | 'faculty' | 'admin' | 'guest';
  userDetails?: {
    name?: string;
    rollNumber?: string;
    department?: string;
    year?: string;
  };
}

export interface StudentGrowthData {
  profile: {
    name: string;
    department: string;
    year: string;
  };
  progress: {
    dsa: string;
    programmingLanguages: number;
    careerPrepStarted: boolean;
  };
  milestones: number;
  streak: number;
  insights: {
    strengths: string[];
    areasToImprove: string[];
    recommendations: string[];
  };
}

export interface ConversationHistory {
  messages: ChatMessage[];
  metadata: {
    startedAt: Date;
    lastActiveAt: Date;
    totalMessages: number;
    topics: string[];
  };
}
