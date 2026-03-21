import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import FacultyLayout from "@/components/FacultyLayout";
import { BookOpen, Users, FileText, Calendar, Clock, Loader2, MapPin, Megaphone } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useState, useEffect } from "react";
import { api } from "@/lib/api";

const FacultyDashboard = () => {
  const { userData } = useAuth();
  const [displayName, setDisplayName] = useState(userData?.name || userData?.collegeId || "Faculty");
  const [courses, setCourses] = useState<any[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<any | null>(null);

  // Faculty schedule state
  const [todaySchedule, setTodaySchedule] = useState<any[]>([]);
  const [loadingSchedule, setLoadingSchedule] = useState(true);

  // Announcements
  const [announcements, setAnnouncements] = useState<any[]>([]);

  // Fetch announcements
  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";
        const res = await fetch(`${apiBaseUrl}/announcements/active?audience=Faculty`);
        if (res.ok) {
          const data = await res.json();
          setAnnouncements(data);
        }
      } catch (error) {
        console.error("Failed to fetch announcements:", error);
      }
    };
    fetchAnnouncements();
  }, []);

  useEffect(() => {
    if (!userData?.uid) return;

    const fetchProfileName = async () => {
      try {
        const profile = await api.get(`/users/${userData.uid}`);
        if (profile && profile.name) {
          setDisplayName(profile.name);
        }
      } catch (error: any) {
        if (!error.message?.includes('404')) {
          console.error("Error fetching profile for dashboard:", error);
        }
      }
    };

    const fetchDashboardCourses = async () => {
      try {
        setLoadingCourses(true);
        const facultyId = userData?.collegeId || "";
        const res = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:5000/api"}/courses?facultyId=${facultyId}`);
        if (res.ok) {
          const data = await res.json();
          setCourses(data);
        }
      } catch (error) {
        console.error("Error fetching courses:", error);
      } finally {
        setLoadingCourses(false);
      }
    };

    fetchProfileName();
    fetchDashboardCourses();
  }, [userData?.uid, userData?.collegeId]);

  // Fetch faculty schedule from MongoDB
  useEffect(() => {
    if (!userData?.collegeId) {
      setLoadingSchedule(false);
      return;
    }

    const fetchFacultySchedule = async () => {
      setLoadingSchedule(true);
      try {
        const rollNumber = userData.collegeId;
        const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

        // Fetch all schedules containing slots for this faculty
        const res = await fetch(
          `${apiBaseUrl}/schedules?facultyId=${encodeURIComponent(rollNumber)}`
        );

        if (res.ok) {
          const schedules = await res.json();

          if (schedules.length > 0) {
            // Get today's day name
            const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
            let today = days[new Date().getDay()];
            
            // Map to collect all assigned slots for today across all schedules
            const allTodaySlots: any[] = [];
            
            schedules.forEach((scheduleDoc: any) => {
              const todayData = scheduleDoc.schedule?.find((d: any) => d.day === today);
              if (todayData?.slots) {
                // IMPORTANT: Filter slots strictly by facultyId
                const assignedSlots = todayData.slots.filter((slot: any) => 
                  slot.facultyId === rollNumber &&
                  (slot.subjectCode?.trim() || slot.subjectName?.trim())
                );
                allTodaySlots.push(...assignedSlots);
              }
            });

            if (allTodaySlots.length > 0) {
              const SLOT_COLORS = ["bg-red-500", "bg-blue-500", "bg-orange-500", "bg-purple-500", "bg-green-500", "bg-teal-500"];

              // Sort slots by start time
              allTodaySlots.sort((a, b) => a.startTime.localeCompare(b.startTime));

              const mapped = allTodaySlots.map((slot: any, idx: number) => {
                const formatTime = (t: string) => {
                  const [h, m] = t.split(":");
                  const hour = parseInt(h);
                  const ampm = hour >= 12 ? "PM" : "AM";
                  const dh = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
                  return `${dh}:${m} ${ampm}`;
                };

                return {
                  time: `${formatTime(slot.startTime)} - ${formatTime(slot.endTime)}`,
                  course: slot.subjectCode || `S${idx + 1}`,
                  courseName: slot.subjectName || "—",
                  room: slot.room || "—",
                  classType: slot.classType || "Class",
                  section: slot.section || "",
                  students: 0,
                  type: slot.classType || "Class",
                  color: SLOT_COLORS[idx % SLOT_COLORS.length],
                };
              });

              setTodaySchedule(mapped);
              setLoadingSchedule(false);
              return;
            }
          }
        }
      } catch (error) {
        console.error("Error fetching faculty schedule:", error);
      }

      // No valid schedule data — show empty state
      setTodaySchedule([]);
      setLoadingSchedule(false);
    };

    fetchFacultySchedule();
  }, [userData?.collegeId]);

  const upcomingEvents = [
    {
      date: "15",
      month: "FEB",
      title: "Mid-Term Examinations Begin",
      time: "Duration: Feb 15 - Feb 23, 2025",
      type: "Exams",
      color: "text-blue-500",
    },
    {
      date: "26",
      month: "FEB",
      title: "Lab Assessment Week",
      time: "Practical evaluations for all lab courses",
      type: "Labs",
      color: "text-orange-500",
    },
  ];

  const getTypeColor = (type: string) => {
    switch (type) {
      case "Class":
      case "Lecture":
        return "bg-blue-100 text-blue-800";
      case "Lab":
        return "bg-green-100 text-green-800";
      case "Tutorial":
        return "bg-yellow-100 text-yellow-800";
      case "Meeting":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <FacultyLayout>
      {/* Welcome Section */}
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          Hello <span className="text-primary">{displayName}</span> 👋
        </h1>
        <p className="text-muted-foreground mt-1">
          Manage your teaching schedule and track student progress.
        </p>
      </div>

      {/* Today's Schedule */}
      <Card className="my-6">
        <CardHeader>
          <CardTitle>Today's Schedule</CardTitle>
        </CardHeader>
        <CardContent>
          {loadingSchedule ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
          ) : todaySchedule.length === 0 ? (
            <div className="text-center py-8 text-sm text-muted-foreground">
              <Calendar className="w-10 h-10 mx-auto mb-3 text-muted-foreground/50" />
              No schedule found for today.
            </div>
          ) : (
            <div className="space-y-4">
              {todaySchedule.map((class_, index) => (
                <div
                  key={index}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-muted/20 rounded-xl hover:bg-muted/30 transition-colors gap-4"
                >
                  <div className="flex items-center space-x-4 sm:space-x-5 flex-1 min-w-0">
                    {/* Highlighted Course Code Box */}
                    <div
                      className={`shrink-0 h-14 w-auto min-w-[4rem] px-3 ${class_.color || "bg-primary"} rounded-xl flex items-center justify-center text-white font-bold text-sm tracking-wide`}
                    >
                      {class_.course}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-foreground text-base truncate">
                        {class_.courseName}
                      </div>
                      <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 text-sm text-muted-foreground mt-1.5">
                        <div className="flex items-center space-x-1.5">
                          <MapPin className="w-4 h-4" />
                          <span>Room: {class_.room}</span>
                        </div>
                        <div className="flex items-center space-x-1.5">
                          <BookOpen className="w-4 h-4" />
                          <span>Class Type: {class_.classType || class_.type || "Class"}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Side Info */}
                  <div className="flex items-center space-x-4 shrink-0 self-start sm:self-auto pl-[5.5rem] sm:pl-0 mt-1 sm:mt-0">
                    <div className="text-sm font-medium text-muted-foreground whitespace-nowrap">
                      {class_.time}
                    </div>
                    <Badge variant="outline" className={`${getTypeColor(class_.type)} border-transparent font-medium px-4 py-1 rounded-full`}>
                      {class_.type}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Upcoming Events */}
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Events</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {upcomingEvents.map((event, index) => (
              <div
                key={index}
                className="flex items-start space-x-4 p-4 bg-muted/30 rounded-lg"
              >
                <div className="text-center">
                  <div className="text-2xl font-bold text-foreground">
                    {event.date}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {event.month}
                  </div>
                </div>
                <div className="flex-1">
                  <div className="font-medium text-foreground">
                    {event.title}
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">
                    <Clock className="w-4 h-4 inline mr-1" />
                    {event.time}
                  </div>
                  <Badge variant="outline" className="mt-2">
                    {event.type}
                  </Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Announcements Section */}
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Megaphone className="w-5 h-5 text-primary" />
              Announcements
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 flex-1 overflow-y-auto max-h-[400px]">
            {announcements.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center h-full">
                <Megaphone className="w-8 h-8 text-muted-foreground/30 mb-2" />
                <p className="text-sm text-muted-foreground">No active announcements</p>
              </div>
            ) : (
              <div className="space-y-4">
                {announcements.map((ann) => (
                  <div key={ann._id} className="p-4 rounded-xl border border-border/50 bg-muted/10 hover:bg-muted/30 transition-colors">
                    <div className="flex justify-between items-start gap-4 mb-2">
                      <h4 className="font-semibold text-foreground text-sm leading-tight">{ann.title}</h4>
                      {ann.priority === "Important" && (
                        <Badge variant="destructive" className="shrink-0 text-[10px] px-1.5 py-0 h-4">Important</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{ann.message}</p>
                    <div className="flex items-center gap-2 mt-3 text-xs text-muted-foreground">
                      <span className="font-medium">By {ann.createdBy}</span>
                      <span>•</span>
                      <span>{new Date(ann.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Active Courses */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Active Courses</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {loadingCourses ? (
              <div className="flex justify-center py-4">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            ) : courses.length === 0 ? (
              <div className="text-center py-4 text-sm text-muted-foreground">
                No active courses. Add courses from the Courses tab.
              </div>
            ) : (
              courses.map((course) => (
                <div
                  key={course._id}
                  className="flex items-center space-x-4 p-4 bg-muted/30 rounded-lg pr-5"
                >
                  <div
                    className={`shrink-0 h-12 w-auto min-w-[3rem] px-3 ${course.color || "bg-blue-500"} rounded-lg flex items-center justify-center text-white font-bold text-sm`}
                  >
                    {course.courseCode}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-foreground truncate">
                      {course.courseName}
                    </div>
                    <div className="text-sm text-muted-foreground flex items-center gap-1.5 mt-0.5">
                      <Users className="w-3.5 h-3.5" />
                      {course.maxStudents} Students
                    </div>
                  </div>
                  <div className="hidden sm:flex items-center space-x-2 mr-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-xs text-muted-foreground font-medium">
                      active
                    </span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="shrink-0"
                    onClick={() => {
                      setSelectedCourse(course);
                      setViewDialogOpen(true);
                    }}
                  >
                    View Details
                  </Button>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* ─── VIEW COURSE DETAILS DIALOG ─────────────────────────── */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto w-[95vw]">
          {selectedCourse && (
            <>
              <DialogHeader>
                <DialogTitle className="text-xl">
                  {selectedCourse.courseCode} - {selectedCourse.courseName}
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-6 mt-2">
                {/* Description */}
                {selectedCourse.description && (
                  <div>
                    <h4 className="font-semibold text-foreground mb-2">
                      Course Description
                    </h4>
                    <p className="text-muted-foreground text-sm leading-relaxed">{selectedCourse.description}</p>
                  </div>
                )}

                {/* Objectives */}
                {selectedCourse.objectives?.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-foreground mb-2">
                      Course Objectives
                    </h4>
                    <ul className="space-y-1.5 list-disc pl-5">
                      {selectedCourse.objectives.map((obj: string, i: number) => (
                        <li key={i} className="text-muted-foreground text-sm">
                          {obj}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Syllabus */}
                {selectedCourse.syllabus?.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-foreground mb-2">Course Syllabus</h4>
                    <div className="space-y-2">
                      {selectedCourse.syllabus.map((item: any, i: number) => (
                        <div
                          key={i}
                          className="flex justify-between items-center p-2.5 bg-muted/30 rounded border border-border/50"
                        >
                          <span className="text-foreground text-sm font-medium">{item.topic}</span>
                          {item.duration && (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary whitespace-nowrap">
                              {item.duration}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Resources */}
                {selectedCourse.resources?.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-foreground mb-2">
                      Course Resources
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {selectedCourse.resources.map((resource: any, i: number) => (
                        <div
                          key={i}
                          className="flex items-center space-x-3 p-3 bg-primary/5 border border-primary/20 rounded-lg cursor-pointer hover:bg-primary/10 transition-colors"
                          onClick={() => {
                            if (resource.fileData) {
                              const link = document.createElement("a");
                              link.href = resource.fileData;
                              link.download = resource.fileName || resource.name;
                              link.click();
                            }
                          }}
                        >
                          <div className="bg-primary/10 p-2 rounded shrink-0">
                            <FileText className="w-5 h-5 text-primary" />
                          </div>
                          <div className="min-w-0">
                            <div className="font-medium text-primary text-sm truncate">
                              {resource.name}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {resource.type}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Meta info */}
                <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-muted-foreground pt-4 border-t">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" />
                    Created{" "}
                    {new Date(selectedCourse.createdAt).toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5" />
                    {selectedCourse.maxStudents} students max
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    {selectedCourse.credits} credits
                  </span>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </FacultyLayout>
  );
};

export default FacultyDashboard;
