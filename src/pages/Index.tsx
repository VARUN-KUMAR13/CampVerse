import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import DeskIllustration from "@/components/DeskIllustration";
import { Link } from "react-router-dom";
import {
  GraduationCap,
  Users,
  Calendar,
  BarChart3,
  Mail,
  Phone,
  MapPin,
} from "lucide-react";

const Index = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submitted:", formData);
    setFormData({
      name: "",
      email: "",
      message: "",
    });
  };

  const features = [
    {
      icon: <GraduationCap className="w-8 h-8" />,
      title: "Academic Management",
      description:
        "Streamline course management, assignments, and grades in one centralized platform.",
      gradient: "from-blue-500 to-blue-600",
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "Student-Faculty Interaction",
      description:
        "Enhanced communication channels between students and faculty members.",
      gradient: "from-blue-500 to-blue-600",
    },
    {
      icon: <Calendar className="w-8 h-8" />,
      title: "Event Management",
      description:
        "Organize and manage campus events, workshops, and activities efficiently.",
      gradient: "from-blue-500 to-blue-600",
    },
    {
      icon: <BarChart3 className="w-8 h-8" />,
      title: "Analytics Dashboard",
      description:
        "Track academic progress and campus engagement with detailed analytics.",
      gradient: "from-blue-500 to-blue-600",
    },
  ];

  const stats = [
    {
      number: "500+",
      label: "Active Users",
      color: "text-blue-400",
    },
    {
      number: "50+",
      label: "Courses",
      color: "text-blue-400",
    },
    {
      number: "24/7",
      label: "Support",
      color: "text-blue-400",
    },
  ];

  const faqs = [
    {
      question: "How do I access my courses?",
      answer:
        "After logging in to your student dashboard, you can access all your enrolled courses from the 'My Courses' section. Each course provides detailed information including syllabus, assignments, and progress tracking.",
    },
    {
      question: "Can I communicate with faculty members?",
      answer:
        "Yes! CampVerse provides multiple communication channels including direct messaging, discussion forums, and virtual office hours. You can reach out to your instructors directly through the platform.",
    },
    {
      question: "How secure is my data?",
      answer:
        "We take data security very seriously. All student and faculty information is encrypted and stored securely. We comply with educational data privacy standards and regularly update our security measures.",
    },
    {
      question: "Can I access the platform on mobile?",
      answer:
        "Absolutely! CampVerse is fully responsive and works seamlessly on all devices including smartphones and tablets. You can access all features on the go.",
    },
  ];

  const contactInfo = [
    {
      icon: <Mail className="w-5 h-5" />,
      label: "Email",
      value: "campverse@gmail.com",
      color: "text-blue-400",
    },
    {
      icon: <Phone className="w-5 h-5" />,
      label: "Phone",
      value: "+91 6303409082",
      color: "text-blue-400",
    },
    {
      icon: <MapPin className="w-5 h-5" />,
      label: "Address",
      value: "10-1-92/118/A,Kothapet,Hyderabad,Telangana,India",
      color: "text-blue-400",
    },
  ];

  return (
    <div className="bg-background">
      {/* Global Background Elements */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-20 right-20 w-96 h-96 bg-gradient-to-r from-primary/10 to-purple-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-20 w-72 h-72 bg-gradient-to-r from-purple-500/5 to-pink-500/5 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-gradient-to-r from-green-500/5 to-blue-500/5 rounded-full blur-3xl"></div>

        {/* Floating particles */}
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-primary/40 rounded-full animate-pulse"></div>
        <div className="absolute top-1/3 right-1/3 w-1 h-1 bg-purple-400/50 rounded-full animate-pulse delay-1000"></div>
        <div className="absolute bottom-1/3 left-1/3 w-1.5 h-1.5 bg-pink-400/30 rounded-full animate-pulse delay-2000"></div>
        <div className="absolute top-1/2 right-1/4 w-1 h-1 bg-primary/30 rounded-full animate-pulse delay-500"></div>
        <div className="absolute bottom-1/4 right-1/2 w-2 h-2 bg-purple-300/40 rounded-full animate-pulse delay-1500"></div>
      </div>

      {/* Hero Section */}
      <section
        id="home"
        className="relative z-10 min-h-screen flex items-center scroll-mt-16"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="relative z-10">
              <div className="space-y-8">
                <h1 className="hero-title hero-3d-text">
                  CAMP
                  <br />
                  VERSE.
                </h1>
                <p className="text-xl text-muted-foreground max-w-md leading-relaxed">
                  "Simplifying campus life, one feature at a time"
                </p>
                <div className="pt-4">
                  <Link to="/login">
                    <Button
                      size="lg"
                      className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-8 py-6 text-lg rounded-xl shadow-xl hover:shadow-2xl transition-all duration-200"
                    >
                      Get Started
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
            <div className="relative lg:h-[600px] h-[400px] flex items-center justify-center">
              <DeskIllustration />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative z-10 py-24 scroll-mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              Key Features
            </h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="group bg-card border-border/50 hover:border-primary/50 transition-all duration-300 hover:shadow-xl hover:shadow-primary/10"
              >
                <CardContent className="p-6 text-center space-y-4">
                  <div
                    className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center text-white mx-auto`}
                  >
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="relative z-10 py-24 scroll-mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <h2 className="text-4xl md:text-5xl font-bold text-foreground">
                About CampVerse
              </h2>
              <div className="space-y-6 text-lg text-muted-foreground leading-relaxed">
                <p>
                  CampVerse is a comprehensive digital platform designed to
                  revolutionize the way educational institutions operate. Our
                  mission is to create a seamless, efficient, and engaging
                  environment for both students and faculty members.
                </p>
                <p>
                  With a focus on innovation and user experience, we provide
                  tools and features that enhance academic excellence and campus
                  life.
                </p>
              </div>
              <div className="grid grid-cols-3 gap-8 pt-8">
                {stats.map((stat, index) => (
                  <div key={index} className="text-center">
                    <div
                      className={`text-3xl md:text-4xl font-bold ${stat.color} mb-2`}
                    >
                      {stat.number}
                    </div>
                    <div className="text-sm text-muted-foreground font-medium">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <div className="relative h-[500px] flex items-center justify-center">
                <div className="relative">
                  <div className="w-48 h-64 bg-gradient-to-b from-yellow-400 to-yellow-500 rounded-t-full relative">
                    <div className="w-32 h-32 bg-gradient-to-b from-yellow-300 to-yellow-400 rounded-full mx-auto"></div>
                    <div className="w-40 h-40 bg-gradient-to-b from-yellow-400 to-yellow-500 rounded-lg mx-auto -mt-8"></div>
                    <div className="absolute top-16 -left-6 w-8 h-20 bg-yellow-400 rounded-full transform -rotate-12"></div>
                    <div className="absolute top-16 -right-6 w-8 h-20 bg-yellow-400 rounded-full transform rotate-12"></div>
                    <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 flex space-x-4">
                      <div className="w-6 h-16 bg-yellow-500 rounded-full"></div>
                      <div className="w-6 h-16 bg-yellow-500 rounded-full"></div>
                    </div>
                  </div>
                  {/* Floating icons around character */}
                  <div className="absolute top-8 right-8 w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                    <div className="w-6 h-6 bg-white rounded"></div>
                  </div>
                  <div className="absolute top-20 left-8 w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center">
                    <div className="w-4 h-4 bg-white rounded-full"></div>
                  </div>
                  <div className="absolute bottom-20 right-12 w-8 h-8 bg-green-500 rounded-full"></div>
                  <div className="absolute bottom-32 left-12 w-10 h-10 bg-pink-500 rounded-full flex items-center justify-center">
                    <div className="w-4 h-4 bg-white rounded"></div>
                  </div>
                  <div className="absolute top-1/2 right-2 w-6 h-6 bg-orange-500 rounded-full"></div>
                  <div className="absolute bottom-8 right-8 w-12 h-12 bg-indigo-500 rounded-full flex items-center justify-center">
                    <div className="w-6 h-6 bg-white rounded"></div>
                  </div>
                  <div className="absolute top-1/3 left-4 w-8 h-8 bg-teal-500 rounded-full"></div>
                  <div className="absolute bottom-1/3 left-0 w-10 h-10 bg-red-500 rounded-full flex items-center justify-center">
                    <div className="w-4 h-4 bg-white rounded"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="relative z-10 py-24 scroll-mt-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              Frequently Asked Questions
            </h2>
          </div>
          <div className="space-y-4">
            <Accordion type="single" collapsible className="space-y-4">
              {faqs.map((faq, index) => (
                <AccordionItem
                  key={index}
                  value={`item-${index}`}
                  className="bg-card border border-border/50 rounded-lg px-6 hover:border-primary/50 transition-colors"
                >
                  <AccordionTrigger className="text-left font-medium text-foreground hover:text-primary py-6">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground pb-6">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="relative z-10 py-24 scroll-mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-start">
            <div className="space-y-8">
              <div>
                <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
                  Get in Touch
                </h2>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  Have questions or need assistance? We're here to help! Reach
                  out to us through any of the following channels or fill out
                  the contact form.
                </p>
              </div>
              <div className="space-y-6">
                {contactInfo.map((info, index) => (
                  <div key={index} className="flex items-center space-x-4">
                    <div
                      className={`w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center ${info.color}`}
                    >
                      {info.icon}
                    </div>
                    <div>
                      <div className="font-semibold text-foreground">
                        {info.label}
                      </div>
                      <div className="text-muted-foreground">{info.value}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <Card className="shadow-xl border-border/50">
              <CardContent className="p-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label
                      htmlFor="name"
                      className="block text-sm font-medium text-foreground mb-2"
                    >
                      Name
                    </label>
                    <Input
                      id="name"
                      name="name"
                      type="text"
                      placeholder="Your name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="h-12"
                      required
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium text-foreground mb-2"
                    >
                      Email
                    </label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="Your email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="h-12"
                      required
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="message"
                      className="block text-sm font-medium text-foreground mb-2"
                    >
                      Message
                    </label>
                    <Textarea
                      id="message"
                      name="message"
                      placeholder="Your message"
                      value={formData.message}
                      onChange={handleInputChange}
                      className="min-h-[120px]"
                      required
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full h-12 text-lg font-semibold"
                    size="lg"
                  >
                    Send Message
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
