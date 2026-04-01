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
  UserPlus,
  UsersRound,
} from "lucide-react";

// ── Interfaces ──
interface ClubData {
  _id: string;
  club_id: string;
  name: string;
  description: string;
  category: string;
  foundedYear?: number;
  logo?: string;
  coverImage?: string;
  president?: { name: string; email: string; phone: string };
  faculty_advisor?: { name: string; email: string; department: string };
  memberCount: number;
  joinedStudents?: string[];
  maxMembers: number;
  meetingSchedule?: string;
  venue?: string;
  achievements?: string[];
  socialLinks?: { instagram?: string; linkedin?: string; twitter?: string; website?: string };
  recruitmentStatus: string;
  recruitmentDeadline?: string;
  eligibility: string;
  membershipFee: string;
  tags?: string[];
  featured: boolean;
  status: string;
  coordinatorRollNo?: string;
  postedBy?: { name: string; collegeId: string; email?: string };
  isRecruitmentOpen?: boolean;
  createdAt?: string;
}

interface PostComment {
  _id: string;
  user: { _id: string; name: string; collegeId: string };
  text: string;
  createdAt: string;
}

interface ClubPost {
  _id: string;
  clubId: string;
  content: string;
  image?: string;
  createdBy: { _id: string; name: string; collegeId: string; role: string };
  likes: string[];
  comments: PostComment[];
  createdAt: string;
}

