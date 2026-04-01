import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import StudentLayout from "@/components/StudentLayout";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Clock,
  Users,
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  Send,
  Loader2,
  Star,
  ExternalLink,
  CheckCircle,
  XCircle,
  Trophy,
  DollarSign,
  Eye,
} from "lucide-react";

// ── Interfaces ──
interface EventData {
  _id: string;
  event_id: string;
  title: string;
  description: string;
  category: string;
  date: string;
  endDate?: string;
  venue: string;
  organizer: string;
  entryFee: string;
  maxParticipants: number;
  registeredParticipants: number;
  registeredStudents?: string[];
  status: string;
  featured: boolean;
  highlights: string[];
  prizes?: string;
  registrationDeadline?: string;
  contactEmail?: string;
  contactPhone?: string;
  websiteLink?: string;
  posterImage?: string;
  attachments?: { filename: string; url: string }[];
  postedBy?: { name: string; collegeId: string; email?: string };
  isRegistrationOpen?: boolean;
  viewCount?: number;
  coordinatorRollNo?: string;
  createdAt?: string;
}

interface PostComment {
  _id: string;
  user: { _id: string; name: string; collegeId: string };
  text: string;
  createdAt: string;
}

interface EventPost {
  _id: string;
  eventId: string;
  content: string;
  image?: string;
  createdBy: { _id: string; name: string; collegeId: string; role: string };
  likes: string[];
  comments: PostComment[];
  createdAt: string;
}

