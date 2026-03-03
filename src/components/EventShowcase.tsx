import { useState, useRef, useEffect, useCallback } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Play,
    Info,
    Calendar,
    MapPin,
    Users,
    Star,
    Clock,
    Sparkles,
    CheckCircle,
    Loader2,
    UserPlus,
    Shield,
    Crown,
    Trophy,
    DollarSign,
} from "lucide-react";
import { useEvents, Event } from "@/contexts/EventContext";
import { useClubs, Club } from "@/contexts/ClubContext";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

// ─── Demo events with poster gradients & sample video URLs ───────────────────
interface ShowcaseEvent extends Event {
    posterGradient: string;
    posterIcon: string;
    trailerUrl?: string;
    tagline?: string;
}

// ─── Unified hero item type — events and clubs share the same carousel ───────
interface HeroEventItem extends ShowcaseEvent {
    _type: 'event';
}

interface HeroClubItem {
    _type: 'club';
    _id: string;
    club: Club;
    posterGradient: string;
    posterIcon: string;
    title: string;
    tagline?: string;
    description: string;
    featured: boolean;
}

type HeroItem = HeroEventItem | HeroClubItem;

const CATEGORY_GRADIENTS: Record<string, string> = {
    Technical:
        "linear-gradient(135deg, #0f172a 0%, #1e3a5f 30%, #0ea5e9 70%, #38bdf8 100%)",
    Cultural:
        "linear-gradient(135deg, #1a0a2e 0%, #4a1578 30%, #e040fb 70%, #f48fb1 100%)",
    Sports:
        "linear-gradient(135deg, #1a0000 0%, #6b1010 30%, #ff5722 70%, #ff9800 100%)",
    Workshop:
        "linear-gradient(135deg, #0a1a0a 0%, #1b5e20 30%, #4caf50 70%, #8bc34a 100%)",
    Seminar:
        "linear-gradient(135deg, #0a0a1a 0%, #1a237e 30%, #3f51b5 70%, #7986cb 100%)",
    Competition:
        "linear-gradient(135deg, #1a0922 0%, #880e4f 30%, #e91e63 70%, #f06292 100%)",
    Other:
        "linear-gradient(135deg, #121212 0%, #424242 30%, #757575 70%, #bdbdbd 100%)",
};

const CATEGORY_ICONS: Record<string, string> = {
    Technical: "🖥️",
    Cultural: "🎭",
    Sports: "⚽",
    Workshop: "🔧",
    Seminar: "📚",
    Competition: "🏆",
    Other: "🎪",
};

// ─── Club-specific category gradients (visually distinct from events) ────────
const CLUB_CATEGORY_GRADIENTS: Record<string, string> = {
    Technical:
        "linear-gradient(135deg, #020617 0%, #0c4a6e 30%, #06b6d4 70%, #67e8f9 100%)",
    Cultural:
        "linear-gradient(135deg, #1e0533 0%, #6b21a8 30%, #c084fc 70%, #e9d5ff 100%)",
    Sports:
        "linear-gradient(135deg, #1c0800 0%, #9a3412 30%, #f97316 70%, #fdba74 100%)",
    Literary:
        "linear-gradient(135deg, #0c0a2a 0%, #3730a3 30%, #818cf8 70%, #c7d2fe 100%)",
    Social:
        "linear-gradient(135deg, #022c22 0%, #065f46 30%, #10b981 70%, #6ee7b7 100%)",
    Professional:
        "linear-gradient(135deg, #1a1000 0%, #92400e 30%, #f59e0b 70%, #fde68a 100%)",
    Hobby:
        "linear-gradient(135deg, #1a0800 0%, #9a3412 30%, #fb923c 70%, #fed7aa 100%)",
    Other:
        "linear-gradient(135deg, #0f172a 0%, #334155 30%, #64748b 70%, #cbd5e1 100%)",
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




// ─── Helper ──────────────────────────────────────────────────────────────────
function formatShowcaseDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
}

