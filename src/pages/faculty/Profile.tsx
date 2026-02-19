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
import { Separator } from "@/components/ui/separator";
import { useState } from "react";
import { toast } from "sonner";
import { Pencil, Save, X, Plus, User } from "lucide-react";

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

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // TODO: Implement API call to save profile data
      // await updateFacultyProfile(facultyId, formData);

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

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
      <div className="grid gap-6 lg:grid-cols-[2fr,1fr]">
        <Card>
          <CardHeader className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarFallback className="text-lg">
                  {(formData.firstName[0] || "") + (formData.lastName[0] || "")}
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-2xl">{facultyId}</CardTitle>
                <CardDescription className="text-base text-muted-foreground">
                  {department}
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="secondary" className="text-sm">
                Faculty ID: {facultyId}
              </Badge>
              {isEditing && (
                <Badge variant="outline" className="text-sm text-blue-500 border-blue-500">
                  <Pencil className="w-3 h-3 mr-1" />
                  Editing
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Profile Information Section */}
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                <User className="w-4 h-4" />
                Profile Information
              </h3>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  {isEditing ? (
                    <Input
                      id="firstName"
                      value={formData.firstName}
                      onChange={(e) => handleInputChange("firstName", e.target.value)}
                      placeholder="Enter first name"
                    />
                  ) : (
                    <p className="font-medium text-foreground">{formData.firstName || "-"}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  {isEditing ? (
                    <Input
                      id="lastName"
                      value={formData.lastName}
                      onChange={(e) => handleInputChange("lastName", e.target.value)}
                      placeholder="Enter last name"
                    />
                  ) : (
                    <p className="font-medium text-foreground">{formData.lastName || "-"}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Department</Label>
                  <p className="font-medium text-foreground">{department}</p>
                  {isEditing && (
                    <p className="text-xs text-muted-foreground italic">Department cannot be changed</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="designation">Designation</Label>
                  {isEditing ? (
                    <Input
                      id="designation"
                      value={formData.designation}
                      onChange={(e) => handleInputChange("designation", e.target.value)}
                      placeholder="e.g., Assistant Professor"
                    />
                  ) : (
                    <p className="font-medium text-foreground">{formData.designation || "-"}</p>
                  )}
                </div>
              </div>
              <div className="mt-4 space-y-2">
                <Label htmlFor="bio">Bio</Label>
                {isEditing ? (
                  <Textarea
                    id="bio"
                    value={formData.bio}
                    onChange={(e) => handleInputChange("bio", e.target.value)}
                    placeholder="Enter your professional bio..."
                    rows={3}
                  />
                ) : (
                  <p className="font-medium text-foreground">{formData.bio || "-"}</p>
                )}
              </div>
            </div>

            <Separator />

            {/* Contact Information Section */}
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                Contact Information
              </h3>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium text-foreground">{facultyEmail}</p>
                  {isEditing && (
                    <p className="text-xs text-muted-foreground italic">Email cannot be changed</p>
                  )}
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Phone</p>
                  {isEditing ? (
                    <Input
                      value={formData.phone}
                      onChange={(e) => handleInputChange("phone", e.target.value)}
                      placeholder="+91 98765 43210"
                    />
                  ) : (
                    <p className="font-medium text-foreground">{formData.phone}</p>
                  )}
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Office Location</p>
                  {isEditing ? (
                    <Input
                      value={formData.officeLocation}
                      onChange={(e) => handleInputChange("officeLocation", e.target.value)}
                      placeholder="Block C, Room 308"
                    />
                  ) : (
                    <p className="font-medium text-foreground">{formData.officeLocation}</p>
                  )}
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Availability</p>
                  {isEditing ? (
                    <Input
                      value={formData.availability}
                      onChange={(e) => handleInputChange("availability", e.target.value)}
                      placeholder="Mon - Fri, 9:00 AM to 5:00 PM"
                    />
                  ) : (
                    <p className="font-medium text-foreground">{formData.availability}</p>
                  )}
                </div>
              </div>
            </div>

            <Separator />

            <div>
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                Professional Overview
              </h3>
              <div className="mt-4 grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Designation</p>
                  {isEditing ? (
                    <Input
                      value={formData.designation}
                      onChange={(e) => handleInputChange("designation", e.target.value)}
                      placeholder="Assistant Professor"
                    />
                  ) : (
                    <p className="font-medium text-foreground">{formData.designation}</p>
                  )}
                  <p className="text-sm text-muted-foreground">
                    Primary responsibility for teaching core subjects and guiding student projects.
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Expertise Areas</p>
                  <div className="flex flex-wrap gap-2">
                    {formData.specializations.map((area, index) => (
                      <Badge key={index} variant="outline" className="gap-1">
                        {area}
                        {isEditing && (
                          <button
                            onClick={() => handleRemoveSpecialization(index)}
                            className="ml-1 hover:text-red-500 transition-colors"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        )}
                      </Badge>
                    ))}
                  </div>
                  {isEditing && (
                    <div className="flex gap-2 mt-2">
                      <Input
                        value={newSpecialization}
                        onChange={(e) => setNewSpecialization(e.target.value)}
                        placeholder="Add new expertise..."
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
                        size="sm"
                        variant="outline"
                        onClick={handleAddSpecialization}
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Manage visibility and export reports</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {isEditing ? (
              <>
                <Button
                  className="w-full bg-green-600 hover:bg-green-700"
                  onClick={handleSave}
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <>
                      <Save className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={handleCancel}
                  disabled={isSaving}
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
              </>
            ) : (
              <Button className="w-full" onClick={() => setIsEditing(true)}>
                <Pencil className="w-4 h-4 mr-2" />
                Update Profile Details
              </Button>
            )}
            <Button variant="outline" className="w-full" disabled={isEditing}>
              Download Teaching Portfolio
            </Button>
            <Button variant="outline" className="w-full" disabled={isEditing}>
              Share Availability Calendar
            </Button>
          </CardContent>
        </Card>
      </div>
    </FacultyLayout>
  );
};

export default FacultyProfile;

