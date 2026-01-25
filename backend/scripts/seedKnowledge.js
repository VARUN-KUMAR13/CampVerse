const KnowledgeBase = require("../models/KnowledgeBase");

// CVR College of Engineering specific knowledge base
const collegeKnowledge = [
    // College Information
    {
        category: "college_info",
        title: "About CVR College of Engineering",
        content:
            "CVR College of Engineering is a premier engineering institution established in 2001, located at Vastunagar, Mangalpalli (V), Ibrahimpatnam (M), Rangareddy (D), Telangana 501510. The college is affiliated to JNTU Hyderabad and approved by AICTE. Our vision is to be a state-of-the-art institution of engineering in pursuit of excellence, in the service of society.",
        keywords: [
            "cvr",
            "college",
            "engineering",
            "about",
            "history",
            "vision",
            "mission",
            "established",
        ],
        priority: 10,
    },
    {
        category: "college_info",
        title: "College Location and Contact",
        content:
            "CVR College of Engineering is located at Vastunagar, Mangalpalli (V), Ibrahimpatnam (M), Rangareddy (D), Telangana 501510. The campus is well-connected by road and accessible from Hyderabad city. For inquiries, you can contact the college administration office.",
        keywords: ["location", "address", "contact", "reach", "directions", "map"],
        priority: 9,
    },

    // Departments
    {
        category: "departments",
        title: "Departments at CVR College",
        content:
            "CVR College offers various engineering programs including: Computer Science and Engineering (CSE), Electronics and Communication Engineering (ECE), Mechanical Engineering (MECH), Civil Engineering (CIVIL), Artificial Intelligence and Machine Learning (AI&ML), Data Science (DS), and Cyber Security. Each department has experienced faculty and modern laboratories.",
        keywords: [
            "departments",
            "branches",
            "courses",
            "programs",
            "cse",
            "ece",
            "mech",
            "civil",
            "ai",
            "ml",
            "data science",
            "cyber",
        ],
        priority: 9,
    },

    // Facilities
    {
        category: "facilities",
        title: "Campus Facilities",
        content:
            "CVR College provides excellent facilities including: Central Library with vast collection of books and digital resources, Modern Computer Labs with latest hardware and software, Well-equipped Technical Laboratories for each department, Sports Complex for various indoor and outdoor games, Cafeteria serving hygienic food, Hostels for boys and girls, NewGen IEDC for innovation and entrepreneurship, and Wi-Fi enabled campus.",
        keywords: [
            "facilities",
            "library",
            "labs",
            "sports",
            "hostel",
            "cafeteria",
            "wifi",
            "newgen",
        ],
        priority: 8,
    },

    // Placements
    {
        category: "placements",
        title: "Placement Cell and Opportunities",
        content:
            "CVR College has an active Training and Placement Cell that coordinates campus recruitment. Top companies visiting the campus include TCS, Infosys, Wipro, Tech Mahindra, Capgemini, Accenture, and many more. The college provides placement training, mock interviews, and resume building workshops to prepare students for their careers.",
        keywords: [
            "placements",
            "jobs",
            "recruitment",
            "campus",
            "companies",
            "career",
            "training",
        ],
        priority: 9,
    },

    // Fees
    {
        category: "fees",
        title: "Fee Structure and Payment",
        content:
            "CVR College fee structure includes Tuition Fees, Development Fees, Examination Fees, and other charges. Students can pay fees through the CampVerse portal using Razorpay payment gateway. Various payment options like Credit/Debit Cards, Net Banking, and UPI are available. Fee receipts can be downloaded after successful payment.",
        keywords: ["fees", "payment", "tuition", "structure", "pay", "cost", "charges"],
        priority: 8,
    },

    // Navigation Help
    {
        category: "navigation",
        title: "Dashboard Navigation",
        content:
            "The CampVerse dashboard provides access to all student features. From the sidebar, you can access: Dashboard (overview), Schedule (class timetable), Assignments (pending and submitted), Grades (academic performance), Attendance (class attendance records), Fees (payment and history), Placements (job opportunities), Events (college events), Clubs (student clubs), and Profile (personal information).",
        keywords: [
            "dashboard",
            "navigate",
            "menu",
            "sidebar",
            "features",
            "access",
            "where",
            "find",
        ],
        priority: 10,
    },
    {
        category: "navigation",
        title: "Assignment Submission Process",
        content:
            "To submit an assignment: 1) Go to Assignments in the sidebar, 2) Click on the assignment you want to submit, 3) Upload your file using the upload button (supported formats: PDF, DOC, DOCX, ZIP), 4) Add any comments if required, 5) Click Submit before the deadline. You'll receive a confirmation once submitted successfully.",
        keywords: [
            "assignment",
            "submit",
            "upload",
            "homework",
            "submission",
            "how to",
        ],
        priority: 9,
    },
    {
        category: "navigation",
        title: "Fee Payment Process",
        content:
            "To pay fees: 1) Go to Fees section in the sidebar, 2) View your fee breakdown (Academic, Hostel, Transport), 3) Click 'Pay Now' button, 4) Select payment method (Card/UPI/Net Banking), 5) Complete payment through Razorpay, 6) Download receipt after successful payment. Payment history is available in the Transactions tab.",
        keywords: ["pay", "fees", "payment", "razorpay", "how to pay", "transaction"],
        priority: 9,
    },
    {
        category: "navigation",
        title: "Viewing Attendance",
        content:
            "To check your attendance: 1) Go to Attendance in the sidebar, 2) View overall attendance percentage, 3) See subject-wise attendance breakdown, 4) Check attendance history by date. Maintain above 75% attendance to be eligible for exams.",
        keywords: ["attendance", "present", "absent", "percentage", "classes"],
        priority: 8,
    },
    {
        category: "navigation",
        title: "Checking Grades and Results",
        content:
            "To view your grades: 1) Go to Grades in the sidebar, 2) Select semester to view results, 3) See subject-wise marks and grades, 4) View overall GPA/CGPA, 5) Download grade card if available. Contact your department for any discrepancies.",
        keywords: ["grades", "marks", "results", "gpa", "cgpa", "semester", "exam"],
        priority: 8,
    },
    {
        category: "navigation",
        title: "Profile Management",
        content:
            "To manage your profile: 1) Go to Profile in the sidebar, 2) View your personal information, 3) Update contact details if needed, 4) View academic information, 5) Change password from security settings. Keep your profile updated for accurate communications.",
        keywords: ["profile", "personal", "information", "update", "details", "account"],
        priority: 7,
    },

    // Academic Help
    {
        category: "academics",
        title: "Academic Calendar",
        content:
            "The academic year typically consists of two semesters. First semester runs from July to December, and second semester from January to May. Important dates include mid-term exams, end-semester exams, holidays, and result announcements. Check the Events section for specific dates.",
        keywords: ["academic", "calendar", "semester", "dates", "schedule", "exams"],
        priority: 7,
    },

    // FAQ
    {
        category: "faq",
        title: "Forgot Password",
        content:
            "If you forgot your password: 1) Click 'Forgot Password' on the login page, 2) Enter your registered email, 3) Check your email for reset link, 4) Click the link and set a new password. If you don't receive the email, check spam folder or contact admin.",
        keywords: ["forgot", "password", "reset", "login", "account", "access"],
        priority: 8,
    },
    {
        category: "faq",
        title: "Technical Support",
        content:
            "For technical issues with CampVerse: 1) Try refreshing the page, 2) Clear browser cache, 3) Try a different browser, 4) Check your internet connection. If issues persist, contact the IT department or use the feedback option in the portal.",
        keywords: ["technical", "support", "help", "issue", "problem", "error", "bug"],
        priority: 7,
    },
];

const seedKnowledgeBase = async () => {
    try {
        // Clear existing knowledge base
        await KnowledgeBase.deleteMany({});

        // Insert college knowledge
        await KnowledgeBase.insertMany(collegeKnowledge);

        console.log("✅ Knowledge base seeded successfully!");
        console.log(`   Inserted ${collegeKnowledge.length} knowledge entries`);
    } catch (error) {
        console.error("❌ Error seeding knowledge base:", error);
        throw error;
    }
};

module.exports = { seedKnowledgeBase, collegeKnowledge };
