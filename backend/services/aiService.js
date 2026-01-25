/**
 * CampVerse AI Chatbot Service
 * Integrates with Google Gemini for intelligent responses
 * Handles context, history, and role-based interactions
 */

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_API_URL =
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

// College context for AI
const COLLEGE_CONTEXT = `You are CampVerse AI Assistant, the official AI chatbot for CVR College of Engineering, Hyderabad.

COLLEGE INFORMATION:
- Name: CVR College of Engineering
- Location: Vastunagar, Mangalpalli (V), Ibrahimpatnam (M), Rangareddy (D), Telangana 501510
- Established: 2001
- Affiliation: JNTU Hyderabad, Approved by AICTE
- Vision: To be a state-of-the-art institution of engineering in pursuit of excellence, in the service of society

DEPARTMENTS:
- Computer Science and Engineering (CSE)
- Electronics and Communication Engineering (ECE)
- Mechanical Engineering (MECH)
- Civil Engineering (CIVIL)
- Artificial Intelligence and Machine Learning (AI&ML)
- Data Science (DS)
- Cyber Security

FACILITIES:
- Central Library, Computer Labs, Technical Laboratories
- Sports Complex, Cafeteria, Hostels
- NewGen IEDC for innovation and entrepreneurship
- Wi-Fi enabled campus

CAMPVERSE PLATFORM FEATURES:
- Dashboard: Overview of student information
- Schedule: Class timetable and upcoming events
- Assignments: Submit and track assignments
- Grades: View marks, GPA, and academic performance
- Attendance: Track class attendance
- Fees: Pay fees online via Razorpay
- Placements: Job opportunities and applications
- Events: College events and activities
- Clubs: Student clubs and memberships
- Profile: Personal information management

YOUR BEHAVIOR:
1. Be helpful, friendly, and professional
2. Provide accurate information about the college and platform
3. Help with navigation by providing step-by-step instructions
4. Assist with academics (DSA, programming, study tips)
5. Provide career guidance and placement preparation tips
6. If you don't know something specific, admit it and suggest contacting the relevant department
7. Keep responses concise but informative
8. Use emojis sparingly to be friendly
9. Always encourage students and be supportive
10. For coding/DSA questions, provide explanations and examples`;

// Role-specific contexts
const ROLE_CONTEXTS = {
    student: `
You are talking to a STUDENT. Help them with:
- Navigating the student portal (assignments, grades, attendance, fees)
- Academic queries, study tips, DSA and programming help
- Career guidance, placement preparation, interview tips
- College information and campus life
- Understanding their growth and progress`,

    faculty: `
You are talking to a FACULTY member. Help them with:
- Course management and student grading
- Assignment creation and management
- Student performance tracking
- Academic administration
- Platform features for faculty`,

    admin: `
You are talking to an ADMINISTRATOR. Help them with:
- User management and system administration
- Report generation and analytics
- Platform configuration
- Event and announcement management
- Overall system overview`,

    guest: `
You are talking to a GUEST (prospective student/parent/visitor). Help them with:
- General college information (courses, facilities, placements)
- Admission procedures and requirements
- Campus facilities and infrastructure
- Contact information
- How to apply`,
};

// Navigation commands and their targets
const NAVIGATION_COMMANDS = {
    dashboard: { path: "/dashboard", description: "Main dashboard overview" },
    schedule: { path: "/schedule", description: "Class schedule and timetable" },
    assignments: { path: "/assignments", description: "View and submit assignments" },
    grades: { path: "/grades", description: "View grades and academic performance" },
    attendance: { path: "/attendance", description: "Check attendance records" },
    fees: { path: "/fees", description: "Fee payment and history" },
    placements: { path: "/placements", description: "Job opportunities" },
    events: { path: "/events", description: "College events" },
    clubs: { path: "/clubs", description: "Student clubs" },
    profile: { path: "/profile", description: "Personal profile" },
};

/**
 * Generate AI response using Google Gemini
 */
