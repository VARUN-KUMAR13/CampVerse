import React, { useEffect, useState, useRef } from "react";
import { api } from "@/lib/api";
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
  const [studentName, setStudentName] = useState<string | null>(null);
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    email: userData?.email || (userData?.collegeId ? `${userData.collegeId}@cvr.ac.in` : ''),
    phone: "",
    address: "",
    dateOfBirth: "",
    branch: "Computer Science and Engineering",
    section: "B",
    semester: "VI",
    rollNumber: userData?.collegeId || "",
    cgpa: "",
    bio: "",
    avatar: "",
    skills: [],
    achievements: [],
  });

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [newSkill, setNewSkill] = useState("");
  const [newAchievement, setNewAchievement] = useState("");
  const printRef = useRef<HTMLDivElement | null>(null);

  // Fetch student name from Firebase Realtime Database using REST API
  useEffect(() => {
    if (!userData?.collegeId) return;

    const fetchStudentName = async () => {
      try {
        // Fetch all student records from Firebase
        // Structure: /{index} -> { "Name of the student": "...", "ROLL NO": "..." }
        const response = await fetch(
          `https://campverse-2004-default-rtdb.asia-southeast1.firebasedatabase.app/.json`
        );

        if (response.ok) {
          const allData = await response.json();

          if (allData) {
            // Search through all entries to find the one with matching ROLL NO
            for (const key in allData) {
              const student = allData[key];
              if (student && student["ROLL NO"] === userData.collegeId) {
                // Found the student! Get the name
                const name = student["Name of the student"] || student["Name"] || student["name"] || null;
                console.log("Found student:", student);
                console.log("Student name:", name);

                if (name) {
                  setStudentName(name);
                  const nameParts = name.trim().split(' ');
                  setProfileData(prev => ({
                    ...prev,
                    lastName: nameParts[0] || '',           // Surname (first word)
                    firstName: nameParts.slice(1).join(' ') || '',  // Given name (remaining)
                  }));
                }
                break; // Found the student, exit loop
              }
            }
          }
        }
      } catch (error) {
        console.error("Error fetching from Firebase:", error);
      }
    };

    fetchStudentName();
  }, [userData?.collegeId]);

  useEffect(() => {
    if (!userData?.collegeId) return;

    const fetchProfile = async () => {
      try {
        // Core auth data sync
        setProfileData(prev => ({
          ...prev,
          rollNumber: userData.collegeId,
          email: userData.email || `${userData.collegeId}@cvr.ac.in`,
        }));

        // Fetch additional profile data from Backend
        if (userData?.uid) {
          console.log("📥 Fetching profile for UID:", userData.uid);

          try {
            const studentProfile = await api.get(`/users/${userData.uid}`);
            console.log("📥 Fetched profile from MongoDB:", studentProfile);

            if (studentProfile) {
              setProfileData(prev => ({
                ...prev,
                lastName: studentProfile.name?.split(' ')[0] || prev.lastName,
                firstName: studentProfile.name?.split(' ').slice(1).join(' ') || prev.firstName,
                phone: studentProfile.phone || prev.phone,
                address: studentProfile.address || prev.address,
                dateOfBirth: studentProfile.dateOfBirth || prev.dateOfBirth,
                bio: studentProfile.bio || prev.bio,
                avatar: studentProfile.avatar || prev.avatar,
                branch: studentProfile.branchInfo || studentProfile.branch || prev.branch,
                section: studentProfile.section || prev.section,
                semester: studentProfile.semester || prev.semester,
                cgpa: studentProfile.cgpa || prev.cgpa,
                skills: studentProfile.skills || [],
                achievements: studentProfile.achievements || [],
              }));
            }
          } catch (apiError: any) {
            // If user not found in MongoDB, that's okay - they can still edit and create profile
            if (apiError.message?.includes('404') || apiError.message?.includes('Not found')) {
              console.log("ℹ️ User profile not found in MongoDB yet - will be created on first save");
            } else {
              console.error("API Error:", apiError);
            }
          }
        } else {
          console.log("ℹ️ No UID available - using default profile data");
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      }
    };

    fetchProfile();
  }, [userData?.collegeId, userData?.uid, userData?.name, userData?.email]);

  const handleAvatarUpload = async (file: File) => {
    try {
      const localUrl = URL.createObjectURL(file);
      setProfileData(prev => ({ ...prev, avatar: localUrl }));

      const { storage, isDevelopment, firebaseReady } = await import('@/lib/firebase');

      if (!isDevelopment && firebaseReady && storage) {
        const { ref, uploadBytes, getDownloadURL } = await import('firebase/storage');
        const path = `avatars/${userData?.uid || userData?.collegeId}.jpg`;
        const storageRef = ref(storage, path);
        await uploadBytes(storageRef, file);
        const downloadUrl = await getDownloadURL(storageRef);

        // Update via API
        if (userData?.uid) {
          await api.put(`/users/${userData.uid}`, { avatar: downloadUrl });
          setProfileData(prev => ({ ...prev, avatar: downloadUrl }));
        }
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

  const handleSave = async () => {
    try {
      if (userData?.uid) {
        const dataToSave = {
          name: `${profileData.lastName} ${profileData.firstName}`, // Save in correct order
          phone: profileData.phone,
          address: profileData.address,
          dateOfBirth: profileData.dateOfBirth,
          bio: profileData.bio,
          cgpa: profileData.cgpa,
          branch: profileData.branch,
          section: profileData.section,
          semester: profileData.semester,
          avatar: profileData.avatar,
          skills: profileData.skills,
          achievements: profileData.achievements,
        };

        console.log("📤 Saving profile data:", dataToSave);
        console.log("📤 User UID:", userData.uid);

        const response = await api.put(`/users/${userData.uid}`, dataToSave);

        console.log("✅ Profile saved to MongoDB:", response);
        alert("Profile saved successfully!");
      } else {
        console.error("❌ No user UID available");
        alert("Error: User not logged in properly. Please log out and log back in.");
      }
    } catch (e: any) {
      console.error("❌ Error saving profile:", e);
      alert(`Failed to save profile: ${e.message || 'Unknown error'}`);
    }
    setIsEditing(false);
  };

  const handleInputChange = (field: string, value: string) => {
    setProfileData((prev) => ({ ...prev, [field]: value }));
  };

  const handlePrint = async () => {
    if (!printRef.current) return;
    try {
      const [{ default: html2canvas }, jsPDFModule] = await Promise.all([
        import('html2canvas'),
        import('jspdf'),
      ]);
      const jsPDFCtor: any = (jsPDFModule as any).jsPDF || (jsPDFModule as any).default;
      const element = printRef.current as HTMLDivElement;
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        ignoreElements: (el) => (el as HTMLElement).classList?.contains('print-hidden'),
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
    }
  };

  return (
    <div className="flex min-h-screen bg-background">
      <StudentSidebar />
      <div className="flex-1 flex flex-col">
        <StudentTopbar studentId={userData?.collegeId || ""} />

        <main className="flex-1 p-6">
          <div ref={printRef} className="max-w-4xl mx-auto space-y-6">
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
                className="print-hidden"
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
                          className="absolute bottom-0 right-0 rounded-full p-2 h-8 w-8 print-hidden"
                          onClick={() => fileInputRef.current?.click()}
                          aria-label="Upload profile photo"
                        >
                          <Camera className="w-4 h-4" />
                        </Button>
                      </>
                    )}
                  </div>
                  <div className="text-center md:text-left flex-1">
                    <h2 className="text-2xl font-bold text-primary">
                      {studentName || `${profileData.firstName} ${profileData.lastName}`}
                    </h2>
                    <p className="text-lg text-foreground font-medium">
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
                      disabled
                      readOnly
                      title="Locked by admin"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      value={profileData.lastName}
                      disabled
                      readOnly
                      title="Locked by admin"
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
                    <Label htmlFor="section">Section</Label>
                    <Select
                      value={profileData.section}
                      onValueChange={(value) =>
                        handleInputChange("section", value)
                      }
                      disabled={!isEditing}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="A">Section A</SelectItem>
                        <SelectItem value="B">Section B</SelectItem>
                        <SelectItem value="C">Section C</SelectItem>
                        <SelectItem value="D">Section D</SelectItem>
                        <SelectItem value="E">Section E</SelectItem>
                        <SelectItem value="F">Section F</SelectItem>
                        <SelectItem value="G">Section G</SelectItem>
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
                            className="h-6 w-6 print-hidden"
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
                      <Button type="button" onClick={addSkill} className="flex items-center gap-1 print-hidden">
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
                            className="h-6 w-6 print-hidden"
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
                      <Button type="button" onClick={addAchievement} className="flex items-center gap-1 print-hidden">
                        <Plus className="w-4 h-4" /> Add
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
            {/* Save Button */}
            {isEditing && (
              <div className="flex justify-end">
                <Button
                  onClick={handleSave}
                  className="flex items-center gap-2 print-hidden"
                >
                  <Save className="w-4 h-4" />
                  Save Changes
                </Button>
              </div>
            )}
          </div>
          <div className="mt-4 flex justify-end">
            <Button onClick={handlePrint} className="print-hidden mr-auto bg-[#4A90E2] text-white hover:bg-[#4A90E2]/90 border border-[#1D2839] rounded-[10px]">
              Print
            </Button>
          </div>
        </main>
      </div>
    </div>
  );
};

export default StudentProfile;


