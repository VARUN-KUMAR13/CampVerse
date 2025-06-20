import Navigation from "@/components/Navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  BookOpen,
  Users,
  Calendar,
  MessageSquare,
  MapPin,
  GraduationCap,
} from "lucide-react";

const Features = () => {
  const features = [
    {
      icon: BookOpen,
      title: "Course Management",
      description:
        "Organize your classes, assignments, and academic schedule in one place.",
    },
    {
      icon: Users,
      title: "Student Community",
      description:
        "Connect with classmates, join study groups, and build lasting relationships.",
    },
    {
      icon: Calendar,
      title: "Event Calendar",
      description:
        "Stay updated with campus events, deadlines, and important dates.",
    },
    {
      icon: MessageSquare,
      title: "Campus Chat",
      description: "Real-time messaging with students, faculty, and staff.",
    },
    {
      icon: MapPin,
      title: "Campus Navigation",
      description:
        "Interactive maps to help you navigate your campus with ease.",
    },
    {
      icon: GraduationCap,
      title: "Academic Resources",
      description:
        "Access to digital library, research tools, and academic support.",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              Powerful Features for
              <span className="text-primary"> Campus Life</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Discover all the tools and features that make CampusConnect the
              ultimate platform for students, faculty, and staff to stay
              connected and organized.
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="bg-card hover:bg-accent/50 transition-colors duration-200 border-border"
              >
                <CardHeader>
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-xl font-semibold text-card-foreground">
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-muted-foreground">
                    {feature.description}
                  </CardDescription>
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
