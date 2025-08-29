import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import StudentSidebar from "@/components/StudentSidebar";
import StudentTopbar from "@/components/StudentTopbar";
import { useAuth } from "@/contexts/AuthContext";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  GraduationCap,
  Award,
  Bell,
  Shield,
  Save,
  Edit,
  Camera,
} from "lucide-react";

const StudentProfile = () => {
  const { userData } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    firstName: userData?.name?.split(' ').slice(0, -1).join(' ') || (userData?.name?.split(' ')[0] || 'Student'),
    lastName: userData?.name?.split(' ').slice(-1)[0] || '',
    email: userData?.email || (userData?.collegeId ? `${userData.collegeId}@cvr.ac.in` : ''),
    phone: "",
    address: "",
    dateOfBirth: "",
    branch: "Computer Science & Business Systems",
    semester: "VI",
    rollNumber: userData?.collegeId || "",
    cgpa: "",
    bio: "",
    skills: ["React", "TypeScript"],
    achievements: [],
  });

  useEffect(() => {
    if (!userData?.collegeId) return;
    // Sync core fields when auth changes
    setProfileData(prev => ({
      ...prev,
      rollNumber: userData.collegeId,
      email: userData.email || `${userData.collegeId}@cvr.ac.in`,
    }));

    // Try to hydrate name from Firebase Realtime Database if available
    import('@/services/realtimeService').then(async ({ getStudentNameByRoll }) => {
      const name = await getStudentNameByRoll(userData.collegeId);
      const finalName = name || userData.name || '';
      if (finalName) {
        const parts = finalName.trim().split(' ');
        setProfileData(prev => ({
          ...prev,
          firstName: parts.slice(0, -1).join(' ') || parts[0] || prev.firstName,
          lastName: parts.slice(-1)[0] || '',
        }));
      }
    });
  }, [userData?.collegeId, userData?.name, userData?.email]);

  const handleSave = () => {
    // Here you would typically save to backend
    console.log("Saving profile data:", profileData);
    setIsEditing(false);
  };

  const handleInputChange = (field: string, value: string) => {
    setProfileData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="flex min-h-screen bg-background">
      <StudentSidebar />
      <div className="flex-1 flex flex-col">
        <StudentTopbar studentId={userData?.collegeId || ""} />

        <main className="flex-1 p-6">
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
                  <User className="w-8 h-8 text-primary" />
                  My Profile
                </h1>
                <p className="text-muted-foreground mt-1">
                  Manage your personal information and preferences
                </p>
              </div>
              <Button
                onClick={() => setIsEditing(!isEditing)}
                variant={isEditing ? "outline" : "default"}
              >
                <Edit className="w-4 h-4 mr-2" />
                {isEditing ? "Cancel" : "Edit Profile"}
              </Button>
            </div>

            {/* Profile Header Card */}
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row items-center gap-6">
                  <div className="relative">
                    <Avatar className="w-24 h-24">
                      <AvatarImage
                        src={`https://api.dicebear.com/7.x/initials/svg?seed=${profileData.firstName} ${profileData.lastName}`}
                      />
                      <AvatarFallback className="text-2xl">
                        {profileData.firstName[0]}
                        {profileData.lastName[0]}
                      </AvatarFallback>
                    </Avatar>
                    {isEditing && (
                      <Button
                        size="sm"
                        className="absolute bottom-0 right-0 rounded-full p-2 h-8 w-8"
                      >
                        <Camera className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                  <div className="text-center md:text-left flex-1">
                    <h2 className="text-2xl font-bold text-foreground">
                      {profileData.firstName} {profileData.lastName}
                    </h2>
                    <p className="text-lg text-primary font-medium">
                      {profileData.rollNumber}
                    </p>
                    <div className="flex flex-wrap gap-2 mt-2 justify-center md:justify-start">
                      <Badge
                        variant="outline"
                        className="flex items-center gap-1"
                      >
                        <GraduationCap className="w-3 h-3" />
                        {profileData.branch}
                      </Badge>
                      <Badge variant="outline">
                        Semester {profileData.semester}
                      </Badge>
                      <Badge
                        variant="outline"
                        className="flex items-center gap-1"
                      >
                        <Award className="w-3 h-3" />
                        CGPA: {profileData.cgpa}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Personal Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Personal Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      value={profileData.firstName}
                      onChange={(e) =>
                        handleInputChange("firstName", e.target.value)
                      }
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      value={profileData.lastName}
                      onChange={(e) =>
                        handleInputChange("lastName", e.target.value)
                      }
                      disabled={!isEditing}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={profileData.email}
                      onChange={(e) =>
                        handleInputChange("email", e.target.value)
                      }
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      value={profileData.phone}
                      onChange={(e) =>
                        handleInputChange("phone", e.target.value)
                      }
                      disabled={!isEditing}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="dateOfBirth">Date of Birth</Label>
                    <Input
                      id="dateOfBirth"
                      type="date"
                      value={profileData.dateOfBirth}
                      onChange={(e) =>
                        handleInputChange("dateOfBirth", e.target.value)
                      }
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="address">Address</Label>
                    <Input
                      id="address"
                      value={profileData.address}
                      onChange={(e) =>
                        handleInputChange("address", e.target.value)
                      }
                      disabled={!isEditing}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    value={profileData.bio}
                    onChange={(e) => handleInputChange("bio", e.target.value)}
                    disabled={!isEditing}
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Academic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GraduationCap className="w-5 h-5" />
                  Academic Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="rollNumber">Roll Number</Label>
                    <Input
                      id="rollNumber"
                      value={profileData.rollNumber}
                      disabled
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="branch">Branch</Label>
                    <Select
                      value={profileData.branch}
                      onValueChange={(value) =>
                        handleInputChange("branch", value)
                      }
                      disabled={!isEditing}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Computer Science & Business Systems">
                          CSBS
                        </SelectItem>
                        <SelectItem value="Computer Science & Engineering">
                          CSE
                        </SelectItem>
                        <SelectItem value="Information Technology">
                          IT
                        </SelectItem>
                        <SelectItem value="Electronics & Communication">
                          ECE
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="semester">Current Semester</Label>
                    <Select
                      value={profileData.semester}
                      onValueChange={(value) =>
                        handleInputChange("semester", value)
                      }
                      disabled={!isEditing}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="I">I</SelectItem>
                        <SelectItem value="II">II</SelectItem>
                        <SelectItem value="III">III</SelectItem>
                        <SelectItem value="IV">IV</SelectItem>
                        <SelectItem value="V">V</SelectItem>
                        <SelectItem value="VI">VI</SelectItem>
                        <SelectItem value="VII">VII</SelectItem>
                        <SelectItem value="VIII">VIII</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cgpa">CGPA</Label>
                  <Input
                    id="cgpa"
                    value={profileData.cgpa}
                    onChange={(e) => handleInputChange("cgpa", e.target.value)}
                    disabled={!isEditing}
                    placeholder="Enter your CGPA"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Skills & Achievements */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Skills</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {profileData.skills.map((skill, index) => (
                      <Badge key={index} variant="secondary">
                        {skill}
                      </Badge>
                    ))}
                    {isEditing && (
                      <Button variant="outline" size="sm" className="h-6">
                        + Add Skill
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Achievements</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {profileData.achievements.map((achievement, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <Award className="w-4 h-4 text-yellow-500" />
                        <span className="text-sm">{achievement}</span>
                      </div>
                    ))}
                    {isEditing && (
                      <Button variant="outline" size="sm">
                        + Add Achievement
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Save Button */}
            {isEditing && (
              <div className="flex justify-end">
                <Button
                  onClick={handleSave}
                  className="flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  Save Changes
                </Button>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default StudentProfile;
