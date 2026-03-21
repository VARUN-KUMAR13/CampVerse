import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Menu, Shield } from "lucide-react";
import AdminSidebar from "@/components/AdminSidebar";
import DashboardLayout from "@/components/DashboardLayout";
import SystemHealthIndicator from "@/components/SystemHealthIndicator";

interface AdminLayoutProps {
    children: React.ReactNode;
}

const AdminTopbar = ({ onMenuClick }: { onMenuClick?: () => void }) => {
    const navigate = useNavigate();
    const { userData, logout } = useAuth();

    const handleLogout = async () => {
        try {
            await logout();
            navigate("/", { replace: true });
        } catch (error) {
            console.error("Logout error:", error);
        }
    };

    return (
        <header className="bg-card w-full px-6 py-2.5 border-b border-border shadow-sm">
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 md:space-x-4">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="md:hidden"
                        onClick={onMenuClick}
                    >
                        <Menu className="w-5 h-5" />
                    </Button>
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
                            <p className="text-xs text-muted-foreground">System Administration</p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center space-x-4">
                    <SystemHealthIndicator />
                    <div className="text-right hidden sm:block">
                        <div className="font-medium text-foreground">{userData?.name || "Administrator"}</div>
                        <div className="text-sm text-muted-foreground">{userData?.email || "admin@cvr.ac.in"}</div>
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
    );
};

const AdminLayout = ({ children }: AdminLayoutProps) => {
    return (
        <DashboardLayout
            topbar={({ toggleSidebar }) => <AdminTopbar onMenuClick={toggleSidebar} />}
            sidebar={({ closeSidebar, isSidebarOpen }) => (
                <AdminSidebar onClose={closeSidebar} isOpen={isSidebarOpen} />
            )}
        >
            {children}
        </DashboardLayout>
    );
};

export default AdminLayout;
