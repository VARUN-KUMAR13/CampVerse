import { Button } from "@/components/ui/button";
import { Link, useLocation } from "react-router-dom";

const Navigation = () => {
  const location = useLocation();
  const isHomePage = location.pathname === "/";

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

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link
            to="/"
            className="campus-connect-logo text-foreground hover:text-primary transition-colors"
          >
            CampusConnect.
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => {
              if (isHomePage) {
                // Use smooth scroll on homepage
                return (
                  <button
                    key={item.name}
                    onClick={() => scrollToSection(item.section)}
                    className="text-sm font-medium transition-colors hover:text-primary text-muted-foreground cursor-pointer"
                  >
                    {item.name}
                  </button>
                );
              } else {
                // Use regular navigation on other pages
                return (
                  <Link
                    key={item.name}
                    to={item.path}
                    className={`text-sm font-medium transition-colors hover:text-primary ${
                      location.pathname === item.path
                        ? "text-primary"
                        : "text-muted-foreground"
                    }`}
                  >
                    {item.name}
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
