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
} from "lucide-react";
import { useEvents, Event } from "@/contexts/EventContext";
import { cn } from "@/lib/utils";

// ─── Demo events with poster gradients & sample video URLs ───────────────────
interface ShowcaseEvent extends Event {
    posterGradient: string;
    posterIcon: string;
    trailerUrl?: string;
    tagline?: string;
}

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



// ─── Demo events for fallback when no real events exist ──────────────────────
const DEMO_EVENTS: ShowcaseEvent[] = [
    {
        _id: "demo-1",
        event_id: "VIBRANCE2026",
        title: "Vibrance 2026",
        description:
            "The grandest cultural fest of the year! Experience mesmerizing performances, art exhibitions, celebrity concerts, and a breathtaking carnival atmosphere. Three days of non-stop entertainment, food stalls, and unforgettable memories.",
        category: "Cultural",
        date: "2026-03-15T10:00:00",
        endDate: "2026-03-17T22:00:00",
        venue: "Main Auditorium & Campus Grounds",
        organizer: "Student Cultural Committee",
        entryFee: "Free",
        maxParticipants: 5000,
        registeredParticipants: 3200,
        status: "Open",
        featured: true,
        highlights: ["Celebrity Night", "Dance Battle", "Art Exhibition", "DJ Night"],
        prizes: "₹5,00,000",
        posterGradient: CATEGORY_GRADIENTS["Cultural"],
        posterIcon: "🎭",
        tagline: "Where Creativity Meets Passion",
    },
    {
        _id: "demo-2",
        event_id: "TECHNOVA2026",
        title: "TechNova Summit",
        description:
            "48-hour hackathon featuring AI, Blockchain, and IoT challenges. Industry mentors from Google, Microsoft, and Amazon. Build the next big thing and win amazing prizes!",
        category: "Technical",
        date: "2026-02-28T09:00:00",
        endDate: "2026-03-02T18:00:00",
        venue: "Innovation Hub, Block-C",
        organizer: "IEEE Student Branch",
        entryFee: "₹200",
        maxParticipants: 500,
        registeredParticipants: 420,
        status: "Open",
        featured: true,
        highlights: ["Hackathon", "AI Workshop", "Startup Pitch", "Networking"],
        prizes: "₹2,50,000",
        posterGradient: CATEGORY_GRADIENTS["Technical"],
        posterIcon: "🖥️",
        tagline: "Code. Create. Conquer.",
    },
    {
        _id: "demo-3",
        event_id: "ARENACLASH2026",
        title: "Arena Clash 2026",
        description:
            "Inter-college sports tournament with cricket, football, basketball, badminton, and athletics. Compete with the best athletes across the state!",
        category: "Sports",
        date: "2026-03-05T07:00:00",
        endDate: "2026-03-08T18:00:00",
        venue: "University Stadium & Sports Complex",
        organizer: "Sports Committee",
        entryFee: "Free",
        maxParticipants: 2000,
        registeredParticipants: 1500,
        status: "Open",
        featured: true,
        highlights: ["Cricket", "Football", "Esports", "Athletics"],
        prizes: "₹3,00,000",
        posterGradient: CATEGORY_GRADIENTS["Sports"],
        posterIcon: "⚽",
        tagline: "Unleash the Champion Within",
    },
    {
        _id: "demo-4",
        event_id: "DESIGNSPRINT2026",
        title: "Design Sprint Workshop",
        description:
            "A 2-day intensive workshop on UI/UX design, Figma mastery, and design thinking. Learn from senior designers at top tech companies.",
        category: "Workshop",
        date: "2026-02-20T10:00:00",
        endDate: "2026-02-21T17:00:00",
        venue: "Seminar Hall, Block-A",
        organizer: "Google DSC",
        entryFee: "₹100",
        maxParticipants: 150,
        registeredParticipants: 130,
        status: "Open",
        featured: false,
        highlights: ["Figma", "Design Thinking", "Portfolio Review", "Certification"],
        prizes: "Goodies & Certificates",
        posterGradient: CATEGORY_GRADIENTS["Workshop"],
        posterIcon: "🔧",
        tagline: "Design the Future",
    },
    {
        _id: "demo-5",
        event_id: "ROBOTWAR2026",
        title: "RoboWars Championship",
        description:
            "Build your robot and battle it out in the arena! Featuring weight categories, autonomous bots, and the legendary heavyweight showdown.",
        category: "Competition",
        date: "2026-03-10T09:00:00",
        endDate: "2026-03-10T20:00:00",
        venue: "Engineering Block Courtyard",
        organizer: "Robotics Club",
        entryFee: "₹500 per team",
        maxParticipants: 50,
        registeredParticipants: 42,
        status: "Open",
        featured: true,
        highlights: ["Bot Battle", "Autonomous Challenge", "Best Design Award"],
        prizes: "₹1,50,000",
        posterGradient: CATEGORY_GRADIENTS["Competition"],
        posterIcon: "🏆",
        tagline: "Machines at War",
    },
    {
        _id: "demo-6",
        event_id: "AICONF2026",
        title: "AI & Future Tech Conference",
        description:
            "A premier seminar featuring keynotes from industry leaders on AI, ML, Quantum Computing and the future of technology.",
        category: "Seminar",
        date: "2026-03-20T10:00:00",
        endDate: "2026-03-20T17:00:00",
        venue: "Convention Center",
        organizer: "CSE Department",
        entryFee: "Free",
        maxParticipants: 800,
        registeredParticipants: 650,
        status: "Upcoming",
        featured: true,
        highlights: ["Keynote Speakers", "Panel Discussion", "Networking Lunch"],
        posterGradient: CATEGORY_GRADIENTS["Seminar"],
        posterIcon: "📚",
        tagline: "Shaping Tomorrow's Technology",
    },
];