// ── Component ──
const EventDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { userData } = useAuth();
  const { toast } = useToast();

  const [event, setEvent] = useState<EventData | null>(null);
  const [posts, setPosts] = useState<EventPost[]>([]);
  const [loadingEvent, setLoadingEvent] = useState(true);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [processingReg, setProcessingReg] = useState(false);

  // Post creation
  const [newPostContent, setNewPostContent] = useState("");
  const [newPostImage, setNewPostImage] = useState("");
  const [submittingPost, setSubmittingPost] = useState(false);

  // Comment management
  const [commentTexts, setCommentTexts] = useState<Record<string, string>>({});
  const [expandedComments, setExpandedComments] = useState<Record<string, boolean>>({});
  const [submittingComment, setSubmittingComment] = useState<string | null>(null);

  // Coordinator check: only the assigned coordinator can post
  const isCoordinator = !!(event?.coordinatorRollNo && userData?.collegeId &&
    event.coordinatorRollNo.toUpperCase() === userData.collegeId.toUpperCase());

  // ── Data fetching ──
  const fetchEvent = useCallback(async () => {
    if (!slug) return;
    setLoadingEvent(true);
    try {
      const data = await api.get(`/events/slug/${slug}`);
      setEvent(data);
    } catch (err: any) {
      console.error("Error fetching event:", err);
      toast({ title: "Error", description: "Event not found.", variant: "destructive" });
    } finally {
      setLoadingEvent(false);
    }
  }, [slug]);

  const fetchPosts = useCallback(async (eventId: string) => {
    setLoadingPosts(true);
    try {
      const data = await api.get(`/events/${eventId}/posts`);
      setPosts(data.posts || []);
    } catch (err: any) {
      console.error("Error fetching posts:", err);
    } finally {
      setLoadingPosts(false);
    }
  }, []);

  useEffect(() => { fetchEvent(); }, [fetchEvent]);
  useEffect(() => { if (event?._id) fetchPosts(event._id); }, [event?._id, fetchPosts]);

  // ── Derived state ──
  const isRegistered = event?.registeredStudents?.includes(userData?.collegeId || "") || false;
  const isPastDeadline = event?.registrationDeadline ? new Date(event.registrationDeadline) < new Date() : false;
  const canRegister =
    !isRegistered && !isPastDeadline && event?.status === "Open" &&
    (event?.maxParticipants === 0 || (event?.registeredParticipants || 0) < (event?.maxParticipants || 0));

  // ── Handlers ──
  const handleRegister = async () => {
    if (!event) return;
    setProcessingReg(true);
    try {
      await api.post(`/events/${event._id}/register`, {});
      toast({ title: "Registration Successful! ✅", description: `You are registered for ${event.title}.` });
      fetchEvent();
    } catch (err: any) {
      toast({ title: "Registration Failed", description: err.message, variant: "destructive" });
    } finally {
      setProcessingReg(false);
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
      toast({ title: "Link Copied! 🔗", description: "Event link copied to clipboard." });
    } catch {
      toast({ title: "Share", description: url });
    }
  };

  const handleCreatePost = async () => {
    if (!event || !newPostContent.trim()) return;
    setSubmittingPost(true);
    try {
      await api.post(`/events/${event._id}/posts`, { content: newPostContent, image: newPostImage || undefined });
      setNewPostContent("");
      setNewPostImage("");
      fetchPosts(event._id);
      toast({ title: "Post Created ✅" });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setSubmittingPost(false);
    }
  };

  const handleLike = async (postId: string) => {
    if (!event) return;
    try {
      const res = await api.post(`/events/${event._id}/posts/${postId}/like`, {});
      setPosts((prev) =>
        prev.map((p) => {
          if (p._id !== postId) return p;
          const userId = (userData as any)?._id || userData?.collegeId || "";
          return res.liked
            ? { ...p, likes: [...p.likes, userId] }
            : { ...p, likes: p.likes.filter((id) => id !== userId) };
        })
      );
    } catch (err: any) {
      console.error("Like error:", err);
    }
  };

  const handleComment = async (postId: string) => {
    if (!event) return;
    const text = commentTexts[postId]?.trim();
    if (!text) return;
    setSubmittingComment(postId);
    try {
      const res = await api.post(`/events/${event._id}/posts/${postId}/comment`, { text });
      setPosts((prev) =>
        prev.map((p) => p._id !== postId ? p : { ...p, comments: [...p.comments, res.comment] })
      );
      setCommentTexts((prev) => ({ ...prev, [postId]: "" }));
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setSubmittingComment(null);
    }
  };

  // ── Format helpers ──
  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
  const formatTime = (d: string) =>
    new Date(d).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true });
  const formatDateTime = (d: string) =>
    new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", hour12: true });
  const timeAgo = (d: string) => {
    const diff = Date.now() - new Date(d).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    if (days < 7) return `${days}d ago`;
    return formatDate(d);
  };

  // ── Loading / Error states ──
  if (loadingEvent) {
    return (
      <StudentLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
        </div>
      </StudentLayout>
    );
  }

  if (!event) {
    return (
      <StudentLayout>
        <div className="py-16 text-center">
          <h2 className="text-2xl font-bold mb-4">Event Not Found</h2>
          <p className="text-muted-foreground mb-6">The event you're looking for doesn't exist or has been removed.</p>
          <Button onClick={() => navigate("/student/events")}>
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Events
          </Button>
        </div>
      </StudentLayout>
    );
  }

  // ── Main Render ──
  return (
    <StudentLayout>
      <div className="space-y-6">
        {/* ═══ BACK NAVIGATION ═══ */}
        <button
          onClick={() => navigate("/student/events")}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-sm group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Events
        </button>

        {/* ═══ BANNER + HEADER ═══ */}
        <Card className="overflow-hidden">
          {event.posterImage && (
            <div className="relative h-[280px] overflow-hidden">
              <img src={event.posterImage} alt={event.title} className="w-full h-full object-cover" />
              <div
                className="absolute inset-0"
                style={{ background: "linear-gradient(to top, hsl(var(--card)) 5%, rgba(0,0,0,0.4) 50%, transparent 100%)" }}
              />
              {event.featured && (
                <Badge className="absolute top-4 right-4 bg-yellow-500/90 backdrop-blur-sm text-white shadow-lg">
                  <Star className="w-3 h-3 mr-1 fill-current" /> Featured
                </Badge>
              )}
            </div>
          )}

          <CardContent className={`${event.posterImage ? "-mt-20 relative z-10" : ""} px-8 py-6`}>
            <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
              {/* Left: Title */}
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="outline" className="text-xs">{event.category}</Badge>
                  <Badge
                    variant="outline"
                    className={`text-xs ${event.status === "Open" ? "bg-green-500/20 text-green-400 border-green-500/30" : "bg-red-500/20 text-red-400 border-red-500/30"}`}
                  >
                    {event.status}
                  </Badge>
                  {isRegistered && (
                    <Badge variant="outline" className="bg-primary/20 text-primary border-primary/30 text-xs">
                      <CheckCircle className="w-3 h-3 mr-1" /> Registered
                    </Badge>
                  )}
                </div>
                <h1 className="text-[28px] lg:text-[32px] font-bold text-foreground leading-tight">{event.title}</h1>
                <p className="text-muted-foreground text-sm">
                  Organized by <span className="font-semibold text-foreground">{event.organizer}</span>
                </p>
              </div>

              {/* Right: Action buttons */}
              <div className="flex flex-wrap gap-3 shrink-0">
                {isRegistered ? (
                  <Button className="bg-green-600 hover:bg-green-700 text-white cursor-default" disabled>
                    <CheckCircle className="w-4 h-4 mr-2" /> Registered
                  </Button>
                ) : isPastDeadline ? (
                  <Button variant="destructive" disabled className="cursor-default">
                    <XCircle className="w-4 h-4 mr-2" /> Registration Closed
                  </Button>
                ) : canRegister ? (
                  <Button className="bg-green-600 hover:bg-green-700 text-white" onClick={handleRegister} disabled={processingReg}>
                    {processingReg && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    Register Now
                  </Button>
                ) : null}
                <Button variant="outline" onClick={handleShare}>
                  <Share2 className="w-4 h-4 mr-2" /> Share
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setBookmarked(!bookmarked)}
                  className={bookmarked ? "border-yellow-500 text-yellow-500" : ""}
                >
                  <Bookmark className={`w-4 h-4 mr-2 ${bookmarked ? "fill-current" : ""}`} />
                  {bookmarked ? "Saved" : "Save"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ═══ MAIN 2-COLUMN LAYOUT ═══ */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6">

          {/* ── LEFT COLUMN (70%) ── */}
          <div className="space-y-6 min-w-0">

            {/* Description Card */}
            <Card>
              <CardContent className="p-7 space-y-5">
                <h2 className="text-xl font-bold">About This Event</h2>
                <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap text-[15px]">{event.description}</p>

                {event.highlights && event.highlights.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold mb-2 text-muted-foreground uppercase tracking-wide">Highlights</h3>
                    <div className="flex flex-wrap gap-2">
                      {event.highlights.map((h, i) => (
                        <Badge key={i} variant="secondary" className="text-xs px-3 py-1">{h}</Badge>
                      ))}
                    </div>
                  </div>
                )}

                {event.prizes && (
                  <div className="flex items-start gap-3 p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                    <Trophy className="w-5 h-5 text-yellow-500 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-sm font-semibold text-yellow-500">Prizes</p>
                      <p className="text-sm text-muted-foreground mt-0.5">{event.prizes}</p>
                    </div>
                  </div>
                )}

                {event.attachments && event.attachments.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold mb-2 text-muted-foreground uppercase tracking-wide">Attachments</h3>
                    <div className="space-y-2">
                      {event.attachments.map((a, i) => (
                        <a
                          key={i}
                          href={a.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-sm text-primary hover:underline"
                        >
                          <ExternalLink className="w-3.5 h-3.5" /> {a.filename}
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* ═══ SOCIAL FEED ═══ */}
            <div className="space-y-5">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-primary" />
                Event Feed
              </h2>

              {/* Create Post (Coordinator Only) */}
              {isCoordinator && (
                <Card className="border-primary/20">
                  <CardContent className="p-6 space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                        {userData?.name?.charAt(0) || "A"}
                      </div>
                      <div>
                        <p className="text-sm font-semibold">{userData?.name || "Coordinator"}</p>
                        <p className="text-xs text-muted-foreground">Event Coordinator</p>
                      </div>
                    </div>
                    <Textarea
                      placeholder="Share an update about this event..."
                      value={newPostContent}
                      onChange={(e) => setNewPostContent(e.target.value)}
                      rows={3}
                      className="resize-none"
                    />
                    {newPostImage && (
                      <div className="relative inline-block">
                        <img src={newPostImage} alt="Preview" className="rounded-lg max-h-40 object-cover" />
                        <button
                          onClick={() => setNewPostImage("")}
                          className="absolute top-2 right-2 bg-background/80 rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-background"
                        >✕</button>
                      </div>
                    )}
                    <div className="flex items-center justify-between gap-4">
                      <Input
                        placeholder="Image URL (optional)"
                        value={newPostImage}
                        onChange={(e) => setNewPostImage(e.target.value)}
                        className="flex-1 text-xs h-9"
                      />
                      <Button onClick={handleCreatePost} disabled={!newPostContent.trim() || submittingPost}>
                        {submittingPost ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
                        Post Update
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Posts */}
              {loadingPosts ? (
                <div className="py-16 text-center">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
                  <p className="text-sm text-muted-foreground mt-3">Loading feed...</p>
                </div>
              ) : posts.length === 0 ? (
                <Card>
                  <CardContent className="py-16 text-center">
                    <MessageCircle className="w-12 h-12 mx-auto mb-3 text-muted-foreground/30" />
                    <p className="text-muted-foreground font-medium">No posts yet</p>
                    {isCoordinator && <p className="text-xs text-muted-foreground mt-1">Create a post to start the conversation!</p>}
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-5">
                  {posts.map((post) => {
                    const isLiked = post.likes.includes((userData as any)?._id || "");
                    const showComments = expandedComments[post._id] || false;

                    return (
                      <Card key={post._id} className="overflow-hidden hover:shadow-lg transition-all duration-200">
                        <CardContent className="p-0">
                          {/* Post Header */}
                          <div className="flex items-center gap-3 px-6 pt-5 pb-3">
                            <div className="w-11 h-11 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                              {post.createdBy?.name?.charAt(0) || "?"}
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-semibold">{post.createdBy?.name || "Unknown"}</p>
                              <p className="text-xs text-muted-foreground">
                                {post.createdBy?.role === "admin" ? "Admin" : "Coordinator"} · {timeAgo(post.createdAt)}
                              </p>
                            </div>
                          </div>

                          {/* Post Content */}
                          <div className="px-6 pb-4">
                            <p className="text-[15px] leading-relaxed whitespace-pre-wrap">{post.content}</p>
                          </div>

                          {/* Post Image */}
                          {post.image && (
                            <div className="px-6 pb-4">
                              <img
                                src={post.image}
                                alt="Post"
                                className="rounded-xl w-full max-h-[420px] object-cover border border-border"
                              />
                            </div>
                          )}

                          {/* Engagement Stats */}
                          <div className="px-6 py-2.5 flex items-center justify-between text-xs text-muted-foreground border-t border-border/40">
                            <span>{post.likes.length} {post.likes.length === 1 ? "like" : "likes"}</span>
                            <span>{post.comments.length} {post.comments.length === 1 ? "comment" : "comments"}</span>
                          </div>

                          {/* Action Bar */}
                          <div className="flex border-t border-border/40">
                            <button
                              onClick={() => handleLike(post._id)}
                              className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors hover:bg-muted/50 ${
                                isLiked ? "text-red-500" : "text-muted-foreground"
                              }`}
                            >
                              <Heart className={`w-[18px] h-[18px] ${isLiked ? "fill-current" : ""}`} />
                              Like
                            </button>
                            <button
                              onClick={() => setExpandedComments((p) => ({ ...p, [post._id]: !p[post._id] }))}
                              className="flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted/50"
                            >
                              <MessageCircle className="w-[18px] h-[18px]" />
                              Comment
                            </button>
                            <button
                              onClick={handleShare}
                              className="flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted/50"
                            >
                              <Share2 className="w-[18px] h-[18px]" />
                              Share
                            </button>
                          </div>

                          {/* Comments */}
                          {showComments && (
                            <div className="border-t border-border/40 bg-muted/10">
                              {post.comments.length > 0 && (
                                <ScrollArea className={post.comments.length > 4 ? "max-h-64" : ""}>
                                  <div className="px-6 py-4 space-y-3">
                                    {post.comments.map((c) => (
                                      <div key={c._id} className="flex gap-2.5">
                                        <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground shrink-0">
                                          {c.user?.name?.charAt(0) || "?"}
                                        </div>
                                        <div className="flex-1">
                                          <div className="bg-muted/60 rounded-2xl px-4 py-2.5">
                                            <p className="text-xs font-semibold">{c.user?.name || "Unknown"}</p>
                                            <p className="text-xs text-muted-foreground leading-relaxed mt-0.5">{c.text}</p>
                                          </div>
                                          <p className="text-[10px] text-muted-foreground mt-1 ml-4">{timeAgo(c.createdAt)}</p>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </ScrollArea>
                              )}

                              {/* Comment Input */}
                              <div className="px-6 py-3 flex items-center gap-3 border-t border-border/30">
                                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary shrink-0">
                                  {userData?.name?.charAt(0) || "?"}
                                </div>
                                <Input
                                  placeholder="Write a comment..."
                                  value={commentTexts[post._id] || ""}
                                  onChange={(e) => setCommentTexts((p) => ({ ...p, [post._id]: e.target.value }))}
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter" && !e.shiftKey) {
                                      e.preventDefault();
                                      handleComment(post._id);
                                    }
                                  }}
                                  className="h-9 text-xs flex-1"
                                />
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-9 w-9 p-0"
                                  onClick={() => handleComment(post._id)}
                                  disabled={submittingComment === post._id || !commentTexts[post._id]?.trim()}
                                >
                                  {submittingComment === post._id ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                  ) : (
                                    <Send className="w-4 h-4 text-primary" />
                                  )}
                                </Button>
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* ── RIGHT COLUMN (Sticky Sidebar — 340px) ── */}
          <div className="space-y-5 lg:sticky lg:top-0 lg:self-start">

            {/* Quick Info Card */}
            <Card>
              <CardContent className="p-6 space-y-5">
                <h3 className="text-sm font-bold uppercase tracking-wide text-muted-foreground">Event Info</h3>

                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <Calendar className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Date</p>
                      <p className="text-sm font-semibold">
                        {formatDate(event.date)}
                        {event.endDate && event.endDate !== event.date && <> — {formatDate(event.endDate)}</>}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <Clock className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Time</p>
                      <p className="text-sm font-semibold">{formatTime(event.date)}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <MapPin className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Venue</p>
                      <p className="text-sm font-semibold">{event.venue}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <Users className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Registered</p>
                      <p className="text-sm font-semibold">
                        {event.registeredParticipants || 0}
                        {event.maxParticipants > 0 ? ` / ${event.maxParticipants}` : " participants"}
                      </p>
                    </div>
                  </div>

                  {event.registrationDeadline && (
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-lg bg-red-500/10 flex items-center justify-center shrink-0">
                        <Clock className="w-4 h-4 text-red-400" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Registration Deadline</p>
                        <p className={`text-sm font-semibold ${isPastDeadline ? "text-destructive" : ""}`}>
                          {formatDateTime(event.registrationDeadline)}
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <DollarSign className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Entry Fee</p>
                      <p className="text-sm font-semibold">{event.entryFee || "Free"}</p>
                    </div>
                  </div>

                  {event.viewCount !== undefined && (
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <Eye className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Views</p>
                        <p className="text-sm font-semibold">{event.viewCount}</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Contact Card */}
            {(event.contactEmail || event.contactPhone || event.websiteLink) && (
              <Card>
                <CardContent className="p-6 space-y-4">
                  <h3 className="text-sm font-bold uppercase tracking-wide text-muted-foreground">Contact</h3>
                  {event.contactEmail && (
                    <div>
                      <p className="text-xs text-muted-foreground">Email</p>
                      <p className="text-sm font-medium">{event.contactEmail}</p>
                    </div>
                  )}
                  {event.contactPhone && (
                    <div>
                      <p className="text-xs text-muted-foreground">Phone</p>
                      <p className="text-sm font-medium">{event.contactPhone}</p>
                    </div>
                  )}
                  {event.websiteLink && (
                    <a
                      href={event.websiteLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm text-primary hover:underline font-medium"
                    >
                      <ExternalLink className="w-3.5 h-3.5" /> Visit Website
                    </a>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </StudentLayout>
  );
};

export default EventDetail;
