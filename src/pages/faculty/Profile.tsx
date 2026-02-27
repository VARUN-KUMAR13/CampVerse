import FacultyLayout from "@/components/FacultyLayout";
import { useAuth } from "@/contexts/AuthContext";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { Pencil, Save, X, Plus, User, Briefcase, Mail, Phone, MapPin, Clock, Calendar, FileText } from "lucide-react";

const branchNames: Record<string, string> = {
  "01": "Civil Engineering",
  "02": "Electrical & Electronics Engineering",
  "03": "Mechanical Engineering",
  "04": "Electronics & Communication Engineering",
  "05": "Computer Science & Engineering",
  "12": "Information Technology",
};

interface ProfileFormData {
  firstName: string;
  lastName: string;
  phone: string;
  officeLocation: string;
  designation: string;
  specializations: string[];
  availability: string;
  bio: string;
}

const FacultyProfile = () => {
  const { userData } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [newSpecialization, setNewSpecialization] = useState("");

  const facultyId = userData?.collegeId || "";
  const facultyName = userData?.name || "";
  const facultyEmail = userData?.email || "";
  const department = branchNames[userData?.branch || ""] || "";

  // Form state - Use type casting for optional properties
  const userDataAny = userData as any;

  // Split name into first and last name (only if name exists)
  const nameParts = facultyName ? facultyName.split(" ") : [];
  const defaultFirstName = nameParts[0] || "";
  const defaultLastName = nameParts.slice(1).join(" ") || "";

  const [formData, setFormData] = useState<ProfileFormData>({
    firstName: userDataAny?.firstName || defaultFirstName,
    lastName: userDataAny?.lastName || defaultLastName,
    phone: userDataAny?.phone || "",
    officeLocation: userDataAny?.address || "",
    designation: userDataAny?.designation || "",
    specializations: userDataAny?.specializations || [],
    availability: userDataAny?.availability || "",
    bio: userDataAny?.bio || "",
  });

  const handleInputChange = (field: keyof ProfileFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleAddSpecialization = () => {
    if (newSpecialization.trim()) {
      setFormData(prev => ({
        ...prev,
        specializations: [...prev.specializations, newSpecialization.trim()],
      }));
      setNewSpecialization("");
    }
  };

  const handleRemoveSpecialization = (index: number) => {
    setFormData(prev => ({
      ...prev,
      specializations: prev.specializations.filter((_, i) => i !== index),
    }));
  };

  useEffect(() => {
    if (!userData?.uid) return;

    const fetchProfile = async () => {
      try {
        const studentProfile = await api.get(`/users/${userData.uid}`);
        if (studentProfile) {
          setFormData(prev => ({
            ...prev,
            firstName: studentProfile.name?.split(' ')[0] || prev.firstName,
            lastName: studentProfile.name?.split(' ').slice(1).join(' ') || prev.lastName,
            phone: studentProfile.phone || prev.phone,
            officeLocation: studentProfile.address || prev.officeLocation,
            designation: studentProfile.designation || prev.designation,
            specializations: studentProfile.skills?.length ? studentProfile.skills : prev.specializations,
            availability: studentProfile.availability || prev.availability,
            bio: studentProfile.bio || prev.bio,
          }));
        }
      } catch (error: any) {
        if (!error.message?.includes('404')) {
          console.error("Error fetching profile:", error);
        }
      }
    };

    fetchProfile();
  }, [userData?.uid]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      if (!userData?.uid) {
        toast.error("User error: UID not found");
        return;
      }

      const dataToSave = {
        name: `${formData.firstName} ${formData.lastName}`.trim(),
        phone: formData.phone,
        address: formData.officeLocation,
        designation: formData.designation,
        availability: formData.availability,
        bio: formData.bio,
        skills: formData.specializations,
        role: "faculty",
        section: "Z" // Faculty require Section Z validation on backend
      };

      await api.put(`/users/${userData.uid}`, dataToSave);

      toast.success("Profile updated successfully!");
      setIsEditing(false);
    } catch (error) {
      console.error("Error saving profile:", error);
      toast.error("Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    // Reset form data to original values
    setFormData({
      firstName: userDataAny?.firstName || defaultFirstName,
      lastName: userDataAny?.lastName || defaultLastName,
      phone: userDataAny?.phone || "",
      officeLocation: userDataAny?.address || "",
      designation: userDataAny?.designation || "",
      specializations: userDataAny?.specializations || [],
      availability: userDataAny?.availability || "",
      bio: userDataAny?.bio || "",
    });
    setIsEditing(false);
  };

  return (
    <FacultyLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header Section */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
              <User className="w-8 h-8 text-primary" />
              My Profile
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage your professional information and preferences
            </p>
          </div>
          <div className="flex gap-2">
            {isEditing ? (
              <>
                <Button variant="outline" onClick={handleCancel} disabled={isSaving}>
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
                <Button className="bg-green-600 hover:bg-green-700" onClick={handleSave} disabled={isSaving}>
                  {isSaving ? (
                    <>
                      <Save className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save
                    </>
                  )}
                </Button>
              </>
            ) : (
              <Button onClick={() => setIsEditing(true)}>
                <Pencil className="w-4 h-4 mr-2" />
                Edit Profile
              </Button>
            )}
          </div>
        </div>

        {/* Profile Header Card */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="relative">
                <Avatar className="w-24 h-24">
                  <AvatarFallback className="text-2xl bg-primary/10 text-primary font-bold">
                    {(formData.firstName[0] || "") + (formData.lastName[0] || "")}
                  </AvatarFallback>
                </Avatar>
              </div>
              <div className="text-center md:text-left flex-1">
                <h2 className="text-2xl font-bold text-primary">
                  {formData.firstName} {formData.lastName}
                </h2>
                <p className="text-lg text-foreground font-medium flex items-center justify-center md:justify-start gap-2">
                  <Briefcase className="w-4 h-4" />
                  {formData.designation || "Faculty Member"}
                </p>
                <div className="flex flex-wrap gap-2 mt-3 justify-center md:justify-start">
                  <Badge variant="outline" className="text-sm">
                    Faculty ID: {facultyId}
                  </Badge>
                  <Badge variant="secondary" className="text-sm border-primary/20 bg-primary/5 text-primary">
                    {department}
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Profile Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5 text-primary" />
              Profile Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange("firstName", e.target.value)}
                  disabled={!isEditing}
                  className={!isEditing ? "bg-muted/50 text-foreground" : ""}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange("lastName", e.target.value)}
                  disabled={!isEditing}
                  className={!isEditing ? "bg-muted/50 text-foreground" : ""}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Department</Label>
                <Input
                  value={department}
                  disabled
                  readOnly
                  title="Locked by admin"
                  className="bg-muted text-muted-foreground"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="designation">Designation</Label>
                <Input
                  id="designation"
                  value={formData.designation}
                  onChange={(e) => handleInputChange("designation", e.target.value)}
                  disabled={!isEditing}
                  className={!isEditing ? "bg-muted/50 text-foreground" : ""}
                  placeholder="e.g., Assistant Professor"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                value={formData.bio}
                onChange={(e) => handleInputChange("bio", e.target.value)}
                disabled={!isEditing}
                className={`resize-none ${!isEditing ? "bg-muted/50 text-foreground" : ""}`}
                placeholder="Enter your professional bio..."
                rows={4}
              />
            </div>
          </CardContent>
        </Card>

        {/* Contact Information Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Phone className="w-5 h-5 text-green-500" />
              Contact Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  Email
                </Label>
                <Input
                  id="email"
                  value={facultyEmail}
                  disabled
                  readOnly
                  title="Locked by admin"
                  className="bg-muted text-muted-foreground"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone" className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  Phone Number
                </Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  disabled={!isEditing}
                  className={!isEditing ? "bg-muted/50 text-foreground" : ""}
                  placeholder="+91 XXXXX XXXXX"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="officeLocation" className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  Office Location
                </Label>
                <Input
                  id="officeLocation"
                  value={formData.officeLocation}
                  onChange={(e) => handleInputChange("officeLocation", e.target.value)}
                  disabled={!isEditing}
                  className={!isEditing ? "bg-muted/50 text-foreground" : ""}
                  placeholder="Block C, Room 308"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="availability" className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  Availability
                </Label>
                <Input
                  id="availability"
                  value={formData.availability}
                  onChange={(e) => handleInputChange("availability", e.target.value)}
                  disabled={!isEditing}
                  className={!isEditing ? "bg-muted/50 text-foreground" : ""}
                  placeholder="Mon - Fri, 9:00 AM to 5:00 PM"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Professional Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-blue-500" />
              Professional Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <Label>Expertise Areas</Label>
              <div className="flex flex-wrap gap-2 min-h-12 p-3 border rounded-md bg-muted/20 items-center">
                {formData.specializations.length === 0 ? (
                  <span className="text-muted-foreground text-sm italic">No expertise areas added yet.</span>
                ) : (
                  formData.specializations.map((area, index) => (
                    <Badge key={index} variant="secondary" className="px-3 py-1 text-sm bg-primary/10 text-primary border-primary/20">
                      {area}
                      {isEditing && (
                        <button
                          onClick={() => handleRemoveSpecialization(index)}
                          className="ml-2 hover:text-red-500 text-muted-foreground transition-colors focus:outline-none"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      )}
                    </Badge>
                  ))
                )}
              </div>

              {isEditing && (
                <div className="flex gap-2">
                  <Input
                    value={newSpecialization}
                    onChange={(e) => setNewSpecialization(e.target.value)}
                    placeholder="Add new expertise area..."
                    className="flex-1"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddSpecialization();
                      }
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleAddSpecialization}
                  >
                    <Plus className="w-4 h-4 mr-1" /> Add
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Plus className="w-5 h-5 text-purple-500" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button variant="outline" className="flex-1 bg-background" disabled={isEditing}>
                <FileText className="w-4 h-4 mr-2" />
                Download Teaching Portfolio
              </Button>
              <Button variant="outline" className="flex-1 bg-background" disabled={isEditing}>
                <Calendar className="w-4 h-4 mr-2" />
                Share Availability Calendar
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </FacultyLayout>
  );
};

export default FacultyProfile;