async function generateAIResponse(
    message,
    userRole = "guest",
    conversationHistory = [],
    userDetails = null
) {
    try {
        // Build conversation context
        const roleContext = ROLE_CONTEXTS[userRole] || ROLE_CONTEXTS.guest;

        let userContext = "";
        if (userDetails) {
            userContext = `\nUSER DETAILS:\n- Name: ${userDetails.name || "Unknown"}\n- Roll Number: ${userDetails.rollNumber || "N/A"}\n- Department: ${userDetails.department || "N/A"}\n- Year: ${userDetails.year || "N/A"}`;
        }

        // Build conversation history for context
        const historyContext = conversationHistory
            .slice(-6) // Last 6 messages for context
            .map((msg) => `${msg.isBot ? "Assistant" : "User"}: ${msg.content}`)
            .join("\n");

        const fullPrompt = `${COLLEGE_CONTEXT}\n${roleContext}${userContext}\n\nCONVERSATION HISTORY:\n${historyContext}\n\nUser's current message: ${message}\n\nProvide a helpful response. If the user is asking about navigation, include the specific location in the sidebar. If they're asking about a process, provide step-by-step instructions.`;

        const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                contents: [
                    {
                        parts: [
                            {
                                text: fullPrompt,
                            },
                        ],
                    },
                ],
                generationConfig: {
                    temperature: 0.7,
                    topK: 40,
                    topP: 0.95,
                    maxOutputTokens: 1024,
                },
                safetySettings: [
                    {
                        category: "HARM_CATEGORY_HARASSMENT",
                        threshold: "BLOCK_MEDIUM_AND_ABOVE",
                    },
                    {
                        category: "HARM_CATEGORY_HATE_SPEECH",
                        threshold: "BLOCK_MEDIUM_AND_ABOVE",
                    },
                    {
                        category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
                        threshold: "BLOCK_MEDIUM_AND_ABOVE",
                    },
                    {
                        category: "HARM_CATEGORY_DANGEROUS_CONTENT",
                        threshold: "BLOCK_MEDIUM_AND_ABOVE",
                    },
                ],
            }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error("Gemini API error:", errorData);
            throw new Error(`Gemini API error: ${response.status}`);
        }

        const data = await response.json();

        if (
            data.candidates &&
            data.candidates[0] &&
            data.candidates[0].content &&
            data.candidates[0].content.parts
        ) {
            const aiResponse = data.candidates[0].content.parts[0].text;

            // Detect navigation intent
            const navigationTarget = detectNavigationIntent(message);

            // Generate smart suggestions based on the conversation
            const suggestions = generateSmartSuggestions(message, userRole);

            return {
                content: aiResponse,
                navigationTarget,
                suggestions,
                metadata: {
                    model: "gemini-2.0-flash",
                    role: userRole,
                },
            };
        }

        throw new Error("Invalid response from Gemini API");
    } catch (error) {
        console.error("AI Service Error:", error);
        // Fallback to basic response
        return generateFallbackResponse(message, userRole);
    }
}

/**
 * Detect if user wants to navigate somewhere
 */
function detectNavigationIntent(message) {
    const lowerMessage = message.toLowerCase();

    // Check for navigation keywords
    const navigateKeywords = [
        "go to",
        "take me to",
        "navigate to",
        "open",
        "show me",
        "where is",
        "how to find",
        "access",
    ];

    const hasNavigateIntent = navigateKeywords.some((keyword) =>
        lowerMessage.includes(keyword)
    );

    if (hasNavigateIntent) {
        for (const [key, value] of Object.entries(NAVIGATION_COMMANDS)) {
            if (lowerMessage.includes(key)) {
                return value;
            }
        }
    }

    return null;
}

/**
 * Generate smart suggestions based on context
 */
function generateSmartSuggestions(message, userRole) {
    const lowerMessage = message.toLowerCase();
    const suggestions = [];

    // Role-based default suggestions
    const roleBasedSuggestions = {
        student: [
            { id: "1", text: "Show my assignments" },
            { id: "2", text: "Check my attendance" },
            { id: "3", text: "Help with DSA" },
            { id: "4", text: "Placement preparation tips" },
        ],
        faculty: [
            { id: "1", text: "Manage courses" },
            { id: "2", text: "View student performance" },
            { id: "3", text: "Create assignment" },
            { id: "4", text: "Platform help" },
        ],
        admin: [
            { id: "1", text: "System overview" },
            { id: "2", text: "User management" },
            { id: "3", text: "Generate reports" },
            { id: "4", text: "Platform settings" },
        ],
        guest: [
            { id: "1", text: "About CVR College" },
            { id: "2", text: "Courses offered" },
            { id: "3", text: "Admission process" },
            { id: "4", text: "Contact information" },
        ],
    };

    // Context-based suggestions
    if (lowerMessage.includes("assignment")) {
        return [
            { id: "1", text: "How to submit assignment?" },
            { id: "2", text: "Check deadline" },
            { id: "3", text: "View submitted assignments" },
            { id: "4", text: "Help with assignment" },
        ];
    }

    if (lowerMessage.includes("fee") || lowerMessage.includes("payment")) {
        return [
            { id: "1", text: "How to pay fees?" },
            { id: "2", text: "View fee breakdown" },
            { id: "3", text: "Payment history" },
            { id: "4", text: "Download receipt" },
        ];
    }

    if (
        lowerMessage.includes("dsa") ||
        lowerMessage.includes("algorithm") ||
        lowerMessage.includes("data structure")
    ) {
        return [
            { id: "1", text: "Array problems" },
            { id: "2", text: "Linked list basics" },
            { id: "3", text: "Tree algorithms" },
            { id: "4", text: "Practice resources" },
        ];
    }

    if (
        lowerMessage.includes("placement") ||
        lowerMessage.includes("job") ||
        lowerMessage.includes("career")
    ) {
        return [
            { id: "1", text: "Interview preparation" },
            { id: "2", text: "Resume tips" },
            { id: "3", text: "Top companies" },
            { id: "4", text: "Skill development" },
        ];
    }

    if (
        lowerMessage.includes("code") ||
        lowerMessage.includes("programming") ||
        lowerMessage.includes("project")
    ) {
        return [
            { id: "1", text: "Project ideas" },
            { id: "2", text: "Best practices" },
            { id: "3", text: "Debug help" },
            { id: "4", text: "Learning roadmap" },
        ];
    }

    return roleBasedSuggestions[userRole] || roleBasedSuggestions.guest;
}

