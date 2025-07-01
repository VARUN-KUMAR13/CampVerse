import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Bell, Search, Menu } from "lucide-react";

interface StudentTopbarProps {
  studentId: string;
  currentTime?: string;
}

const StudentTopbar = ({ studentId, currentTime }: StudentTopbarProps) => {
  return (
    <header className="bg-background border-b border-border px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Left side - Mobile menu and breadcrumb */}
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" className="md:hidden">
            <Menu className="w-5 h-5" />
          </Button>
        </div>

        {/* Right side - Time, Student ID, and Avatar */}
        <div className="flex items-center space-x-4">
          {currentTime && (
            <span className="text-sm text-muted-foreground">{currentTime}</span>
          )}

          <div className="flex items-center space-x-2">
            <div className="text-xs text-muted-foreground">ID: {studentId}</div>
          </div>

          <Avatar className="w-8 h-8">
            <AvatarFallback className="bg-primary text-primary-foreground text-sm">
              {studentId.slice(-2)}
            </AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  );
};

export default StudentTopbar;
