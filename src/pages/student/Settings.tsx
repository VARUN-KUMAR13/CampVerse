import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import StudentLayout from "@/components/StudentLayout";
import { useAuth } from "@/contexts/AuthContext";
import {
  Settings,
  Bell,
  Shield,
  Palette,
  Save,
  Eye,
  EyeOff,
  Smartphone,
  Mail,
  Globe,
} from "lucide-react";

const StudentSettings = () => {
  const { userData } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [settings, setSettings] = useState({
    // Notification Settings
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    assignmentReminders: true,
    examAlerts: true,
    placementUpdates: true,
    eventNotifications: false,

    // Privacy Settings
    profileVisibility: "college",
    showEmail: false,
    showPhone: false,
    allowMessaging: true,

    // App Preferences
    theme: "system",
    language: "en",
    timezone: "Asia/Kolkata",
    compactView: false,

    // Security Settings
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
    twoFactorAuth: false,
  });

  const handleSettingChange = (key: string, value: any) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleSaveSettings = () => {
    console.log("Saving settings:", settings);
    // Here you would typically save to backend/localStorage
  };

  const handlePasswordChange = () => {
    if (settings.newPassword !== settings.confirmPassword) {
      alert("Passwords don't match!");
      return;
    }
    console.log("Changing password");
    // Here you would handle password change
  };

  return (
    <StudentLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
              <Settings className="w-8 h-8 text-primary" />
              Account Settings
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage your account preferences and security settings
            </p>
          </div>
        </div>

        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5" />
              Notification Preferences
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="font-medium text-foreground">
                  General Notifications
                </h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="flex items-center gap-2">
                        <Mail className="w-4 h-4" />
                        Email Notifications
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Receive updates via email
                      </p>
                    </div>
                    <Switch
                      checked={settings.emailNotifications}
                      onCheckedChange={(checked) =>
                        handleSettingChange("emailNotifications", checked)
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="flex items-center gap-2">
                        <Smartphone className="w-4 h-4" />
                        SMS Notifications
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Get important alerts via SMS
                      </p>
                    </div>
                    <Switch
                      checked={settings.smsNotifications}
                      onCheckedChange={(checked) =>
                        handleSettingChange("smsNotifications", checked)
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Push Notifications</Label>
                      <p className="text-sm text-muted-foreground">
                        Browser push notifications
                      </p>
                    </div>
                    <Switch
                      checked={settings.pushNotifications}
                      onCheckedChange={(checked) =>
                        handleSettingChange("pushNotifications", checked)
                      }
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium text-foreground">
                  Specific Alerts
                </h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Assignment Reminders</Label>
                      <p className="text-sm text-muted-foreground">
                        Deadline notifications
                      </p>
                    </div>
                    <Switch
                      checked={settings.assignmentReminders}
                      onCheckedChange={(checked) =>
                        handleSettingChange("assignmentReminders", checked)
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Exam Alerts</Label>
                      <p className="text-sm text-muted-foreground">
                        Upcoming exam notifications
                      </p>
                    </div>
                    <Switch
                      checked={settings.examAlerts}
                      onCheckedChange={(checked) =>
                        handleSettingChange("examAlerts", checked)
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Placement Updates</Label>
                      <p className="text-sm text-muted-foreground">
                        New job opportunities
                      </p>
                    </div>
                    <Switch
                      checked={settings.placementUpdates}
                      onCheckedChange={(checked) =>
                        handleSettingChange("placementUpdates", checked)
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Event Notifications</Label>
                      <p className="text-sm text-muted-foreground">
                        College events and activities
                      </p>
                    </div>
                    <Switch
                      checked={settings.eventNotifications}
                      onCheckedChange={(checked) =>
                        handleSettingChange("eventNotifications", checked)
                      }
                    />
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Privacy Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Privacy & Visibility
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Profile Visibility</Label>
                  <Select
                    value={settings.profileVisibility}
                    onValueChange={(value) =>
                      handleSettingChange("profileVisibility", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="public">Everyone</SelectItem>
                      <SelectItem value="college">College Only</SelectItem>
                      <SelectItem value="classmates">
                        Classmates Only
                      </SelectItem>
                      <SelectItem value="private">Private</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-muted-foreground">
                    Who can view your profile information
                  </p>
                </div>
              </div>
              <div className="space-y-4">
                <h4 className="font-medium text-foreground">
                  Contact Information
                </h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Show Email Address</Label>
                      <p className="text-sm text-muted-foreground">
                        Display email on profile
                      </p>
                    </div>
                    <Switch
                      checked={settings.showEmail}
                      onCheckedChange={(checked) =>
                        handleSettingChange("showEmail", checked)
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Show Phone Number</Label>
                      <p className="text-sm text-muted-foreground">
                        Display phone on profile
                      </p>
                    </div>
                    <Switch
                      checked={settings.showPhone}
                      onCheckedChange={(checked) =>
                        handleSettingChange("showPhone", checked)
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Allow Messaging</Label>
                      <p className="text-sm text-muted-foreground">
                        Other students can message you
                      </p>
                    </div>
                    <Switch
                      checked={settings.allowMessaging}
                      onCheckedChange={(checked) =>
                        handleSettingChange("allowMessaging", checked)
                      }
                    />
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* App Preferences */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="w-5 h-5" />
              App Preferences
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Theme</Label>
                <Select
                  value={settings.theme}
                  onValueChange={(value) =>
                    handleSettingChange("theme", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                    <SelectItem value="system">System</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Language</Label>
                <Select
                  value={settings.language}
                  onValueChange={(value) =>
                    handleSettingChange("language", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="hi">Hindi</SelectItem>
                    <SelectItem value="te">Telugu</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Timezone</Label>
                <Select
                  value={settings.timezone}
                  onValueChange={(value) =>
                    handleSettingChange("timezone", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Asia/Kolkata">
                      Asia/Kolkata (IST)
                    </SelectItem>
                    <SelectItem value="UTC">UTC</SelectItem>
                    <SelectItem value="America/New_York">
                      America/New_York (EST)
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex items-center justify-between pt-4">
              <div className="space-y-0.5">
                <Label>Compact View</Label>
                <p className="text-sm text-muted-foreground">
                  Use a more compact layout for better screen utilization
                </p>
              </div>
              <Switch
                checked={settings.compactView}
                onCheckedChange={(checked) =>
                  handleSettingChange("compactView", checked)
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Security & Password
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="font-medium text-foreground">
                  Change Password
                </h4>
                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label>Current Password</Label>
                    <div className="relative">
                      <Input
                        type={showPassword ? "text" : "password"}
                        value={settings.currentPassword}
                        onChange={(e) =>
                          handleSettingChange(
                            "currentPassword",
                            e.target.value,
                          )
                        }
                        placeholder="Enter current password"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>New Password</Label>
                    <Input
                      type={showPassword ? "text" : "password"}
                      value={settings.newPassword}
                      onChange={(e) =>
                        handleSettingChange("newPassword", e.target.value)
                      }
                      placeholder="Enter new password"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Confirm New Password</Label>
                    <Input
                      type={showPassword ? "text" : "password"}
                      value={settings.confirmPassword}
                      onChange={(e) =>
                        handleSettingChange(
                          "confirmPassword",
                          e.target.value,
                        )
                      }
                      placeholder="Confirm new password"
                    />
                  </div>
                  <Button onClick={handlePasswordChange} className="w-full">
                    Change Password
                  </Button>
                </div>
              </div>
              <div className="space-y-4">
                <h4 className="font-medium text-foreground">
                  Additional Security
                </h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Two-Factor Authentication</Label>
                      <p className="text-sm text-muted-foreground">
                        Add an extra layer of security to your account
                      </p>
                    </div>
                    <Switch
                      checked={settings.twoFactorAuth}
                      onCheckedChange={(checked) =>
                        handleSettingChange("twoFactorAuth", checked)
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Button variant="outline" className="w-full">
                      View Active Sessions
                    </Button>
                    <Button variant="outline" className="w-full">
                      Download My Data
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button
            onClick={handleSaveSettings}
            className="flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            Save All Settings
          </Button>
        </div>
      </div>
    </StudentLayout>
  );
};

export default StudentSettings;
