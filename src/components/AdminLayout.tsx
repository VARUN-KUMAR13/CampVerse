import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Shield, ChevronRight, ChevronLeft } from "lucide-react";
import AdminSidebar from "@/components/AdminSidebar";

interface AdminLayoutProps {
    children: React.ReactNode;
}

const AdminLayout = ({ children }: AdminLayoutProps) => {
    const { userData, logout } = useAuth();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    return (
        <div className="min-h-screen bg-background">
            {/* Top Bar - Always visible */}
            <header className="bg-card border-b border-border px-6 py-4 sticky top-0 z-30">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-3">
                            <button
                                onClick={logout}
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
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                            <Input
                                placeholder="Search users, courses..."
                                className="pl-10 w-64"
                            />
                        </div>
                    </div>

                    <div className="flex items-center space-x-4">
                        <Badge
                            variant="outline"
                            className="bg-green-50 text-green-700 border-green-200"
                        >
                            <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                            System Online
                        </Badge>
                        <div className="text-right">
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
                            onClick={logout}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                            Logout
                        </Button>
                    </div>
                </div>
            </header>

            {/* Main layout with sidebar */}
            <div className="flex relative">
                {/* Collapsible Sidebar */}
                <div
                    className={`fixed top-[73px] left-0 h-[calc(100vh-73px)] z-40 transform transition-transform duration-300 ease-in-out ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"
                        }`}
                >
                    <AdminSidebar onClose={() => setIsSidebarOpen(false)} isOpen={isSidebarOpen} />
                </div>

                {/* Single Toggle Button - Always visible, position changes based on sidebar state */}
                <button
                    onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                    className={`fixed top-1/2 -translate-y-1/2 z-50 w-6 h-16 bg-blue-600 hover:bg-blue-700 rounded-r-full flex items-center justify-center transition-all duration-300 shadow-lg ${isSidebarOpen ? "left-64" : "left-0"
                        }`}
                    aria-label={isSidebarOpen ? "Close navigation" : "Open navigation"}
                >
                    {isSidebarOpen ? (
                        <ChevronLeft className="w-4 h-4 text-white" />
                    ) : (
                        <ChevronRight className="w-4 h-4 text-white" />
                    )}
                </button>

                {/* Subtle overlay when sidebar is open */}
                {isSidebarOpen && (
                    <div
                        className="fixed inset-0 top-[73px] z-30 bg-black/20 transition-opacity duration-300"
                        onClick={() => setIsSidebarOpen(false)}
                    />
                )}

                {/* Main Content */}
                <div className="flex-1 min-h-[calc(100vh-73px)]">
                    {children}
                </div>
            </div>
        </div>
    );
};

export default AdminLayout;
