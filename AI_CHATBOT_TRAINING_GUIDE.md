# 🤖 CampVerse AI Chatbot - Enhanced System

## 📋 Overview
The CampVerse AI Chatbot is a comprehensive, intelligent assistant designed for CVR College of Engineering. It provides personalized support for students, faculty, administrators, and visitors.

## 🎯 Key Features

### 1. **Multi-Role Support**
- **Students**: Academic help, navigation, DSA/coding assistance, career guidance, growth tracking
- **Faculty**: Course management, student tracking, platform assistance
- **Admin**: System administration, reports, user management
- **Guests**: College information, admissions, facilities

### 2. **AI-Powered Responses**
- Powered by Google Gemini AI
- Context-aware conversations
- Smart suggestions based on user role and history
- Navigation assistance with step-by-step guides

### 3. **Student Growth Tracking**
- Learning progress monitoring (DSA, programming, academics)
- Achievement milestones
- Daily streak tracking
- Personalized recommendations

### 4. **Chat History & Persistence**
- Conversation history stored in MongoDB
- Session-based tracking
- Cross-device conversation continuity

## 🔧 Architecture

```
Frontend (React)
├── AIChatbot.tsx      # Main chatbot component
├── ChatModal.tsx      # Chat UI with premium design
├── ChatbotIcon.tsx    # Floating action button
└── useAI.ts           # AI hook with API integration

Backend (Express.js)
├── routes/chatbot.js  # API endpoints
├── services/aiService.js  # Gemini AI integration
└── models/
    ├── ChatConversation.js  # Chat history
    ├── StudentGrowth.js     # Growth tracking
    └── KnowledgeBase.js     # College information
```

## 🚀 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/chatbot/message` | POST | Send message and get AI response |
| `/api/chatbot/history/:sessionId` | GET | Get conversation history |
| `/api/chatbot/user-history/:userId` | GET | Get user's all conversations |
| `/api/chatbot/feedback` | POST | Submit feedback |
| `/api/chatbot/growth/:userId` | GET | Get student growth data |
| `/api/chatbot/suggestions/:userRole` | GET | Get role-based suggestions |
| `/api/chatbot/navigation` | GET | Get navigation commands |

## 🔐 Security

### API Keys Management
⚠️ **IMPORTANT: Never expose API keys in frontend code or commit them to git!**

All API keys are stored in:
- `backend/.env` (server-side only, not accessible to browsers)

Required environment variables:
```env
GEMINI_API_KEY=your-gemini-api-key-here
```

### Data Isolation
- Chat data is stored in separate MongoDB collections
- User data is isolated per session/user
- No business logic is exposed to the client

## 📊 Database Collections

### ChatConversation
- Stores all chat messages
- Tracks session and user information
- Maintains conversation metadata

### StudentGrowth
- Independent from main user data
- Tracks learning progress
- Stores milestones and insights

### KnowledgeBase
- College-specific information
- Searchable with text indexing
- Admin-manageable content

## 🎨 UI Features

- **Role-based color themes**: Different gradients for each user type
- **Animated transitions**: Smooth message appearances
- **Typing indicators**: AI thinking animation
- **Quick suggestions**: Context-aware action buttons
- **Feedback system**: Thumbs up/down for responses
- **Growth panel**: Student progress visualization
- **Navigation shortcuts**: Direct links to platform features

## 🛠️ Setup Instructions

1. **Get Gemini API Key**:
   - Go to [Google AI Studio](https://aistudio.google.com)
   - Create a new API key
   - Add to `backend/.env`

2. **Seed Knowledge Base**:
   ```bash
   cd backend
   node scripts/seedKnowledge.js
   ```

3. **Start the Server**:
   ```bash
   npm run start:full
   ```

## 📈 Future Enhancements

- [ ] Voice input support
- [ ] Multi-language support
- [ ] Proactive notifications
- [ ] Quiz and assessment integration
- [ ] Direct file sharing in chat
- [ ] Video tutorials integration

---

**Note**: This chatbot system is designed with security in mind. All sensitive operations and API calls are handled server-side to protect your credentials and business logic.
