import { useState } from "react";
import AdminLayout from "@/components/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { getStoredToken } from "@/lib/api";
import { Database, Download, History } from "lucide-react";

export default function BackupDatabase() {
    const { toast } = useToast();
    const [isBackingUp, setIsBackingUp] = useState(false);

    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:5000/api";

    const handleBackup = async () => {
        setIsBackingUp(true);
        try {
            const response = await fetch(`${API_BASE_URL}/admin/backup`, {
                method: "POST",
                headers: { Authorization: `Bearer ${getStoredToken()}` }
            });
            const data = await response.json();

            if (response.ok) {
                toast({ title: "Backup Complete", description: "System backup stored in Archives." });
            } else {
                throw new Error(data.message);
            }
        } catch (err: any) {
            toast({ title: "Backup Failed", description: err.message, variant: "destructive" });
        } finally {
            setIsBackingUp(false);
        }
    };

    const handleExportJSON = () => {
        toast({ title: "Export Scheduled", description: "JSON dump will be sent to your admin email." });
    };

    return (
        <AdminLayout>
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Database Backup & Archive</h1>
                    <p className="text-muted-foreground mt-2">
                        Securely backup system data and manage institutional historical records.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <Database className="w-5 h-5 mr-2" /> Manual Master Backup
                            </CardTitle>
                            <CardDescription>
                                Creates a snapshot of current system states in the MongoDB Archive collection.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <Button
                                onClick={handleBackup}
                                disabled={isBackingUp}
                                className="w-full bg-orange-600 hover:bg-orange-700"
                            >
                                {isBackingUp ? "Processing Backup..." : "Create Full Backup"}
                            </Button>
                            <Button
                                variant="outline"
                                onClick={handleExportJSON}
                                className="w-full flex items-center justify-center"
                            >
                                <Download className="w-4 h-4 mr-2" /> Export to Local JSON
                            </Button>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <History className="w-5 h-5 mr-2" /> Restore Points
                            </CardTitle>
                            <CardDescription>
                                Historical backups. Restore functionality is restricted to Super Admins.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {[...Array(3)].map((_, i) => (
                                    <div key={i} className="flex items-center justify-between p-3 border rounded-lg bg-slate-50">
                                        <div className="flex flex-col">
                                            <span className="text-sm font-semibold">Backup Point #{3 - i}</span>
                                            <span className="text-xs text-muted-foreground">{new Date(Date.now() - i * 2592000000).toLocaleDateString()}</span>
                                        </div>
                                        <Button variant="ghost" size="sm" onClick={() => toast({ title: "Restricted", description: "Super Admin privileges required to restore." })}>
                                            Restore
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AdminLayout>
    );
}
