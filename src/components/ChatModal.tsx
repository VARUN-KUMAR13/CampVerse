import React, { useEffect, useRef, useState } from 'react';
import {
  X,
  Send,
  Bot,
  User,
  Loader2,
  Trash2,
  ThumbsUp,
  ThumbsDown,
  Sparkles,
  GraduationCap,
  TrendingUp,
  ExternalLink,
  MessageSquare,
  Zap
} from 'lucide-react';
import { ChatMessage, ChatSuggestion, StudentGrowthData } from '../types/chatbot';

interface ChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  messages: ChatMessage[];
  onSendMessage: (message: string) => void;
  onSuggestionClick: (suggestion: ChatSuggestion) => void;
  suggestions: ChatSuggestion[];
  isTyping: boolean;
  inputValue: string;
  onInputChange: (value: string) => void;
  onClearChat?: () => void;
  onNavigate?: (path: string) => void;
  onFeedback?: (messageId: string, isPositive: boolean) => void;
  userRole?: string;
  userName?: string;
  growthData?: StudentGrowthData | null;
}

export const ChatModal: React.FC<ChatModalProps> = ({
  isOpen,
  onClose,
  messages,
  onSendMessage,
  onSuggestionClick,
  suggestions,
  isTyping,
  inputValue,
  onInputChange,
  onClearChat,
  onNavigate,
  onFeedback,
  userRole = 'guest',
  userName,
  growthData,
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [showGrowth, setShowGrowth] = useState(false);
  const [feedbackGiven, setFeedbackGiven] = useState<Set<string>>(new Set());

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen, messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      onSendMessage(inputValue.trim());
      onInputChange('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleFeedbackClick = (messageId: string, isPositive: boolean) => {
    if (onFeedback && !feedbackGiven.has(messageId)) {
      onFeedback(messageId, isPositive);
      setFeedbackGiven(prev => new Set([...prev, messageId]));
    }
  };

  // Format message content with markdown-like styling
  const formatMessage = (content: string) => {
    // Convert **bold** to <strong>
    let formatted = content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    // Convert newlines to <br>
    formatted = formatted.replace(/\n/g, '<br>');
    return formatted;
  };

  if (!isOpen) return null;

  const roleColors = {
    student: 'from-blue-400 to-indigo-500',
    faculty: 'from-emerald-400 to-teal-500',
    admin: 'from-purple-400 to-violet-500',
    guest: 'from-blue-400 to-indigo-500',
  };

  const roleGradient = roleColors[userRole as keyof typeof roleColors] || roleColors.guest;

  return (
    <div className="fixed bottom-20 right-4 z-40 w-[380px] max-w-[calc(100vw-2rem)] max-h-[calc(100vh-6rem)] animate-in slide-in-from-bottom-4 duration-300">
      <div className="bg-card rounded-2xl shadow-2xl border overflow-hidden backdrop-blur-lg flex flex-col max-h-[calc(100vh-6rem)]">
        {/* Header with Gradient */}
        <div className={`bg-gradient-to-r ${roleGradient} text-white p-3 flex-shrink-0`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-sm">CampVerse AI</h3>
                  <span className="px-2 py-0.5 bg-white/20 rounded-full text-[10px] font-medium uppercase tracking-wider">
                    {userRole}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className={`w-2 h-2 rounded-full ${isTyping ? 'bg-yellow-300 animate-pulse' : 'bg-green-300'}`} />
                  <p className="text-xs text-white/80">
                    {isTyping ? 'Thinking...' : 'Online'}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1">
              {/* Growth Stats Button (for students) */}
              {userRole === 'student' && growthData && (
                <button
                  onClick={() => setShowGrowth(!showGrowth)}
                  className="w-8 h-8 rounded-lg hover:bg-white/20 flex items-center justify-center transition-colors"
                  title="Your Growth"
                >
                  <TrendingUp className="w-4 h-4" />
                </button>
              )}
              {/* Clear Chat */}
              {onClearChat && (
                <button
                  onClick={onClearChat}
                  className="w-8 h-8 rounded-lg hover:bg-white/20 flex items-center justify-center transition-colors"
                  title="Clear Chat"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
              {/* Close */}
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-lg hover:bg-white/20 flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Growth Stats Panel */}
          {showGrowth && growthData && (
            <div className="mt-3 p-3 bg-white/10 rounded-xl backdrop-blur-sm">
              <div className="flex items-center gap-2 mb-2">
                <GraduationCap className="w-4 h-4" />
                <span className="text-xs font-semibold">Your Learning Journey</span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-white/10 rounded-lg p-2">
                  <div className="text-lg font-bold">{growthData.streak}</div>
                  <div className="text-[10px] opacity-80">Day Streak</div>
                </div>
                <div className="bg-white/10 rounded-lg p-2">
                  <div className="text-lg font-bold">{growthData.milestones}</div>
                  <div className="text-[10px] opacity-80">Milestones</div>
                </div>
                <div className="bg-white/10 rounded-lg p-2">
                  <div className="text-lg font-bold capitalize">{growthData.progress.dsa}</div>
                  <div className="text-[10px] opacity-80">DSA Level</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Messages Area */}
        <div className="h-[280px] min-h-[200px] overflow-y-auto p-3 space-y-3 bg-gradient-to-b from-background to-muted/30 flex-1">
          {messages.length === 0 && (
            <div className="text-center text-muted-foreground py-8">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-primary/20 to-primary/5 rounded-2xl flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-primary" />
              </div>
              <p className="text-sm font-medium">
                Hi{userName ? ` ${userName}` : ''}! I'm your CampVerse AI assistant.
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                How can I help you today?
              </p>
            </div>
          )}

          {messages.map((message, index) => (
            <div
              key={message.id}
              className={`flex gap-3 ${message.isBot ? 'justify-start' : 'justify-end'} animate-in fade-in slide-in-from-bottom-2 duration-300`}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              {message.isBot && (
                <div className={`w-8 h-8 bg-gradient-to-br ${roleGradient} rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg`}>
                  <Bot className="w-4 h-4 text-white" />
                </div>
              )}

              <div className="flex flex-col max-w-[80%]">
                <div
                  className={`p-3 rounded-2xl shadow-sm ${message.isBot
                    ? 'bg-card border rounded-tl-sm'
                    : `bg-gradient-to-r ${roleGradient} text-white rounded-tr-sm`
                    }`}
                >
                  <div
                    className="text-sm leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: formatMessage(message.content) }}
                  />
                  <p className={`text-[10px] mt-2 ${message.isBot ? 'text-muted-foreground' : 'text-white/70'}`}>
                    {message.timestamp.toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>

                {/* Feedback buttons for bot messages */}
                {message.isBot && onFeedback && (
                  <div className="flex items-center gap-1 mt-1 ml-1">
                    <button
                      onClick={() => handleFeedbackClick(message.id, true)}
                      disabled={feedbackGiven.has(message.id)}
                      className={`p-1 rounded hover:bg-muted transition-colors ${feedbackGiven.has(message.id) ? 'opacity-50' : ''
                        }`}
                      title="Helpful"
                    >
                      <ThumbsUp className="w-3 h-3 text-muted-foreground" />
                    </button>
                    <button
                      onClick={() => handleFeedbackClick(message.id, false)}
                      disabled={feedbackGiven.has(message.id)}
                      className={`p-1 rounded hover:bg-muted transition-colors ${feedbackGiven.has(message.id) ? 'opacity-50' : ''
                        }`}
                      title="Not helpful"
                    >
                      <ThumbsDown className="w-3 h-3 text-muted-foreground" />
                    </button>
                  </div>
                )}

                {/* Navigation button if present */}
                {message.isBot && message.metadata?.navigationTarget && onNavigate && (
                  <button
                    onClick={() => onNavigate(message.metadata!.navigationTarget!)}
                    className="flex items-center gap-1 mt-2 ml-1 text-xs text-primary hover:underline"
                  >
                    <ExternalLink className="w-3 h-3" />
                    Go to {message.metadata.navigationTarget.replace('/', '')}
                  </button>
                )}
              </div>

              {!message.isBot && (
                <div className="w-8 h-8 bg-muted rounded-xl flex items-center justify-center flex-shrink-0">
                  <User className="w-4 h-4 text-muted-foreground" />
                </div>
              )}
            </div>
          ))}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex gap-3 justify-start animate-in fade-in duration-300">
              <div className={`w-8 h-8 bg-gradient-to-br ${roleGradient} rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg`}>
                <Bot className="w-4 h-4 text-white animate-pulse" />
              </div>
              <div className="bg-card p-4 rounded-2xl rounded-tl-sm border shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                  <span className="text-xs text-muted-foreground font-medium flex items-center gap-1">
                    <Zap className="w-3 h-3" />
                    AI is thinking...
                  </span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggestions */}
        {suggestions.length > 0 && !isTyping && (
          <div className="px-4 py-3 border-t bg-card/50 backdrop-blur-sm">
            <div className="flex items-center gap-1.5 mb-2">
              <MessageSquare className="w-3 h-3 text-muted-foreground" />
              <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">
                Quick Actions
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {suggestions.slice(0, 4).map((suggestion) => (
                <button
                  key={suggestion.id}
                  onClick={() => onSuggestionClick(suggestion)}
                  className="text-xs bg-muted/80 hover:bg-muted text-foreground px-3 py-1.5 rounded-full hover:shadow-md transition-all duration-200 border border-transparent hover:border-primary/20"
                >
                  {suggestion.text}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input Area */}
        <div className="p-4 border-t bg-card">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <div className="flex-1 relative">
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => onInputChange(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me anything..."
                className="w-full px-4 py-3 border bg-background rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary text-sm pr-10 transition-all"
                disabled={isTyping}
              />
            </div>
            <button
              type="submit"
              disabled={!inputValue.trim() || isTyping}
              className={`w-12 h-12 bg-gradient-to-r ${roleGradient} text-white rounded-xl flex items-center justify-center hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl hover:scale-105 active:scale-95`}
            >
              {isTyping ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </button>
          </form>
          <p className="text-[10px] text-center text-muted-foreground mt-2">
            Powered by CampVerse AI • CVR College of Engineering
          </p>
        </div>
      </div>
    </div>
  );
};
