import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogDescription,
} from "@/components/ui/dialog";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import AdminLayout from "@/components/AdminLayout";
import { useAuth } from "@/contexts/AuthContext";
import { useClubs, Club } from "@/contexts/ClubContext";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";
import {
    Plus,
    Users,
    Edit,
    Trash2,
    Eye,
    Loader2,
    MapPin,
    Star,
    UsersRound,
    Calendar,
    AlertTriangle,
    Mail,
    GraduationCap,
} from "lucide-react";

interface ClubMember {
    _id: string;
    name: string;
    collegeId: string;
    email: string;
    branch?: string;
    year?: string;
    section?: string;
}

const AdminClubs = () => {
    const { userData } = useAuth();
    const { clubs, loading, error, addClub, updateClub, deleteClub, fetchClubs } = useClubs();
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("all");

    // View modal state
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [viewClub, setViewClub] = useState<Club | null>(null);
    const [members, setMembers] = useState<ClubMember[]>([]);
    const [loadingMembers, setLoadingMembers] = useState(false);

    // Edit modal state
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editClub, setEditClub] = useState<any>(null);
    const [isEditing, setIsEditing] = useState(false);

    // Delete confirmation state
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState<Club | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const [newClub, setNewClub] = useState({
        club_id: "",
        name: "",
        category: "",
        description: "",
        foundedYear: "",
        presidentName: "",
        presidentEmail: "",
        presidentPhone: "",
        advisorName: "",
        advisorEmail: "",
        advisorDepartment: "",
        venue: "",
        meetingSchedule: "",
        membershipFee: "Free",
        maxMembers: "",
        eligibility: "All Students",
        achievements: "",
        recruitmentStatus: "Open",
        instagram: "",
        linkedin: "",
        website: "",
        featured: false,
    });

    // Generate unique Club ID
    const generateClubId = () => {
        const name = newClub.name.replace(/\s+/g, "").toUpperCase().slice(0, 8);
        return `${name || "CLUB"}${new Date().getFullYear()}`;
    };

    const handleAddClub = async () => {
        if (!newClub.club_id || !newClub.name || !newClub.category || !newClub.description) {
            toast({
                title: "Missing Fields",
                description: "Please fill in Club ID, Name, Category, and Description.",
                variant: "destructive",
            });
            return;
        }

        const clubData = {
            club_id: newClub.club_id,
            name: newClub.name,
            category: newClub.category,
            description: newClub.description,
            foundedYear: newClub.foundedYear ? parseInt(newClub.foundedYear) : undefined,
            president: {
                name: newClub.presidentName,
                email: newClub.presidentEmail,
                phone: newClub.presidentPhone,
            },
            faculty_advisor: {
                name: newClub.advisorName,
                email: newClub.advisorEmail,
                department: newClub.advisorDepartment,
            },
            venue: newClub.venue,
            meetingSchedule: newClub.meetingSchedule,
            membershipFee: newClub.membershipFee || "Free",
            maxMembers: newClub.maxMembers ? parseInt(newClub.maxMembers) : 0,
            eligibility: newClub.eligibility || "All Students",
            achievements: newClub.achievements ? newClub.achievements.split(",").map((a) => a.trim()) : [],
            recruitmentStatus: newClub.recruitmentStatus || "Open",
            socialLinks: {
                instagram: newClub.instagram,
                linkedin: newClub.linkedin,
                website: newClub.website,
            },
            featured: newClub.featured,
            status: "Active",
        };

        try {
            setIsSubmitting(true);
            await addClub(clubData as any);

            toast({
                title: "Success!",
                description: "Club registered successfully.",
            });

            // Reset form
            setNewClub({
                club_id: "",
                name: "",
                category: "",
                description: "",
                foundedYear: "",
                presidentName: "",
                presidentEmail: "",
                presidentPhone: "",
                advisorName: "",
                advisorEmail: "",
                advisorDepartment: "",
                venue: "",
                meetingSchedule: "",
                membershipFee: "Free",
                maxMembers: "",
                eligibility: "All Students",
                achievements: "",
                recruitmentStatus: "Open",
                instagram: "",
                linkedin: "",
                website: "",
                featured: false,
            });
            setIsAddModalOpen(false);
        } catch (err: any) {
            toast({
                title: "Error",
                description: err.message || "Failed to register club.",
                variant: "destructive",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    // ── View modal handler ──
    const handleViewClub = async (club: Club) => {
        setViewClub(club);
        setIsViewModalOpen(true);
        setLoadingMembers(true);
        try {
            const res = await api.get(`/clubs/${club._id}/members`);
            setMembers(res.members || []);
        } catch (err) {
            console.error("Error fetching club members:", err);
            setMembers([]);
        } finally {
            setLoadingMembers(false);
        }
    };

    // ── Edit modal handler ──
    const handleOpenEdit = (club: Club) => {
        setEditClub({
            ...club,
            presidentName: club.president?.name || "",
            presidentEmail: club.president?.email || "",
            presidentPhone: club.president?.phone || "",
            advisorName: club.faculty_advisor?.name || "",
            advisorEmail: club.faculty_advisor?.email || "",
            advisorDepartment: club.faculty_advisor?.department || "",
            achievements: Array.isArray(club.achievements) ? club.achievements.join(", ") : (club.achievements || ""),
            instagram: club.socialLinks?.instagram || "",
            linkedin: club.socialLinks?.linkedin || "",
            website: club.socialLinks?.website || "",
            foundedYear: club.foundedYear ? String(club.foundedYear) : "",
            maxMembers: club.maxMembers ? String(club.maxMembers) : "",
        });
        setIsEditModalOpen(true);
    };

    const handleSaveEdit = async () => {
        if (!editClub) return;
        setIsEditing(true);
        try {
            const updates = {
                name: editClub.name,
                category: editClub.category,
                description: editClub.description,
                foundedYear: editClub.foundedYear ? parseInt(editClub.foundedYear) : undefined,
                president: {
                    name: editClub.presidentName,
                    email: editClub.presidentEmail,
                    phone: editClub.presidentPhone,
                },
                faculty_advisor: {
                    name: editClub.advisorName,
                    email: editClub.advisorEmail,
                    department: editClub.advisorDepartment,
                },
                venue: editClub.venue,
                meetingSchedule: editClub.meetingSchedule,
                membershipFee: editClub.membershipFee || "Free",
                maxMembers: editClub.maxMembers ? parseInt(editClub.maxMembers) : 0,
                eligibility: editClub.eligibility || "All Students",
                achievements: editClub.achievements
                    ? editClub.achievements.split(",").map((a: string) => a.trim())
                    : [],
                recruitmentStatus: editClub.recruitmentStatus || "Open",
                socialLinks: {
                    instagram: editClub.instagram,
                    linkedin: editClub.linkedin,
                    website: editClub.website,
                },
                featured: editClub.featured,
                status: editClub.status,
            };

            await updateClub(editClub._id, updates);
            toast({ title: "Success", description: "Club updated successfully." });
            setIsEditModalOpen(false);
        } catch (err: any) {
            toast({
                title: "Error",
                description: err.message || "Failed to update club.",
                variant: "destructive",
            });
        } finally {
            setIsEditing(false);
        }
    };

    // ── Delete handler ──
    const handleDeleteClick = (club: Club) => {
        setDeleteTarget(club);
        setIsDeleteDialogOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!deleteTarget) return;
        setIsDeleting(true);
        try {
            await deleteClub(deleteTarget._id);
            toast({
                title: "Deleted",
                description: `"${deleteTarget.name}" and all its data have been deleted.`,
            });
            setIsDeleteDialogOpen(false);
            setDeleteTarget(null);
        } catch (err: any) {
            toast({
                title: "Error",
                description: err.message || "Failed to delete club.",
                variant: "destructive",
            });
        } finally {
            setIsDeleting(false);
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "Active":
                return <Badge className="bg-green-500">Active</Badge>;
            case "Inactive":
                return <Badge variant="destructive">Inactive</Badge>;
            case "On Hold":
                return <Badge variant="secondary">On Hold</Badge>;
            default:
                return <Badge variant="secondary">{status}</Badge>;
        }
    };

    const getRecruitmentBadge = (status: string) => {
        switch (status) {
            case "Open":
                return <Badge className="bg-blue-500">Recruiting</Badge>;
            case "Closed":
                return <Badge variant="secondary">Closed</Badge>;
            case "Coming Soon":
                return <Badge variant="outline">Coming Soon</Badge>;
            default:
                return <Badge variant="secondary">{status}</Badge>;
        }
    };

    const getCategoryBadge = (category: string) => {
        const colors: { [key: string]: string } = {
            Technical: "bg-blue-500",
            Cultural: "bg-purple-500",
            Sports: "bg-green-500",
            Literary: "bg-amber-500",
            Social: "bg-pink-500",
            Professional: "bg-cyan-500",
            Hobby: "bg-orange-500",
            Other: "bg-gray-500",
        };
        return <Badge className={colors[category] || "bg-gray-500"}>{category}</Badge>;
    };

    // Map branch codes to short names
    const branchShortName = (branch: string | undefined): string => {
        if (!branch) return "—";
        const map: Record<string, string> = {
            "Computer Science and Engineering": "CSE",
            "Computer Science": "CSE",
            "Computer Science & Engineering": "CSE",
            "Information Technology": "IT",
            "Electronics and Communication Engineering": "ECE",
            "Electronics & Communication Engineering": "ECE",
            "Electronics & Communication": "ECE",
            "Electrical and Electronics Engineering": "EEE",
            "Electrical & Electronics Engineering": "EEE",
            "Electrical & Electronics": "EEE",
            "Mechanical Engineering": "MECH",
            "Civil Engineering": "CIVIL",
            "Chemical Engineering": "CHEM",
            "Aerospace Engineering": "AERO",
            "Biotechnology": "BIOTECH",
            "Data Science": "DS",
            "Computer Science & Business Systems": "CSBS",
        };
        return map[branch] || branch;
    };

    const filteredClubs = clubs.filter((club) => {
        const matchesSearch =
            club.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            club.club_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (club.description?.toLowerCase().includes(searchTerm.toLowerCase()) || false);
        const matchesCategory =
            categoryFilter === "all" || club.category === categoryFilter;
        return matchesSearch && matchesCategory;
    });

    return (
        <AdminLayout>
            <main className="p-6">
                <div className="max-w-7xl mx-auto space-y-6">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
                                <UsersRound className="w-8 h-8 text-primary" />
                                Club Management
                            </h1>
                            <p className="text-muted-foreground mt-1">
                                Manage campus clubs and organizations
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
                                <DialogTrigger asChild>
                                    <Button className="flex items-center gap-2 bg-primary hover:bg-primary/90">
                                        <Plus className="w-4 h-4" />
                                        Register Club
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                                    <DialogHeader>
                                        <DialogTitle className="text-xl font-bold flex items-center gap-2">
                                            <UsersRound className="w-6 h-6 text-primary" />
                                            Register New Club
                                        </DialogTitle>
                                    </DialogHeader>
                                    <div className="space-y-5 py-4">
                                        {/* Club ID and Name */}
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label className="text-sm font-semibold">
                                                    Club ID <span className="text-destructive">*</span>
                                                </Label>
                                                <div className="flex gap-2">
                                                    <Input
                                                        value={newClub.club_id}
                                                        onChange={(e) =>
                                                            setNewClub({ ...newClub, club_id: e.target.value.toUpperCase() })
                                                        }
                                                        placeholder="e.g., IEEE2025"
                                                        className="flex-1"
                                                    />
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => setNewClub({ ...newClub, club_id: generateClubId() })}
                                                    >
                                                        Auto
                                                    </Button>
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-sm font-semibold">
                                                    Club Name <span className="text-destructive">*</span>
                                                </Label>
                                                <Input
                                                    value={newClub.name}
                                                    onChange={(e) =>
                                                        setNewClub({ ...newClub, name: e.target.value })
                                                    }
                                                    placeholder="e.g., IEEE Student Branch"
                                                />
                                            </div>
                                        </div>

                                        {/* Category */}
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label className="text-sm font-semibold">
                                                    Category <span className="text-destructive">*</span>
                                                </Label>
                                                <Select
                                                    value={newClub.category}
                                                    onValueChange={(value) =>
                                                        setNewClub({ ...newClub, category: value })
                                                    }
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select category" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="Technical">Technical</SelectItem>
                                                        <SelectItem value="Cultural">Cultural</SelectItem>
                                                        <SelectItem value="Sports">Sports</SelectItem>
                                                        <SelectItem value="Literary">Literary</SelectItem>
                                                        <SelectItem value="Social">Social</SelectItem>
                                                        <SelectItem value="Professional">Professional</SelectItem>
                                                        <SelectItem value="Hobby">Hobby</SelectItem>
                                                        <SelectItem value="Other">Other</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-sm font-semibold">Founded Year</Label>
                                                <Input
                                                    type="number"
                                                    value={newClub.foundedYear}
                                                    onChange={(e) =>
                                                        setNewClub({ ...newClub, foundedYear: e.target.value })
                                                    }
                                                    placeholder="e.g., 2020"
                                                />
                                            </div>
                                        </div>

                                        {/* Description */}
                                        <div className="space-y-2">
                                            <Label className="text-sm font-semibold">
                                                Description <span className="text-destructive">*</span>
                                            </Label>
                                            <Textarea
                                                value={newClub.description}
                                                onChange={(e) =>
                                                    setNewClub({ ...newClub, description: e.target.value })
                                                }
                                                placeholder="Club objectives, activities..."
                                                rows={3}
                                            />
                                        </div>

                                        {/* President and Advisor */}
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label className="text-sm font-semibold">President Name</Label>
                                                <Input
                                                    value={newClub.presidentName}
                                                    onChange={(e) =>
                                                        setNewClub({ ...newClub, presidentName: e.target.value })
                                                    }
                                                    placeholder="President Name"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-sm font-semibold">Faculty Advisor</Label>
                                                <Input
                                                    value={newClub.advisorName}
                                                    onChange={(e) =>
                                                        setNewClub({ ...newClub, advisorName: e.target.value })
                                                    }
                                                    placeholder="Advisor Name"
                                                />
                                            </div>
                                        </div>

                                        {/* Venue and Schedule */}
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label className="text-sm font-semibold">Venue</Label>
                                                <Input
                                                    value={newClub.venue}
                                                    onChange={(e) =>
                                                        setNewClub({ ...newClub, venue: e.target.value })
                                                    }
                                                    placeholder="Room 201, CS Block"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-sm font-semibold">Meeting Schedule</Label>
                                                <Input
                                                    value={newClub.meetingSchedule}
                                                    onChange={(e) =>
                                                        setNewClub({ ...newClub, meetingSchedule: e.target.value })
                                                    }
                                                    placeholder="Every Saturday, 3 PM"
                                                />
                                            </div>
                                        </div>

                                        {/* Featured Toggle */}
                                        <div className="flex items-center justify-between rounded-lg border border-border bg-muted/20 p-3">
                                            <div>
                                                <p className="text-sm font-medium text-foreground">
                                                    Featured Club
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    Highlight on student dashboard
                                                </p>
                                            </div>
                                            <Switch
                                                checked={newClub.featured}
                                                onCheckedChange={(checked) =>
                                                    setNewClub({ ...newClub, featured: checked })
                                                }
                                            />
                                        </div>

                                        {/* Form Actions */}
                                        <div className="flex justify-end gap-3 pt-4 border-t">
                                            <Button
                                                variant="outline"
                                                onClick={() => setIsAddModalOpen(false)}
                                                disabled={isSubmitting}
                                            >
                                                Cancel
                                            </Button>
                                            <Button
                                                onClick={handleAddClub}
                                                disabled={isSubmitting}
                                                className="min-w-[140px]"
                                            >
                                                {isSubmitting ? (
                                                    <>
                                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                        Creating...
                                                    </>
                                                ) : (
                                                    <>
                                                        <Plus className="w-4 h-4 mr-2" />
                                                        Register Club
                                                    </>
                                                )}
                                            </Button>
                                        </div>
                                    </div>
                                </DialogContent>
                            </Dialog>
                        </div>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <Card>
                            <CardContent className="p-4 flex items-center gap-4">
                                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                                    <UsersRound className="w-6 h-6 text-primary" />
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Total Clubs</p>
                                    <p className="text-2xl font-bold">{clubs.length}</p>
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-4 flex items-center gap-4">
                                <div className="w-12 h-12 rounded-lg bg-green-500/10 flex items-center justify-center">
                                    <Users className="w-6 h-6 text-green-500" />
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Active</p>
                                    <p className="text-2xl font-bold">
                                        {clubs.filter((c) => c.status === "Active").length}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-4 flex items-center gap-4">
                                <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center">
                                    <Star className="w-6 h-6 text-blue-500" />
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Recruiting</p>
                                    <p className="text-2xl font-bold">
                                        {clubs.filter((c) => c.recruitmentStatus === "Open").length}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-4 flex items-center gap-4">
                                <div className="w-12 h-12 rounded-lg bg-yellow-500/10 flex items-center justify-center">
                                    <Star className="w-6 h-6 text-yellow-500 fill-current" />
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Featured</p>
                                    <p className="text-2xl font-bold">
                                        {clubs.filter((c) => c.featured).length}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Filters */}
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex flex-col md:flex-row gap-4">
                                <div className="flex-1">
                                    <Input
                                        placeholder="Search clubs by name or ID..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full"
                                    />
                                </div>
                                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                                    <SelectTrigger className="w-full md:w-[200px]">
                                        <SelectValue placeholder="Category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Categories</SelectItem>
                                        <SelectItem value="Technical">Technical</SelectItem>
                                        <SelectItem value="Cultural">Cultural</SelectItem>
                                        <SelectItem value="Sports">Sports</SelectItem>
                                        <SelectItem value="Literary">Literary</SelectItem>
                                        <SelectItem value="Social">Social</SelectItem>
                                        <SelectItem value="Professional">Professional</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Error Display */}
                    {error && (
                        <Card className="border-destructive bg-destructive/10">
                            <CardContent className="p-4 text-destructive">
                                {error}
                            </CardContent>
                        </Card>
                    )}

                    {/* Loading State */}
                    {loading && clubs.length === 0 && (
                        <Card>
                            <CardContent className="p-12 text-center">
                                <Loader2 className="w-12 h-12 text-primary mx-auto mb-4 animate-spin" />
                                <p className="text-muted-foreground">Loading clubs...</p>
                            </CardContent>
                        </Card>
                    )}

                    {/* Clubs List */}
                    {!loading && filteredClubs.length === 0 ? (
                        <Card>
                            <CardContent className="p-12 text-center">
                                <UsersRound className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-foreground mb-2">
                                    No clubs found
                                </h3>
                                <p className="text-muted-foreground mb-4">
                                    {clubs.length === 0
                                        ? "Start by registering your first club."
                                        : "Try adjusting your search or filters."}
                                </p>
                                <Button onClick={() => setIsAddModalOpen(true)}>
                                    <Plus className="w-4 h-4 mr-2" />
                                    Register First Club
                                </Button>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="grid gap-4">
                            {filteredClubs.map((club) => (
                                <Card key={club._id} className="hover:shadow-lg transition-shadow">
                                    <CardContent className="p-6">
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-start gap-4">
                                                <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                                                    <UsersRound className="w-8 h-8 text-primary" />
                                                </div>
                                                <div className="space-y-2">
                                                    <div className="flex items-center gap-2">
                                                        <h3 className="text-xl font-bold text-foreground">
                                                            {club.name}
                                                        </h3>
                                                        {club.featured && (
                                                            <Star className="w-5 h-5 text-yellow-500 fill-current" />
                                                        )}
                                                    </div>
                                                    <div className="flex items-center gap-2 flex-wrap">
                                                        <Badge variant="outline">{club.club_id}</Badge>
                                                        {getCategoryBadge(club.category)}
                                                        {getStatusBadge(club.status)}
                                                        {getRecruitmentBadge(club.recruitmentStatus)}
                                                    </div>
                                                    <p className="text-muted-foreground text-sm line-clamp-2">
                                                        {club.description}
                                                    </p>
                                                    <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                                                        {club.venue && (
                                                            <span className="flex items-center gap-1">
                                                                <MapPin className="w-4 h-4" />
                                                                {club.venue}
                                                            </span>
                                                        )}
                                                        {club.meetingSchedule && (
                                                            <span className="flex items-center gap-1">
                                                                <Calendar className="w-4 h-4" />
                                                                {club.meetingSchedule}
                                                            </span>
                                                        )}
                                                        <span className="flex items-center gap-1">
                                                            <Users className="w-4 h-4" />
                                                            {club.memberCount || 0} members
                                                        </span>
                                                    </div>
                                                    {club.president?.name && (
                                                        <p className="text-sm text-muted-foreground">
                                                            <strong>President:</strong> {club.president.name}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    title="View Details"
                                                    onClick={() => handleViewClub(club)}
                                                >
                                                    <Eye className="w-4 h-4 mr-1" />
                                                    View
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    title="Edit Club"
                                                    onClick={() => handleOpenEdit(club)}
                                                >
                                                    <Edit className="w-4 h-4 mr-1" />
                                                    Edit
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    title="Delete Club"
                                                    onClick={() => handleDeleteClick(club)}
                                                    className="text-red-500 hover:text-red-700"
                                                >
                                                    <Trash2 className="w-4 h-4 mr-1" />
                                                    Delete
                                                </Button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>

                {/* ═══ VIEW MODAL ═══ */}
                <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
                    <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle className="text-xl font-bold flex items-center gap-2">
                                <UsersRound className="w-5 h-5 text-primary" />
                                {viewClub?.name}
                            </DialogTitle>
                            <DialogDescription className="text-primary font-medium">
                                {viewClub?.club_id} · {viewClub?.category}
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4 py-2">
                            {/* Club summary row */}
                            <div className="grid grid-cols-3 gap-3">
                                <div className="p-3 rounded-lg bg-muted/50 text-center">
                                    <p className="text-xs text-muted-foreground">Status</p>
                                    <p className="font-semibold text-sm">{viewClub?.status}</p>
                                </div>
                                <div className="p-3 rounded-lg bg-muted/50 text-center">
                                    <p className="text-xs text-muted-foreground">Recruitment</p>
                                    <p className="font-semibold text-sm">{viewClub?.recruitmentStatus}</p>
                                </div>
                                <div className="p-3 rounded-lg bg-muted/50 text-center">
                                    <p className="text-xs text-muted-foreground">Members</p>
                                    <p className="font-semibold text-sm">{viewClub?.memberCount || 0}</p>
                                </div>
                            </div>

                            {/* Club Details */}
                            {viewClub?.description && (
                                <div className="p-3 rounded-lg bg-muted/30 border">
                                    <p className="text-xs text-muted-foreground font-medium mb-1">Description</p>
                                    <p className="text-sm">{viewClub.description}</p>
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-3">
                                {viewClub?.venue && (
                                    <div className="p-3 rounded-lg bg-muted/30 border">
                                        <p className="text-xs text-muted-foreground font-medium mb-1">Venue</p>
                                        <p className="text-sm flex items-center gap-1">
                                            <MapPin className="w-3 h-3" /> {viewClub.venue}
                                        </p>
                                    </div>
                                )}
                                {viewClub?.meetingSchedule && (
                                    <div className="p-3 rounded-lg bg-muted/30 border">
                                        <p className="text-xs text-muted-foreground font-medium mb-1">Schedule</p>
                                        <p className="text-sm flex items-center gap-1">
                                            <Calendar className="w-3 h-3" /> {viewClub.meetingSchedule}
                                        </p>
                                    </div>
                                )}
                                {viewClub?.president?.name && (
                                    <div className="p-3 rounded-lg bg-muted/30 border">
                                        <p className="text-xs text-muted-foreground font-medium mb-1">President</p>
                                        <p className="text-sm">{viewClub.president.name}</p>
                                        {viewClub.president.email && (
                                            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                                                <Mail className="w-3 h-3" /> {viewClub.president.email}
                                            </p>
                                        )}
                                    </div>
                                )}
                                {viewClub?.faculty_advisor?.name && (
                                    <div className="p-3 rounded-lg bg-muted/30 border">
                                        <p className="text-xs text-muted-foreground font-medium mb-1">Faculty Advisor</p>
                                        <p className="text-sm">{viewClub.faculty_advisor.name}</p>
                                        {viewClub.faculty_advisor.department && (
                                            <p className="text-xs text-muted-foreground mt-0.5">
                                                {viewClub.faculty_advisor.department}
                                            </p>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Joined Students */}
                            <div>
                                <h3 className="font-semibold text-sm flex items-center gap-2 mb-3">
                                    <Users className="w-4 h-4 text-primary" />
                                    Joined Students ({members.length})
                                </h3>

                                {loadingMembers ? (
                                    <div className="py-8 text-center">
                                        <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-primary" />
                                        <p className="text-sm text-muted-foreground">Loading members...</p>
                                    </div>
                                ) : members.length === 0 ? (
                                    <div className="py-8 text-center border rounded-lg bg-muted/20">
                                        <Users className="w-10 h-10 mx-auto mb-2 text-muted-foreground/40" />
                                        <p className="text-sm text-muted-foreground">No students have joined yet</p>
                                    </div>
                                ) : (
                                    <div className="border rounded-lg overflow-hidden">
                                        <table className="w-full text-sm">
                                            <thead>
                                                <tr className="bg-muted/50 border-b">
                                                    <th className="text-left py-2.5 px-3 font-medium text-muted-foreground">#</th>
                                                    <th className="text-left py-2.5 px-3 font-medium text-muted-foreground">Student</th>
                                                    <th className="text-left py-2.5 px-3 font-medium text-muted-foreground">Roll No</th>
                                                    <th className="text-left py-2.5 px-3 font-medium text-muted-foreground">Branch</th>
                                                    <th className="text-left py-2.5 px-3 font-medium text-muted-foreground">Email</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {members.map((member, idx) => (
                                                    <tr key={member._id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                                                        <td className="py-2.5 px-3 text-muted-foreground">{idx + 1}</td>
                                                        <td className="py-2.5 px-3">
                                                            <div className="flex items-center gap-2">
                                                                <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-xs font-semibold text-primary">
                                                                    {member.name?.charAt(0) || "?"}
                                                                </div>
                                                                <span className="font-medium">{member.name || "Unknown"}</span>
                                                            </div>
                                                        </td>
                                                        <td className="py-2.5 px-3 font-mono text-xs">{member.collegeId || "—"}</td>
                                                        <td className="py-2.5 px-3">{branchShortName(member.branch)}</td>
                                                        <td className="py-2.5 px-3 text-muted-foreground text-xs">{member.email || "—"}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>

                {/* ═══ EDIT MODAL ═══ */}
                <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
                    <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle className="text-xl font-bold">Edit Club Details</DialogTitle>
                            <DialogDescription>Update the details for this club.</DialogDescription>
                        </DialogHeader>

                        {editClub && (
                            <div className="space-y-5 py-2">
                                {/* Club ID (read-only) & Name */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label className="text-sm font-semibold">Club ID</Label>
                                        <Input value={editClub.club_id} disabled className="opacity-60" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-sm font-semibold">Club Name</Label>
                                        <Input
                                            value={editClub.name}
                                            onChange={(e) => setEditClub({ ...editClub, name: e.target.value })}
                                        />
                                    </div>
                                </div>

                                {/* Category & Founded Year */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label className="text-sm font-semibold">Category</Label>
                                        <Select
                                            value={editClub.category}
                                            onValueChange={(v) => setEditClub({ ...editClub, category: v })}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Technical">Technical</SelectItem>
                                                <SelectItem value="Cultural">Cultural</SelectItem>
                                                <SelectItem value="Sports">Sports</SelectItem>
                                                <SelectItem value="Literary">Literary</SelectItem>
                                                <SelectItem value="Social">Social</SelectItem>
                                                <SelectItem value="Professional">Professional</SelectItem>
                                                <SelectItem value="Hobby">Hobby</SelectItem>
                                                <SelectItem value="Other">Other</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-sm font-semibold">Founded Year</Label>
                                        <Input
                                            type="number"
                                            value={editClub.foundedYear}
                                            onChange={(e) => setEditClub({ ...editClub, foundedYear: e.target.value })}
                                            placeholder="e.g., 2020"
                                        />
                                    </div>
                                </div>

                                {/* Description */}
                                <div className="space-y-2">
                                    <Label className="text-sm font-semibold">Description</Label>
                                    <Textarea
                                        value={editClub.description || ""}
                                        onChange={(e) => setEditClub({ ...editClub, description: e.target.value })}
                                        rows={3}
                                    />
                                </div>

                                {/* President & Advisor */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label className="text-sm font-semibold">President Name</Label>
                                        <Input
                                            value={editClub.presidentName}
                                            onChange={(e) => setEditClub({ ...editClub, presidentName: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-sm font-semibold">President Email</Label>
                                        <Input
                                            value={editClub.presidentEmail}
                                            onChange={(e) => setEditClub({ ...editClub, presidentEmail: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label className="text-sm font-semibold">Faculty Advisor</Label>
                                        <Input
                                            value={editClub.advisorName}
                                            onChange={(e) => setEditClub({ ...editClub, advisorName: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-sm font-semibold">Advisor Department</Label>
                                        <Input
                                            value={editClub.advisorDepartment}
                                            onChange={(e) => setEditClub({ ...editClub, advisorDepartment: e.target.value })}
                                        />
                                    </div>
                                </div>

                                {/* Venue & Schedule */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label className="text-sm font-semibold">Venue</Label>
                                        <Input
                                            value={editClub.venue || ""}
                                            onChange={(e) => setEditClub({ ...editClub, venue: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-sm font-semibold">Meeting Schedule</Label>
                                        <Input
                                            value={editClub.meetingSchedule || ""}
                                            onChange={(e) => setEditClub({ ...editClub, meetingSchedule: e.target.value })}
                                        />
                                    </div>
                                </div>

                                {/* Status & Recruitment */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label className="text-sm font-semibold">Status</Label>
                                        <Select
                                            value={editClub.status}
                                            onValueChange={(v) => setEditClub({ ...editClub, status: v })}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Active">Active</SelectItem>
                                                <SelectItem value="Inactive">Inactive</SelectItem>
                                                <SelectItem value="On Hold">On Hold</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-sm font-semibold">Recruitment Status</Label>
                                        <Select
                                            value={editClub.recruitmentStatus}
                                            onValueChange={(v) => setEditClub({ ...editClub, recruitmentStatus: v })}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Open">Open</SelectItem>
                                                <SelectItem value="Closed">Closed</SelectItem>
                                                <SelectItem value="Coming Soon">Coming Soon</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                {/* Membership Fee & Max Members */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label className="text-sm font-semibold">Membership Fee</Label>
                                        <Input
                                            value={editClub.membershipFee || ""}
                                            onChange={(e) => setEditClub({ ...editClub, membershipFee: e.target.value })}
                                            placeholder="Free"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-sm font-semibold">Max Members (0 = unlimited)</Label>
                                        <Input
                                            type="number"
                                            value={editClub.maxMembers}
                                            onChange={(e) => setEditClub({ ...editClub, maxMembers: e.target.value })}
                                            placeholder="0"
                                        />
                                    </div>
                                </div>

                                {/* Achievements */}
                                <div className="space-y-2">
                                    <Label className="text-sm font-semibold">Achievements</Label>
                                    <Input
                                        value={editClub.achievements || ""}
                                        onChange={(e) => setEditClub({ ...editClub, achievements: e.target.value })}
                                        placeholder="e.g., National Hackathon Winners, Best Club 2024"
                                    />
                                    <p className="text-xs text-muted-foreground">Separate with commas</p>
                                </div>

                                {/* Featured Toggle */}
                                <div className="flex items-center justify-between rounded-lg border border-border bg-muted/20 p-3">
                                    <div>
                                        <p className="text-sm font-medium text-foreground">Featured Club</p>
                                        <p className="text-xs text-muted-foreground">
                                            Highlight on student dashboard
                                        </p>
                                    </div>
                                    <Switch
                                        checked={editClub.featured}
                                        onCheckedChange={(checked) =>
                                            setEditClub({ ...editClub, featured: checked })
                                        }
                                    />
                                </div>

                                {/* Actions */}
                                <div className="flex justify-end gap-3 pt-3 border-t">
                                    <Button
                                        variant="outline"
                                        onClick={() => setIsEditModalOpen(false)}
                                        disabled={isEditing}
                                    >
                                        Cancel
                                    </Button>
                                    <Button onClick={handleSaveEdit} disabled={isEditing} className="min-w-[100px]">
                                        {isEditing ? (
                                            <>
                                                <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...
                                            </>
                                        ) : (
                                            "Save Changes"
                                        )}
                                    </Button>
                                </div>
                            </div>
                        )}
                    </DialogContent>
                </Dialog>

                {/* ═══ DELETE CONFIRMATION ═══ */}
                <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle className="flex items-center gap-2">
                                <AlertTriangle className="w-5 h-5 text-red-500" />
                                Delete Club Permanently?
                            </AlertDialogTitle>
                            <AlertDialogDescription className="space-y-2">
                                <p>
                                    You are about to delete <strong>"{deleteTarget?.name}"</strong> (
                                    <strong>{deleteTarget?.club_id}</strong>).
                                </p>
                                {(deleteTarget?.memberCount || 0) > 0 && (
                                    <p className="text-red-500 font-medium">
                                        ⚠️ {deleteTarget!.memberCount} student(s) have joined this club. Their membership data will also be removed.
                                    </p>
                                )}
                                <p>This action cannot be undone.</p>
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                                onClick={handleConfirmDelete}
                                disabled={isDeleting}
                                className="bg-red-600 hover:bg-red-700 text-white"
                            >
                                {isDeleting ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Deleting...
                                    </>
                                ) : (
                                    "Delete Club"
                                )}
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </main>
        </AdminLayout>
    );
};

export default AdminClubs;
