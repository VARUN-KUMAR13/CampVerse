import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Shield } from "lucide-react";
import AdminSidebar from "@/components/AdminSidebar";
import DashboardLayout from "@/components/DashboardLayout";

interface AdminLayoutProps {
    children: React.ReactNode;
}

const AdminTopbar = () => {
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
                            <p className="text-xs text-muted-foreground">System Administration</p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center space-x-4">
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 hidden sm:flex">
                        <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                        System Online
                    </Badge>
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
            topbar={<AdminTopbar />}
            sidebar={({ closeSidebar, isSidebarOpen }) => (
                <AdminSidebar onClose={closeSidebar} isOpen={isSidebarOpen} />
            )}
        >
            {children}
        </DashboardLayout>
    );
};

export default AdminLayout;