/**
 * Fallback response when AI is unavailable
 */
function generateFallbackResponse(message, userRole) {
    const lowerMessage = message.toLowerCase();

    // Navigation fallbacks
    if (lowerMessage.includes("schedule") || lowerMessage.includes("timetable")) {
        return {
            content:
                "📅 You can find your schedule by clicking on 'Schedule' in the sidebar. It shows your daily classes, timings, and upcoming events.",
            suggestions: [
                { id: "1", text: "View assignments" },
                { id: "2", text: "Check attendance" },
                { id: "3", text: "Help with navigation" },
            ],
        };
    }

    if (lowerMessage.includes("assignment")) {
        return {
            content:
                "📝 Assignments can be found in the 'Assignments' section in your sidebar. You can view pending assignments, submit work, and track deadlines there.\n\nTo submit:\n1. Go to Assignments\n2. Click on the assignment\n3. Upload your file\n4. Click Submit",
            suggestions: [
                { id: "1", text: "Check grades" },
                { id: "2", text: "View schedule" },
                { id: "3", text: "Help with submission" },
            ],
        };
    }

    if (lowerMessage.includes("fee") || lowerMessage.includes("payment")) {
        return {
            content:
                "💰 You can manage your fees in the 'Fees' section. View your fee breakdown, make payments through Razorpay, and download receipts.\n\nPayment methods: Cards, UPI, Net Banking",
            suggestions: [
                { id: "1", text: "How to pay?" },
                { id: "2", text: "View history" },
                { id: "3", text: "Download receipt" },
            ],
        };
    }

    // Default fallback
    return {
        content:
            "👋 I'm CampVerse AI Assistant! I can help you with:\n\n• 📱 Navigating the portal\n• 📚 Academic queries\n• 💻 Coding & DSA help\n• 🎯 Career guidance\n• 🏫 College information\n\nWhat would you like help with?",
        suggestions: generateSmartSuggestions(message, userRole),
    };
}

/**
 * Analyze message intent for growth tracking
 */
function analyzeIntent(message) {
    const lowerMessage = message.toLowerCase();

    const intents = {
        dsa: [
            "dsa",
            "algorithm",
            "data structure",
            "array",
            "linked list",
            "tree",
            "graph",
            "sorting",
            "searching",
            "dynamic programming",
        ],
        programming: [
            "code",
            "programming",
            "python",
            "java",
            "javascript",
            "c++",
            "project",
            "debug",
            "function",
            "class",
        ],
        career: [
            "job",
            "placement",
            "career",
            "interview",
            "resume",
            "company",
            "salary",
            "offer",
        ],
        academics: [
            "exam",
            "marks",
            "grade",
            "subject",
            "study",
            "semester",
            "assignment",
            "attendance",
        ],
        navigation: [
            "where",
            "how to",
            "find",
            "navigate",
            "open",
            "show",
            "go to",
            "access",
        ],
    };

    for (const [intent, keywords] of Object.entries(intents)) {
        if (keywords.some((keyword) => lowerMessage.includes(keyword))) {
            return intent;
        }
    }

    return "general";
}

module.exports = {
    generateAIResponse,
    detectNavigationIntent,
    generateSmartSuggestions,
    analyzeIntent,
    NAVIGATION_COMMANDS,
};
