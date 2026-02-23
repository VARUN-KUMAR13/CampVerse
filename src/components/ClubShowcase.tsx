import { useState, useRef } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Users,
    Star,
    ChevronLeft,
    ChevronRight,
    MapPin,
    Clock,
    Trophy,
    UserPlus,
    CheckCircle,
    Loader2,
    X,
    Shield,
    Sparkles,
    Crown,
    DollarSign,
} from "lucide-react";
import { useClubs, Club } from "@/contexts/ClubContext";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

// ─── Category colors for club cards ──────────────────────────────────────────
const CLUB_CATEGORY_COLORS: Record<string, { gradient: string; accent: string; glow: string }> = {
    Technical: {
        gradient: "linear-gradient(135deg, #06b6d4, #3b82f6)",
        accent: "#3b82f6",
        glow: "rgba(59, 130, 246, 0.3)",
    },
    Cultural: {
        gradient: "linear-gradient(135deg, #f472b6, #a855f7)",
        accent: "#a855f7",
        glow: "rgba(168, 85, 247, 0.3)",
    },
    Sports: {
        gradient: "linear-gradient(135deg, #f97316, #ef4444)",
        accent: "#ef4444",
        glow: "rgba(239, 68, 68, 0.3)",
    },
    Literary: {
        gradient: "linear-gradient(135deg, #a78bfa, #6366f1)",
        accent: "#6366f1",
        glow: "rgba(99, 102, 241, 0.3)",
    },
    Social: {
        gradient: "linear-gradient(135deg, #34d399, #10b981)",
        accent: "#10b981",
        glow: "rgba(16, 185, 129, 0.3)",
    },
    Professional: {
        gradient: "linear-gradient(135deg, #fbbf24, #f59e0b)",
        accent: "#f59e0b",
        glow: "rgba(245, 158, 11, 0.3)",
    },
    Hobby: {
        gradient: "linear-gradient(135deg, #fb923c, #f97316)",
        accent: "#f97316",
        glow: "rgba(249, 115, 22, 0.3)",
    },
    Other: {
        gradient: "linear-gradient(135deg, #94a3b8, #64748b)",
        accent: "#64748b",
        glow: "rgba(100, 116, 139, 0.3)",
    },
};

const CLUB_CATEGORY_ICONS: Record<string, string> = {
    Technical: "💻",
    Cultural: "🎭",
    Sports: "🏆",
    Literary: "📖",
    Social: "🤝",
    Professional: "💼",
    Hobby: "🎨",
    Other: "⭐",
};

