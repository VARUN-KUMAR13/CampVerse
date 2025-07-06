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
  Calendar,
  MapPin,
  Clock,
  Users,
  DollarSign,
  Star,
  ExternalLink,
} from "lucide-react";

const StudentEvents = () => {
  const { userData } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const eventsData = [
    {
      id: "ANUDHAHAN2025",
      title: "Anudhahan 2025",
      description:
        "Anurag University National Cultural Festival - A celebration of arts, culture, and talent with competitions, performances, and workshops.",
      category: "Cultural",
      date: "2025-03-15T09:00:00",
      endDate: "2025-03-17T18:00:00",
      venue: "Anurag University Campus",
      organizer: "Cultural Committee",
      entryFee: "₹200",
      maxParticipants: 500,
      registeredParticipants: 324,
      status: "Open",
      featured: true,
      image: "/events/anudhahan.jpg",
      highlights: [
        "Dance Competition",
        "Music Concert",
        "Art Exhibition",
        "Drama Performance",
      ],
      prizes: "₹50,000+ Prize Pool",
      registrationDeadline: "2025-03-10T23:59:00",
    },
    {
      id: "HACKATHON2025",
      title: "CodeStorm Hackathon",
      description:
        "48-hour coding challenge to build innovative solutions for real-world problems. Teams of 3-4 members can participate.",
      category: "Technical",
      date: "2025-02-20T18:00:00",
      endDate: "2025-02-22T18:00:00",
      venue: "Computer Science Block",
      organizer: "IEEE Computer Society",
      entryFee: "Free",
      maxParticipants: 200,
      registeredParticipants: 156,
      status: "Open",
      featured: true,
      image: "/events/hackathon.jpg",
      highlights: [
        "Industry Mentors",
        "Free Food & Swag",
        "Job Opportunities",
        "Networking Session",
      ],
      prizes: "₹1,00,000+ Prize Pool",
      registrationDeadline: "2025-02-15T23:59:00",
    },
    {
      id: "WORKSHOP2025",
      title: "AI/ML Workshop Series",
      description:
        "Comprehensive workshop series on Artificial Intelligence and Machine Learning with hands-on projects and industry insights.",
      category: "Workshop",
      date: "2025-02-10T10:00:00",
      endDate: "2025-02-12T16:00:00",
      venue: "Seminar Hall A",
      organizer: "Computer Science Department",
      entryFee: "₹500",
      maxParticipants: 100,
      registeredParticipants: 87,
      status: "Open",
      featured: false,
      image: "/events/aiml.jpg",
      highlights: [
        "Expert Sessions",
        "Hands-on Projects",
        "Certificate",
        "Industry Exposure",
      ],
      prizes: "Certificate of Completion",
      registrationDeadline: "2025-02-05T23:59:00",
    },
    {
      id: "SPORTS2025",
      title: "Inter-College Sports Meet",
      description:
        "Annual sports championship featuring multiple indoor and outdoor games with participation from various colleges.",
      category: "Sports",
      date: "2025-04-01T08:00:00",
      endDate: "2025-04-03T17:00:00",
      venue: "Sports Complex",
      organizer: "Sports Committee",
      entryFee: "₹100",
      maxParticipants: 300,
      registeredParticipants: 89,
      status: "Open",
      featured: false,
      image: "/events/sports.jpg",
      highlights: ["Cricket", "Football", "Basketball", "Athletics"],
      prizes: "Trophies & Medals",
      registrationDeadline: "2025-03-25T23:59:00",
    },
    {
      id: "ENIGMA2024",
      title: "ENIGMA Technical Symposium",
      description:
        "Technical symposium with paper presentations, project exhibitions, and technical competitions.",
      category: "Technical",
      date: "2025-01-15T09:00:00",
      endDate: "2025-01-15T17:00:00",
      venue: "Main Auditorium",
      organizer: "ENIGMA Club",
      entryFee: "₹150",
      maxParticipants: 250,
      registeredParticipants: 250,
      status: "Closed",
      featured: false,
      image: "/events/enigma.jpg",
      highlights: [
        "Paper Presentation",
        "Project Expo",
        "Technical Quiz",
        "Guest Lectures",
      ],
      prizes: "₹25,000 Prize Pool",
      registrationDeadline: "2025-01-10T23:59:00",
    },
  ];

  const filteredEvents = eventsData.filter((event) => {
    const matchesSearch =
      event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      categoryFilter === "all" ||
      event.category.toLowerCase() === categoryFilter.toLowerCase();
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "open" && event.status === "Open") ||
      (statusFilter === "featured" && event.featured) ||
      (statusFilter === "closed" && event.status === "Closed");

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const getStatusBadge = (event: any) => {
    if (event.status === "Closed") {
      return <Badge variant="destructive">Registration Closed</Badge>;
    }
    if (event.registeredParticipants >= event.maxParticipants) {
      return <Badge variant="secondary">Full</Badge>;
    }
    return <Badge className="bg-green-500">Open for Registration</Badge>;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
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
                  <Calendar className="w-8 h-8 text-primary" />
                  Campus Events
                </h1>
                <p className="text-muted-foreground mt-1">
                  Discover and participate in exciting campus events and
                  activities
                </p>
              </div>
            </div>

            {/* Filters */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Find Events</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                      <Input
                        placeholder="Search events..."
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
                      <SelectItem value="workshop">Workshop</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full md:w-[200px]">
                      <SelectValue placeholder="Filter" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Events</SelectItem>
                      <SelectItem value="open">Open</SelectItem>
                      <SelectItem value="featured">Featured</SelectItem>
                      <SelectItem value="closed">Closed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Featured Events Banner */}
            {filteredEvents.some((event) => event.featured) && (
              <div>
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <Star className="w-5 h-5 text-yellow-500" />
                  Featured Events
                </h2>
                <div className="grid md:grid-cols-2 gap-6 mb-8">
                  {filteredEvents
                    .filter((event) => event.featured)
                    .map((event) => (
                      <Card
                        key={event.id}
                        className="overflow-hidden border-2 border-primary/20 hover:shadow-xl transition-all"
                      >
                        <div className="h-48 bg-gradient-to-r from-primary/20 to-purple-500/20 flex items-center justify-center">
                          <Calendar className="w-16 h-16 text-primary/60" />
                        </div>
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="text-xl font-bold text-foreground">
                                {event.title}
                              </h3>
                              <Badge className="mt-2">{event.category}</Badge>
                            </div>
                            <Star className="w-5 h-5 text-yellow-500 fill-current" />
                          </div>
                        </CardHeader>
                        <CardContent>
                          <p className="text-muted-foreground text-sm mb-4">
                            {event.description}
                          </p>
                          <div className="space-y-2 text-sm">
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-primary" />
                              <span>
                                {formatDate(event.date)} -{" "}
                                {formatDate(event.endDate)}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <MapPin className="w-4 h-4 text-primary" />
                              <span>{event.venue}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <DollarSign className="w-4 h-4 text-primary" />
                              <span>{event.entryFee}</span>
                            </div>
                          </div>
                          <div className="flex justify-between items-center mt-4 pt-4 border-t">
                            {getStatusBadge(event)}
                            <Button size="sm">View Details</Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                </div>
              </div>
            )}

            {/* All Events */}
            <div>
              <h2 className="text-xl font-semibold mb-4">All Events</h2>
              <div className="grid gap-6">
                {filteredEvents.length === 0 ? (
                  <Card>
                    <CardContent className="py-12 text-center">
                      <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-foreground mb-2">
                        No events found
                      </h3>
                      <p className="text-muted-foreground">
                        Try adjusting your filters to see more events.
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  filteredEvents.map((event) => (
                    <Card
                      key={event.id}
                      className="hover:shadow-lg transition-shadow"
                    >
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="space-y-2">
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                                <Calendar className="w-6 h-6 text-primary" />
                              </div>
                              <div>
                                <h3 className="text-xl font-semibold text-foreground">
                                  {event.title}
                                </h3>
                                <p className="text-muted-foreground">
                                  {event.organizer}
                                </p>
                              </div>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              <Badge variant="outline">{event.category}</Badge>
                              {getStatusBadge(event)}
                              {event.featured && (
                                <Badge className="bg-yellow-500">
                                  <Star className="w-3 h-3 mr-1" />
                                  Featured
                                </Badge>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-muted-foreground">
                              Registration Deadline
                            </p>
                            <p className="font-medium text-destructive">
                              {formatDate(event.registrationDeadline)}
                            </p>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <p className="text-muted-foreground">
                          {event.description}
                        </p>

                        <div className="grid md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-primary" />
                              <span className="font-medium">Date:</span>
                              <span>
                                {formatDate(event.date)} -{" "}
                                {formatDate(event.endDate)}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4 text-primary" />
                              <span className="font-medium">Time:</span>
                              <span>
                                {formatTime(event.date)} -{" "}
                                {formatTime(event.endDate)}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <MapPin className="w-4 h-4 text-primary" />
                              <span className="font-medium">Venue:</span>
                              <span>{event.venue}</span>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <DollarSign className="w-4 h-4 text-green-500" />
                              <span className="font-medium">Entry Fee:</span>
                              <span>{event.entryFee}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Users className="w-4 h-4 text-blue-500" />
                              <span className="font-medium">Registered:</span>
                              <span>
                                {event.registeredParticipants}/
                                {event.maxParticipants}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Star className="w-4 h-4 text-yellow-500" />
                              <span className="font-medium">Prizes:</span>
                              <span>{event.prizes}</span>
                            </div>
                          </div>
                        </div>

                        <div>
                          <span className="font-medium">Highlights:</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {event.highlights.map((highlight) => (
                              <Badge
                                key={highlight}
                                variant="outline"
                                className="text-xs"
                              >
                                {highlight}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-4 border-t">
                          <div className="text-sm text-muted-foreground">
                            Organized by{" "}
                            <span className="font-medium">
                              {event.organizer}
                            </span>
                          </div>
                          <div className="flex gap-2">
                            {event.status === "Open" &&
                              event.registeredParticipants <
                                event.maxParticipants && (
                                <Button className="bg-green-600 hover:bg-green-700">
                                  Register Now
                                </Button>
                              )}
                            <Button variant="outline">
                              View Details
                              <ExternalLink className="w-3 h-3 ml-1" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default StudentEvents;