// ─── Helper ──────────────────────────────────────────────────────────────────
function formatShowcaseDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
}

// ─── HeroBanner (Top spotlight, Netflix style) ───────────────────────────────
const HeroBanner = ({
    events,
    onExplore,
}: {
    events: ShowcaseEvent[];
    onExplore: (e: ShowcaseEvent) => void;
}) => {
    const [activeIndex, setActiveIndex] = useState(0);
    const [isTransitioning, setIsTransitioning] = useState(false);
    const timerRef = useRef<ReturnType<typeof setInterval>>();

    const featured = events.filter((e) => e.featured);
    const heroEvents = featured.length > 0 ? featured : events.slice(0, 3);

    const goTo = useCallback(
        (idx: number) => {
            setIsTransitioning(true);
            setTimeout(() => {
                setActiveIndex(idx % heroEvents.length);
                setIsTransitioning(false);
            }, 400);
        },
        [heroEvents.length]
    );

    useEffect(() => {
        timerRef.current = setInterval(() => {
            goTo(activeIndex + 1);
        }, 6000);
        return () => clearInterval(timerRef.current);
    }, [activeIndex, goTo]);

    if (heroEvents.length === 0) return null;
    const active = heroEvents[activeIndex % heroEvents.length];

    const hasPoster = !!active.posterImage;

    return (
        <div
            className={cn("event-hero-banner", hasPoster && "event-hero-banner--has-poster")}
            style={{ background: hasPoster ? '#000' : active.posterGradient }}
        >
            {/* ── NETFLIX-STYLE: full-bleed poster background ── */}
            {hasPoster && (
                <>
                    <img
                        src={active.posterImage}
                        alt=""
                        className="event-hero-fullbleed-bg"
                    />
                    {/* Cinematic gradient overlays for text readability */}
                    <div className="event-hero-gradient-left" />
                    <div className="event-hero-gradient-right" />
                    <div className="event-hero-gradient-bottom" />
                    <div className="event-hero-gradient-top" />
                    {/* Vignette for cinematic edge darkening */}
                    <div className="event-hero-vignette" />
                    {/* Subtle film grain */}
                    <div className="event-hero-film-grain" />
                </>
            )}

            {/* ── FALLBACK: gradient bg + overlay (no poster) ── */}
            {!hasPoster && <div className="event-hero-overlay" />}

            {/* Fallback icon when no poster */}
            {!hasPoster && (
                <div className="event-hero-poster-icon">{active.posterIcon}</div>
            )}

            {/* ── Maturity rating badge (top-right, Netflix style) ── */}
            {hasPoster && active.featured && (
                <div className="event-hero-maturity-badge">
                    <Star className="w-3 h-3 fill-current" /> Featured
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
                {/* Category + status badges */}
                <div className="event-hero-badges">
                    {active.featured && !hasPoster && (
                        <Badge className="event-hero-badge-featured">
                            <Star className="w-3 h-3 mr-0.5 fill-current" /> Featured
                        </Badge>
                    )}
                    <Badge className="event-hero-badge-category">{active.category}</Badge>
                </div>

                {/* Title — large cinematic text */}
                <h2 className={cn("event-hero-title", hasPoster && "event-hero-title--poster")}>
                    {active.title}
                </h2>

                {/* Tagline */}
                {active.tagline && (
                    <p className="event-hero-tagline">{active.tagline}</p>
                )}

                {/* Description */}
                <p className="event-hero-description">{active.description}</p>

                {/* Meta row */}
                <div className="event-hero-meta">
                    <span className="event-hero-meta-item">
                        <Calendar className="w-4 h-4" />
                        {formatShowcaseDate(active.date)}
                    </span>
                    <span className="event-hero-meta-item">
                        <MapPin className="w-4 h-4" />
                        {active.venue}
                    </span>
                    <span className="event-hero-meta-item">
                        <Users className="w-4 h-4" />
                        {active.maxParticipants === 0
                            ? `${active.registeredParticipants}/Unlimited`
                            : `${active.registeredParticipants}/${active.maxParticipants}`}
                    </span>
                </div>

                {/* CTAs */}
                <div className="event-hero-actions">
                    {active.registrationDeadline && (
                        <Button
                            className="event-hero-btn-primary"
                            onClick={() => {
                                if (active.registrationLink) {
                                    window.open(active.registrationLink, "_blank");
                                } else {
                                    onExplore(active);
                                }
                            }}
                        >
                            <Play className="w-4 h-4 mr-2 fill-current" />
                            Register Now
                        </Button>
                    )}
                    <Button
                        variant="outline"
                        className="event-hero-btn-secondary"
                        onClick={() => onExplore(active)}
                    >
                        <Info className="w-4 h-4 mr-2" />
                        More Info
                    </Button>
                </div>
            </div>

            {/* Progress dots */}
            <div className="event-hero-dots">
                {heroEvents.map((_, i) => (
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
}: {
    event: ShowcaseEvent | null;
    onClose: () => void;
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
                        {event.registrationDeadline && (
                            <Button
                                className="event-hero-btn-primary"
                                onClick={() => {
                                    if (event.registrationLink) {
                                        window.open(event.registrationLink, "_blank");
                                    } else {
                                        onClose();
                                    }
                                }}
                            >
                                <Play className="w-4 h-4 mr-2 fill-current" />
                                Register Now
                            </Button>
                        )}
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

// ─── Main EventShowcase Component ────────────────────────────────────────────
const EventShowcase = () => {
    const { events: rawEvents, loading } = useEvents();
    const [selectedEvent, setSelectedEvent] = useState<ShowcaseEvent | null>(null);

    // Merge real events with demo gradient/icon data
    const showcaseEvents: ShowcaseEvent[] =
        rawEvents.length > 0
            ? rawEvents.map((e) => ({
                ...e,
                posterGradient:
                    CATEGORY_GRADIENTS[e.category] || CATEGORY_GRADIENTS["Other"],
                posterIcon: CATEGORY_ICONS[e.category] || "🎪",
                tagline: e.featured ? "Don't Miss This!" : undefined,
            }))
            : DEMO_EVENTS;



    const handleSelect = (e: ShowcaseEvent) => setSelectedEvent(e);

    return (
        <div className="event-showcase">
            {/* Netflix-like hero banner */}
            <HeroBanner events={showcaseEvents} onExplore={handleSelect} />

            {/* Detail modal */}
            <EventDetailModal
                event={selectedEvent}
                onClose={() => setSelectedEvent(null)}
            />
        </div>
    );
};

export default EventShowcase;