// ─── HeroBanner (Top spotlight, Netflix style — now supports events + clubs) ─
const HeroBanner = ({
    items,
    onExploreEvent,
    onExploreClub,
    onRegister,
    onJoinClub,
    isRegistered,
    isClubMember,
    processingId,
}: {
    items: HeroItem[];
    onExploreEvent: (e: ShowcaseEvent) => void;
    onExploreClub: (c: Club) => void;
    onRegister: (e: ShowcaseEvent) => void;
    onJoinClub: (c: Club) => void;
    isRegistered: (e: ShowcaseEvent) => boolean;
    isClubMember: (c: Club) => boolean;
    processingId: string | null;
}) => {
    const [activeIndex, setActiveIndex] = useState(0);
    const [isTransitioning, setIsTransitioning] = useState(false);
    const timerRef = useRef<ReturnType<typeof setInterval>>();

    const heroItems = items.length > 0 ? items : [];

    const goTo = useCallback(
        (idx: number) => {
            if (heroItems.length === 0) return;
            setIsTransitioning(true);
            setTimeout(() => {
                setActiveIndex(idx % heroItems.length);
                setIsTransitioning(false);
            }, 400);
        },
        [heroItems.length]
    );

    useEffect(() => {
        if (heroItems.length === 0) return;
        timerRef.current = setInterval(() => {
            goTo(activeIndex + 1);
        }, 6000);
        return () => clearInterval(timerRef.current);
    }, [activeIndex, goTo, heroItems.length]);

    if (heroItems.length === 0) return null;
    const active = heroItems[activeIndex % heroItems.length];
    const isEvent = active._type === 'event';
    const isClub = active._type === 'club';

    // Determine poster/background
    const hasPoster = isEvent ? !!(active as HeroEventItem).posterImage : false;
    const bgGradient = active.posterGradient;
    const bgIcon = active.posterIcon;

    return (
        <div
            className={cn("event-hero-banner", hasPoster && "event-hero-banner--has-poster")}
            style={{ background: hasPoster ? '#000' : bgGradient }}
        >
            {/* ── NETFLIX-STYLE: full-bleed poster background (events only) ── */}
            {hasPoster && isEvent && (
                <>
                    <img
                        src={(active as HeroEventItem).posterImage}
                        alt=""
                        className="event-hero-fullbleed-bg"
                    />
                    <div className="event-hero-gradient-left" />
                    <div className="event-hero-gradient-right" />
                    <div className="event-hero-gradient-bottom" />
                    <div className="event-hero-gradient-top" />
                    <div className="event-hero-vignette" />
                    <div className="event-hero-film-grain" />
                </>
            )}

            {/* ── FALLBACK: gradient bg + overlay ── */}
            {!hasPoster && <div className="event-hero-overlay" />}

            {/* Fallback icon */}
            {!hasPoster && (
                <div className="event-hero-poster-icon">{bgIcon}</div>
            )}

            {/* ── Featured badge (top-right) ── */}
            {active.featured && (
                <div className="event-hero-maturity-badge">
                    <Star className="w-3 h-3 fill-current" /> Featured {isClub ? 'Club' : 'Event'}
                </div>
            )}

            {/* Content */}
            <div
                className={cn(
                    "event-hero-content",
                    hasPoster && "event-hero-content--poster-mode",
                    isTransitioning && "event-hero-content--transitioning"
                )}
            >
                {/* Type + Category badges */}
                <div className="event-hero-badges">
                    {active.featured && !hasPoster && (
                        <Badge className="event-hero-badge-featured">
                            <Star className="w-3 h-3 mr-0.5 fill-current" /> Featured
                        </Badge>
                    )}
                    {isClub && (
                        <Badge className="event-hero-badge-category" style={{ background: 'rgba(139, 92, 246, 0.5)', borderColor: 'rgba(139, 92, 246, 0.6)' }}>
                            🏛️ Club
                        </Badge>
                    )}
                    <Badge className="event-hero-badge-category">
                        {isEvent ? (active as HeroEventItem).category : (active as HeroClubItem).club.category}
                    </Badge>
                </div>

                {/* Title */}
                <h2 className={cn("event-hero-title", hasPoster && "event-hero-title--poster")}>
                    {active.title}
                </h2>

                {/* Tagline */}
                {active.tagline && (
                    <p className="event-hero-tagline">{active.tagline}</p>
                )}

                {/* Description */}
                <p className="event-hero-description">{active.description}</p>

                {/* ── EVENT META ROW ── */}
                {isEvent && (() => {
                    const ev = active as HeroEventItem;
                    return (
                        <div className="event-hero-meta">
                            <span className="event-hero-meta-item">
                                <Calendar className="w-4 h-4" />
                                {formatShowcaseDate(ev.date)}
                            </span>
                            <span className="event-hero-meta-item">
                                <MapPin className="w-4 h-4" />
                                {ev.venue}
                            </span>
                            <span className="event-hero-meta-item">
                                <Users className="w-4 h-4" />
                                {ev.maxParticipants === 0
                                    ? `${ev.registeredParticipants}/Unlimited`
                                    : `${ev.registeredParticipants}/${ev.maxParticipants}`}
                            </span>
                        </div>
                    );
                })()}

                {/* ── CLUB META ROW ── */}
                {isClub && (() => {
                    const cl = (active as HeroClubItem).club;
                    return (
                        <div className="event-hero-meta">
                            <span className="event-hero-meta-item">
                                <Users className="w-4 h-4" />
                                {cl.memberCount} member{cl.memberCount !== 1 ? 's' : ''}
                                {cl.maxMembers > 0 ? ` / ${cl.maxMembers}` : ''}
                            </span>
                            {cl.venue && (
                                <span className="event-hero-meta-item">
                                    <MapPin className="w-4 h-4" />
                                    {cl.venue}
                                </span>
                            )}
                            {cl.meetingSchedule && (
                                <span className="event-hero-meta-item">
                                    <Clock className="w-4 h-4" />
                                    {cl.meetingSchedule}
                                </span>
                            )}
                            <span className="event-hero-meta-item">
                                <DollarSign className="w-4 h-4" />
                                {cl.membershipFee || 'Free'}
                            </span>
                        </div>
                    );
                })()}

                {/* ── EVENT CTAs ── */}
                {isEvent && (() => {
                    const ev = active as HeroEventItem;
                    return (
                        <div className="event-hero-actions">
                            {isRegistered(ev) ? (
                                <Button className="event-hero-btn-primary bg-green-600 hover:bg-green-700 opacity-100 disabled:opacity-100 cursor-default text-white" disabled>
                                    <CheckCircle className="w-4 h-4 mr-2" />
                                    Registered
                                </Button>
                            ) : ev.status === "Open" && (ev.maxParticipants === 0 || ev.registeredParticipants < ev.maxParticipants) ? (
                                <Button
                                    className="event-hero-btn-primary"
                                    onClick={() => onRegister(ev)}
                                    disabled={processingId === ev._id}
                                >
                                    {processingId === ev._id ? (
                                        <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Processing...</>
                                    ) : (
                                        <><Play className="w-4 h-4 mr-2 fill-current" />Register</>
                                    )}
                                </Button>
                            ) : null}
                            <Button
                                variant="outline"
                                className="event-hero-btn-secondary"
                                onClick={() => onExploreEvent(ev)}
                            >
                                <Info className="w-4 h-4 mr-2" />
                                More Info
                            </Button>
                        </div>
                    );
                })()}

                {/* ── CLUB CTAs ── */}
                {isClub && (() => {
                    const cl = (active as HeroClubItem).club;
                    return (
                        <div className="event-hero-actions">
                            {isClubMember(cl) ? (
                                <Button className="event-hero-btn-primary bg-green-600 hover:bg-green-700 opacity-100 disabled:opacity-100 cursor-default text-white" disabled>
                                    <CheckCircle className="w-4 h-4 mr-2" />
                                    Joined
                                </Button>
                            ) : cl.recruitmentStatus === 'Open' ? (
                                <Button
                                    className="event-hero-btn-primary"
                                    onClick={() => onJoinClub(cl)}
                                    disabled={processingId === cl._id}
                                >
                                    {processingId === cl._id ? (
                                        <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Joining...</>
                                    ) : (
                                        <><UserPlus className="w-4 h-4 mr-2" />Join Club</>
                                    )}
                                </Button>
                            ) : (
                                <Button className="event-hero-btn-primary" disabled>
                                    Recruitment {cl.recruitmentStatus}
                                </Button>
                            )}
                            <Button
                                variant="outline"
                                className="event-hero-btn-secondary"
                                onClick={() => onExploreClub(cl)}
                            >
                                <Info className="w-4 h-4 mr-2" />
                                More Info
                            </Button>
                        </div>
                    );
                })()}
            </div>

            {/* Progress dots */}
            <div className="event-hero-dots">
                {heroItems.map((_, i) => (
                    <button
                        key={i}
                        className={cn("event-hero-dot", i === activeIndex && "active")}
                        onClick={() => goTo(i)}
                    />
                ))}
            </div>

        </div>
    );
};



