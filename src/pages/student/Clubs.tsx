import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import StudentLayout from "@/components/StudentLayout";
import { useAuth } from "@/contexts/AuthContext";
import { useClubs } from "@/contexts/ClubContext";
import { useToast } from "@/hooks/use-toast";
import {
  Search,
  Users,
  Heart,
  Calendar,
  Trophy,
  Code,
  Palette,
  Camera,
  ExternalLink,
  UserPlus,
  Loader2,
  MapPin,
  Star,
  UsersRound,
  CheckCircle,
} from "lucide-react";

const StudentClubs = () => {
  const { userData } = useAuth();
  const { clubs, loading, error, fetchClubs, joinClub } = useClubs();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [processingClubId, setProcessingClubId] = useState<string | null>(null);

  const isJoined = (club: any) => {
    if (!userData?.collegeId || !club.joinedStudents) return false;
    return club.joinedStudents.includes(userData.collegeId);
  };

  useEffect(() => {
    fetchClubs();
  }, []);

  const filteredClubs = clubs.filter((club) => {
    const matchesSearch =
      club.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      club.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      club.club_id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      categoryFilter === "all" ||
      club.category.toLowerCase() === categoryFilter.toLowerCase();
    const matchesStatus =
      statusFilter === "all" || club.recruitmentStatus === statusFilter;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case "technical":
        return <Code className="w-4 h-4" />;
      case "cultural":
        return <Palette className="w-4 h-4" />;
      case "sports":
        return <Trophy className="w-4 h-4" />;
      case "literary":
        return <Camera className="w-4 h-4" />;
      default:
        return <Users className="w-4 h-4" />;
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

  const getRecruitmentBadge = (status: string) => {
    switch (status) {
      case "Open":
        return <Badge className="bg-green-500">Recruiting</Badge>;
      case "Closed":
        return <Badge variant="secondary">Closed</Badge>;
      case "Coming Soon":
        return <Badge variant="outline">Coming Soon</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const handleJoinClub = async (clubId: string) => {
    try {
      setProcessingClubId(clubId);
      await joinClub(clubId);
      toast({
        title: "Joined!",
        description: "You have successfully joined the club.",
      });
    } catch (err: any) {
      console.error("Error joining club:", err);
      toast({
        title: "Error",
        description: err.message || "Failed to join club.",
        variant: "destructive",
      });
    } finally {
      setProcessingClubId(null);
    }
  };

  return (
    <StudentLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
              <UsersRound className="w-8 h-8 text-primary" />
              Student Clubs
            </h1>
            <p className="text-muted-foreground mt-1">
              Discover and join clubs that match your interests
            </p>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Find Clubs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="Search clubs..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select
                value={categoryFilter}
                onValueChange={setCategoryFilter}
              >
                <SelectTrigger className="w-full md:w-[200px]">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="technical">Technical</SelectItem>
                  <SelectItem value="cultural">Cultural</SelectItem>
                  <SelectItem value="sports">Sports</SelectItem>
                  <SelectItem value="literary">Literary</SelectItem>
                  <SelectItem value="social">Social</SelectItem>
                  <SelectItem value="hobby">Hobby</SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={statusFilter}
                onValueChange={setStatusFilter}
              >
                <SelectTrigger className="w-full md:w-[200px]">
                  <SelectValue placeholder="Recruitment" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Clubs</SelectItem>
                  <SelectItem value="Open">Recruiting</SelectItem>
                  <SelectItem value="Closed">Closed</SelectItem>
                  <SelectItem value="Coming Soon">Coming Soon</SelectItem>
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

        {/* Clubs Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {!loading && filteredClubs.length === 0 ? (
            <div className="col-span-full">
              <Card>
                <CardContent className="py-12 text-center">
                  <UsersRound className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-foreground mb-2">
                    No clubs found
                  </h3>
                  <p className="text-muted-foreground">
                    {clubs.length === 0
                      ? "No clubs have been registered yet."
                      : "Try adjusting your filters to discover more clubs."}
                  </p>
                </CardContent>
              </Card>
            </div>
          ) : (
            filteredClubs.map((club) => (
              <Card
                key={club._id}
                className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center text-white">
                        <UsersRound className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-foreground">
                            {club.name}
                          </h3>
                          {club.featured && (
                            <Star className="w-4 h-4 text-yellow-500 fill-current" />
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {club.foundedYear ? `Est. ${club.foundedYear}` : club.club_id}
                        </p>
                      </div>
                    </div>
                    {isJoined(club) ? (
                      <Button size="sm" disabled className="bg-primary">
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Joined
                      </Button>
                    ) : club.recruitmentStatus === "Open" && (
                      <Button
                        size="sm"
                        onClick={() => handleJoinClub(club._id)}
                        disabled={processingClubId === club._id}
                      >
                        {processingClubId === club._id ? (
                          <><Loader2 className="w-4 h-4 mr-1 animate-spin" /> Joining...</>
                        ) : (
                          <><UserPlus className="w-4 h-4 mr-1" /> Join</>
                        )}
                      </Button>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {getCategoryBadge(club.category)}
                    {getRecruitmentBadge(club.recruitmentStatus)}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {club.description}
                  </p>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-4 py-3 border-y">
                    <div className="text-center">
                      <div className="text-lg font-bold text-foreground">
                        {club.memberCount || 0}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Members
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-foreground">
                        {club.maxMembers || "∞"}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Max
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-foreground">
                        {club.membershipFee || "Free"}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Fee
                      </div>
                    </div>
                  </div>

                  {/* Details */}
                  <div className="space-y-2 text-sm text-muted-foreground">
                    {club.venue && (
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        <span>{club.venue}</span>
                      </div>
                    )}
                    {club.meetingSchedule && (
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span>{club.meetingSchedule}</span>
                      </div>
                    )}
                    {club.president?.name && (
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        <span>President: {club.president.name}</span>
                      </div>
                    )}
                  </div>

                  {/* Achievements */}
                  {club.achievements && club.achievements.length > 0 && (
                    <div>
                      <h4 className="font-medium text-sm mb-2 flex items-center gap-1">
                        <Trophy className="w-4 h-4" />
                        Achievements
                      </h4>
                      <div className="flex flex-wrap gap-1">
                        {club.achievements.slice(0, 2).map((achievement, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {achievement}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2 pt-2">
                    <Button size="sm" className="flex-1">
                      View Details
                      <ExternalLink className="w-3 h-3 ml-1" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </StudentLayout>
  );
};

export default StudentClubs;
