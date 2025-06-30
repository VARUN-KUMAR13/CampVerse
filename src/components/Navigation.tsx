import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "react-router-dom";

const Navigation = () => {
  const location = useLocation();
  const isHomePage = location.pathname === "/";
  const [activeSection, setActiveSection] = useState("");

  const navItems = [
    { name: "Features", path: "/features", section: "features" },
    { name: "About", path: "/about", section: "about" },
    { name: "FAQ", path: "/faq", section: "faq" },
    { name: "Contact", path: "/contact", section: "contact" },
  ];

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };

  useEffect(() => {
    if (!isHomePage) return;

    const handleScroll = () => {
      const sections = ["home", "features", "about", "faq", "contact"];
      const scrollPosition = window.scrollY + 100; // Offset for header

      for (let i = sections.length - 1; i >= 0; i--) {
        const section = document.getElementById(sections[i]);
        if (section && section.offsetTop <= scrollPosition) {
          setActiveSection(sections[i]);
          break;
        }
      }
    };

    // Set initial active section
    handleScroll();

    // Add scroll event listener
    window.addEventListener("scroll", handleScroll, { passive: true });

    // Cleanup
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [isHomePage]);

  const isActiveSection = (sectionId: string) => {
    if (!isHomePage) return false;

    // For home section, consider it active when no other section is active or when explicitly at home
    if (sectionId === "home") {
      return activeSection === "home" || activeSection === "";
    }

    return activeSection === sectionId;
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <button
            onClick={() => (isHomePage ? scrollToSection("home") : null)}
            className="campus-connect-logo text-foreground hover:text-primary transition-colors cursor-pointer"
          >
            <Link
              to="/"
              className={`${
                isActiveSection("home") ? "text-primary" : "text-foreground"
              } hover:text-primary transition-colors`}
            >
              CampVerse.
            </Link>
          </button>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => {
              if (isHomePage) {
                // Use smooth scroll on homepage with active highlighting
                return (
                  <button
                    key={item.name}
                    onClick={() => scrollToSection(item.section)}
                    className={`text-sm font-medium transition-all duration-300 cursor-pointer relative ${
                      isActiveSection(item.section)
                        ? "text-primary font-semibold"
                        : "text-muted-foreground hover:text-primary"
                    }`}
                  >
                    {item.name}
                    {/* Active indicator */}
                    {isActiveSection(item.section) && (
                      <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-primary rounded-full transition-all duration-300"></span>
                    )}
                  </button>
                );
              } else {
                // Use regular navigation on other pages
                return (
                  <Link
                    key={item.name}
                    to={item.path}
                    className={`text-sm font-medium transition-colors hover:text-primary relative ${
                      location.pathname === item.path
                        ? "text-primary font-semibold"
                        : "text-muted-foreground"
                    }`}
                  >
                    {item.name}
                    {/* Active indicator */}
                    {location.pathname === item.path && (
                      <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-primary rounded-full"></span>
                    )}
                  </Link>
                );
              }
            })}
          </div>

          {/* Login Button */}
          <Link to="/login">
            <Button
              variant="default"
              size="sm"
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium px-6"
            >
              Login Now
            </Button>
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
