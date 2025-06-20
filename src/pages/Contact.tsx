import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Mail, Phone, MapPin, Clock } from "lucide-react";

const Contact = () => {
  const contactInfo = [
    {
      icon: Mail,
      title: "Email",
      details: "support@campusconnect.edu",
      description: "Send us an email anytime",
    },
    {
      icon: Phone,
      title: "Phone",
      details: "+1 (555) 123-4567",
      description: "Mon-Fri from 8am to 6pm",
    },
    {
      icon: MapPin,
      title: "Office",
      details: "123 Campus Drive, University City",
      description: "Visit us in person",
    },
    {
      icon: Clock,
      title: "Support Hours",
      details: "24/7 Online Support",
      description: "Always here to help",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <main className="pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              Get in <span className="text-primary">Touch</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Have questions about CampusConnect? We'd love to hear from you.
              Send us a message and we'll respond as soon as possible.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-12">
            {/* Contact Form */}
            <div className="lg:col-span-2">
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-2xl text-card-foreground">
                    Send us a message
                  </CardTitle>
                  <CardDescription>
                    Fill out the form below and we'll get back to you within 24
                    hours.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name</Label>
                      <Input id="firstName" placeholder="John" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input id="lastName" placeholder="Doe" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="john@university.edu"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subject">Subject</Label>
                    <Input id="subject" placeholder="How can we help you?" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">Message</Label>
                    <Textarea
                      id="message"
                      placeholder="Tell us more about your question or concern..."
                      className="min-h-[120px]"
                    />
                  </div>

                  <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                    Send Message
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Contact Information */}
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-foreground mb-6">
                  Contact Information
                </h3>
                <div className="space-y-6">
                  {contactInfo.map((info, index) => (
                    <Card key={index} className="bg-card border-border">
                      <CardContent className="p-6">
                        <div className="flex items-start space-x-4">
                          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                            <info.icon className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-card-foreground mb-1">
                              {info.title}
                            </h4>
                            <p className="text-sm text-muted-foreground mb-2">
                              {info.description}
                            </p>
                            <p className="font-medium text-card-foreground">
                              {info.details}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Quick Links */}
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-lg">Quick Links</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <a
                    href="/faq"
                    className="block text-muted-foreground hover:text-primary transition-colors"
                  >
                    → Frequently Asked Questions
                  </a>
                  <a
                    href="/features"
                    className="block text-muted-foreground hover:text-primary transition-colors"
                  >
                    → Platform Features
                  </a>
                  <a
                    href="/about"
                    className="block text-muted-foreground hover:text-primary transition-colors"
                  >
                    → About CampusConnect
                  </a>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Contact;
