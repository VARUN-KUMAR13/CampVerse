import { useState } from "react";
import AdminLayout from "@/components/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { getStoredToken } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { Checkbox } from "@/components/ui/checkbox";
import { UserPlus, ShieldPlus, GraduationCap, Users } from "lucide-react";

export default function UserManagement() {
    const { userData } = useAuth();
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState("student");

    // Form states
    const [studentForm, setStudentForm] = useState({
        name: "", email: "", collegeId: "", branch: "", section: "", year: "I", academicBatch: "2026-2030"
    });

    const [facultyForm, setFacultyForm] = useState({
        name: "", email: "", collegeId: "", branch: "", section: "Z"
    });

    const [subAdminForm, setSubAdminForm] = useState({
        name: "", email: "", collegeId: "",
        permissions: {
            manageAttendance: false, manageEvents: false, manageClubs: false, manageNotifications: false, manageResults: false
        }
    });

    const generateCollegeId = (role: string) => {
        // Basic generator for visual
        const prefix = role === "student" ? "22B81A" : "FCL-";
        const rand = Math.floor(1000 + Math.random() * 9000);
        return `${prefix}${rand}`;
    };

    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:5000/api";

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        let payload: any = {};
        if (activeTab === "student") {
            payload = { ...studentForm, role: "student" };
        } else if (activeTab === "faculty") {
            payload = { ...facultyForm, role: "faculty" };
        } else {
            payload = { ...subAdminForm, role: "sub-admin" };
        }

        try {
            const response = await fetch(`${API_BASE_URL}/admin/users`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${getStoredToken()}`,
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.message || "Failed to create user");
            }

            toast({
                title: "User Created Successfully",
                description: `${payload.role} account created for ${payload.name}`,
            });

            // Reset logic
            if (activeTab === "student") setStudentForm({ ...studentForm, name: "", email: "", collegeId: "" });
            if (activeTab === "faculty") setFacultyForm({ ...facultyForm, name: "", email: "", collegeId: "" });
            if (activeTab === "sub-admin") setSubAdminForm({ ...subAdminForm, name: "", email: "", collegeId: "" });

        } catch (err: any) {
            toast({
                title: "Error",
                description: err.message,
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <AdminLayout>
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
                        <p className="text-muted-foreground mt-2">
                            Add new Students, Faculty, and Sub-Admins. Assign Roles & Permissions.
                        </p>
                    </div>
                </div>

                <Tabs defaultValue="student" onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-3 max-w-2xl mb-8">
                        <TabsTrigger value="student" className="flex items-center gap-2">
                            <GraduationCap className="w-4 h-4" /> Student
                        </TabsTrigger>
                        <TabsTrigger value="faculty" className="flex items-center gap-2">
                            <Users className="w-4 h-4" /> Faculty
                        </TabsTrigger>
                        <TabsTrigger value="sub-admin" className="flex items-center gap-2">
                            <ShieldPlus className="w-4 h-4" /> Sub-Admin
                        </TabsTrigger>
                    </TabsList>

                    <Card className="max-w-3xl">
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <UserPlus className="w-5 h-5 mr-2" /> Add {activeTab === "student" ? "Student" : activeTab === "faculty" ? "Faculty" : "Sub-Admin"}
                            </CardTitle>
                            <CardDescription>
                                Fill in the details carefully. Passwords are set by default to their ID.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Full Name</label>
                                        <Input
                                            required
                                            value={activeTab === "student" ? studentForm.name : activeTab === "faculty" ? facultyForm.name : subAdminForm.name}
                                            onChange={(e) => {
                                                const val = e.target.value;
                                                if (activeTab === "student") setStudentForm(f => ({ ...f, name: val }));
                                                if (activeTab === "faculty") setFacultyForm(f => ({ ...f, name: val }));
                                                if (activeTab === "sub-admin") setSubAdminForm(f => ({ ...f, name: val }));
                                            }}
                                            placeholder="e.g. John Doe"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Email Address</label>
                                        <Input
                                            type="email"
                                            required
                                            value={activeTab === "student" ? studentForm.email : activeTab === "faculty" ? facultyForm.email : subAdminForm.email}
                                            onChange={(e) => {
                                                const val = e.target.value;
                                                if (activeTab === "student") setStudentForm(f => ({ ...f, email: val }));
                                                if (activeTab === "faculty") setFacultyForm(f => ({ ...f, email: val }));
                                                if (activeTab === "sub-admin") setSubAdminForm(f => ({ ...f, email: val }));
                                            }}
                                            placeholder="e.g. jdoe@cvr.ac.in"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Unique ID</label>
                                        <div className="flex gap-2">
                                            <Input
                                                required
                                                value={activeTab === "student" ? studentForm.collegeId : activeTab === "faculty" ? facultyForm.collegeId : subAdminForm.collegeId}
                                                onChange={(e) => {
                                                    const val = e.target.value.toUpperCase();
                                                    if (activeTab === "student") setStudentForm(f => ({ ...f, collegeId: val }));
                                                    if (activeTab === "faculty") setFacultyForm(f => ({ ...f, collegeId: val }));
                                                    if (activeTab === "sub-admin") setSubAdminForm(f => ({ ...f, collegeId: val }));
                                                }}
                                                placeholder="e.g. 22B81A05C4"
                                            />
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={() => {
                                                    const val = generateCollegeId(activeTab);
                                                    if (activeTab === "student") setStudentForm(f => ({ ...f, collegeId: val }));
                                                    if (activeTab === "faculty") setFacultyForm(f => ({ ...f, collegeId: val }));
                                                    if (activeTab === "sub-admin") setSubAdminForm(f => ({ ...f, collegeId: val }));
                                                }}
                                            >
                                                Auto
                                            </Button>
                                        </div>
                                    </div>

                                    {activeTab !== "sub-admin" && (
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Branch</label>
                                            <Select
                                                value={activeTab === "student" ? studentForm.branch : facultyForm.branch}
                                                onValueChange={(val) => {
                                                    if (activeTab === "student") setStudentForm(f => ({ ...f, branch: val }));
                                                    if (activeTab === "faculty") setFacultyForm(f => ({ ...f, branch: val }));
                                                }}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select Branch" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="05">CSE</SelectItem>
                                                    <SelectItem value="12">IT</SelectItem>
                                                    <SelectItem value="04">ECE</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    )}

                                    {activeTab === "student" && (
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Academic Batch</label>
                                            <Input
                                                value={studentForm.academicBatch}
                                                onChange={e => setStudentForm(f => ({ ...f, academicBatch: e.target.value }))}
                                                placeholder="2026-2030"
                                            />
                                        </div>
                                    )}
                                    {activeTab === "student" && (
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Section</label>
                                            <Input
                                                value={studentForm.section}
                                                onChange={e => setStudentForm(f => ({ ...f, section: e.target.value.toUpperCase() }))}
                                                placeholder="A, B, C..."
                                                maxLength={1}
                                            />
                                        </div>
                                    )}

                                </div>

                                {/* Sub Admin Permissions section */}
                                {activeTab === "sub-admin" && (
                                    <div className="pt-4 border-t mt-6">
                                        <h3 className="text-lg font-semibold mb-4">Granular Permissions</h3>
                                        <div className="grid grid-cols-2 gap-4">
                                            {["manageAttendance", "manageEvents", "manageClubs", "manageNotifications", "manageResults"].map(perm => (
                                                <div key={perm} className="flex items-center space-x-2">
                                                    <Checkbox
                                                        id={perm}
                                                        checked={subAdminForm.permissions[perm as keyof typeof subAdminForm.permissions]}
                                                        onCheckedChange={(checked) =>
                                                            setSubAdminForm(f => ({
                                                                ...f,
                                                                permissions: { ...f.permissions, [perm]: checked }
                                                            }))
                                                        }
                                                    />
                                                    <label htmlFor={perm} className="text-sm font-medium leading-none cursor-pointer">
                                                        {perm.replace("manage", "Manage ")}
                                                    </label>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <Button type="submit" disabled={loading} className="w-full mt-6 bg-blue-600 hover:bg-blue-700">
                                    {loading ? "Processing..." : `Create ${activeTab === "student" ? "Student" : activeTab === "faculty" ? "Faculty" : "Sub-Admin"}`}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </Tabs>
            </div>
        </AdminLayout>
    );
}
