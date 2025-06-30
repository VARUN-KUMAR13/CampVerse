import { Card, CardContent } from "@/components/ui/card";

const About = () => {
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

  return (
    <div className="min-h-screen bg-background">
      {/* Background decorative elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-20 right-20 w-72 h-72 bg-gradient-to-r from-primary/10 to-purple-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-gradient-to-r from-purple-500/5 to-pink-500/5 rounded-full blur-3xl"></div>
      </div>

      <main className="relative z-10 pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left Content */}
            <div className="space-y-8">
              <h1 className="text-4xl md:text-5xl font-bold text-foreground">
                About CampVerse
              </h1>

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

              {/* Statistics */}
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

            {/* Right Content - Character Illustration */}
            <div className="relative">
              <div className="relative h-[500px] flex items-center justify-center">
                {/* Character illustration area */}
                <div className="relative">
                  {/* Main character */}
                  <div className="w-48 h-64 bg-gradient-to-b from-yellow-400 to-yellow-500 rounded-t-full relative">
                    {/* Head */}
                    <div className="w-32 h-32 bg-gradient-to-b from-yellow-300 to-yellow-400 rounded-full mx-auto"></div>

                    {/* Body */}
                    <div className="w-40 h-40 bg-gradient-to-b from-yellow-400 to-yellow-500 rounded-lg mx-auto -mt-8"></div>

                    {/* Arms */}
                    <div className="absolute top-16 -left-6 w-8 h-20 bg-yellow-400 rounded-full transform -rotate-12"></div>
                    <div className="absolute top-16 -right-6 w-8 h-20 bg-yellow-400 rounded-full transform rotate-12"></div>

                    {/* Legs */}
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
      </main>
    </div>
  );
};

export default About;
