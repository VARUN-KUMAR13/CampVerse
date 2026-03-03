import { useState, useEffect } from "react";
import AdminLayout from "@/components/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { getStoredToken } from "@/lib/api";
import { AlertTriangle, Download, Settings, RefreshCcw } from "lucide-react";

export default function SystemSettings() {
    const { toast } = useToast();
    const [config, setConfig] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isPromoting, setIsPromoting] = useState(false);

    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:5000/api";

    useEffect(() => {
        fetchConfig();
    }, []);

    const fetchConfig = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/admin/settings`, {
                headers: { Authorization: `Bearer ${getStoredToken()}` }
            });
            if (response.ok) {
                setConfig(await response.json());
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/admin/settings`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${getStoredToken()}`
                },
                body: JSON.stringify(config)
            });
            if (response.ok) {
                toast({ title: "Settings Saved", description: "Global configuration updated successfully." });
            }
        } catch (err) {
            toast({ title: "Error", description: "Failed to save settings.", variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    };

    const handlePromoteStudents = async () => {
        if (!window.confirm("WARNING: This will promote all students to the next academic year and archive 4th years. Continue?")) {
            return;
        }

        setIsPromoting(true);
        try {
            const response = await fetch(`${API_BASE_URL}/admin/promote`, {
                method: "POST",
                headers: { Authorization: `Bearer ${getStoredToken()}` }
            });

            const data = await response.json();

            if (response.ok) {
                toast({ title: "Promotion Successful", description: data.message });
            } else {
                throw new Error(data.message);
            }
        } catch (err: any) {
            toast({ title: "Failed to promote students", description: err.message, variant: "destructive" });
        } finally {
            setIsPromoting(false);
        }
    };

    if (!config) return <AdminLayout><div className="p-8">Loading Settings...</div></AdminLayout>;

    return (
        <AdminLayout>
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">System Settings</h1>
                    <p className="text-muted-foreground mt-2">
                        Configure Academic Year, Attendance thresholds, CGPA formula and global settings.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center"><Settings className="w-5 h-5 mr-2" /> Global Configuration</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSave} className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Academic Year</Label>
                                    <Input
                                        value={config.academicYear || ""}
                                        onChange={e => setConfig({ ...config, academicYear: e.target.value })}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label>Default Semester</Label>
                                    <Select
                                        value={config.defaultSemester || "Odd"}
                                        onValueChange={v => setConfig({ ...config, defaultSemester: v })}
                                    >
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Odd">Odd Semester</SelectItem>
                                            <SelectItem value="Even">Even Semester</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label>Attendance Thresholds (%)</Label>
                                    <div className="grid grid-cols-4 gap-2">
                                        <div><span className="text-xs">4w</span><Input type="number" value={config.attendanceThresholds?.fourWeeks || 75} onChange={e => setConfig({ ...config, attendanceThresholds: { ...config.attendanceThresholds, fourWeeks: +e.target.value } })} /></div>
                                        <div><span className="text-xs">8w</span><Input type="number" value={config.attendanceThresholds?.eightWeeks || 75} onChange={e => setConfig({ ...config, attendanceThresholds: { ...config.attendanceThresholds, eightWeeks: +e.target.value } })} /></div>
                                        <div><span className="text-xs">12w</span><Input type="number" value={config.attendanceThresholds?.twelveWeeks || 75} onChange={e => setConfig({ ...config, attendanceThresholds: { ...config.attendanceThresholds, twelveWeeks: +e.target.value } })} /></div>
                                        <div><span className="text-xs">16w</span><Input type="number" value={config.attendanceThresholds?.sixteenWeeks || 75} onChange={e => setConfig({ ...config, attendanceThresholds: { ...config.attendanceThresholds, sixteenWeeks: +e.target.value } })} /></div>
                                    </div>
                                </div>

                                <div className="space-y-2 border-t pt-4">
                                    <Label className="flex items-center gap-2">
                                        <Checkbox
                                            checked={config.globalNotifications?.emailAlerts}
                                            onCheckedChange={c => setConfig({ ...config, globalNotifications: { ...config.globalNotifications, emailAlerts: !!c } })}
                                        />
                                        Enable Email Alerts globally
                                    </Label>
                                </div>

                                <Button type="submit" disabled={isLoading} className="w-full bg-slate-900">{isLoading ? "Saving..." : "Save Settings"}</Button>
                            </form>
                        </CardContent>
                    </Card>

                    <Card className="border-orange-200 bg-orange-50/30">
                        <CardHeader>
                            <CardTitle className="flex items-center text-orange-700">
                                <AlertTriangle className="w-5 h-5 mr-2" /> Academic Management
                            </CardTitle>
                            <CardDescription>
                                Execute system-wide academic processes. These actions are irreversible.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="p-4 bg-white rounded-lg border shadow-sm">
                                <h3 className="font-semibold text-sm mb-2">Academic Year Promotion</h3>
                                <p className="text-sm text-gray-500 mb-4">
                                    Moves all students up one year (I &rarr; II &rarr; III &rarr; IV). 4th Year students will be marked as Graduated and moved to the Alumni archive.
                                </p>
                                <Button
                                    onClick={handlePromoteStudents}
                                    disabled={isPromoting}
                                    variant="destructive"
                                    className="w-full"
                                >
                                    <RefreshCcw className={`w-4 h-4 mr-2 ${isPromoting ? 'animate-spin' : ''}`} />
                                    {isPromoting ? "Promoting Students..." : "Promote All Students to Next Year"}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AdminLayout>
    );
}
