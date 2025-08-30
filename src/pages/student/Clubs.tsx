import { useState } from "react";
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
import StudentSidebar from "@/components/StudentSidebar";
import StudentTopbar from "@/components/StudentTopbar";
import { useAuth } from "@/contexts/AuthContext";
import {
  Search,
  Users,
  Heart,
  Calendar,
  Trophy,
  Code,
  Palette,
  Gamepad2,
  Music,
  Camera,
  ExternalLink,
  UserPlus,
} from "lucide-react";

const StudentClubs = () => {
  const { userData } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [followedFilter, setFollowedFilter] = useState("all");

  const clubsData = [
    {
      id: "ENIGMA",
      name: "ENIGMA",
      fullName: "Engineering Initiative for Gaming and Multimedia Applications",
      description:
        "A technical club focused on game development, multimedia applications, and innovative engineering solutions. We organize workshops, hackathons, and gaming tournaments.",
      category: "Technical",
      members: 120,
      followers: 340,
      events: 15,
      achievementsCount: 8,
      isFollowing: true,
      established: "2018",
      president: "Arjun Sharma",
      activities: [
        "Game Development Workshops",
        "Multimedia Projects",
        "Gaming Tournaments",
        "Tech Talks",
      ],
      upcomingEvents: [
        {
          title: "Unity Workshop",
          date: "2025-02-15",
          type: "Workshop",
        },
        {
          title: "Gaming Tournament",
          date: "2025-02-20",
          type: "Competition",
        },
      ],
      achievements: [
        "Best Technical Club 2024",
        "Most Innovative Project Award",
        "Excellence in Game Development",
      ],
      icon: <Gamepad2 className="w-6 h-6" />,
      color: "bg-purple-500",
    },
    {
      id: "IEEE_CS",
      name: "IEEE Computer Society",
      fullName: "IEEE Computational Intelligence Society",
      description:
        "Professional society dedicated to advancing computational intelligence and computer science. We bridge the gap between academia and industry.",
      category: "Technical",
      members: 85,
      followers: 245,
      events: 12,
      achievementsCount: 6,
      isFollowing: false,
      established: "2015",
      president: "Priya Patel",
      activities: [
        "Research Paper Presentations",
        "Industry Expert Sessions",
        "AI/ML Workshops",
        "Coding Competitions",
      ],
      upcomingEvents: [
        {
          title: "AI Research Symposium",
          date: "2025-02-25",
          type: "Symposium",
        },
        {
          title: "Coding Bootcamp",
          date: "2025-03-01",
          type: "Workshop",
        },
      ],
      achievements: [
        "IEEE Student Branch Excellence Award",
        "Best Research Paper 2024",
        "Outstanding Student Chapter",
      ],
      icon: <Code className="w-6 h-6" />,
      color: "bg-blue-500",
    },
    {
      id: "CULTURAL_CLUB",
      name: "Cultural Club",
      fullName: "Cultural Activities and Arts Society",
      description:
        "Promoting arts, culture, and creativity on campus. We organize cultural events, art exhibitions, and performance showcases.",
      category: "Cultural",
      members: 200,
      followers: 520,
      events: 25,
      achievementsCount: 12,
      isFollowing: true,
      established: "2010",
      president: "Kavya Reddy",
      activities: [
        "Dance Competitions",
        "Music Concerts",
        "Art Exhibitions",
        "Drama Performances",
      ],
      upcomingEvents: [
        {
          title: "Spring Cultural Fest",
          date: "2025-03-15",
          type: "Festival",
        },
        {
          title: "Art Workshop",
          date: "2025-02-18",
          type: "Workshop",
        },
      ],
      achievements: [
        "Best Cultural Event 2024",
        "Excellence in Arts Promotion",
        "Most Participated Club",
      ],
      icon: <Palette className="w-6 h-6" />,
      color: "bg-pink-500",
    },
    {
      id: "PHOTOGRAPHY",
      name: "Photography Club",
      fullName: "Campus Photography and Visual Arts Club",
      description:
        "Capturing moments and creating visual stories. We conduct photography workshops, photo walks, and organize exhibitions.",
      category: "Arts",
      members: 65,
      followers: 180,
      events: 8,
      achievementsCount: 4,
      isFollowing: false,
      established: "2019",
      president: "Rohit Gupta",
      activities: [
        "Photo Walks",
        "Photography Workshops",
        "Photo Exhibitions",
        "Camera Technique Sessions",
      ],
      upcomingEvents: [
        {
          title: "Nature Photography Walk",
          date: "2025-02-22",
          type: "Activity",
        },
        {
          title: "Portrait Workshop",
          date: "2025-03-05",
          type: "Workshop",
        },
      ],
      achievements: [
        "Best Photo Exhibition 2024",
        "Excellence in Visual Arts",
        "Outstanding Creative Club",
      ],
      icon: <Camera className="w-6 h-6" />,
      color: "bg-green-500",
    },
    {
      id: "MUSIC_CLUB",
      name: "Music Club",
      fullName: "Harmony - Music and Sound Society",
      description:
        "Creating melodies and fostering musical talent. We organize concerts, music workshops, and provide a platform for aspiring musicians.",
      category: "Arts",
      members: 90,
      followers: 280,
      events: 18,
      achievementsCount: 7,
      isFollowing: true,
      established: "2016",
      president: "Ananya Singh",
      activities: [
        "Live Concerts",
        "Music Production Workshops",
        "Band Formations",
        "Instrument Training",
      ],
      upcomingEvents: [
        {
          title: "Acoustic Night",
          date: "2025-02-28",
          type: "Concert",
        },
        {
          title: "Music Production Workshop",
          date: "2025-03-10",
          type: "Workshop",
        },
      ],
      achievements: [
        "Best Musical Performance 2024",
        "Outstanding Music Club",
        "Excellence in Sound Production",
      ],
      icon: <Music className="w-6 h-6" />,
      color: "bg-indigo-500",
    },
    {
      id: "SPORTS_CLUB",
      name: "Sports Club",
      fullName: "Athletic Excellence and Sports Society",
      description:
        "Promoting physical fitness and sportsmanship. We organize tournaments, training sessions, and represent the college in inter-collegiate competitions.",
      category: "Sports",
      members: 150,
      followers: 380,
      events: 20,
      achievementsCount: 15,
      isFollowing: false,
      established: "2012",
      president: "Vikram Kumar",
      activities: [
        "Inter-College Tournaments",
        "Daily Training Sessions",
        "Fitness Workshops",
        "Sports Equipment Management",
      ],
      upcomingEvents: [
        {
          title: "Basketball Tournament",
          date: "2025-03-08",
          type: "Tournament",
        },
        {
          title: "Fitness Workshop",
          date: "2025-02-25",
          type: "Workshop",
        },
      ],
      achievements: [
        "Inter-College Champions 2024",
        "Best Sports Club Award",
        "Excellence in Athletic Training",
      ],
      icon: <Trophy className="w-6 h-6" />,
      color: "bg-orange-500",
    },
  ];

  const filteredClubs = clubsData.filter((club) => {
    const matchesSearch =
      club.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      club.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      categoryFilter === "all" ||
      club.category.toLowerCase() === categoryFilter.toLowerCase();
    const matchesFollowed =
      followedFilter === "all" ||
      (followedFilter === "following" && club.isFollowing) ||
      (followedFilter === "not_following" && !club.isFollowing);

    return matchesSearch && matchesCategory && matchesFollowed;
  });

  const toggleFollow = (clubId: string) => {
    // This would typically make an API call to follow/unfollow
    console.log(`Toggle follow for club: ${clubId}`);
  };

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case "technical":
        return <Code className="w-4 h-4" />;
      case "cultural":
        return <Palette className="w-4 h-4" />;
      case "arts":
        return <Camera className="w-4 h-4" />;
      case "sports":
        return <Trophy className="w-4 h-4" />;
      default:
        return <Users className="w-4 h-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
    });
  };

  return (
    <div className="flex min-h-screen bg-background">
      <StudentSidebar />
      <div className="flex-1 flex flex-col">
        <StudentTopbar studentId={userData?.collegeId || ""} />

        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
                  <Users className="w-8 h-8 text-primary" />
                  Student Clubs
                </h1>
                <p className="text-muted-foreground mt-1">
                  Discover and join clubs that match your interests and passions
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
                      <SelectItem value="arts">Arts</SelectItem>
                      <SelectItem value="sports">Sports</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select
                    value={followedFilter}
                    onValueChange={setFollowedFilter}
                  >
                    <SelectTrigger className="w-full md:w-[200px]">
                      <SelectValue placeholder="Following" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Clubs</SelectItem>
                      <SelectItem value="following">Following</SelectItem>
                      <SelectItem value="not_following">
                        Not Following
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Clubs Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredClubs.length === 0 ? (
                <div className="col-span-full">
                  <Card>
                    <CardContent className="py-12 text-center">
                      <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-foreground mb-2">
                        No clubs found
                      </h3>
                      <p className="text-muted-foreground">
                        Try adjusting your filters to discover more clubs.
                      </p>
                    </CardContent>
                  </Card>
                </div>
              ) : (
                filteredClubs.map((club) => (
                  <Card
                    key={club.id}
                    className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-12 h-12 ${club.color} rounded-lg flex items-center justify-center text-white`}
                          >
                            {club.icon}
                          </div>
                          <div>
                            <h3 className="font-bold text-foreground">
                              {club.name}
                            </h3>
                            <p className="text-xs text-muted-foreground">
                              Est. {club.established}
                            </p>
                          </div>
                        </div>
                        <Button
                          variant={club.isFollowing ? "default" : "outline"}
                          size="sm"
                          onClick={() => toggleFollow(club.id)}
                          className={
                            club.isFollowing
                              ? "bg-red-500 hover:bg-red-600"
                              : ""
                          }
                        >
                          {club.isFollowing ? (
                            <Heart className="w-4 h-4 mr-1 fill-current" />
                          ) : (
                            <UserPlus className="w-4 h-4 mr-1" />
                          )}
                          {club.isFollowing ? "Following" : "Follow"}
                        </Button>
                      </div>
                      <div className="flex flex-wrap gap-1 mt-2">
                        <Badge variant="outline" className="text-xs">
                          {getCategoryIcon(club.category)}
                          <span className="ml-1">{club.category}</span>
                        </Badge>
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
                            {club.members}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Members
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-bold text-foreground">
                            {club.followers}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Followers
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-bold text-foreground">
                            {club.events}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Events
                          </div>
                        </div>
                      </div>

                      {/* Upcoming Events */}
                      <div>
                        <h4 className="font-medium text-sm mb-2 flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          Upcoming Events
                        </h4>
                        <div className="space-y-1">
                          {club.upcomingEvents.slice(0, 2).map((event, idx) => (
                            <div
                              key={idx}
                              className="flex justify-between items-center text-xs"
                            >
                              <span className="text-muted-foreground">
                                {event.title}
                              </span>
                              <Badge variant="outline" className="text-xs">
                                {formatDate(event.date)}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2 pt-2">
                        <Button size="sm" className="flex-1">
                          View Details
                          <ExternalLink className="w-3 h-3 ml-1" />
                        </Button>
                        {!club.isFollowing && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="px-3"
                            onClick={() => toggleFollow(club.id)}
                          >
                            <UserPlus className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default StudentClubs;
