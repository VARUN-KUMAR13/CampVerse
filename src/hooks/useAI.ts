import { useState, useCallback, useEffect, useRef } from 'react';
import { AIResponse, ChatSuggestion, ChatMessage, ChatbotConfig, StudentGrowthData } from '../types/chatbot';
import { useAuth } from '../contexts/AuthContext';
import { config } from '../config/environment';

const API_BASE_URL = config.API_BASE_URL || 'http://localhost:5000/api';

// Generate a unique session ID
const generateSessionId = (): string => {
  const timestamp = Date.now().toString(36);
  const randomStr = Math.random().toString(36).substring(2, 15);
  return `session_${timestamp}_${randomStr}`;
};

// Get or create session ID from localStorage
const getSessionId = (): string => {
  try {
    let sessionId = localStorage.getItem('campverse_chat_session');
    if (!sessionId) {
      sessionId = generateSessionId();
      localStorage.setItem('campverse_chat_session', sessionId);
    }
    return sessionId;
  } catch {
    return generateSessionId();
  }
};

export const useAI = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sessionId] = useState<string>(() => getSessionId());
  const [conversationHistory, setConversationHistory] = useState<ChatMessage[]>([]);
  const [growthData, setGrowthData] = useState<StudentGrowthData | null>(null);
  const [initialSuggestions, setInitialSuggestions] = useState<ChatSuggestion[]>([
    { id: '1', text: 'Show me around the dashboard' },
    { id: '2', text: 'Help with assignments' },
    { id: '3', text: 'Where is my schedule?' },
    { id: '4', text: 'How to pay fees?' },
  ]);

  const { userData } = useAuth();
  const initRef = useRef(false);
  const fetchingRef = useRef(false);

  // Get user configuration
  const getUserConfig = useCallback((): ChatbotConfig => {
    if (userData) {
      return {
        sessionId,
        userId: userData.uid,
        userRole: userData.role || 'student',
        userDetails: {
          name: userData.name,
          rollNumber: userData.rollNumber,
          department: userData.branch,
          year: userData.year,
        },
      };
    }
    return {
      sessionId,
      userRole: 'guest',
    };
  }, [userData, sessionId]);

  // Initialize suggestions based on user role
  useEffect(() => {
    const fetchInitialSuggestions = async () => {
      if (initRef.current || fetchingRef.current) return;
      fetchingRef.current = true;

      const config = getUserConfig();
      try {
        const response = await fetch(
          `${API_BASE_URL}/chatbot/suggestions/${config.userRole}`
        );
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.suggestions) {
            setInitialSuggestions(data.suggestions);
          }
        }
      } catch (err) {
        console.warn('Failed to fetch initial suggestions:', err);
      } finally {
        initRef.current = true;
        fetchingRef.current = false;
      }
    };

    fetchInitialSuggestions();
  }, [getUserConfig]);

  // Fetch student growth data if logged in as student
  const fetchGrowthData = useCallback(async () => {
    if (!userData || userData.role !== 'student') return;

    try {
      const response = await fetch(
        `${API_BASE_URL}/chatbot/growth/${userData.uid}`
      );
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.growth) {
          setGrowthData(data.growth);
        }
      }
    } catch (err) {
      console.warn('Failed to fetch growth data:', err);
    }
  }, [userData]);

  useEffect(() => {
    if (userData?.role === 'student') {
      fetchGrowthData();
    }
  }, [userData?.role, fetchGrowthData]);

  // Main function to get AI response
  const getAIResponse = useCallback(async (message: string): Promise<AIResponse> => {
    setIsLoading(true);
    setError(null);

    const config = getUserConfig();

    try {
      const response = await fetch(`${API_BASE_URL}/chatbot/message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          sessionId: config.sessionId,
          userId: config.userId,
          userRole: config.userRole,
          userDetails: config.userDetails,
          conversationHistory: conversationHistory.slice(-6),
        }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();

      if (data.success && data.response) {
        const userMsg: ChatMessage = {
          id: `user_${Date.now()}`,
          content: message,
          isBot: false,
          timestamp: new Date(),
        };
        const botMsg: ChatMessage = {
          id: `bot_${Date.now()}`,
          content: data.response.content,
          isBot: true,
          timestamp: new Date(),
          metadata: {
            navigationTarget: data.response.navigationTarget?.path,
            suggestions: data.response.suggestions,
          },
        };
        setConversationHistory(prev => [...prev, userMsg, botMsg]);

        return {
          content: data.response.content,
          suggestions: data.response.suggestions || [],
          navigationTarget: data.response.navigationTarget,
          metadata: data.response.metadata,
        };
      }

      if (data.fallbackResponse) {
        return data.fallbackResponse;
      }

      throw new Error('Invalid response from server');
    } catch (err) {
      console.error('AI Service Error:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      return generateFallbackResponse(message, config.userRole);
    } finally {
      setIsLoading(false);
    }
  }, [getUserConfig, conversationHistory]);

  // Clear conversation history
  const clearHistory = useCallback(async () => {
    setConversationHistory([]);
    try {
      await fetch(`${API_BASE_URL}/chatbot/session/${sessionId}`, {
        method: 'DELETE',
      });
    } catch (err) {
      console.warn('Failed to clear session:', err);
    }
  }, [sessionId]);

  // Submit feedback
  const submitFeedback = useCallback(async (
    messageId: string,
    rating: number,
    feedback?: string
  ) => {
    try {
      await fetch(`${API_BASE_URL}/chatbot/feedback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId,
          messageId,
          rating,
          feedback,
        }),
      });
    } catch (err) {
      console.warn('Failed to submit feedback:', err);
    }
  }, [sessionId]);

  return {
    getAIResponse,
    isLoading,
    error,
    sessionId,
    conversationHistory,
    growthData,
    initialSuggestions,
    clearHistory,
    submitFeedback,
    fetchGrowthData,
  };
};