// ── Component ──
const ClubDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { userData } = useAuth();
  const { toast } = useToast();

  const [club, setClub] = useState<ClubData | null>(null);
  const [posts, setPosts] = useState<ClubPost[]>([]);
  const [loadingClub, setLoadingClub] = useState(true);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [processingJoin, setProcessingJoin] = useState(false);

  // Post creation
  const [newPostContent, setNewPostContent] = useState("");
  const [newPostImage, setNewPostImage] = useState("");
  const [submittingPost, setSubmittingPost] = useState(false);

  // Comment management
  const [commentTexts, setCommentTexts] = useState<Record<string, string>>({});
  const [expandedComments, setExpandedComments] = useState<Record<string, boolean>>({});
  const [submittingComment, setSubmittingComment] = useState<string | null>(null);

  // Coordinator check
  const isCoordinator = !!(club?.coordinatorRollNo && userData?.collegeId &&
    club.coordinatorRollNo.toUpperCase() === userData.collegeId.toUpperCase());

  // ── Data fetching ──
  const fetchClub = useCallback(async () => {
    if (!slug) return;
    setLoadingClub(true);
    try {
      const data = await api.get(`/clubs/slug/${slug}`);
      setClub(data);
    } catch (err: any) {
      console.error("Error fetching club:", err);
      toast({ title: "Error", description: "Club not found.", variant: "destructive" });
    } finally {
      setLoadingClub(false);
    }
  }, [slug]);

  const fetchPosts = useCallback(async (clubId: string) => {
    setLoadingPosts(true);
    try {
      const data = await api.get(`/clubs/${clubId}/posts`);
      setPosts(data.posts || []);
    } catch (err: any) {
      console.error("Error fetching posts:", err);
    } finally {
      setLoadingPosts(false);
    }
  }, []);

  useEffect(() => { fetchClub(); }, [fetchClub]);
  useEffect(() => { if (club?._id) fetchPosts(club._id); }, [club?._id, fetchPosts]);

  // ── Derived state ──
  const isJoined = club?.joinedStudents?.includes(userData?.collegeId || "") || false;
  const isPastDeadline = club?.recruitmentDeadline ? new Date(club.recruitmentDeadline) < new Date() : false;
  const canJoin = !isJoined && !isPastDeadline && club?.recruitmentStatus === "Open" &&
    (club?.maxMembers === 0 || club.memberCount < club.maxMembers);

  // ── Handlers ──
  const handleJoin = async () => {
    if (!club) return;
    setProcessingJoin(true);
    try {
      await api.post(`/clubs/${club._id}/join`, {});
      toast({ title: "Joined Successfully! ✅", description: `You are now a member of ${club.name}.` });
      fetchClub();
    } catch (err: any) {
      toast({ title: "Join Failed", description: err.message, variant: "destructive" });
    } finally {
      setProcessingJoin(false);
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
      toast({ title: "Link Copied! 🔗", description: "Club link copied to clipboard." });
    } catch {
      toast({ title: "Share", description: url });
    }
  };

  const handleCreatePost = async () => {
    if (!club || !newPostContent.trim()) return;
    setSubmittingPost(true);
    try {
      await api.post(`/clubs/${club._id}/posts`, { content: newPostContent, image: newPostImage || undefined });
      setNewPostContent("");
      setNewPostImage("");
      fetchPosts(club._id);
      toast({ title: "Post Created ✅" });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setSubmittingPost(false);
    }
  };

  const handleLike = async (postId: string) => {
    if (!club) return;
    try {
      const res = await api.post(`/clubs/${club._id}/posts/${postId}/like`, {});
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
    if (!club) return;
    const text = commentTexts[postId]?.trim();
    if (!text) return;
    setSubmittingComment(postId);
    try {
      const res = await api.post(`/clubs/${club._id}/posts/${postId}/comment`, { text });
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
  if (loadingClub) {
    return (
      <StudentLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
        </div>
      </StudentLayout>
    );
  }

  if (!club) {
    return (
      <StudentLayout>
        <div className="py-16 text-center">
          <h2 className="text-2xl font-bold mb-4">Club Not Found</h2>
          <p className="text-muted-foreground mb-6">The club you're looking for doesn't exist or has been removed.</p>
          <Button onClick={() => navigate("/student/clubs")}>
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Clubs
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
          onClick={() => navigate("/student/clubs")}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-sm group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Clubs
        </button>

        {/* ═══ BANNER + HEADER ═══ */}
        <Card className="overflow-hidden">
          {club.coverImage && (
            <div className="relative h-[280px] overflow-hidden">
              <img src={club.coverImage} alt={club.name} className="w-full h-full object-cover" />
              <div
                className="absolute inset-0"
                style={{ background: "linear-gradient(to top, hsl(var(--card)) 5%, rgba(0,0,0,0.4) 50%, transparent 100%)" }}
              />
              {club.featured && (
                <Badge className="absolute top-4 right-4 bg-yellow-500/90 backdrop-blur-sm text-white shadow-lg">
                  <Star className="w-3 h-3 mr-1 fill-current" /> Featured
                </Badge>
              )}
            </div>
          )}

          <CardContent className={`${club.coverImage ? "-mt-20 relative z-10" : ""} px-8 py-6`}>
            <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
              {/* Left: Title + Info */}
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="outline" className="text-xs">{club.category}</Badge>
                  <Badge
                    variant="outline"
                    className={`text-xs ${club.recruitmentStatus === "Open" ? "bg-green-500/20 text-green-400 border-green-500/30" : "bg-red-500/20 text-red-400 border-red-500/30"}`}
                  >
                    {club.recruitmentStatus === "Open" ? "Recruiting" : club.recruitmentStatus}
                  </Badge>
                  {isJoined && (
                    <Badge variant="outline" className="bg-primary/20 text-primary border-primary/30 text-xs">
                      <CheckCircle className="w-3 h-3 mr-1" /> Member
                    </Badge>
                  )}
                </div>
                <h1 className="text-[28px] lg:text-[32px] font-bold text-foreground leading-tight">{club.name}</h1>
                <p className="text-muted-foreground text-sm">
                  {club.foundedYear ? `Est. ${club.foundedYear}` : club.club_id}
                  {club.president?.name && <> · Led by <span className="font-semibold text-foreground">{club.president.name}</span></>}
                </p>
              </div>

              {/* Right: Action buttons */}
              <div className="flex flex-wrap gap-3 shrink-0">
                {isJoined ? (
                  <Button className="bg-green-600 hover:bg-green-700 text-white cursor-default" disabled>
                    <CheckCircle className="w-4 h-4 mr-2" /> Joined
                  </Button>
                ) : isPastDeadline ? (
                  <Button variant="destructive" disabled className="cursor-default">
                    <XCircle className="w-4 h-4 mr-2" /> Joining Closed
                  </Button>
                ) : canJoin ? (
                  <Button className="bg-green-600 hover:bg-green-700 text-white" onClick={handleJoin} disabled={processingJoin}>
                    {processingJoin && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    <UserPlus className="w-4 h-4 mr-2" /> Join Club
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

          {/* ── LEFT COLUMN ── */}
          <div className="space-y-6 min-w-0">

            {/* Description */}
            <Card>
              <CardContent className="p-7 space-y-5">
                <h2 className="text-xl font-bold">About This Club</h2>
                <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap text-[15px]">{club.description}</p>

                {club.achievements && club.achievements.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold mb-2 text-muted-foreground uppercase tracking-wide">Achievements</h3>
                    <div className="flex flex-wrap gap-2">
                      {club.achievements.map((a, i) => (
                        <Badge key={i} variant="secondary" className="text-xs px-3 py-1">
                          <Trophy className="w-3 h-3 mr-1" />{a}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {club.tags && club.tags.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold mb-2 text-muted-foreground uppercase tracking-wide">Tags</h3>
                    <div className="flex flex-wrap gap-2">
                      {club.tags.map((t, i) => (
                        <Badge key={i} variant="outline" className="text-xs">{t}</Badge>
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
                Club Feed
              </h2>

              {/* Create Post (Coordinator Only) */}
              {isCoordinator && (
                <Card className="border-primary/20">
                  <CardContent className="p-6 space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                        {userData?.name?.charAt(0) || "C"}
                      </div>
                      <div>
                        <p className="text-sm font-semibold">{userData?.name || "Coordinator"}</p>
                        <p className="text-xs text-muted-foreground">Club Coordinator</p>
                      </div>
                    </div>
                    <Textarea
                      placeholder="Share an update about this club..."
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
                                Coordinator · {timeAgo(post.createdAt)}
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
                              <img src={post.image} alt="Post" className="rounded-xl w-full max-h-[420px] object-cover border border-border" />
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
                              className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors hover:bg-muted/50 ${isLiked ? "text-red-500" : "text-muted-foreground"}`}
                            >
                              <Heart className={`w-[18px] h-[18px] ${isLiked ? "fill-current" : ""}`} /> Like
                            </button>
                            <button
                              onClick={() => setExpandedComments((p) => ({ ...p, [post._id]: !p[post._id] }))}
                              className="flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted/50"
                            >
                              <MessageCircle className="w-[18px] h-[18px]" /> Comment
                            </button>
                            <button
                              onClick={handleShare}
                              className="flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted/50"
                            >
                              <Share2 className="w-[18px] h-[18px]" /> Share
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

          {/* ── RIGHT COLUMN (Sticky Sidebar) ── */}
          <div className="space-y-5 lg:sticky lg:top-0 lg:self-start">

            {/* Quick Info */}
            <Card>
              <CardContent className="p-6 space-y-5">
                <h3 className="text-sm font-bold uppercase tracking-wide text-muted-foreground">Club Info</h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <Users className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Members</p>
                      <p className="text-sm font-semibold">
                        {club.memberCount || 0}
                        {club.maxMembers > 0 ? ` / ${club.maxMembers}` : " members"}
                      </p>
                    </div>
                  </div>

                  {club.venue && (
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <MapPin className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Venue</p>
                        <p className="text-sm font-semibold">{club.venue}</p>
                      </div>
                    </div>
                  )}

                  {club.meetingSchedule && (
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <Calendar className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Meetings</p>
                        <p className="text-sm font-semibold">{club.meetingSchedule}</p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <DollarSign className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Membership Fee</p>
                      <p className="text-sm font-semibold">{club.membershipFee || "Free"}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <UsersRound className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Eligibility</p>
                      <p className="text-sm font-semibold">{club.eligibility || "All Students"}</p>
                    </div>
                  </div>

                  {club.recruitmentDeadline && (
                    <div className="flex items-start gap-3">
                      <div className={`w-9 h-9 rounded-lg ${isPastDeadline ? "bg-red-500/10" : "bg-primary/10"} flex items-center justify-center shrink-0`}>
                        <Calendar className={`w-4 h-4 ${isPastDeadline ? "text-red-400" : "text-primary"}`} />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Recruitment Deadline</p>
                        <p className={`text-sm font-semibold ${isPastDeadline ? "text-destructive" : ""}`}>
                          {formatDateTime(club.recruitmentDeadline)}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Contact / Advisors */}
            {(club.faculty_advisor?.name || club.president?.name || club.socialLinks) && (
              <Card>
                <CardContent className="p-6 space-y-4">
                  <h3 className="text-sm font-bold uppercase tracking-wide text-muted-foreground">People & Links</h3>
                  {club.president?.name && (
                    <div>
                      <p className="text-xs text-muted-foreground">President</p>
                      <p className="text-sm font-medium">{club.president.name}</p>
                      {club.president.email && <p className="text-xs text-muted-foreground">{club.president.email}</p>}
                    </div>
                  )}
                  {club.faculty_advisor?.name && (
                    <div>
                      <p className="text-xs text-muted-foreground">Faculty Advisor</p>
                      <p className="text-sm font-medium">{club.faculty_advisor.name}</p>
                      {club.faculty_advisor.department && <p className="text-xs text-muted-foreground">{club.faculty_advisor.department}</p>}
                    </div>
                  )}
                  {club.socialLinks && (
                    <div className="flex flex-wrap gap-2 pt-1">
                      {club.socialLinks.website && (
                        <a href={club.socialLinks.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-primary hover:underline">
                          <ExternalLink className="w-3 h-3" /> Website
                        </a>
                      )}
                      {club.socialLinks.instagram && (
                        <a href={club.socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-primary hover:underline">
                          <ExternalLink className="w-3 h-3" /> Instagram
                        </a>
                      )}
                      {club.socialLinks.linkedin && (
                        <a href={club.socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-primary hover:underline">
                          <ExternalLink className="w-3 h-3" /> LinkedIn
                        </a>
                      )}
                    </div>
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

export default ClubDetail;
