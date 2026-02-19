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
import StudentLayout from "@/components/StudentLayout";
import { useAuth } from "@/contexts/AuthContext";
import { auth } from "@/lib/firebase";
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
  FolderKanban,
  BadgeCheck,
  Link2,
  Github,
  Linkedin,
  Globe,
  ExternalLink,
  Trash2,
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
    skills: [] as string[],
    achievements: [] as string[],
    projects: [] as { title: string; description: string; techStack: string; link: string }[],
    certifications: [] as { name: string; issuer: string; date: string; credentialLink: string }[],
    linkedin: "",
    github: "",
    portfolio: "",
    twitter: "",
  });

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [newSkill, setNewSkill] = useState("");
  const [newAchievement, setNewAchievement] = useState("");
  const [newProject, setNewProject] = useState({ title: "", description: "", techStack: "", link: "" });
  const [newCertification, setNewCertification] = useState({ name: "", issuer: "", date: "", credentialLink: "" });
  const printRef = useRef<HTMLDivElement | null>(null);

  // Fetch student name from Firebase Realtime Database using REST API
  useEffect(() => {
    if (!userData?.collegeId) return;

    const fetchStudentName = async () => {
      const rollNumber = userData.collegeId;
      console.log(`[Profile] Fetching student name for roll number: ${rollNumber}`);

      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

      try {
        // Fetch student data from backend API (uses Firebase Admin SDK internally)
        const response = await fetch(`${apiBaseUrl}/students/${rollNumber}`);

        if (response.ok) {
          const data = await response.json();
          console.log(`[Profile] Got student data from backend:`, data);

          if (data.name) {
            setStudentName(data.name);
            const nameParts = data.name.trim().split(' ');
            setProfileData(prev => ({
              ...prev,
              lastName: nameParts[0] || '',
              firstName: nameParts.slice(1).join(' ') || '',
            }));
          }
          return;
        }

        console.log(`[Profile] Backend returned ${response.status} for ${rollNumber}`);
      } catch (error) {
        console.warn("[Profile] Backend API call failed:", error);
      }

      console.log(`[Profile] No student name found for ${rollNumber}`);
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
                projects: studentProfile.projects || [],
                certifications: studentProfile.certifications || [],
                linkedin: studentProfile.linkedin || '',
                github: studentProfile.github || '',
                portfolio: studentProfile.portfolio || '',
                twitter: studentProfile.twitter || '',
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

  const handleRemoveAvatar = async () => {
    try {
      setProfileData(prev => ({ ...prev, avatar: '' }));

      // Remove from Firebase Storage & update MongoDB
      if (userData?.uid) {
        try {
          const { storage, isDevelopment, firebaseReady } = await import('@/lib/firebase');
          if (!isDevelopment && firebaseReady && storage) {
            const { ref, deleteObject } = await import('firebase/storage');
            const path = `avatars/${userData.uid || userData.collegeId}.jpg`;
            const storageRef = ref(storage, path);
            await deleteObject(storageRef).catch(() => {
              // File may not exist in storage, that's fine
            });
          }
        } catch {
          // Storage deletion is best-effort
        }

        await api.put(`/users/${userData.uid}`, { avatar: '' });
      }

      console.log('✅ Avatar removed successfully');
    } catch (e) {
      console.error('Failed to remove avatar:', e);
    }
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

  const addProject = () => {
    if (!newProject.title.trim()) return;
    setProfileData(prev => ({
      ...prev,
      projects: [...prev.projects, { ...newProject, title: newProject.title.trim(), description: newProject.description.trim(), techStack: newProject.techStack.trim(), link: newProject.link.trim() }],
    }));
    setNewProject({ title: "", description: "", techStack: "", link: "" });
  };

  const removeProject = (index: number) => {
    setProfileData(prev => ({
      ...prev,
      projects: prev.projects.filter((_, i) => i !== index),
    }));
  };

  const addCertification = () => {
    if (!newCertification.name.trim()) return;
    setProfileData(prev => ({
      ...prev,
      certifications: [...prev.certifications, { ...newCertification, name: newCertification.name.trim(), issuer: newCertification.issuer.trim(), date: newCertification.date.trim(), credentialLink: newCertification.credentialLink.trim() }],
    }));
    setNewCertification({ name: "", issuer: "", date: "", credentialLink: "" });
  };

  const removeCertification = (index: number) => {
    setProfileData(prev => ({
      ...prev,
      certifications: prev.certifications.filter((_, i) => i !== index),
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
          projects: profileData.projects,
          certifications: profileData.certifications,
          linkedin: profileData.linkedin,
          github: profileData.github,
          portfolio: profileData.portfolio,
          twitter: profileData.twitter,
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
    try {
      const jsPDFModule = await import('jspdf');
      const jsPDFCtor: any = (jsPDFModule as any).jsPDF || (jsPDFModule as any).default;
      const pdf = new jsPDFCtor('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 15;
      const contentWidth = pageWidth - margin * 2;
      let y = 0;

      // Colors
      const primaryColor = [37, 99, 235]; // blue-600
      const darkColor = [17, 24, 39]; // gray-900
      const mutedColor = [107, 114, 128]; // gray-500
      const lightBg = [243, 244, 246]; // gray-100
      const white = [255, 255, 255];
      const accentBg = [239, 246, 255]; // blue-50

      // Helper: check page overflow
      const checkPage = (needed: number) => {
        if (y + needed > pageHeight - margin) {
          pdf.addPage();
          y = margin;
        }
      };

      // Helper: draw section header
      const drawSectionHeader = (title: string) => {
        checkPage(14);
        pdf.setFillColor(...primaryColor);
        pdf.rect(margin, y, contentWidth, 9, 'F');
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(11);
        pdf.setTextColor(...white);
        pdf.text(title, margin + 4, y + 6.5);
        y += 13;
      };

      // Helper: draw label-value pair
      const drawField = (label: string, value: string, x: number, width: number) => {
        if (!value) return;
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(8);
        pdf.setTextColor(...mutedColor);
        pdf.text(label, x, y);
        y += 4;
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(10);
        pdf.setTextColor(...darkColor);
        const lines = pdf.splitTextToSize(value, width);
        pdf.text(lines, x, y);
        y += lines.length * 4.5 + 2;
      };

      // ========== HEADER ==========
      pdf.setFillColor(...primaryColor);
      pdf.rect(0, 0, pageWidth, 42, 'F');

      // Name
      const displayName = studentName || `${profileData.firstName} ${profileData.lastName}`;
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(22);
      pdf.setTextColor(...white);
      pdf.text(displayName.toUpperCase(), margin, 16);

      // Roll Number & Branch
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(11);
      pdf.setTextColor(220, 230, 255);
      pdf.text(`${profileData.rollNumber}  |  ${profileData.branch}  |  Semester ${profileData.semester}  |  Section ${profileData.section}`, margin, 24);

      // Contact info row
      pdf.setFontSize(9);
      const contactParts: string[] = [];
      if (profileData.email) contactParts.push(profileData.email);
      if (profileData.phone) contactParts.push(profileData.phone);
      if (profileData.address) contactParts.push(profileData.address);
      if (contactParts.length > 0) {
        pdf.text(contactParts.join('  •  '), margin, 31);
      }

      // Social links row
      const socialParts: string[] = [];
      if (profileData.linkedin) socialParts.push(`LinkedIn: ${profileData.linkedin}`);
      if (profileData.github) socialParts.push(`GitHub: ${profileData.github}`);
      if (profileData.portfolio) socialParts.push(`Portfolio: ${profileData.portfolio}`);
      if (socialParts.length > 0) {
        pdf.setFontSize(8);
        pdf.text(socialParts.join('  |  '), margin, 37);
      }

      y = 50;

      // ========== BIO ==========
      if (profileData.bio) {
        drawSectionHeader('ABOUT');
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(10);
        pdf.setTextColor(...darkColor);
        const bioLines = pdf.splitTextToSize(profileData.bio, contentWidth - 4);
        checkPage(bioLines.length * 5 + 4);
        pdf.text(bioLines, margin + 2, y);
        y += bioLines.length * 4.5 + 6;
      }

      // ========== ACADEMIC INFO ==========
      drawSectionHeader('ACADEMIC INFORMATION');
      const acadCol = contentWidth / 4;
      const acadItems = [
        { label: 'Roll Number', value: profileData.rollNumber },
        { label: 'Branch', value: profileData.branch },
        { label: 'Semester', value: profileData.semester },
        { label: 'CGPA', value: profileData.cgpa },
      ];
      const acadY = y;
      acadItems.forEach((item, i) => {
        const x = margin + 2 + i * acadCol;
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(8);
        pdf.setTextColor(...mutedColor);
        pdf.text(item.label, x, acadY);
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(11);
        pdf.setTextColor(...darkColor);
        pdf.text(item.value || '—', x, acadY + 5);
      });
      y = acadY + 12;

      // ========== PERSONAL INFO ==========
      if (profileData.dateOfBirth || profileData.phone || profileData.address) {
        drawSectionHeader('PERSONAL INFORMATION');
        const halfWidth = contentWidth / 2 - 4;

        // Row 1: DOB & Phone
        const personalY1 = y;
        if (profileData.dateOfBirth) {
          drawField('Date of Birth', profileData.dateOfBirth, margin + 2, halfWidth);
        }
        const afterDob = y;
        y = personalY1;
        if (profileData.phone) {
          drawField('Phone', profileData.phone, margin + contentWidth / 2, halfWidth);
        }
        y = Math.max(afterDob, y);

        // Row 2: Address
        if (profileData.address) {
          drawField('Address', profileData.address, margin + 2, contentWidth - 4);
        }
      }

      // ========== SKILLS ==========
      if (profileData.skills.length > 0) {
        drawSectionHeader('SKILLS');
        checkPage(12);
        let skillX = margin + 2;
        const skillY = y;
        profileData.skills.forEach((skill) => {
          const textWidth = pdf.getTextWidth(skill) + 6;
          if (skillX + textWidth > pageWidth - margin) {
            skillX = margin + 2;
            y += 7;
          }
          checkPage(8);
          pdf.setFillColor(...accentBg);
          pdf.roundedRect(skillX, y - 4, textWidth, 6, 1.5, 1.5, 'F');
          pdf.setFont('helvetica', 'normal');
          pdf.setFontSize(9);
          pdf.setTextColor(...primaryColor);
          pdf.text(skill, skillX + 3, y);
          skillX += textWidth + 3;
        });
        y += 8;
      }

      // ========== PROJECTS ==========
      if (profileData.projects.length > 0) {
        drawSectionHeader('PROJECTS');
        profileData.projects.forEach((project) => {
          checkPage(22);
          pdf.setFont('helvetica', 'bold');
          pdf.setFontSize(11);
          pdf.setTextColor(...darkColor);
          pdf.text(project.title, margin + 2, y);
          y += 5;
          if (project.techStack) {
            pdf.setFont('helvetica', 'italic');
            pdf.setFontSize(9);
            pdf.setTextColor(...primaryColor);
            pdf.text(`Tech: ${project.techStack}`, margin + 2, y);
            y += 4.5;
          }
          if (project.description) {
            pdf.setFont('helvetica', 'normal');
            pdf.setFontSize(9);
            pdf.setTextColor(...mutedColor);
            const descLines = pdf.splitTextToSize(project.description, contentWidth - 4);
            checkPage(descLines.length * 4);
            pdf.text(descLines, margin + 2, y);
            y += descLines.length * 4 + 1;
          }
          if (project.link) {
            pdf.setFont('helvetica', 'normal');
            pdf.setFontSize(8);
            pdf.setTextColor(...primaryColor);
            pdf.textWithLink(project.link, margin + 2, y, { url: project.link });
            y += 4;
          }
          y += 3;
        });
      }

      // ========== CERTIFICATIONS ==========
      if (profileData.certifications.length > 0) {
        drawSectionHeader('CERTIFICATIONS');
        profileData.certifications.forEach((cert) => {
          checkPage(16);
          pdf.setFont('helvetica', 'bold');
          pdf.setFontSize(10);
          pdf.setTextColor(...darkColor);
          pdf.text(cert.name, margin + 2, y);

          // Issuer & Date on same line
          const metaParts: string[] = [];
          if (cert.issuer) metaParts.push(cert.issuer);
          if (cert.date) metaParts.push(cert.date);
          if (metaParts.length > 0) {
            pdf.setFont('helvetica', 'normal');
            pdf.setFontSize(9);
            pdf.setTextColor(...mutedColor);
            pdf.text(metaParts.join('  •  '), margin + 2, y + 4.5);
            y += 4.5;
          }
          if (cert.credentialLink) {
            pdf.setFont('helvetica', 'normal');
            pdf.setFontSize(8);
            pdf.setTextColor(...primaryColor);
            pdf.textWithLink('View Credential →', margin + 2, y + 4, { url: cert.credentialLink });
            y += 4;
          }
          y += 7;
        });
      }

      // ========== ACHIEVEMENTS ==========
      if (profileData.achievements.length > 0) {
        drawSectionHeader('ACHIEVEMENTS');
        profileData.achievements.forEach((achievement) => {
          checkPage(7);
          pdf.setFont('helvetica', 'normal');
          pdf.setFontSize(9);
          pdf.setTextColor(...darkColor);
          const lines = pdf.splitTextToSize(`•  ${achievement}`, contentWidth - 6);
          pdf.text(lines, margin + 4, y);
          y += lines.length * 4.5 + 1;
        });
        y += 2;
      }

      // ========== FOOTER ==========
      const footerY = pageHeight - 8;
      pdf.setDrawColor(...lightBg);
      pdf.line(margin, footerY - 3, pageWidth - margin, footerY - 3);
      pdf.setFont('helvetica', 'italic');
      pdf.setFontSize(7);
      pdf.setTextColor(...mutedColor);
      pdf.text(`Generated from CampVerse  •  ${new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}`, margin, footerY);

      // Save
      const fileName = `${displayName.replace(/\s+/g, '_')}_Profile.pdf`;
      pdf.save(fileName);
    } catch (e) {
      console.error('Print failed', e);
    }
  };

  return (
    <StudentLayout>
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
                    {profileData.avatar && (
                      <Button
                        size="sm"
                        variant="destructive"
                        className="absolute top-0 right-0 rounded-full p-2 h-7 w-7 print-hidden"
                        onClick={handleRemoveAvatar}
                        aria-label="Remove profile photo"
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    )}
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
                  <SelectTrigger id="branch">
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
                  <SelectTrigger id="section">
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
                  <SelectTrigger id="semester">
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

        {/* Projects */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FolderKanban className="w-5 h-5" />
              Projects
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {profileData.projects.length === 0 && !isEditing && (
              <p className="text-sm text-muted-foreground">No projects added yet.</p>
            )}
            {profileData.projects.map((project, index) => (
              <div key={index} className="p-4 border rounded-lg space-y-2 relative">
                {isEditing && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2 h-7 w-7 text-destructive print-hidden"
                    onClick={() => removeProject(index)}
                    aria-label={`Remove project ${project.title}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
                <h4 className="font-semibold text-foreground">{project.title}</h4>
                {project.description && (
                  <p className="text-sm text-muted-foreground">{project.description}</p>
                )}
                <div className="flex flex-wrap gap-2">
                  {project.techStack && project.techStack.split(',').map((tech, i) => (
                    <Badge key={i} variant="secondary" className="text-xs">{tech.trim()}</Badge>
                  ))}
                </div>
                {project.link && (
                  <a href={project.link} target="_blank" rel="noopener noreferrer" className="text-sm text-primary flex items-center gap-1 hover:underline">
                    <ExternalLink className="w-3 h-3" /> View Project
                  </a>
                )}
              </div>
            ))}
            {isEditing && (
              <div className="p-4 border border-dashed rounded-lg space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label htmlFor="project-title">Project Title *</Label>
                    <Input
                      id="project-title"
                      placeholder="e.g. CampVerse"
                      value={newProject.title}
                      onChange={(e) => setNewProject(prev => ({ ...prev, title: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="project-tech">Tech Stack</Label>
                    <Input
                      id="project-tech"
                      placeholder="e.g. React, Node.js, MongoDB"
                      value={newProject.techStack}
                      onChange={(e) => setNewProject(prev => ({ ...prev, techStack: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <Label htmlFor="project-desc">Description</Label>
                  <Textarea
                    id="project-desc"
                    placeholder="Brief description of the project"
                    value={newProject.description}
                    onChange={(e) => setNewProject(prev => ({ ...prev, description: e.target.value }))}
                    rows={2}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="project-link">Project Link</Label>
                  <Input
                    id="project-link"
                    placeholder="https://github.com/..."
                    value={newProject.link}
                    onChange={(e) => setNewProject(prev => ({ ...prev, link: e.target.value }))}
                  />
                </div>
                <Button type="button" onClick={addProject} className="flex items-center gap-1 print-hidden">
                  <Plus className="w-4 h-4" /> Add Project
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Certifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BadgeCheck className="w-5 h-5" />
              Certifications
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {profileData.certifications.length === 0 && !isEditing && (
              <p className="text-sm text-muted-foreground">No certifications added yet.</p>
            )}
            {profileData.certifications.map((cert, index) => (
              <div key={index} className="p-4 border rounded-lg space-y-1 relative">
                {isEditing && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2 h-7 w-7 text-destructive print-hidden"
                    onClick={() => removeCertification(index)}
                    aria-label={`Remove certification ${cert.name}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
                <h4 className="font-semibold text-foreground">{cert.name}</h4>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  {cert.issuer && <span>Issued by: {cert.issuer}</span>}
                  {cert.date && <span>• {cert.date}</span>}
                </div>
                {cert.credentialLink && (
                  <a href={cert.credentialLink} target="_blank" rel="noopener noreferrer" className="text-sm text-primary flex items-center gap-1 hover:underline">
                    <ExternalLink className="w-3 h-3" /> View Credential
                  </a>
                )}
              </div>
            ))}
            {isEditing && (
              <div className="p-4 border border-dashed rounded-lg space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label htmlFor="cert-name">Certification Name *</Label>
                    <Input
                      id="cert-name"
                      placeholder="e.g. AWS Cloud Practitioner"
                      value={newCertification.name}
                      onChange={(e) => setNewCertification(prev => ({ ...prev, name: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="cert-issuer">Issuing Organization</Label>
                    <Input
                      id="cert-issuer"
                      placeholder="e.g. Amazon Web Services"
                      value={newCertification.issuer}
                      onChange={(e) => setNewCertification(prev => ({ ...prev, issuer: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label htmlFor="cert-date">Date</Label>
                    <Input
                      id="cert-date"
                      type="month"
                      value={newCertification.date}
                      onChange={(e) => setNewCertification(prev => ({ ...prev, date: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="cert-link">Credential Link</Label>
                    <Input
                      id="cert-link"
                      placeholder="https://..."
                      value={newCertification.credentialLink}
                      onChange={(e) => setNewCertification(prev => ({ ...prev, credentialLink: e.target.value }))}
                    />
                  </div>
                </div>
                <Button type="button" onClick={addCertification} className="flex items-center gap-1 print-hidden">
                  <Plus className="w-4 h-4" /> Add Certification
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Social Links */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Link2 className="w-5 h-5" />
              Social Links
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="linkedin" className="flex items-center gap-2">
                  <Linkedin className="w-4 h-4 text-[#0077B5]" /> LinkedIn
                </Label>
                <Input
                  id="linkedin"
                  placeholder="https://linkedin.com/in/..."
                  value={profileData.linkedin}
                  onChange={(e) => handleInputChange("linkedin", e.target.value)}
                  disabled={!isEditing}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="github" className="flex items-center gap-2">
                  <Github className="w-4 h-4" /> GitHub
                </Label>
                <Input
                  id="github"
                  placeholder="https://github.com/..."
                  value={profileData.github}
                  onChange={(e) => handleInputChange("github", e.target.value)}
                  disabled={!isEditing}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="portfolio" className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-green-500" /> Portfolio / Website
                </Label>
                <Input
                  id="portfolio"
                  placeholder="https://yourportfolio.com"
                  value={profileData.portfolio}
                  onChange={(e) => handleInputChange("portfolio", e.target.value)}
                  disabled={!isEditing}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="twitter" className="flex items-center gap-2">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
                  X (Twitter)
                </Label>
                <Input
                  id="twitter"
                  placeholder="https://x.com/..."
                  value={profileData.twitter}
                  onChange={(e) => handleInputChange("twitter", e.target.value)}
                  disabled={!isEditing}
                />
              </div>
            </div>
            {!isEditing && (profileData.linkedin || profileData.github || profileData.portfolio || profileData.twitter) && (
              <div className="flex flex-wrap gap-3 pt-2">
                {profileData.linkedin && (
                  <a href={profileData.linkedin} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-sm text-[#0077B5] hover:underline">
                    <Linkedin className="w-4 h-4" /> LinkedIn
                  </a>
                )}
                {profileData.github && (
                  <a href={profileData.github} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-sm text-foreground hover:underline">
                    <Github className="w-4 h-4" /> GitHub
                  </a>
                )}
                {profileData.portfolio && (
                  <a href={profileData.portfolio} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-sm text-green-500 hover:underline">
                    <Globe className="w-4 h-4" /> Portfolio
                  </a>
                )}
                {profileData.twitter && (
                  <a href={profileData.twitter} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-sm text-foreground hover:underline">
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
                    X (Twitter)
                  </a>
                )}
              </div>
            )}
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
    </StudentLayout>
  );
};

export default StudentProfile;


