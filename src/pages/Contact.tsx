import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Mail, Phone, MapPin } from "lucide-react";

const Contact = () => {
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
    // Handle form submission here
    console.log("Form submitted:", formData);
    // Reset form
    setFormData({
      name: "",
      email: "",
      message: "",
    });
  };

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
      value: "+91 7416130242",
      color: "text-blue-400",
    },
    {
      icon: <MapPin className="w-5 h-5" />,
      label: "Address",
      value: "CVR College Of Engineering,\nVastunagar, Mangalpalli (V), Ibrahimpatnam (M),\nRangareddy (D), Telangana 501 510",
      color: "text-blue-400",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Background decorative elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-20 right-20 w-72 h-72 bg-gradient-to-r from-primary/10 to-purple-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-gradient-to-r from-purple-500/5 to-pink-500/5 rounded-full blur-3xl"></div>
      </div>

      <main className="relative z-10 pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-start">
            {/* Left Content - Contact Info */}
            <div className="space-y-8">
              <div>
                <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
                  Get in Touch
                </h1>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  Have questions or need assistance? We're here to help! Reach
                  out to us through any of the following channels or fill out
                  the contact form.
                </p>
              </div>

              {/* Contact Information */}
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
                      <div className="text-muted-foreground whitespace-pre-line">{info.value}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Content - Contact Form */}
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
                      autoComplete="name"
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
                      autoComplete="email"
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
      </main>
    </div>
  );
};

export default Contact;
