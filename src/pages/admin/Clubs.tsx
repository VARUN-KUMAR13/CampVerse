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
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import AdminSidebar from "@/components/AdminSidebar";
import { useAuth } from "@/contexts/AuthContext";
import { useClubs, Club } from "@/contexts/ClubContext";
import { useToast } from "@/hooks/use-toast";
import {
    Plus,
    Users,
    Edit,
    Trash2,
    Eye,
    RefreshCw,
    Loader2,
    MapPin,
    Star,
    UsersRound,
    Calendar,
    Mail,
    Phone,
    Globe,
} from "lucide-react";

const AdminClubs = () => {
    const { userData } = useAuth();
    const { clubs, loading, error, addClub, deleteClub, fetchClubs } = useClubs();
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("all");

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

    const handleDeleteClub = async (clubId: string) => {
        if (!confirm("Are you sure you want to delete this club?")) return;

        try {
            await deleteClub(clubId);
            toast({
                title: "Success",
                description: "Club deleted successfully.",
            });
        } catch (err: any) {
            toast({
                title: "Error",
                description: err.message || "Failed to delete club.",
                variant: "destructive",
            });
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
        <div className="flex min-h-screen bg-background">
            <AdminSidebar />
            <div className="flex-1 p-6">
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
                            <Button
                                variant="outline"
                                onClick={fetchClubs}
                                disabled={loading}
                                className="flex items-center gap-2"
                            >
                                {loading ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <RefreshCw className="w-4 h-4" />
                                )}
                                Refresh
                            </Button>
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
                                                <Button variant="outline" size="icon" title="View Details">
                                                    <Eye className="w-4 h-4" />
                                                </Button>
                                                <Button variant="outline" size="icon" title="Edit Club">
                                                    <Edit className="w-4 h-4" />
                                                </Button>
                                                <Button
                                                    variant="destructive"
                                                    size="icon"
                                                    title="Delete Club"
                                                    onClick={() => handleDeleteClub(club._id)}
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminClubs;
