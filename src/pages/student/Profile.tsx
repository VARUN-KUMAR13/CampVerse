import React, { useEffect, useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { format } from "date-fns";
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
  Plus,
  X,
} from "lucide-react";


const StudentProfile = () => {
  const { userData } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    email: userData?.email || (userData?.collegeId ? `${userData.collegeId}@cvr.ac.in` : ''),
    phone: "",
    address: "",
    dateOfBirth: "",
    branch: "Computer Science & Business Systems",
    semester: "VI",
    rollNumber: userData?.collegeId || "",
    cgpa: "",
    bio: "",
    avatar: "",
    skills: ["React", "TypeScript"],
    achievements: [],
  });

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [newSkill, setNewSkill] = useState("");
  const [newAchievement, setNewAchievement] = useState("");
  const printRef = useRef<HTMLDivElement | null>(null);
  const [printMode, setPrintMode] = useState(false);

  useEffect(() => {
    if (!userData?.collegeId) return;
    // Sync core fields when auth changes
    setProfileData(prev => ({
      ...prev,
      rollNumber: userData.collegeId,
      email: userData.email || `${userData.collegeId}@cvr.ac.in`,
    }));

  }, [userData?.collegeId, userData?.name, userData?.email]);

  const handleAvatarUpload = async (file: File) => {
    try {
      const localUrl = URL.createObjectURL(file);
      setProfileData(prev => ({ ...prev, avatar: localUrl }));

      const { default: app, isDevelopment, firebaseReady } = await import('@/lib/firebase');
      let finalUrl = localUrl;
      if (!isDevelopment && firebaseReady && app) {
        const { getStorage, ref, uploadBytes, getDownloadURL } = await import('firebase/storage');
        const storage = getStorage(app);
        const path = `avatars/${userData?.uid || userData?.collegeId}.jpg`;
        const storageRef = ref(storage, path);
        await uploadBytes(storageRef, file);
        finalUrl = await getDownloadURL(storageRef);
        setProfileData(prev => ({ ...prev, avatar: finalUrl }));
      }

      const { StudentService } = await import('@/services/firestoreService');
      if (userData?.uid) {
        await StudentService.updateStudentProfile(userData.uid, { profile: { avatar: finalUrl } } as any);
      }
    } catch (e) {
      console.error('Avatar upload failed:', e);
    }
  };

  const onAvatarFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleAvatarUpload(file);
  };

  const addSkill = () => {
    const skill = newSkill.trim();
    if (!skill) return;
    setProfileData(prev => {
      if (prev.skills.includes(skill)) return prev;
      return { ...prev, skills: [...prev.skills, skill] };
    });
    setNewSkill("");
  };

  const removeSkill = (index: number) => {
    setProfileData(prev => ({
      ...prev,
      skills: prev.skills.filter((_, i) => i !== index),
    }));
  };

  const addAchievement = () => {
    const text = newAchievement.trim();
    if (!text) return;
    setProfileData(prev => ({ ...prev, achievements: [...prev.achievements, text] }));
    setNewAchievement("");
  };

  const removeAchievement = (index: number) => {
    setProfileData(prev => ({
      ...prev,
      achievements: prev.achievements.filter((_, i) => i !== index),
    }));
  };

  const handleSave = () => {
    console.log("Saving profile data:", profileData);
    setIsEditing(false);
  };

  const handleInputChange = (field: string, value: string) => {
    setProfileData((prev) => ({ ...prev, [field]: value }));
  };

  const handlePrint = async () => {
    if (!printRef.current) return;
    try {
      setPrintMode(true);
      await new Promise((r) => setTimeout(r, 50));
      const [{ default: html2canvas }, jsPDFModule] = await Promise.all([
        import('html2canvas'),
        import('jspdf'),
      ]);
      const jsPDFCtor: any = (jsPDFModule as any).jsPDF || (jsPDFModule as any).default;
      const element = printRef.current as HTMLDivElement;
      const canvas = await html2canvas(element, {
        backgroundColor: '#ffffff',
        scale: 2,
        useCORS: true,
      });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDFCtor('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 10;
      const imgWidth = pageWidth - margin * 2;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = margin;

      pdf.addImage(imgData, 'PNG', margin, position, imgWidth, imgHeight);
      heightLeft -= pageHeight - margin * 2;

      while (heightLeft > 0) {
        pdf.addPage();
        position = margin - (imgHeight - heightLeft);
        pdf.addImage(imgData, 'PNG', margin, position, imgWidth, imgHeight);
        heightLeft -= pageHeight - margin * 2;
      }

      pdf.save('profile.pdf');
    } catch (e) {
      console.error('Print failed', e);
    } finally {
      setPrintMode(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-background">
      <StudentSidebar />
      <div className="flex-1 flex flex-col">
        <StudentTopbar studentId={userData?.collegeId || ""} />

        <main className="flex-1 p-6">
          <div ref={printRef} className="max-w-4xl mx-auto space-y-6" style={printMode ? { backgroundColor: '#ffffff', color: '#000000' } : undefined}>
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
                      {profileData.avatar && (
                        <AvatarImage src={profileData.avatar} alt="Profile Photo" />
                      )}
                      <AvatarFallback className="bg-primary/10 text-foreground">
                        <User className="w-10 h-10" />
                      </AvatarFallback>
                    </Avatar>
                    {isEditing && (
                      <>
                        <input
                          type="file"
                          accept="image/*"
                          ref={fileInputRef}
                          onChange={onAvatarFileChange}
                          className="hidden"
                        />
                        <Button
                          size="sm"
                          className="absolute bottom-0 right-0 rounded-full p-2 h-8 w-8"
                          onClick={() => fileInputRef.current?.click()}
                          aria-label="Upload profile photo"
                        >
                          <Camera className="w-4 h-4" />
                        </Button>
                      </>
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
                      disabled
                      readOnly
                      title="Locked by admin"
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
                    <div className="flex items-center gap-2">
                      <Input
                        id="dateOfBirth"
                        type="date"
                        value={profileData.dateOfBirth}
                        onChange={(e) => handleInputChange("dateOfBirth", e.target.value)}
                        disabled={!isEditing}
                      />
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button type="button" variant="outline" size="icon" disabled={!isEditing} aria-label="Set date">
                            <Calendar className="w-4 h-4" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="p-0" align="start">
                          <CalendarComponent
                            mode="single"
                            selected={profileData.dateOfBirth ? new Date(profileData.dateOfBirth) : undefined}
                            onSelect={(date) => {
                              if (date) handleInputChange("dateOfBirth", format(date, "yyyy-MM-dd"));
                            }}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
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
                      readOnly
                      title="Locked by admin"
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
                      <div key={index} className="flex items-center gap-1">
                        <Badge variant="secondary">{skill}</Badge>
                        {isEditing && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => removeSkill(index)}
                            aria-label={`Remove ${skill}`}
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                  {isEditing && (
                    <div className="mt-3 flex items-center gap-2">
                      <Input
                        id="new-skill"
                        placeholder="Add a skill"
                        value={newSkill}
                        onChange={(e) => setNewSkill(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            addSkill();
                          }
                        }}
                      />
                      <Button type="button" onClick={addSkill} className="flex items-center gap-1">
                        <Plus className="w-4 h-4" /> Add
                      </Button>
                    </div>
                  )}
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
                        {isEditing && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => removeAchievement(index)}
                            aria-label={`Remove achievement ${index + 1}`}
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                  {isEditing && (
                    <div className="mt-3 flex items-center gap-2">
                      <Input
                        id="new-achievement"
                        placeholder="Add an achievement"
                        value={newAchievement}
                        onChange={(e) => setNewAchievement(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            addAchievement();
                          }
                        }}
                      />
                      <Button type="button" onClick={addAchievement} className="flex items-center gap-1">
                        <Plus className="w-4 h-4" /> Add
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
            <div className="flex justify-end">
              <Button variant="outline" onClick={handlePrint}>
                Print
              </Button>
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
