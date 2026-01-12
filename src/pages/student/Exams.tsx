import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import StudentSidebar from "@/components/StudentSidebar";
import StudentTopbar from "@/components/StudentTopbar";
import { useAuth } from "@/contexts/AuthContext";
import { useExams } from "@/contexts/ExamContext";
import { Calendar, Clock, MapPin, Loader2, FileText, AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";

const StudentExams = () => {
  const { userData } = useAuth();
  const { upcomingExams, loading, error, fetchUpcomingExams } = useExams();
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    fetchUpcomingExams();
  }, []);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return {
      day: date.getDate().toString(),
      month: date.toLocaleString('default', { month: 'short' }),
      full: date.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }),
    };
  };

  const getDaysUntil = (dateStr: string) => {
    const examDate = new Date(dateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    examDate.setHours(0, 0, 0, 0);
    const diffTime = examDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Tomorrow";
    if (diffDays < 7) return `${diffDays} days`;
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} week${Math.ceil(diffDays / 7) > 1 ? 's' : ''}`;
    return `${Math.ceil(diffDays / 30)} month${Math.ceil(diffDays / 30) > 1 ? 's' : ''}`;
  };

  const isWithinWeek = (dateStr: string) => {
    const examDate = new Date(dateStr);
    const today = new Date();
    const weekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    return examDate >= today && examDate <= weekFromNow;
  };

  const isWithinMonth = (dateStr: string) => {
    const examDate = new Date(dateStr);
    const today = new Date();
    const monthFromNow = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
    return examDate >= today && examDate <= monthFromNow;
  };

  const getExamTypeColor = (type: string) => {
    const colors: { [key: string]: string } = {
      "Mid-Term": "bg-purple-500",
      "End-Term": "bg-indigo-500",
      "Quiz": "bg-cyan-500",
      "Practical": "bg-green-500",
      "Viva": "bg-pink-500",
      "Assignment": "bg-amber-500",
      "Other": "bg-gray-500",
    };
    return colors[type] || "bg-gray-500";
  };

  const filteredExams = upcomingExams.filter((exam) => {
    if (filter === "all") return true;
    if (filter === "week") return isWithinWeek(exam.date);
    if (filter === "month") return isWithinMonth(exam.date);
    return true;
  });

  return (
    <div className="flex min-h-screen bg-background">
      <StudentSidebar />

      <div className="flex-1 flex flex-col">
        <StudentTopbar studentId={userData?.collegeId || ""} />

        <main className="flex-1 p-6 space-y-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                <Calendar className="w-7 h-7 text-primary" />
                Upcoming Exams
              </h1>
              <p className="text-muted-foreground mt-1">
                View all your scheduled examinations
              </p>
            </div>

            <div className="flex items-center gap-3">
              {/* Filter Tabs */}
              <div className="flex space-x-2">
                <Badge
                  variant={filter === "all" ? "default" : "outline"}
                  className="cursor-pointer px-4 py-1"
                  onClick={() => setFilter("all")}
                >
                  All
                </Badge>
                <Badge
                  variant={filter === "week" ? "default" : "outline"}
                  className="cursor-pointer px-4 py-1"
                  onClick={() => setFilter("week")}
                >
                  This Week
                </Badge>
                <Badge
                  variant={filter === "month" ? "default" : "outline"}
                  className="cursor-pointer px-4 py-1"
                  onClick={() => setFilter("month")}
                >
                  This Month
                </Badge>
              </div>
              <Button variant="outline" size="sm" onClick={fetchUpcomingExams} disabled={loading}>
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4 flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Upcoming</p>
                  <p className="text-2xl font-bold">{upcomingExams.length}</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-amber-500/10 flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-amber-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">This Week</p>
                  <p className="text-2xl font-bold">{upcomingExams.filter(e => isWithinWeek(e.date)).length}</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center">
                  <FileText className="w-6 h-6 text-blue-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">This Month</p>
                  <p className="text-2xl font-bold">{upcomingExams.filter(e => isWithinMonth(e.date)).length}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Error */}
          {error && (
            <Card className="border-destructive bg-destructive/10">
              <CardContent className="p-4 text-destructive">{error}</CardContent>
            </Card>
          )}

          {/* Loading */}
          {loading && upcomingExams.length === 0 && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <span className="ml-3 text-muted-foreground">Loading exams...</span>
            </div>
          )}

          {/* Empty State */}
          {!loading && filteredExams.length === 0 && (
            <Card>
              <CardContent className="p-12 text-center">
                <Calendar className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-foreground mb-2">No Upcoming Exams</h3>
                <p className="text-muted-foreground">
                  {upcomingExams.length === 0
                    ? "No exams have been scheduled yet. Check back later!"
                    : "No exams found for the selected filter."}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Exams Grid */}
          {filteredExams.length > 0 && (
            <div className="grid lg:grid-cols-2 gap-6">
              {filteredExams.map((exam) => {
                const dateInfo = formatDate(exam.date);
                const daysUntil = getDaysUntil(exam.date);
                const isUrgent = daysUntil === "Today" || daysUntil === "Tomorrow";

                return (
                  <Card
                    key={exam._id}
                    className={`hover:shadow-lg transition-shadow ${isUrgent ? 'border-red-500 border-2' : ''}`}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start space-x-4">
                        {/* Date Circle */}
                        <div className="text-center">
                          <div className={`w-16 h-16 rounded-full flex flex-col items-center justify-center text-white ${getExamTypeColor(exam.examType)}`}>
                            <div className="text-lg font-bold">{dateInfo.day}</div>
                            <div className="text-xs">{dateInfo.month}</div>
                          </div>
                        </div>

                        {/* Exam Details */}
                        <div className="flex-1">
                          <div className="flex items-start justify-between">
                            <h3 className="text-lg font-semibold text-foreground mb-2">
                              {exam.title}
                            </h3>
                            <Badge
                              variant="outline"
                              className={isUrgent ? "border-red-500 text-red-500 bg-red-500/10" : ""}
                            >
                              {daysUntil}
                            </Badge>
                          </div>

                          <div className="flex items-center gap-2 mb-3">
                            <Badge className={getExamTypeColor(exam.examType)}>
                              {exam.examType}
                            </Badge>
                          </div>

                          <div className="space-y-2">
                            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                              <Clock className="w-4 h-4" />
                              <span>{exam.startTime} - {exam.endTime}</span>
                            </div>
                            {exam.venue && (
                              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                                <MapPin className="w-4 h-4" />
                                <span>{exam.venue}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default StudentExams;
