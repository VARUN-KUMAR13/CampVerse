import { useState, useEffect } from "react";
import AdminLayout from "@/components/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { getStoredToken } from "@/lib/api";
import { BarChart3, GraduationCap, Building2, CalendarDays, UsersRound, Trophy } from "lucide-react";

export default function Reports() {
    const { toast } = useToast();
    const [reports, setReports] = useState<any>(null);

    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:5000/api";

    useEffect(() => {
        const fetchReports = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/admin/reports`, {
                    headers: {
                        Authorization: `Bearer ${getStoredToken()}`,
                    }
                });
                if (response.ok) {
                    const data = await response.json();
                    setReports(data);
                }
            } catch (err) {
                toast({ title: "Warning", description: "Could not load latest reports" });
            }
        };
        fetchReports();
    }, [toast, API_BASE_URL]);

    if (!reports) return <AdminLayout><div className="p-8">Loading Reports...</div></AdminLayout>;

    return (
        <AdminLayout>
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Analytics Dashboard</h1>
                    <p className="text-muted-foreground mt-2">
                        Comprehensive reports on Attendance, Placements, Events, Clubs, and Results.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
                            <GraduationCap className="h-4 w-4 text-blue-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{reports.users.studentCount}</div>
                            <p className="text-xs text-muted-foreground">Active in the system</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Placements / Job Posts</CardTitle>
                            <Building2 className="h-4 w-4 text-green-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{reports.placements.totalSelected} / {reports.placements.totalPosted}</div>
                            <p className="text-xs text-muted-foreground">Students Placed this year</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Graduated Alumni</CardTitle>
                            <Trophy className="h-4 w-4 text-orange-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{reports.users.graduatedCount}</div>
                            <p className="text-xs text-muted-foreground">Moved to Archive Collection</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Results Pass Rate</CardTitle>
                            <BarChart3 className="h-4 w-4 text-purple-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{reports.results.passPercentage}</div>
                            <p className="text-xs text-muted-foreground">Average CGPA: {reports.results.avgCGPA}</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Active Events</CardTitle>
                            <CalendarDays className="h-4 w-4 text-emerald-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{reports.events.activeEvents}</div>
                            <p className="text-xs text-muted-foreground">Participation: {reports.events.participationRate}</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Active Clubs</CardTitle>
                            <UsersRound className="h-4 w-4 text-rose-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{reports.clubs.totalClubs}</div>
                            <p className="text-xs text-muted-foreground">{reports.clubs.activeMembers} Members across campus</p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AdminLayout>
    );
}
