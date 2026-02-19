import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import FacultyLayout from "@/components/FacultyLayout";
import { Clock, MapPin, Users, Calendar } from "lucide-react";

const FacultySchedule = () => {
  const todaySchedule = [
    {
      time: "09:00 - 10:30",
      course: "CS101",
      courseName: "Introduction to Computer Science",
      room: "Room 301",
      section: "A",
      students: 45,
      type: "Lecture",
    },
    {
      time: "11:00 - 12:30",
      course: "CS201",
      courseName: "Data Structures and Algorithms",
      room: "Room 205",
      section: "A",
      students: 42,
      type: "Lecture",
    },
    {
      time: "14:00 - 15:30",
      course: "CS301",
      courseName: "Database Management Systems",
      room: "Lab 101",
      section: "A",
      students: 38,
      type: "Lab",
    },
    {
      time: "16:00 - 17:00",
      course: "CS401",
      courseName: "Software Engineering",
      room: "Room 403",
      section: "A",
      students: 40,
      type: "Tutorial",
    },
  ];

  const weeklySchedule = {
    Monday: [
      { time: "09:00-10:30", course: "CS101", room: "301", type: "Lecture" },
      { time: "11:00-12:30", course: "CS201", room: "205", type: "Lecture" },
      { time: "14:00-15:30", course: "CS301", room: "Lab 101", type: "Lab" },
    ],
    Tuesday: [
      { time: "10:00-11:30", course: "CS201", room: "205", type: "Tutorial" },
      { time: "14:00-15:30", course: "CS401", room: "403", type: "Lecture" },
      { time: "16:00-17:00", course: "CS101", room: "301", type: "Tutorial" },
    ],
    Wednesday: [
      { time: "09:00-10:30", course: "CS301", room: "Lab 101", type: "Lab" },
      { time: "11:00-12:30", course: "CS401", room: "403", type: "Lecture" },
      { time: "14:00-15:30", course: "CS501", room: "Lab 201", type: "Lab" },
    ],
    Thursday: [
      { time: "09:00-10:30", course: "CS101", room: "301", type: "Lecture" },
      { time: "11:00-12:30", course: "CS201", room: "205", type: "Lecture" },
      {
        time: "15:00-16:00",
        course: "Faculty Meeting",
        room: "Conference",
        type: "Meeting",
      },
    ],
    Friday: [
      { time: "10:00-11:30", course: "CS501", room: "Lab 201", type: "Lab" },
      { time: "14:00-15:30", course: "CS401", room: "403", type: "Tutorial" },
    ],
  };

  const getTypeColor = (type: string) => {
    switch (type) {
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

  const timeSlots = [
    "09:00",
    "10:00",
    "11:00",
    "12:00",
    "13:00",
    "14:00",
    "15:00",
    "16:00",
    "17:00",
  ];

  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

  return (
    <FacultyLayout>
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">My Schedule</h1>
          <p className="text-sm text-muted-foreground">
            Track daily sessions and weekly plan at a glance.
          </p>
        </div>
        <Button variant="outline" className="w-full md:w-auto">
          Download Schedule
        </Button>
      </div>

      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-2 bg-blue-500/10 rounded-lg">
                  <Clock className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">24</p>
                  <p className="text-sm text-muted-foreground">
                    Hours/Week
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-2 bg-green-500/10 rounded-lg">
                  <Calendar className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">4</p>
                  <p className="text-sm text-muted-foreground">
                    Classes Today
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-2 bg-purple-500/10 rounded-lg">
                  <Users className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">165</p>
                  <p className="text-sm text-muted-foreground">
                    Total Students
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-2 bg-orange-500/10 rounded-lg">
                  <MapPin className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">5</p>
                  <p className="text-sm text-muted-foreground">
                    Rooms Used
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Today's Schedule */}
        <Card>
          <CardHeader>
            <CardTitle>Today's Schedule</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {todaySchedule.map((class_, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/30 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <div className="text-center">
                      <div className="font-medium text-foreground">
                        {class_.time}
                      </div>
                    </div>
                    <div className="h-8 w-px bg-border" />
                    <div>
                      <div className="font-medium text-foreground">
                        {class_.course} - {class_.courseName}
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <div className="flex items-center space-x-1">
                          <MapPin className="w-4 h-4" />
                          <span>{class_.room}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Users className="w-4 h-4" />
                          <span>{class_.students} students</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className={getTypeColor(class_.type)}>
                      {class_.type}
                    </Badge>
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Weekly Schedule Grid */}
        <Card>
          <CardHeader>
            <CardTitle>Weekly Schedule</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <div className="grid grid-cols-6 gap-2 min-w-[800px]">
                {/* Header */}
                <div className="p-2 font-medium text-center text-muted-foreground">
                  Time
                </div>
                {days.map((day) => (
                  <div
                    key={day}
                    className="p-2 font-medium text-center text-muted-foreground"
                  >
                    {day}
                  </div>
                ))}

                {/* Time slots */}
                {timeSlots.map((time) => (
                  <React.Fragment key={time}>
                    <div className="p-2 text-sm text-muted-foreground text-center">
                      {time}
                    </div>
                    {days.map((day) => {
                      const daySchedule =
                        weeklySchedule[
                        day as keyof typeof weeklySchedule
                        ] || [];
                      const classAtTime = daySchedule.find((c) =>
                        c.time.startsWith(time),
                      );

                      return (
                        <div
                          key={`${day}-${time}`}
                          className="p-1 min-h-[60px]"
                        >
                          {classAtTime && (
                            <div className="bg-primary/10 border border-primary/20 rounded p-2 text-xs">
                              <div className="font-medium text-foreground">
                                {classAtTime.course}
                              </div>
                              <div className="text-muted-foreground">
                                {classAtTime.room}
                              </div>
                              <Badge
                                className={`${getTypeColor(classAtTime.type)} text-xs mt-1`}
                                size="sm"
                              >
                                {classAtTime.type}
                              </Badge>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </React.Fragment>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </FacultyLayout>
  );
};

export default FacultySchedule;
