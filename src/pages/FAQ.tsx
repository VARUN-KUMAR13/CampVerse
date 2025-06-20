import Navigation from "@/components/Navigation";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const FAQ = () => {
  const faqs = [
    {
      question: "What is CampusConnect?",
      answer:
        "CampusConnect is a comprehensive platform designed to simplify campus life by connecting students, faculty, and staff through integrated tools for communication, course management, events, and more.",
    },
    {
      question: "How do I create an account?",
      answer:
        "Simply click the 'Login Now' button and select 'Create Account'. You'll need to use your campus email address to verify your student or faculty status.",
    },
    {
      question: "Is CampusConnect free to use?",
      answer:
        "Yes! CampusConnect is free for all students and faculty members. Your institution may choose to upgrade to premium features for enhanced functionality.",
    },
    {
      question: "Can I access CampusConnect on my mobile device?",
      answer:
        "Absolutely! CampusConnect is fully responsive and works seamlessly on all devices. We also have dedicated mobile apps coming soon.",
    },
    {
      question: "How do I join my campus community?",
      answer:
        "After creating your account with your campus email, you'll automatically be added to your institution's community. You can then join specific groups, clubs, and courses.",
    },
    {
      question: "What if I have technical issues?",
      answer:
        "Our support team is available 24/7 to help with any technical issues. You can reach us through the help center, live chat, or email support.",
    },
    {
      question: "How is my data protected?",
      answer:
        "We take data privacy seriously. All data is encrypted, and we follow strict privacy policies. We never sell your data to third parties.",
    },
    {
      question: "Can faculty use CampusConnect for course management?",
      answer:
        "Yes! Faculty can create courses, share resources, communicate with students, schedule office hours, and manage assignments all within the platform.",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              Frequently Asked <span className="text-primary">Questions</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Find answers to common questions about CampusConnect. Can't find
              what you're looking for? Contact our support team.
            </p>
          </div>

          {/* FAQ Accordion */}
          <div className="space-y-4">
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((faq, index) => (
                <AccordionItem
                  key={index}
                  value={`item-${index}`}
                  className="border-border bg-card rounded-lg px-6 mb-4"
                >
                  <AccordionTrigger className="text-left text-card-foreground hover:text-primary hover:no-underline py-6">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground pb-6">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>

          {/* Contact CTA */}
          <div className="text-center mt-16 p-8 bg-card rounded-2xl border border-border">
            <h3 className="text-2xl font-bold text-card-foreground mb-4">
              Still have questions?
            </h3>
            <p className="text-muted-foreground mb-6">
              Our friendly support team is here to help you get the most out of
              CampusConnect.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/contact"
                className="inline-flex items-center justify-center px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
              >
                Contact Support
              </a>
              <a
                href="mailto:help@campusconnect.edu"
                className="inline-flex items-center justify-center px-6 py-3 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/90 transition-colors font-medium"
              >
                Email Us
              </a>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default FAQ;