// ─── Event Detail Modal ──────────────────────────────────────────────────────
const EventDetailModal = ({
    event,
    onClose,
    onRegister,
    isRegistered,
    processingId,
}: {
    event: ShowcaseEvent | null;
    onClose: () => void;
    onRegister: (e: ShowcaseEvent) => void;
    isRegistered: (e: ShowcaseEvent) => boolean;
    processingId: string | null;
}) => {
    if (!event) return null;

    return (
        <div className="event-modal-overlay" onClick={onClose}>
            <div
                className="event-modal"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Hero section */}
                <div
                    className="event-modal-hero"
                    style={{ background: event.posterImage ? '#000' : event.posterGradient }}
                >
                    {event.posterImage ? (
                        <>
                            <img
                                src={event.posterImage}
                                alt=""
                                style={{
                                    position: 'absolute',
                                    inset: 0,
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'cover',
                                    zIndex: 0,
                                }}
                            />
                            <div className="event-modal-hero-overlay" />
                        </>
                    ) : (
                        <>
                            <div className="event-modal-hero-overlay" />
                            <div className="event-modal-hero-icon">{event.posterIcon}</div>
                        </>
                    )}
                    <button className="event-modal-close" onClick={onClose}>
                        ✕
                    </button>
                    <div className="event-modal-hero-content">
                        <h2 className="event-modal-title">{event.title}</h2>
                        {event.tagline && (
                            <p className="event-modal-tagline">{event.tagline}</p>
                        )}
                    </div>
                </div>

                {/* Body */}
                <div className="event-modal-body">
                    {/* Badges */}
                    <div className="event-modal-badges">
                        <Badge className="event-card-badge-status">{event.status}</Badge>
                        <Badge className="event-card-badge-cat">{event.category}</Badge>
                        {event.featured && (
                            <Badge className="event-card-badge-featured">
                                <Star className="w-3 h-3 mr-0.5 fill-current" /> Featured
                            </Badge>
                        )}
                    </div>

                    {/* Description */}
                    <p className="event-modal-description">{event.description}</p>

                    {/* Details Grid */}
                    <div className="event-modal-details-grid">
                        <div className="event-modal-detail">
                            <Calendar className="w-5 h-5 text-primary" />
                            <div>
                                <span className="event-modal-detail-label">Date</span>
                                <span className="event-modal-detail-value">
                                    {formatShowcaseDate(event.date)}
                                    {event.endDate && ` - ${formatShowcaseDate(event.endDate)}`}
                                </span>
                            </div>
                        </div>
                        <div className="event-modal-detail">
                            <MapPin className="w-5 h-5 text-primary" />
                            <div>
                                <span className="event-modal-detail-label">Venue</span>
                                <span className="event-modal-detail-value">{event.venue}</span>
                            </div>
                        </div>
                        <div className="event-modal-detail">
                            <Users className="w-5 h-5 text-primary" />
                            <div>
                                <span className="event-modal-detail-label">Participants</span>
                                <span className="event-modal-detail-value">
                                    {event.maxParticipants === 0
                                        ? `${event.registeredParticipants} registered (Unlimited)`
                                        : `${event.registeredParticipants}/${event.maxParticipants} registered`}
                                </span>
                            </div>
                        </div>
                        <div className="event-modal-detail">
                            <Clock className="w-5 h-5 text-primary" />
                            <div>
                                <span className="event-modal-detail-label">Entry Fee</span>
                                <span className="event-modal-detail-value">{event.entryFee}</span>
                            </div>
                        </div>
                    </div>

                    {/* Highlights */}
                    {event.highlights && event.highlights.length > 0 && (
                        <div className="event-modal-highlights">
                            <h4 className="event-modal-highlights-title">
                                <Sparkles className="w-4 h-4" /> Highlights
                            </h4>
                            <div className="event-modal-highlights-list">
                                {event.highlights.map((h, i) => (
                                    <span key={i} className="event-modal-highlight-chip">
                                        {h}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Prizes */}
                    {event.prizes && (
                        <div className="event-modal-prizes">
                            🏆 Prize Pool: <strong>{event.prizes}</strong>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="event-modal-actions">
                        {isRegistered(event) ? (
                            <Button className="event-hero-btn-primary bg-green-600 hover:bg-green-700 opacity-100 disabled:opacity-100 cursor-default text-white" disabled>
                                <CheckCircle className="w-4 h-4 mr-2" />
                                Registered
                            </Button>
                        ) : event.status === "Open" && (event.maxParticipants === 0 || event.registeredParticipants < event.maxParticipants) ? (
                            <Button
                                className="event-hero-btn-primary"
                                onClick={() => onRegister(event)}
                                disabled={processingId === event._id}
                            >
                                {processingId === event._id ? (
                                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Processing...</>
                                ) : (
                                    <><Play className="w-4 h-4 mr-2 fill-current" />Register</>
                                )}
                            </Button>
                        ) : null}
                        <Button
                            variant="outline"
                            className="event-hero-btn-secondary"
                            onClick={onClose}
                        >
                            Close
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// ─── Club Detail Modal ───────────────────────────────────────────────────────
const ClubDetailModal = ({
    club,
    onClose,
    onJoin,
    isMember,
    processingId,
}: {
    club: Club | null;
    onClose: () => void;
    onJoin: (c: Club) => void;
    isMember: boolean;
    processingId: string | null;
}) => {
    if (!club) return null;
    const gradient = CLUB_CATEGORY_GRADIENTS[club.category] || CLUB_CATEGORY_GRADIENTS["Other"];
    const icon = CLUB_CATEGORY_ICONS[club.category] || "⭐";

    return (
        <div className="event-modal-overlay" onClick={onClose}>
            <div className="event-modal" onClick={(e) => e.stopPropagation()}>
                {/* Hero section */}
                <div className="event-modal-hero" style={{ background: gradient }}>
                    <div className="event-modal-hero-overlay" />
                    <div className="event-modal-hero-icon">{icon}</div>
                    <button className="event-modal-close" onClick={onClose}>✕</button>
                    <div className="event-modal-hero-content">
                        <h2 className="event-modal-title">{club.name}</h2>
                        <p className="event-modal-tagline">{club.club_id}</p>
                    </div>
                </div>

                {/* Body */}
                <div className="event-modal-body">
                    {/* Badges */}
                    <div className="event-modal-badges">
                        <Badge className="event-card-badge-cat">{club.category}</Badge>
                        <Badge className={cn(
                            "event-card-badge-status",
                            club.recruitmentStatus === 'Open' && 'text-green-400',
                            club.recruitmentStatus === 'Closed' && 'text-red-400',
                        )}>{club.recruitmentStatus}</Badge>
                        {club.featured && (
                            <Badge className="event-card-badge-featured">
                                <Star className="w-3 h-3 mr-0.5 fill-current" /> Featured
                            </Badge>
                        )}
                    </div>

                    {/* Description */}
                    <p className="event-modal-description">{club.description}</p>

                    {/* Details Grid */}
                    <div className="event-modal-details-grid">
                        <div className="event-modal-detail">
                            <Users className="w-5 h-5 text-primary" />
                            <div>
                                <span className="event-modal-detail-label">Members</span>
                                <span className="event-modal-detail-value">
                                    {club.memberCount}{club.maxMembers > 0 ? ` / ${club.maxMembers}` : ' (Unlimited)'}
                                </span>
                            </div>
                        </div>
                        {club.venue && (
                            <div className="event-modal-detail">
                                <MapPin className="w-5 h-5 text-primary" />
                                <div>
                                    <span className="event-modal-detail-label">Venue</span>
                                    <span className="event-modal-detail-value">{club.venue}</span>
                                </div>
                            </div>
                        )}
                        {club.meetingSchedule && (
                            <div className="event-modal-detail">
                                <Clock className="w-5 h-5 text-primary" />
                                <div>
                                    <span className="event-modal-detail-label">Meeting Schedule</span>
                                    <span className="event-modal-detail-value">{club.meetingSchedule}</span>
                                </div>
                            </div>
                        )}
                        <div className="event-modal-detail">
                            <DollarSign className="w-5 h-5 text-primary" />
                            <div>
                                <span className="event-modal-detail-label">Membership Fee</span>
                                <span className="event-modal-detail-value">{club.membershipFee || 'Free'}</span>
                            </div>
                        </div>
                    </div>

                    {/* President & Advisor */}
                    {(club.president?.name || club.faculty_advisor?.name) && (
                        <div className="event-modal-details-grid" style={{ marginBottom: 16 }}>
                            {club.president?.name && (
                                <div className="event-modal-detail">
                                    <Crown className="w-5 h-5 text-primary" />
                                    <div>
                                        <span className="event-modal-detail-label">President</span>
                                        <span className="event-modal-detail-value">{club.president.name}</span>
                                    </div>
                                </div>
                            )}
                            {club.faculty_advisor?.name && (
                                <div className="event-modal-detail">
                                    <Shield className="w-5 h-5 text-primary" />
                                    <div>
                                        <span className="event-modal-detail-label">Faculty Advisor</span>
                                        <span className="event-modal-detail-value">{club.faculty_advisor.name}</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Achievements */}
                    {club.achievements && club.achievements.length > 0 && (
                        <div className="event-modal-highlights">
                            <h4 className="event-modal-highlights-title">
                                <Trophy className="w-4 h-4" /> Achievements
                            </h4>
                            <div className="event-modal-highlights-list">
                                {club.achievements.map((a, i) => (
                                    <span key={i} className="event-modal-highlight-chip">{a}</span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="event-modal-actions">
                        {isMember ? (
                            <Button className="event-hero-btn-primary bg-green-600 hover:bg-green-700 opacity-100 disabled:opacity-100 cursor-default text-white" disabled>
                                <CheckCircle className="w-4 h-4 mr-2" />
                                Joined
                            </Button>
                        ) : club.recruitmentStatus === 'Open' ? (
                            <Button
                                className="event-hero-btn-primary"
                                onClick={() => onJoin(club)}
                                disabled={processingId === club._id}
                            >
                                {processingId === club._id ? (
                                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Joining...</>
                                ) : (
                                    <><UserPlus className="w-4 h-4 mr-2" />Join Club</>
                                )}
                            </Button>
                        ) : (
                            <Button className="event-hero-btn-primary" disabled>
                                Recruitment {club.recruitmentStatus}
                            </Button>
                        )}
                        <Button variant="outline" className="event-hero-btn-secondary" onClick={onClose}>
                            Close
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// ─── Main EventShowcase Component ────────────────────────────────────────────
declare global { interface Window { Razorpay: any } }

const EventShowcase = () => {
    const { events: rawEvents, loading, registerForEvent } = useEvents();
    const { clubs, joinClub } = useClubs();
    const { userData } = useAuth();
    const { toast } = useToast();
    const [selectedEvent, setSelectedEvent] = useState<ShowcaseEvent | null>(null);
    const [selectedClub, setSelectedClub] = useState<Club | null>(null);
    const [processingId, setProcessingId] = useState<string | null>(null);

    const RAZORPAY_KEY_ID = import.meta.env.VITE_RAZORPAY_KEY_ID as string | undefined;
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

    // ── Build showcase events ──
    const showcaseEvents: ShowcaseEvent[] =
        rawEvents.map((e) => ({
            ...e,
            posterGradient:
                CATEGORY_GRADIENTS[e.category] || CATEGORY_GRADIENTS["Other"],
            posterIcon: CATEGORY_ICONS[e.category] || "🎪",
            tagline: e.featured ? "Don't Miss This!" : undefined,
        }));

    // ── Build unified hero items (featured events + featured clubs) ──
    const heroItems: HeroItem[] = [
        // Featured events
        ...showcaseEvents
            .filter((e) => e.featured)
            .map((e): HeroEventItem => ({ ...e, _type: 'event' })),
        // Featured active clubs
        ...clubs
            .filter((c) => c.featured && c.status === 'Active')
            .map((c): HeroClubItem => ({
                _type: 'club',
                _id: c._id,
                club: c,
                posterGradient: CLUB_CATEGORY_GRADIENTS[c.category] || CLUB_CATEGORY_GRADIENTS["Other"],
                posterIcon: CLUB_CATEGORY_ICONS[c.category] || "⭐",
                title: c.name,
                tagline: `${c.category} Club · ${c.recruitmentStatus === 'Open' ? '🟢 Recruiting Now' : c.recruitmentStatus}`,
                description: c.description,
                featured: true,
            })),
    ];

    // Fallback: if no featured items at all, show first 3 events
    const finalHeroItems = heroItems.length > 0
        ? heroItems
        : showcaseEvents.slice(0, 3).map((e): HeroEventItem => ({ ...e, _type: 'event' }));

    // ── Event helpers ──
    // ── Event helpers ──
    const isRegistered = (event: ShowcaseEvent) => {
        if (!userData?.collegeId) return false;
        // Dynamically reference the absolute latest real-time context data instead of static modal props
        const liveEvent = rawEvents.find(e => e._id === event._id) || event;
        return liveEvent.registeredStudents?.includes(userData.collegeId) || false;
    };

    const isClubMember = (club: Club) => {
        if (!userData?.collegeId) return false;
        const liveClub = clubs.find(c => c._id === club._id) || club;
        return liveClub.joinedStudents?.includes(userData.collegeId) || false;
    };

    const isFreeEvent = (event: ShowcaseEvent) => {
        return !event.entryFee || event.entryFee === 'Free' || event.entryFee === '0' || event.entryFee === '₹0';
    };

    const parseEntryFee = (fee: string): number => {
        const num = parseFloat(fee.replace(/[^0-9.]/g, ''));
        return isNaN(num) ? 0 : num;
    };

    const loadRazorpay = (): Promise<boolean> => {
        return new Promise((resolve) => {
            if (window.Razorpay) return resolve(true);
            const script = document.createElement('script');
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
        });
    };

    const handleRegister = async (event: ShowcaseEvent) => {
        if (isRegistered(event)) return;
        setProcessingId(event._id);

        try {
            if (isFreeEvent(event)) {
                await registerForEvent(event._id);
                toast({ title: 'Registration Successful! ✅', description: `You are now registered for ${event.title}.` });
            } else {
                const amount = parseEntryFee(event.entryFee);
                if (amount <= 0) {
                    await registerForEvent(event._id);
                    toast({ title: 'Registration Successful! ✅', description: `You are now registered for ${event.title}.` });
                    return;
                }

                if (!RAZORPAY_KEY_ID) {
                    toast({ title: 'Payment Unavailable', description: 'Payment configuration is missing. Contact admin.', variant: 'destructive' });
                    return;
                }

                const orderResponse = await fetch(`${API_BASE_URL}/payments/create-order`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        amount,
                        studentId: userData?.collegeId || '',
                        studentName: userData?.name || userData?.collegeId || '',
                        email: userData?.email || `${userData?.collegeId}@cvr.ac.in`,
                        feeType: 'Event Registration',
                        feeDescription: `Registration for ${event.title}`,
                        notes: { source: 'CampVerse Event Registration', eventId: event._id }
                    })
                });

                const orderData = await orderResponse.json();
                if (!orderResponse.ok || !orderData.success) {
                    throw new Error(orderData.error || 'Failed to create payment order');
                }

                const loaded = await loadRazorpay();
                if (!loaded) {
                    toast({ title: 'Payment Unavailable', description: 'Could not load Razorpay. Check your network.', variant: 'destructive' });
                    return;
                }

                const options: any = {
                    key: RAZORPAY_KEY_ID,
                    amount: orderData.order.amount,
                    currency: orderData.order.currency,
                    name: 'CampVerse Events',
                    description: `Registration: ${event.title}`,
                    order_id: orderData.order.id,
                    prefill: {
                        name: userData?.name || userData?.collegeId || 'Student',
                        email: userData?.email || `${userData?.collegeId}@cvr.ac.in`,
                    },
                    notes: { studentId: userData?.collegeId || '', eventId: event._id },
                    theme: { color: '#16a34a' },
                    handler: async function (response: any) {
                        try {
                            const verifyResponse = await fetch(`${API_BASE_URL}/payments/verify`, {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                    razorpay_order_id: response.razorpay_order_id,
                                    razorpay_payment_id: response.razorpay_payment_id,
                                    razorpay_signature: response.razorpay_signature
                                })
                            });
                            const verifyData = await verifyResponse.json();
                            if (verifyData.verified) {
                                await registerForEvent(event._id, response.razorpay_payment_id);
                                toast({ title: 'Registration Successful! ✅', description: `Payment verified. You are registered for ${event.title}.` });
                            } else {
                                toast({ title: 'Payment Verification Failed', description: 'Please contact admin.', variant: 'destructive' });
                            }
                        } catch (verifyError) {
                            console.error('Verification error:', verifyError);
                            toast({ title: 'Payment Received', description: `Transaction ID: ${response.razorpay_payment_id}. Verification pending.` });
                        }
                    },
                    modal: { ondismiss: () => toast({ title: 'Payment Cancelled', description: 'You cancelled the payment.' }) }
                };

                const rzp = new window.Razorpay(options);
                rzp.on('payment.failed', (response: any) => {
                    toast({ title: 'Payment Failed', description: response.error?.description || 'Payment could not be completed.', variant: 'destructive' });
                });
                rzp.open();
            }
        } catch (err: any) {
            console.error('Registration error:', err);
            toast({ title: 'Registration Failed', description: err.message || 'Could not complete registration.', variant: 'destructive' });
        } finally {
            setProcessingId(null);
        }
    };

    // ── Club join handler ──
    const handleJoinClub = async (club: Club) => {
        if (isClubMember(club)) return;
        setProcessingId(club._id);
        try {
            await joinClub(club._id);
            toast({ title: 'Joined Successfully! 🎉', description: `Welcome to ${club.name}!` });
        } catch (err: any) {
            toast({ title: 'Could not join club', description: err.message || 'Something went wrong.', variant: 'destructive' });
        } finally {
            setProcessingId(null);
        }
    };

    return (
        <div className="event-showcase">
            {/* Unified hero banner — events + clubs */}
            <HeroBanner
                items={finalHeroItems}
                onExploreEvent={(e) => setSelectedEvent(e)}
                onExploreClub={(c) => setSelectedClub(c)}
                onRegister={handleRegister}
                onJoinClub={handleJoinClub}
                isRegistered={isRegistered}
                isClubMember={isClubMember}
                processingId={processingId}
            />

            {/* Event detail modal */}
            <EventDetailModal
                event={selectedEvent}
                onClose={() => setSelectedEvent(null)}
                onRegister={handleRegister}
                isRegistered={isRegistered}
                processingId={processingId}
            />

            {/* Club detail modal */}
            <ClubDetailModal
                club={selectedClub}
                onClose={() => setSelectedClub(null)}
                onJoin={handleJoinClub}
                isMember={selectedClub ? isClubMember(selectedClub) : false}
                processingId={processingId}
            />
        </div>
    );
};

export default EventShowcase;
