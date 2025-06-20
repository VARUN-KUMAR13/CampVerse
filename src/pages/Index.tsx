import { Button } from "@/components/ui/button";
import DeskIllustration from "@/components/DeskIllustration";
import { ArrowRight } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <main className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
          <div className="grid lg:grid-cols-2 gap-12 items-center min-h-[calc(100vh-8rem)]">
            {/* Left Content */}
            <div className="relative z-10">
              <div className="space-y-8">
                {/* Main Heading */}
                <h1 className="hero-title hero-3d-text">
                  CAMPUS
                  <br />
                  CONNECT.
                </h1>

                {/* Tagline */}
                <p className="text-lg text-muted-foreground max-w-md leading-relaxed">
                  "Simplifying campus life, one feature at a time"
                </p>

                {/* CTA Button */}
                <div className="pt-4">
                  <Button
                    size="lg"
                    className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-8 py-6 text-lg rounded-xl shadow-xl hover:shadow-2xl transition-all duration-200 group"
                  >
                    Get Started
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Right Content - 3D Illustration */}
            <div className="relative lg:h-[600px] h-[400px]">
              <DeskIllustration />
            </div>
          </div>
        </div>

        {/* Background decorative elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Gradient orbs */}
          <div className="absolute top-20 right-20 w-72 h-72 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 left-20 w-96 h-96 bg-gradient-to-r from-purple-500/5 to-pink-500/5 rounded-full blur-3xl"></div>

          {/* Floating particles */}
          <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-blue-400/40 rounded-full animate-pulse"></div>
          <div className="absolute top-1/3 right-1/3 w-1 h-1 bg-purple-400/50 rounded-full animate-pulse delay-1000"></div>
          <div className="absolute bottom-1/3 left-1/3 w-1.5 h-1.5 bg-pink-400/30 rounded-full animate-pulse delay-2000"></div>
        </div>
      </main>
    </div>
  );
};

export default Index;