// ─── Club Detail Modal ───────────────────────────────────────────────────────
const ClubDetailModal = ({
    club,
    onClose,
    onJoin,
    isMember,
    processing,
}: {
    club: Club | null;
    onClose: () => void;
    onJoin: (club: Club) => void;
    isMember: boolean;
    processing: boolean;
}) => {
    if (!club) return null;
    const colors = CLUB_CATEGORY_COLORS[club.category] || CLUB_CATEGORY_COLORS["Other"];
    const icon = CLUB_CATEGORY_ICONS[club.category] || "⭐";

    return (
        <div className="club-modal-overlay" onClick={onClose}>
            <div className="club-modal" onClick={(e) => e.stopPropagation()}>
                {/* Hero header with gradient */}
                <div className="club-modal-hero" style={{ background: colors.gradient }}>
                    <div className="club-modal-hero-pattern" />
                    <button className="club-modal-close" onClick={onClose}>
                        <X className="w-4 h-4" />
                    </button>
                    <div className="club-modal-hero-content">
                        <span className="club-modal-hero-icon">{icon}</span>
                        <h2 className="club-modal-title">{club.name}</h2>
                        {club.club_id && (
                            <span className="club-modal-id">{club.club_id}</span>
                        )}
                    </div>
                </div>

                {/* Body */}
                <div className="club-modal-body">
                    {/* Status badges */}
                    <div className="club-modal-badges">
                        <Badge className="club-badge-category" style={{ background: colors.accent }}>
                            {club.category}
                        </Badge>
                        <Badge className={cn(
                            "club-badge-status",
                            club.recruitmentStatus === "Open" && "club-badge-open",
                            club.recruitmentStatus === "Closed" && "club-badge-closed",
                            club.recruitmentStatus === "Coming Soon" && "club-badge-coming"
                        )}>
                            {club.recruitmentStatus}
                        </Badge>
                        {club.featured && (
                            <Badge className="club-badge-featured">
                                <Star className="w-3 h-3 mr-0.5 fill-current" /> Featured
                            </Badge>
                        )}
                    </div>

                    {/* Description */}
                    <p className="club-modal-description">{club.description}</p>

                    {/* Details grid */}
                    <div className="club-modal-details-grid">
                        <div className="club-modal-detail">
                            <Users className="w-5 h-5" style={{ color: colors.accent }} />
                            <div>
                                <span className="club-modal-detail-label">Members</span>
                                <span className="club-modal-detail-value">
                                    {club.memberCount}{club.maxMembers > 0 ? ` / ${club.maxMembers}` : " (Unlimited)"}
                                </span>
                            </div>
                        </div>
                        {club.venue && (
                            <div className="club-modal-detail">
                                <MapPin className="w-5 h-5" style={{ color: colors.accent }} />
                                <div>
                                    <span className="club-modal-detail-label">Venue</span>
                                    <span className="club-modal-detail-value">{club.venue}</span>
                                </div>
                            </div>
                        )}
                        {club.meetingSchedule && (
                            <div className="club-modal-detail">
                                <Clock className="w-5 h-5" style={{ color: colors.accent }} />
                                <div>
                                    <span className="club-modal-detail-label">Meeting Schedule</span>
                                    <span className="club-modal-detail-value">{club.meetingSchedule}</span>
                                </div>
                            </div>
                        )}
                        {club.membershipFee && (
                            <div className="club-modal-detail">
                                <DollarSign className="w-5 h-5" style={{ color: colors.accent }} />
                                <div>
                                    <span className="club-modal-detail-label">Membership Fee</span>
                                    <span className="club-modal-detail-value">{club.membershipFee}</span>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* President & Advisor */}
                    {(club.president?.name || club.faculty_advisor?.name) && (
                        <div className="club-modal-people">
                            {club.president?.name && (
                                <div className="club-modal-person">
                                    <Crown className="w-4 h-4" style={{ color: colors.accent }} />
                                    <div>
                                        <span className="club-modal-person-role">President</span>
                                        <span className="club-modal-person-name">{club.president.name}</span>
                                    </div>
                                </div>
                            )}
                            {club.faculty_advisor?.name && (
                                <div className="club-modal-person">
                                    <Shield className="w-4 h-4" style={{ color: colors.accent }} />
                                    <div>
                                        <span className="club-modal-person-role">Faculty Advisor</span>
                                        <span className="club-modal-person-name">{club.faculty_advisor.name}</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Achievements */}
                    {club.achievements && club.achievements.length > 0 && (
                        <div className="club-modal-achievements">
                            <h4 className="club-modal-section-title">
                                <Trophy className="w-4 h-4" /> Achievements
                            </h4>
                            <div className="club-modal-achievements-list">
                                {club.achievements.map((a, i) => (
                                    <span key={i} className="club-modal-achievement-chip">{a}</span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="club-modal-actions">
                        {isMember ? (
                            <Button className="club-btn-joined" disabled>
                                <CheckCircle className="w-4 h-4 mr-2" />
                                Already a Member
                            </Button>
                        ) : club.recruitmentStatus === "Open" ? (
                            <Button
                                className="club-btn-join"
                                style={{ background: colors.gradient }}
                                onClick={() => onJoin(club)}
                                disabled={processing}
                            >
                                {processing ? (
                                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Joining...</>
                                ) : (
                                    <><UserPlus className="w-4 h-4 mr-2" />Join Club</>
                                )}
                            </Button>
                        ) : (
                            <Button className="club-btn-closed" disabled>
                                Recruitment {club.recruitmentStatus}
                            </Button>
                        )}
                        <Button variant="outline" className="club-btn-close" onClick={onClose}>
                            Close
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// ─── Main ClubShowcase Component ─────────────────────────────────────────────
const ClubShowcase = () => {
    const { clubs, loading, joinClub } = useClubs();
    const { userData } = useAuth();
    const { toast } = useToast();
    const [selectedClub, setSelectedClub] = useState<Club | null>(null);
    const [processingClubId, setProcessingClubId] = useState<string | null>(null);
    const scrollRef = useRef<HTMLDivElement>(null);

    // Only show featured active clubs
    const featuredClubs = clubs.filter(
        (c) => c.featured && c.status === "Active"
    );

    const isMember = (club: Club) => {
        if (!userData?.collegeId || !club.joinedStudents) return false;
        return club.joinedStudents.includes(userData.collegeId);
    };

    const handleJoin = async (club: Club) => {
        if (isMember(club)) return;
        setProcessingClubId(club._id);
        try {
            await joinClub(club._id);
            toast({
                title: "Joined Successfully! 🎉",
                description: `Welcome to ${club.name}!`,
            });
        } catch (err: any) {
            toast({
                title: "Could not join club",
                description: err.message || "Something went wrong.",
                variant: "destructive",
            });
        } finally {
            setProcessingClubId(null);
        }
    };

    const scroll = (dir: "left" | "right") => {
        if (!scrollRef.current) return;
        const amount = 320;
        scrollRef.current.scrollBy({
            left: dir === "left" ? -amount : amount,
            behavior: "smooth",
        });
    };

    // Don't render if no featured clubs and not loading
    if (!loading && featuredClubs.length === 0) return null;

    return (
        <div className="club-showcase">
            {/* Section header */}
            <div className="club-showcase-header">
                <div className="club-showcase-header-left">
                    <Sparkles className="w-5 h-5 club-showcase-header-icon" />
                    <h2 className="club-showcase-title">Featured Clubs</h2>
                    <span className="club-showcase-count">{featuredClubs.length}</span>
                </div>
                <div className="club-showcase-arrows">
                    <button className="club-showcase-arrow" onClick={() => scroll("left")}>
                        <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button className="club-showcase-arrow" onClick={() => scroll("right")}>
                        <ChevronRight className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Scrollable row of club cards */}
            {loading ? (
                <div className="club-showcase-loading">
                    <Loader2 className="w-6 h-6 animate-spin" />
                    <span>Loading clubs...</span>
                </div>
            ) : (
                <div className="club-showcase-scroll" ref={scrollRef}>
                    {featuredClubs.map((club) => {
                        const colors = CLUB_CATEGORY_COLORS[club.category] || CLUB_CATEGORY_COLORS["Other"];
                        const icon = CLUB_CATEGORY_ICONS[club.category] || "⭐";
                        const memberPercent = club.maxMembers > 0
                            ? Math.min(100, Math.round((club.memberCount / club.maxMembers) * 100))
                            : null;
                        const memberOfClub = isMember(club);

                        return (
                            <div
                                key={club._id}
                                className="club-card"
                                onClick={() => setSelectedClub(club)}
                            >
                                {/* Gradient border glow */}
                                <div className="club-card-glow" style={{ background: colors.glow }} />

                                {/* Top accent bar */}
                                <div className="club-card-accent" style={{ background: colors.gradient }} />

                                {/* Card content */}
                                <div className="club-card-body">
                                    {/* Icon + Category */}
                                    <div className="club-card-top">
                                        <span className="club-card-icon">{icon}</span>
                                        <Badge
                                            className="club-card-category"
                                            style={{ background: `${colors.accent}22`, color: colors.accent, borderColor: `${colors.accent}44` }}
                                        >
                                            {club.category}
                                        </Badge>
                                    </div>

                                    {/* Club name */}
                                    <h3 className="club-card-name">{club.name}</h3>

                                    {/* Description */}
                                    <p className="club-card-desc">{club.description}</p>

                                    {/* Meta info */}
                                    <div className="club-card-meta">
                                        <span className="club-card-meta-item">
                                            <Users className="w-3.5 h-3.5" />
                                            {club.memberCount} member{club.memberCount !== 1 ? "s" : ""}
                                        </span>
                                        {club.venue && (
                                            <span className="club-card-meta-item">
                                                <MapPin className="w-3.5 h-3.5" />
                                                {club.venue}
                                            </span>
                                        )}
                                    </div>

                                    {/* Capacity bar */}
                                    {memberPercent !== null && (
                                        <div className="club-card-capacity">
                                            <div className="club-card-capacity-bar">
                                                <div
                                                    className="club-card-capacity-fill"
                                                    style={{
                                                        width: `${memberPercent}%`,
                                                        background: colors.gradient,
                                                    }}
                                                />
                                            </div>
                                            <span className="club-card-capacity-text">
                                                {club.memberCount}/{club.maxMembers} seats
                                            </span>
                                        </div>
                                    )}

                                    {/* Recruitment + Join button */}
                                    <div className="club-card-footer">
                                        <Badge className={cn(
                                            "club-card-recruitment",
                                            club.recruitmentStatus === "Open" && "club-badge-open",
                                            club.recruitmentStatus === "Closed" && "club-badge-closed",
                                            club.recruitmentStatus === "Coming Soon" && "club-badge-coming"
                                        )}>
                                            {club.recruitmentStatus === "Open" ? "🟢" : club.recruitmentStatus === "Closed" ? "🔴" : "🟡"}{" "}
                                            {club.recruitmentStatus}
                                        </Badge>

                                        {memberOfClub ? (
                                            <span className="club-card-member-badge">
                                                <CheckCircle className="w-3 h-3" /> Member
                                            </span>
                                        ) : club.recruitmentStatus === "Open" ? (
                                            <Button
                                                size="sm"
                                                className="club-card-join-btn"
                                                style={{ background: colors.gradient }}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleJoin(club);
                                                }}
                                                disabled={processingClubId === club._id}
                                            >
                                                {processingClubId === club._id ? (
                                                    <Loader2 className="w-3 h-3 animate-spin" />
                                                ) : (
                                                    <><UserPlus className="w-3 h-3 mr-1" />Join</>
                                                )}
                                            </Button>
                                        ) : null}
                                    </div>
                                </div>

                                {/* Featured star */}
                                <div className="club-card-featured" style={{ color: colors.accent }}>
                                    <Star className="w-3 h-3 fill-current" />
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Detail modal */}
            <ClubDetailModal
                club={selectedClub}
                onClose={() => setSelectedClub(null)}
                onJoin={handleJoin}
                isMember={selectedClub ? isMember(selectedClub) : false}
                processing={processingClubId === selectedClub?._id}
            />
        </div>
    );
};

export default ClubShowcase;
