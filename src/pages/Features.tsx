import { Card, CardContent } from "@/components/ui/card";
import {
  GraduationCap,
  Users,
  Calendar,
  BarChart3,
  BookOpen,
  MessageSquare,
  EventIcon as Event,
  TrendingUp,
} from "lucide-react";

const Features = () => {
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

  return (
    <div className="min-h-screen bg-background">
      {/* Background decorative elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-20 right-20 w-72 h-72 bg-gradient-to-r from-primary/10 to-purple-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-gradient-to-r from-purple-500/5 to-pink-500/5 rounded-full blur-3xl"></div>

        {/* Floating particles */}
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-primary/40 rounded-full animate-pulse"></div>
        <div className="absolute top-1/3 right-1/3 w-1 h-1 bg-purple-400/50 rounded-full animate-pulse delay-1000"></div>
        <div className="absolute bottom-1/3 left-1/3 w-1.5 h-1.5 bg-pink-400/30 rounded-full animate-pulse delay-2000"></div>
      </div>

      <main className="relative z-10 pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              Key Features
            </h1>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="group bg-card border-border/50 hover:border-primary/50 transition-all duration-300 hover:shadow-xl hover:shadow-primary/10"
              >
                <CardContent className="p-6 text-center space-y-4">
                  {/* Icon */}
                  <div
                    className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center text-white mx-auto`}
                  >
                    {feature.icon}
                  </div>

                  {/* Title */}
                  <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">
                    {feature.title}
                  </h3>

                  {/* Description */}
                  <p className="text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Features;
