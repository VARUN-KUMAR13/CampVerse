import { Card, CardContent } from "@/components/ui/card";
import { Users, Target, Lightbulb, Heart } from "lucide-react";

const About = () => {
  const values = [
    {
      icon: Users,
      title: "Community First",
      description:
        "We believe in the power of connection and collaboration in education.",
    },
    {
      icon: Target,
      title: "Simplicity",
      description:
        "Making complex campus systems simple and accessible for everyone.",
    },
    {
      icon: Lightbulb,
      title: "Innovation",
      description:
        "Continuously improving and innovating to serve the campus community better.",
    },
    {
      icon: Heart,
      title: "Student Success",
      description:
        "Everything we do is focused on helping students succeed academically and socially.",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <main className="pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              About <span className="text-primary">CampusConnect</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              We're on a mission to revolutionize campus life by creating
              seamless connections between students, faculty, and campus
              resources.
            </p>
          </div>

          {/* Mission Section */}
          <div className="mb-20">
            <Card className="bg-card border-border">
              <CardContent className="p-12">
                <div className="grid lg:grid-cols-2 gap-12 items-center">
                  <div>
                    <h2 className="text-3xl font-bold text-card-foreground mb-6">
                      Our Mission
                    </h2>
                    <p className="text-lg text-muted-foreground leading-relaxed mb-6">
                      CampusConnect was born from the simple idea that campus
                      life should be connected, not complicated. We saw students
                      struggling with fragmented systems, missed opportunities,
                      and isolation in what should be the most connected time of
                      their lives.
                    </p>
                    <p className="text-lg text-muted-foreground leading-relaxed">
                      Our platform brings together all aspects of campus life
                      into one unified, intuitive experience that empowers
                      students to make the most of their educational journey.
                    </p>
                  </div>
                  <div className="lg:text-center">
                    <div className="inline-block p-8 bg-primary/10 rounded-2xl">
                      <div className="text-6xl font-bold text-primary mb-2">
                        100k+
                      </div>
                      <div className="text-muted-foreground">
                        Students Connected
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Values */}
          <div>
            <h2 className="text-3xl font-bold text-center text-foreground mb-12">
              Our Values
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {values.map((value, index) => (
                <Card key={index} className="bg-card border-border text-center">
                  <CardContent className="p-8">
                    <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-6">
                      <value.icon className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold text-card-foreground mb-4">
                      {value.title}
                    </h3>
                    <p className="text-muted-foreground">{value.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default About;
