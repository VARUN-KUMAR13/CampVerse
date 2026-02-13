import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Bell, X, Clock, User, AlertTriangle, CheckCircle } from "lucide-react";
import { useNotifications } from "@/contexts/NotificationContext";

const NotificationBell = () => {
  const { notifications, unreadCount, loading, markAsRead, markAllAsRead } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);

  // Category colors: General=Violet, Academic=Orange, Placement=Blue, Event=Green, Emergency=Red
  const getCategoryColor = (category: string) => {
    switch (category?.toLowerCase()) {
      case "general":
        return "bg-violet-500";
      case "academic":
        return "bg-orange-500";
      case "placement":
        return "bg-blue-500";
      case "event":
        return "bg-green-500";
      case "emergency":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const formatDateTime = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInMinutes < 1) {
      return "Just now";
    } else if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`;
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else if (diffInDays < 7) {
      return `${diffInDays}d ago`;
    } else {
      return date.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      });
    }
  };

  const handleMarkAsRead = async (notificationId: string) => {
    await markAsRead(notificationId);
  };

  const handleMarkAllAsRead = async () => {
    await markAllAsRead();
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs animate-pulse"
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96 p-0" align="end">
        <div className="border-b p-4">
          <h3 className="font-semibold text-lg flex items-center gap-2">
            <Bell className="w-5 h-5 text-primary" />
            Notifications
          </h3>
          {unreadCount > 0 && (
            <p className="text-sm text-muted-foreground">
              {unreadCount} new notifications
            </p>
          )}
        </div>

        <div className="max-h-96 overflow-y-auto">
          {loading && notifications.length === 0 ? (
            <div className="p-8 text-center">
              <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4" />
              <p className="text-muted-foreground">Loading notifications...</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-8 text-center">
              <Bell className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                No new notifications to show.
              </p>
            </div>
          ) : (
            notifications.slice(0, 10).map((notification) => (
              <div
                key={notification.id}
                className={`border-b p-4 hover:bg-muted/50 transition-colors ${!notification.isRead ? "bg-primary/5" : ""
                  }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <div className={`w-3 h-3 rounded-full flex-shrink-0 ${getCategoryColor((notification as any).category)}`}></div>
                      <h4 className="font-medium text-sm line-clamp-1">
                        {notification.title || "Notification"}
                      </h4>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                      {notification.message}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatDateTime(notification.createdAt)}
                      </div>
                      {notification.postedBy?.name && (
                        <div className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          {notification.postedBy.name}
                        </div>
                      )}
                    </div>
                  </div>
                  {!notification.isRead && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 ml-2"
                      onClick={() => handleMarkAsRead(notification.id)}
                      title="Mark as read"
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  )}
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
              onClick={handleMarkAllAsRead}
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
