import { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface DashboardLayoutProps {
    sidebar: (props: { closeSidebar: () => void; isSidebarOpen: boolean }) => React.ReactNode;
    topbar: React.ReactNode;
    children: React.ReactNode;
}

const DashboardLayout = ({ sidebar, topbar, children }: DashboardLayoutProps) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
        return typeof window !== "undefined" && window.innerWidth >= 768;
    });

    useEffect(() => {
        const handleResize = () => {
            const mobile = window.innerWidth < 768;
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
        <div className="h-screen flex flex-col bg-background overflow-hidden relative">
            {/* Top Bar - Fixed height constraints */}
            <div className="flex-none z-30 border-b border-border shadow-sm bg-background">
                {topbar}
            </div>

            {/* Main layout — flex container */}
            <div className="flex-1 flex overflow-hidden relative">
                {/* Desktop sidebar */}
                <div
                    className={`hidden md:flex flex-col flex-shrink-0 transition-all duration-300 ease-in-out h-full border-r border-border bg-sidebar ${isSidebarOpen ? "w-[260px]" : "w-0 overflow-hidden"
                        }`}
                >
                    <div className="w-[260px] h-full">
                        {sidebar({ closeSidebar, isSidebarOpen })}
                    </div>
                </div>

                {/* Blue edge toggle button */}
                <button
                    onClick={toggleSidebar}
                    className={`absolute top-1/2 -translate-y-1/2 z-50 w-6 h-16 bg-blue-600 hover:bg-blue-700 rounded-r-full flex items-center justify-center transition-all duration-300 shadow-lg ${isSidebarOpen ? "md:left-[260px] left-[260px]" : "left-0"
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
                    className={`md:hidden absolute inset-0 z-40 bg-black/50 transition-opacity duration-300 ${isSidebarOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
                        }`}
                    onClick={closeSidebar}
                    aria-hidden="true"
                />

                {/* Mobile drawer */}
                <div
                    className={`md:hidden absolute left-0 top-0 bottom-0 z-50 w-[260px] transform transition-transform duration-300 ease-in-out bg-sidebar ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"
                        }`}
                >
                    {sidebar({ closeSidebar, isSidebarOpen })}
                </div>

                {/* Main content - Uniform padding and spacing block */}
                <div className="flex-1 overflow-y-auto transition-all duration-300 ease-in-out relative">
                    <main className="p-6 pt-6 space-y-6 min-h-full">
                        {children}
                    </main>
                </div>
            </div>
        </div>
    );
};

export default DashboardLayout;
