import { useState, useCallback } from 'react';
import { AIResponse, ChatSuggestion } from '../types/chatbot';

export const useAI = () => {
  const [isLoading, setIsLoading] = useState(false);

  const getAIResponse = useCallback(async (message: string): Promise<AIResponse> => {
    setIsLoading(true);
    
    // Simulate AI processing delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const lowerMessage = message.toLowerCase();
    
    // Navigation queries
    if (lowerMessage.includes('schedule') || lowerMessage.includes('timetable')) {
      setIsLoading(false);
      return {
        content: "You can find your schedule by clicking on 'Schedule' in the sidebar. It shows your daily classes, timings, and upcoming events.",
        suggestions: [
          { id: '1', text: 'Show me assignments' },
          { id: '2', text: 'Where are my grades?' },
          { id: '3', text: 'Help with attendance' }
        ]
      };
    }
    
    if (lowerMessage.includes('assignment') || lowerMessage.includes('homework')) {
      setIsLoading(false);
      return {
        content: "Assignments can be found in the 'Assignments' section in your sidebar. You can view pending assignments, submit work, and track deadlines there.",
        suggestions: [
          { id: '1', text: 'How to submit assignments?' },
          { id: '2', text: 'Check my grades' },
          { id: '3', text: 'View schedule' }
        ]
      };
    }
    
    if (lowerMessage.includes('fee') || lowerMessage.includes('payment')) {
      setIsLoading(false);
      return {
        content: "You can manage your fees in the 'Fees' section under assignments. View academic fees, hostel fees, transport fees, and make payments through Razorpay.",
        suggestions: [
          { id: '1', text: 'How to pay fees?' },
          { id: '2', text: 'Check fee status' },
          { id: '3', text: 'Payment history' }
        ]
      };
    }
    
    if (lowerMessage.includes('grade') || lowerMessage.includes('marks') || lowerMessage.includes('result')) {
      setIsLoading(false);
      return {
        content: "Your grades and results are available in the 'Grades' section. You can view semester-wise performance, GPA, and detailed subject marks.",
        suggestions: [
          { id: '1', text: 'Calculate GPA' },
          { id: '2', text: 'View attendance' },
          { id: '3', text: 'Check assignments' }
        ]
      };
    }
    
    // College information
    if (lowerMessage.includes('college') || lowerMessage.includes('university') || lowerMessage.includes('campus')) {
      setIsLoading(false);
      return {
        content: "CampVerse is your comprehensive college management platform. Our college focuses on providing quality education in Computer Science and Engineering with modern facilities and experienced faculty.",
        suggestions: [
          { id: '1', text: 'Contact information' },
          { id: '2', text: 'Faculty details' },
          { id: '3', text: 'Campus facilities' }
        ]
      };
    }
    
    // Academic help
    if (lowerMessage.includes('dsa') || lowerMessage.includes('algorithm') || lowerMessage.includes('data structure')) {
      setIsLoading(false);
      return {
        content: "For Data Structures and Algorithms, I recommend practicing on platforms like LeetCode, HackerRank. Focus on arrays, linked lists, trees, and graphs first. Need specific DSA topics?",
        suggestions: [
          { id: '1', text: 'Array problems' },
          { id: '2', text: 'Tree algorithms' },
          { id: '3', text: 'Practice resources' }
        ]
      };
    }
    
    if (lowerMessage.includes('coding') || lowerMessage.includes('programming')) {
      setIsLoading(false);
      return {
        content: "For coding improvement, practice regularly on coding platforms, work on projects, and participate in coding contests. Focus on clean code principles and problem-solving patterns.",
        suggestions: [
          { id: '1', text: 'Project ideas' },
          { id: '2', text: 'Coding contests' },
          { id: '3', text: 'Best practices' }
        ]
      };
    }
    
    // Career guidance
    if (lowerMessage.includes('career') || lowerMessage.includes('job') || lowerMessage.includes('placement')) {
      setIsLoading(false);
      return {
        content: "For career growth, focus on building strong technical skills, work on real projects, maintain a good GitHub profile, and prepare for interviews. Check the Placements section for job opportunities.",
        suggestions: [
          { id: '1', text: 'Interview tips' },
          { id: '2', text: 'Resume building' },
          { id: '3', text: 'Skill development' }
        ]
      };
    }
    
    // Default response
    setIsLoading(false);
    return {
      content: "I'm here to help you navigate CampVerse and assist with your academic journey. You can ask me about navigation, features, college information, career guidance, or academic topics like DSA and coding. What would you like to know?",
      suggestions: [
        { id: '1', text: 'Show me around the dashboard' },
        { id: '2', text: 'Help with assignments' },
        { id: '3', text: 'Career guidance' },
        { id: '4', text: 'Study tips' }
      ]
    };
  }, []);

  return { getAIResponse, isLoading };
};
