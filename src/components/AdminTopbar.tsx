import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import NotificationBell from "@/components/NotificationBell";
import { useAuth } from "@/contexts/AuthContext";
import { LogOut, Menu, Search, Settings, User, Shield } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const AdminTopbar = () => {
    const { userData, logout } = useAuth();
    const navigate = useNavigate();
    const [currentDateTime, setCurrentDateTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentDateTime(new Date());
        }, 60000);

        return () => clearInterval(timer);
    }, []);

    const adminId = userData?.collegeId || "ADMIN";
    const adminEmail = userData?.email || "admin@cvr.ac.in";

    const handleLogout = async () => {
        try {
            await logout();
            navigate("/", { replace: true });
        } catch (error) {
            console.error("Logout error:", error);
        }
    };

    return (
        <header className="bg-background border-b border-border px-6 py-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <Button variant="ghost" size="sm" className="md:hidden">
                        <Menu className="w-5 h-5" />
                    </Button>
                    <div className="relative hidden md:block">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                        <Input placeholder="Search students, faculty, events..." className="pl-10 w-80" />
                    </div>
                </div>

                <div className="flex items-center space-x-4">
                    <div className="hidden sm:block text-right">
                        <div className="text-sm font-medium text-foreground">
                            {format(currentDateTime, "MMM dd, yyyy")}
                        </div>
                        <div className="text-xs text-muted-foreground">
                            {format(currentDateTime, "h:mm a")}
                        </div>
                    </div>

                    <NotificationBell />

                    <div className="flex items-center gap-2">
                        <Badge variant="outline" className="border-primary text-primary gap-1">
                            <Shield className="w-3 h-3" />
                            Admin
                        </Badge>
                        <div className="text-right">
                            <div className="text-sm font-medium text-foreground">
                                {adminId}
                            </div>
                        </div>
                    </div>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                                <Avatar className="h-8 w-8">
                                    <AvatarFallback className="bg-primary/20 text-primary font-semibold">
                                        A
                                    </AvatarFallback>
                                </Avatar>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-56" align="end" forceMount>
                            <div className="flex items-center gap-2 p-2">
                                <Avatar className="h-10 w-10">
                                    <AvatarFallback className="bg-primary/20 text-primary font-semibold">
                                        A
                                    </AvatarFallback>
                                </Avatar>
                                <div className="flex flex-col leading-none">
                                    <p className="font-medium">{adminId}</p>
                                    <p className="w-[180px] truncate text-sm text-muted-foreground">
                                        {adminEmail}
                                    </p>
                                </div>
                            </div>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => navigate("/admin/settings")}>
                                <Settings className="mr-2 h-4 w-4" />
                                <span>Admin Settings</span>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={handleLogout} className="text-red-500">
                                <LogOut className="mr-2 h-4 w-4" />
                                <span>Sign Out</span>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </header>
    );
};

export default AdminTopbar;
