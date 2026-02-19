import { useState, useEffect, useLayoutEffect, useCallback, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import FacultySidebar from "@/components/FacultySidebar";
import FacultyTopbar from "@/components/FacultyTopbar";

interface FacultyLayoutProps {
    children: React.ReactNode;
}

const FacultyLayout = ({ children }: FacultyLayoutProps) => {
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

    return (
        <div className="min-h-screen bg-background">
            {/* Top Bar */}
            <div className="sticky top-0 z-30" ref={topbarRef}>
                <FacultyTopbar />
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
                        <FacultySidebar />
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
                    <FacultySidebar onNavigate={closeSidebar} />
                </div>

                {/* Main content */}
                <div
                    className="flex-1 min-w-0 transition-all duration-300 ease-in-out"
                    style={{ minHeight: `calc(100vh - ${topbarHeight}px)` }}
                >
                    <main className="p-6 space-y-6 overflow-y-auto">
                        {children}
                    </main>
                </div>
            </div>
        </div>
    );
};

export default FacultyLayout;
