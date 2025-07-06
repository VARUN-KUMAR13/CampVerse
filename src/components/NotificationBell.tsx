import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Bell, X, Clock } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface Notification {
  id: string;
  title: string;
  description: string;
  dateTime: string;
  urgency: "normal" | "priority" | "urgent";
  targetAudience: string[];
  createdBy: string;
}

const NotificationBell = () => {
  const { userData } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  // Mock notifications - in real app, fetch from API
  useEffect(() => {
    const mockNotifications: Notification[] = [
      {
        id: "1",
        title: "INAE Youth Conclave 2025",
        description:
          "Calling All Innovators, Coders, Creators & Change-Makers! INAE Youth Conclave 2025 is coming to Anurag University.",
        dateTime: "2025-01-30T10:30:00",
        urgency: "priority",
        targetAudience: ["students"],
        createdBy: "Mr.T. Dinesh | ASSISTANT PROFESSOR",
      },
      {
        id: "2",
        title: "Placement Drive - Apty",
        description:
          "Technical Consultant I position open. CTC: 5.00 LPA - 8.00 LPA. Application deadline: July 5, 2025.",
        dateTime: "2025-01-29T14:20:00",
        urgency: "normal",
        targetAudience: ["students"],
        createdBy: "Placement Cell",
      },
      {
        id: "3",
        title: "Fee Payment Reminder",
        description:
          "Semester fees due soon. Please complete payment to avoid late fees.",
        dateTime: "2025-01-28T09:15:00",
        urgency: "urgent",
        targetAudience: ["students"],
        createdBy: "Accounts Department",
      },
      {
        id: "4",
        title: "Library Book Return",
        description:
          "Books issued are due for return. Please return to avoid penalty.",
        dateTime: "2025-01-27T16:45:00",
        urgency: "normal",
        targetAudience: ["students"],
        createdBy: "Library",
      },
    ];

    // Filter notifications based on user role
    const filteredNotifications = mockNotifications.filter((notification) =>
      notification.targetAudience.includes(userData?.role || "students"),
    );

    setNotifications(filteredNotifications.slice(0, 10)); // Max 10 notifications
  }, [userData?.role]);

  const handleMarkAsRead = (notificationId: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case "urgent":
        return "text-red-500 bg-red-50 border-red-200";
      case "priority":
        return "text-orange-500 bg-orange-50 border-orange-200";
      default:
        return "text-blue-500 bg-blue-50 border-blue-200";
    }
  };

  const formatDateTime = (dateTime: string) => {
    const date = new Date(dateTime);
    const now = new Date();
    const diffInHours = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60),
    );

    if (diffInHours < 1) {
      return "Just now";
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else {
      return date.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      });
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          <Bell className="w-5 h-5" />
          {notifications.length > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
            >
              {notifications.length > 9 ? "9+" : notifications.length}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96 p-0" align="end">
        <div className="border-b p-4">
          <h3 className="font-semibold text-lg">Notifications</h3>
          <p className="text-sm text-muted-foreground">
            {notifications.length} new notifications
          </p>
        </div>

        <div className="max-h-96 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="p-8 text-center">
              <Bell className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">
                All caught up!
              </h3>
              <p className="text-muted-foreground">
                No new notifications to show.
              </p>
            </div>
          ) : (
            notifications.map((notification) => (
              <div
                key={notification.id}
                className="border-b p-4 hover:bg-muted/50"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-sm line-clamp-1">
                        {notification.title}
                      </h4>
                      <Badge
                        variant="outline"
                        className={`text-xs ${getUrgencyColor(notification.urgency)}`}
                      >
                        {notification.urgency}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                      {notification.description}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatDateTime(notification.dateTime)}
                      </div>
                      <span>by {notification.createdBy}</span>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 ml-2"
                    onClick={() => handleMarkAsRead(notification.id)}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>

        {notifications.length > 0 && (
          <div className="border-t p-3">
            <Button
              variant="ghost"
              size="sm"
              className="w-full"
              onClick={() => setNotifications([])}
            >
              Mark all as read
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
};

export default NotificationBell;
