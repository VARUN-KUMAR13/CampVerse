import { useState, useEffect, useLayoutEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Shield, ChevronLeft, ChevronRight } from "lucide-react";
import AdminSidebar from "@/components/AdminSidebar";

interface AdminLayoutProps {
    children: React.ReactNode;
}

const AdminLayout = ({ children }: AdminLayoutProps) => {
    const navigate = useNavigate();
    const { userData, logout } = useAuth();
    const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
        return typeof window !== "undefined" && window.innerWidth >= 768;
    });
    const [isMobile, setIsMobile] = useState(() => {
        return typeof window !== "undefined" && window.innerWidth < 768;
    });
    const [topbarHeight, setTopbarHeight] = useState(73);
    const topbarRef = useRef<HTMLDivElement>(null);

    useLayoutEffect(() => {
        if (topbarRef.current) {
            setTopbarHeight(topbarRef.current.offsetHeight);
        }
    });

    useEffect(() => {
        const measure = () => {
            if (topbarRef.current) {
                setTopbarHeight(topbarRef.current.offsetHeight);
            }
        };
        window.addEventListener("resize", measure);
        return () => window.removeEventListener("resize", measure);
    }, []);

    useEffect(() => {
        const handleResize = () => {
            const mobile = window.innerWidth < 768;
            setIsMobile(mobile);
            if (mobile) {
                setIsSidebarOpen(false);
            }
        };

        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const toggleSidebar = useCallback(() => {
        setIsSidebarOpen((prev) => !prev);
    }, []);

    const closeSidebar = useCallback(() => {
        setIsSidebarOpen(false);
    }, []);

    const handleLogout = async () => {
        try {
            await logout();
            navigate("/", { replace: true });
        } catch (error) {
            console.error("Logout error:", error);
        }
    };

    return (
        <div className="min-h-screen bg-background">
            {/* Top Bar */}
            <div ref={topbarRef} className="sticky top-0 z-30">
                <header className="bg-card border-b border-border px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-3">
                                <button
                                    onClick={handleLogout}
                                    className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center hover:bg-primary/90 transition-colors cursor-pointer"
                                    title="Logout and return to home"
                                >
                                    <Shield className="w-5 h-5 text-primary-foreground" />
                                </button>
                                <div>
                                    <h1 className="font-bold text-foreground">CampVerse Admin</h1>
                                    <p className="text-xs text-muted-foreground">
                                        System Administration
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center space-x-4">
                            <Badge
                                variant="outline"
                                className="bg-green-50 text-green-700 border-green-200 hidden sm:flex"
                            >
                                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                                System Online
                            </Badge>
                            <div className="text-right hidden sm:block">
                                <div className="font-medium text-foreground">
                                    {userData?.name || "Administrator"}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                    {userData?.email || "admin@cvr.ac.in"}
                                </div>
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleLogout}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                                Logout
                            </Button>
                        </div>
                    </div>
                </header>
            </div>

            {/* Main layout — flex container */}
            <div className="flex relative">
                {/* Desktop sidebar */}
                <div
                    className={`hidden md:block flex-shrink-0 transition-all duration-300 ease-in-out overflow-hidden ${isSidebarOpen ? "w-[260px]" : "w-0"
                        }`}
                >
                    <div
                        className="w-[260px] sticky"
                        style={{
                            height: `calc(100vh - ${topbarHeight}px)`,
                            top: `${topbarHeight}px`,
                        }}
                    >
                        <AdminSidebar onClose={closeSidebar} isOpen={isSidebarOpen} />
                    </div>
                </div>

                {/* Blue edge toggle button */}
                <button
                    onClick={toggleSidebar}
                    className={`fixed top-1/2 -translate-y-1/2 z-50 w-6 h-16 bg-blue-600 hover:bg-blue-700 rounded-r-full flex items-center justify-center transition-all duration-300 shadow-lg ${isSidebarOpen ? "md:left-[260px] left-[260px]" : "left-0"
                        }`}
                    aria-label={isSidebarOpen ? "Close sidebar" : "Open sidebar"}
                >
                    {isSidebarOpen ? (
                        <ChevronLeft className="w-4 h-4 text-white" />
                    ) : (
                        <ChevronRight className="w-4 h-4 text-white" />
                    )}
                </button>

                {/* Mobile backdrop */}
                <div
                    className={`md:hidden fixed inset-0 z-40 bg-black/50 transition-opacity duration-300 ${isSidebarOpen
                        ? "opacity-100 pointer-events-auto"
                        : "opacity-0 pointer-events-none"
                        }`}
                    style={{ top: `${topbarHeight}px` }}
                    onClick={closeSidebar}
                    aria-hidden="true"
                />
                {/* Mobile drawer */}
                <div
                    className={`md:hidden fixed left-0 z-50 w-[260px] transform transition-transform duration-300 ease-in-out ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"
                        }`}
                    style={{
                        top: `${topbarHeight}px`,
                        height: `calc(100vh - ${topbarHeight}px)`,
                    }}
                >
                    <AdminSidebar onClose={closeSidebar} isOpen={isSidebarOpen} />
                </div>

                {/* Main content */}
                <div
                    className="flex-1 min-w-0 transition-all duration-300 ease-in-out"
                    style={{ minHeight: `calc(100vh - ${topbarHeight}px)` }}
                >
                    {children}
                </div>
            </div>
        </div>
    );
};

export default AdminLayout;
