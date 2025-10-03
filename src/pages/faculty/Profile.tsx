import FacultySidebar from "@/components/FacultySidebar";
import FacultyTopbar from "@/components/FacultyTopbar";
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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";

const branchNames: Record<string, string> = {
  "01": "Civil Engineering",
  "02": "Electrical & Electronics Engineering",
  "03": "Mechanical Engineering",
  "04": "Electronics & Communication Engineering",
  "05": "Computer Science & Engineering",
  "12": "Information Technology",
};

const FacultyProfile = () => {
  const { userData } = useAuth();

  const facultyId = userData?.collegeId || "FACULTYID";
  const facultyName = userData?.name || "Faculty Member";
  const facultyEmail = userData?.email || `${facultyId}@cvr.ac.in`;
  const department = branchNames[userData?.branch || ""] || "Department of Engineering";
  const section = userData?.section === "Z" ? "Faculty" : userData?.section || "";

  return (
    <div className="flex min-h-screen bg-background">
      <FacultySidebar />

      <div className="flex-1 flex flex-col">
        <FacultyTopbar />

        <main className="flex-1 p-6 space-y-6">
          <div className="grid gap-6 lg:grid-cols-[2fr,1fr]">
            <Card>
              <CardHeader className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarFallback className="text-lg">
                      {facultyName
                        .split(" ")
                        .map((part) => part[0])
                        .join("")
                        .slice(0, 2)
                        .toUpperCase()}
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
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                    Contact Information
                  </h3>
                  <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Email</p>
                      <p className="font-medium text-foreground">{facultyEmail}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Phone</p>
                      <p className="font-medium text-foreground">
                        {userData?.phone || "+91 98765 43210"}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Office Location</p>
                      <p className="font-medium text-foreground">{userData?.address || "Block C, Room 308"}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Availability</p>
                      <p className="font-medium text-foreground">Mon - Fri, 9:00 AM to 5:00 PM</p>
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
                      <p className="font-medium text-foreground">
                        {userData?.role === "faculty" ? "Assistant Professor" : "Faculty"}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Primary responsibility for teaching core subjects and guiding student projects.
                      </p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">Expertise Areas</p>
                      <div className="flex flex-wrap gap-2">
                        {(
                          userData?.specializations || [
                            "Data Structures",
                            "Algorithms",
                            "Database Systems",
                          ]
                        ).map((area) => (
                          <Badge key={area} variant="outline">
                            {area}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="grid gap-6 md:grid-cols-2">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Current Teaching Load</CardTitle>
                      <CardDescription>Overview of active courses</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Courses</span>
                        <span className="text-sm font-semibold text-foreground">05</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Total Students</span>
                        <span className="text-sm font-semibold text-foreground">180</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Active Assignments</span>
                        <span className="text-sm font-semibold text-foreground">12</span>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Upcoming Milestones</CardTitle>
                      <CardDescription>Important academic dates</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <p className="text-sm font-medium text-foreground">Midterm Evaluation Week</p>
                        <p className="text-xs text-muted-foreground">Starts 15 Aug 2025</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">Capstone Review</p>
                        <p className="text-xs text-muted-foreground">Scheduled 10 Sep 2025</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">Curriculum Workshop</p>
                        <p className="text-xs text-muted-foreground">23 Sep 2025</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Manage visibility and export reports</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full">Update Profile Details</Button>
                <Button variant="outline" className="w-full">
                  Download Teaching Portfolio
                </Button>
                <Button variant="outline" className="w-full">
                  Share Availability Calendar
                </Button>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
};

export default FacultyProfile;
