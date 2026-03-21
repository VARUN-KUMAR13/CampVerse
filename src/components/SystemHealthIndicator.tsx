import { useState, useEffect, useMemo, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { api } from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Activity, 
  Database, 
  Cloud, 
  Server, 
  AlertTriangle, 
  Clock,
  RefreshCw,
  Info
} from "lucide-react";
import { cn } from "@/lib/utils";

interface HealthData {
  status: string; // "Online" | "Degraded" | "Down" | "OK"
  timestamp: string;
  services: {
    backend: { status: string; latency: string };
    database: { status: string; usage?: number };
    firebase: { status: string; usage?: number };
  };
}

const SystemHealthIndicator = () => {
    const [lastCheckedCounter, setLastCheckedCounter] = useState<number>(0);

    const { data, isLoading, isError, refetch, isRefetching } = useQuery<HealthData>({
        queryKey: ["system-health"],
        queryFn: () => api.get("/health"),
        refetchInterval: 20000, // Poll every 20s
        staleTime: 15000,
        retry: 2,
    });

    useEffect(() => {
        if (!isRefetching) {
            setLastCheckedCounter(0);
        }
    }, [data, isRefetching]);

    useEffect(() => {
        const timer = setInterval(() => {
            setLastCheckedCounter(prev => prev + 1);
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const status = useMemo(() => {
        if (isError) return "Down";
        if (isLoading && !data) return "Checking...";
        
        const rawStatus = data?.status?.toLowerCase() || "degraded";
        if (rawStatus === "ok") return "Online";
        if (rawStatus === "degraded") return "Degraded";
        if (rawStatus === "down") return "Down";
        return "Degraded";
    }, [data, isLoading, isError]);

    const getStatusColor = useCallback((s: string) => {
        switch (s) {
            case "Online": return "bg-green-500";
            case "Degraded": return "bg-yellow-500";
            case "Down": return "bg-red-500";
            default: return "bg-slate-400";
        }
    }, []);

    const getBadgeStyles = useCallback((s: string) => {
        switch (s) {
            case "Online": return "bg-green-50 text-green-700 border-green-200 hover:bg-green-100/50";
            case "Degraded": return "bg-yellow-50 text-yellow-700 border-yellow-200 hover:bg-yellow-100/50";
            case "Down": return "bg-red-50 text-red-700 border-red-200 hover:bg-red-100/50";
            default: return "bg-slate-50 text-slate-700 border-slate-200";
        }
    }, []);

    return (
        <Popover>
            <PopoverTrigger asChild>
                <button className="outline-none focus:ring-0 group">
                    <Badge 
                        variant="outline" 
                        className={cn(
                            "hidden sm:flex items-center gap-2 select-none cursor-pointer transition-all duration-300 active:scale-95",
                            getBadgeStyles(status)
                        )}
                    >
                        <div className="relative flex items-center justify-center">
                            <motion.div 
                                animate={{ scale: status === "Online" ? [1, 1.4, 1] : 1 }} 
                                transition={{ duration: 2, repeat: Infinity }}
                                className={cn("w-2 h-2 rounded-full", getStatusColor(status))} 
                            />
                            {isRefetching && (
                                <motion.div 
                                    initial={{ rotate: 0 }}
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                    className="absolute inset-0 flex items-center justify-center"
                                >
                                    <div className="w-3 h-3 border-[1.5px] border-t-primary/50 border-transparent rounded-full" />
                                </motion.div>
                            )}
                        </div>
                        <AnimatePresence mode="wait">
                            <motion.span
                                key={status}
                                initial={{ opacity: 0, x: -5 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 5 }}
                                transition={{ duration: 0.2 }}
                                className="whitespace-nowrap"
                            >
                                System {status === "Checking..." ? "Syncing..." : status}
                            </motion.span>
                        </AnimatePresence>
                    </Badge>
                </button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0 overflow-hidden shadow-2xl border-border/40 backdrop-blur-sm" align="end">
                <div className="p-4 bg-muted/30 border-b border-border space-y-1">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 font-bold text-sm tracking-tight">
                            <Activity className="w-4 h-4 text-primary" />
                            Live Health Pulse
                        </div>
                        <div className="text-[10px] uppercase font-bold text-muted-foreground flex items-center gap-1 bg-background/50 px-1.5 py-0.5 rounded border border-border/50">
                            <Clock className="w-3 h-3" />
                            Checked {lastCheckedCounter}s ago
                        </div>
                    </div>
                </div>
                
                <div className="p-4 space-y-5">
                    <HealthItem 
                        icon={<Server className="w-4 h-4" />} 
                        label="Backend API" 
                        status={data ? (data.services?.backend?.status === "OK" ? "OK" : "NOT OK") : (isError ? "NOT OK" : "CHECKING")}
                        subtext={data ? (data.services?.backend?.status === "OK" ? `Processing: ${data.services.backend.latency}` : "Service unreachable") : "Awaiting response..."}
                        indicator={data?.services?.backend?.status === "OK" ? "Online" : (data ? "Down" : "Online")}
                    />
                    
                    <HealthItem 
                        icon={<Database className="w-4 h-4" />} 
                        label="Database Cluster" 
                        status={data ? (data.services?.database?.status === "OK" ? "OK" : "NOT OK") : (isError ? "NOT OK" : "CHECKING")}
                        usage={data?.services?.database?.usage}
                        indicator={data?.services?.database?.status === "OK" ? "Online" : (data ? "Down" : "Online")}
                    />
                    
                    <HealthItem 
                        icon={<Cloud className="w-4 h-4" />} 
                        label="Firebase Core" 
                        status={data ? (data.services?.firebase?.status === "OK" ? "OK" : "NOT OK") : (isError ? "NOT OK" : "CHECKING")}
                        usage={data?.services?.firebase?.usage}
                        indicator={data?.services?.firebase?.status === "OK" ? "Online" : (data ? "Degraded" : "Online")}
                        isFirebase
                    />
                </div>

                <div className="px-4 py-3 bg-muted/20 border-t border-border flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground font-medium">
                        <Info className="w-3 h-3" />
                        Next auto-poll in {Math.max(0, 30 - lastCheckedCounter)}s
                    </div>
                    <button 
                        onClick={() => refetch()} 
                        disabled={isRefetching}
                        className="text-[10px] font-bold text-primary hover:text-primary/80 flex items-center gap-1 disabled:opacity-50 transition-colors uppercase tracking-wider"
                    >
                        <RefreshCw className={cn("w-3 h-3", isRefetching && "animate-spin")} />
                        Refresh
                    </button>
                </div>
            </PopoverContent>
        </Popover>
    );
};

interface HealthItemProps {
    icon: React.ReactNode;
    label: string;
    status: string;
    subtext?: string;
    usage?: number;
    indicator: "Online" | "Degraded" | "Down";
    isFirebase?: boolean;
}

const HealthItem = ({ icon, label, status, subtext, usage, indicator, isFirebase }: HealthItemProps) => {
    const colorClass = indicator === "Online" ? "text-green-500" : indicator === "Degraded" ? "text-yellow-500" : "text-red-500";
    const bgClass = indicator === "Online" ? "bg-green-500" : indicator === "Degraded" ? "bg-yellow-500" : "bg-red-500";
    
    const isCriticalUsage = usage && usage > 80;

    return (
        <div className="space-y-2">
            <div className="flex items-start gap-3">
                <div className="mt-0.5 p-2 rounded-lg bg-background border border-border shadow-sm text-foreground/70">
                    {icon}
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                        <span className="text-xs font-bold text-foreground truncate">{label}</span>
                        <div className="flex items-center gap-2">
                            {isFirebase && isCriticalUsage && (
                                <AlertTriangle className="w-3.5 h-3.5 text-red-500 animate-pulse" />
                            )}
                            <div className="flex items-center gap-1.5">
                                <div className={cn("w-1.5 h-1.5 rounded-full", bgClass)} />
                                <span className={cn("text-[11px] font-black uppercase tracking-tighter", colorClass)}>{status}</span>
                            </div>
                        </div>
                    </div>
                    {subtext && <p className="text-[10px] text-muted-foreground leading-none">{subtext}</p>}
                    
                    {usage !== undefined && (
                        <div className="mt-1.5 space-y-1">
                            <div className="flex items-center justify-between text-[9px] uppercase font-bold text-muted-foreground/70">
                                <span>Utilization</span>
                                <span className={cn(isCriticalUsage && "text-red-500")}>{usage}%</span>
                            </div>
                            <div className="h-1 w-full bg-muted rounded-full overflow-hidden">
                                <motion.div 
                                    initial={{ width: 0 }}
                                    animate={{ width: `${usage}%` }}
                                    className={cn("h-full", isCriticalUsage ? "bg-red-500" : "bg-primary/60")} 
                                />
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SystemHealthIndicator;