// Fallback response generator
function generateFallbackResponse(message: string, userRole: string): AIResponse {
  const lowerMessage = message.toLowerCase();

  if (lowerMessage.includes('schedule') || lowerMessage.includes('timetable')) {
    return {
      content: "📅 You can find your schedule by clicking on **'Schedule'** in the sidebar. It shows your daily classes, timings, and upcoming events.",
      suggestions: [
        { id: '1', text: 'View assignments' },
        { id: '2', text: 'Check attendance' },
        { id: '3', text: 'Help with navigation' },
      ],
    };
  }

  if (lowerMessage.includes('assignment')) {
    return {
      content: "📝 **How to Submit Assignments:**\n\n1. Go to **Assignments** in the sidebar\n2. Click on the assignment you want to submit\n3. Upload your file (PDF, DOC, DOCX, ZIP)\n4. Add comments if needed\n5. Click **Submit**\n\nYou'll receive a confirmation once submitted!",
      suggestions: [
        { id: '1', text: 'Check grades' },
        { id: '2', text: 'View schedule' },
        { id: '3', text: 'More help' },
      ],
    };
  }

  if (lowerMessage.includes('fee') || lowerMessage.includes('payment')) {
    return {
      content: "💰 **Fee Payment Process:**\n\n1. Go to **Fees** in the sidebar\n2. View your fee breakdown\n3. Click **'Pay Now'**\n4. Choose payment method (Card/UPI/Net Banking)\n5. Complete payment via Razorpay\n6. Download your receipt\n\nPayment history is available in the Transactions tab.",
      suggestions: [
        { id: '1', text: 'View fee breakdown' },
        { id: '2', text: 'Payment history' },
        { id: '3', text: 'Download receipt' },
      ],
    };
  }

  if (lowerMessage.includes('grade') || lowerMessage.includes('marks') || lowerMessage.includes('result')) {
    return {
      content: "📊 Your grades are available in the **'Grades'** section:\n\n1. Go to Grades in sidebar\n2. Select semester\n3. View subject-wise marks\n4. Check your GPA/CGPA\n\nContact your department for any discrepancies.",
      suggestions: [
        { id: '1', text: 'View attendance' },
        { id: '2', text: 'Check assignments' },
        { id: '3', text: 'Academic calendar' },
      ],
    };
  }

  if (lowerMessage.includes('dsa') || lowerMessage.includes('algorithm') || lowerMessage.includes('data structure')) {
    return {
      content: "💻 **DSA Learning Path:**\n\n**Beginner:**\n- Arrays & Strings\n- Linked Lists\n- Stacks & Queues\n\n**Intermediate:**\n- Trees & BST\n- Graphs basics\n- Recursion & Backtracking\n\n**Advanced:**\n- Dynamic Programming\n- Advanced Graphs\n- Segment Trees\n\n**Practice on:** LeetCode, HackerRank, GeeksforGeeks",
      suggestions: [
        { id: '1', text: 'Array problems' },
        { id: '2', text: 'Tree concepts' },
        { id: '3', text: 'Interview preparation' },
      ],
    };
  }

  if (lowerMessage.includes('placement') || lowerMessage.includes('job') || lowerMessage.includes('career')) {
    return {
      content: "🎯 **Placement Preparation Tips:**\n\n1. **Technical Skills:** DSA, OOP, DBMS, OS\n2. **Coding Practice:** Solve 2-3 problems daily\n3. **Projects:** Build 2-3 good projects\n4. **Resume:** Keep it concise, 1 page\n5. **Mock Interviews:** Practice regularly\n\nCheck the **Placements** section for job opportunities!",
      suggestions: [
        { id: '1', text: 'Resume tips' },
        { id: '2', text: 'Interview questions' },
        { id: '3', text: 'Top companies' },
      ],
    };
  }

  const roleBasedGreeting = {
    student: "I can help you with assignments, grades, fees, attendance, DSA, coding, and career guidance!",
    faculty: "I can help you with course management, student performance, and platform features!",
    admin: "I can help you with system administration, user management, and reports!",
    guest: "I can help you learn about CVR College, courses, admissions, and facilities!",
  };

  return {
    content: `👋 **Hello!** I'm CampVerse AI Assistant.\n\n${roleBasedGreeting[userRole as keyof typeof roleBasedGreeting] || roleBasedGreeting.guest}\n\nHow can I help you today?`,
    suggestions: [
      { id: '1', text: 'Navigate the platform' },
      { id: '2', text: 'Academic help' },
      { id: '3', text: 'Career guidance' },
      { id: '4', text: 'College information' },
    ],
  };
}
