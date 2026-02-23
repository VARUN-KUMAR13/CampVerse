import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import StudentLayout from "@/components/StudentLayout";
import { useAuth } from "@/contexts/AuthContext";
import { useEvents, Event } from "@/contexts/EventContext";
import { useToast } from "@/hooks/use-toast";
import {
  Search,
  Calendar,
  MapPin,
  Clock,
  Users,
  DollarSign,
  Star,
  ExternalLink,
  Loader2,
  AlertCircle,
  CheckCircle,
  Trophy,
  Eye,
} from "lucide-react";

declare global { interface Window { Razorpay: any } }

const StudentEvents = () => {
  const { userData } = useAuth();
  const { events, loading, error, fetchEvents, registerForEvent } = useEvents();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [processingEventId, setProcessingEventId] = useState<string | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  const handleOpenView = (event: Event) => {
    setSelectedEvent(event);
    setIsViewModalOpen(true);
  };

  const RAZORPAY_KEY_ID = import.meta.env.VITE_RAZORPAY_KEY_ID as string | undefined;
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

  // Fetch events on mount
  useEffect(() => {
    fetchEvents();
  }, []);

  const filteredEvents = events.filter((event) => {
    const matchesSearch =
      event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (event.description?.toLowerCase().includes(searchTerm.toLowerCase()) || false);
    const matchesCategory =
      categoryFilter === "all" ||
      event.category.toLowerCase() === categoryFilter.toLowerCase();
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "open" && event.status === "Open") ||
      (statusFilter === "featured" && event.featured) ||
      (statusFilter === "closed" && event.status === "Closed");

    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Check if current user is registered for an event
  const isRegistered = (event: Event) => {
    if (!userData?.collegeId || !event.registeredStudents) return false;
    return event.registeredStudents.includes(userData.collegeId);
  };

  // Check if event is free
  const isFreeEvent = (event: Event) => {
    return !event.entryFee || event.entryFee === 'Free' || event.entryFee === '0' || event.entryFee === '₹0';
  };

  // Parse entry fee amount
  const parseEntryFee = (fee: string): number => {
    const num = parseFloat(fee.replace(/[^0-9.]/g, ''));
    return isNaN(num) ? 0 : num;
  };

  // Load Razorpay script
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

  // Handle registration (free or paid)
  const handleRegister = async (event: Event) => {
    if (isRegistered(event)) return;
    setProcessingEventId(event._id);

    try {
      if (isFreeEvent(event)) {
        // Free event: register directly
        await registerForEvent(event._id);
        toast({ title: 'Registration Successful! ✅', description: `You are now registered for ${event.title}.` });
      } else {
        // Paid event: open Razorpay
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

        // Create Razorpay order
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
              // Verify payment
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
                // Register after successful payment
                await registerForEvent(event._id, response.razorpay_payment_id);
                toast({ title: 'Registration Successful! ✅', description: `Payment verified. You are registered for ${event.title}.` });
              } else {
                toast({ title: 'Payment Verification Failed', description: 'Please contact admin with your transaction ID.', variant: 'destructive' });
              }
            } catch (verifyError) {
              console.error('Verification error:', verifyError);
              toast({ title: 'Payment Received', description: `Transaction ID: ${response.razorpay_payment_id}. Verification pending.` });
            }
          },
          modal: {
            ondismiss: () => {
              toast({ title: 'Payment Cancelled', description: 'You cancelled the payment.' });
            }
          }
        };

        const rzp = new window.Razorpay(options);
        rzp.on('payment.failed', function (response: any) {
          toast({ title: 'Payment Failed', description: response.error?.description || 'Payment could not be completed.', variant: 'destructive' });
        });
        rzp.open();
      }
    } catch (err: any) {
      console.error('Registration error:', err);
      toast({ title: 'Registration Failed', description: err.message || 'Could not complete registration.', variant: 'destructive' });
    } finally {
      setProcessingEventId(null);
    }
  };

  const getStatusBadge = (event: Event) => {
    if (isRegistered(event)) {
      return <Badge className="bg-primary"><CheckCircle className="w-3 h-3 mr-1" /> Registered</Badge>;
    }
    if (event.status === "Closed" || event.status === "Cancelled") {
      return <Badge variant="destructive">Registration Closed</Badge>;
    }
    if (event.status === "Completed") {
      return <Badge variant="secondary">Completed</Badge>;
    }
    if (event.maxParticipants > 0 && event.registeredParticipants >= event.maxParticipants) {
      return <Badge variant="secondary">Full</Badge>;
    }
    return <Badge className="bg-green-500">Register</Badge>;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  return (
    <StudentLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
              <Calendar className="w-8 h-8 text-primary" />
              Campus Events
            </h1>
            <p className="text-muted-foreground mt-1">
              Discover and participate in exciting campus events and
              activities
            </p>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <Card className="border-destructive bg-destructive/10">
            <CardContent className="py-4 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-destructive" />
              <span className="text-destructive">{error}</span>
            </CardContent>
          </Card>
        )}

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Find Events</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="Search events..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select
                value={categoryFilter}
                onValueChange={setCategoryFilter}
              >
                <SelectTrigger className="w-full md:w-[200px]">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="technical">Technical</SelectItem>
                  <SelectItem value="cultural">Cultural</SelectItem>
                  <SelectItem value="sports">Sports</SelectItem>
                  <SelectItem value="workshop">Workshop</SelectItem>
                  <SelectItem value="seminar">Seminar</SelectItem>
                  <SelectItem value="competition">Competition</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-[200px]">
                  <SelectValue placeholder="Filter" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Events</SelectItem>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="featured">Featured</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Loading State */}
        {loading && events.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <Loader2 className="w-12 h-12 text-primary mx-auto mb-4 animate-spin" />
              <h3 className="text-lg font-medium text-foreground mb-2">
                Loading events...
              </h3>
            </CardContent>
          </Card>
        )}


        {/* All Events */}
        <div>
          <h2 className="text-xl font-semibold mb-4">All Events</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {!loading && filteredEvents.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-foreground mb-2">
                    No events found
                  </h3>
                  <p className="text-muted-foreground">
                    {events.length === 0
                      ? "No events have been posted yet. Check back later!"
                      : "Try adjusting your filters to see more events."}
                  </p>
                </CardContent>
              </Card>
            ) : (
              filteredEvents.map((event) => (
                <Card
                  key={event._id}
                  className="hover:shadow-lg transition-shadow overflow-hidden"
                >
                  {/* Poster image banner (if available) */}
                  {event.posterImage && (
                    <div className="h-40 relative overflow-hidden">
                      <img
                        src={event.posterImage}
                        alt={event.title}
                        className="w-full h-full object-cover"
                      />
                      <div
                        className="absolute inset-0"
                        style={{
                          background:
                            'linear-gradient(to top, hsl(var(--card)) 0%, rgba(0,0,0,0.2) 60%, transparent 100%)',
                        }}
                      />
                      {event.featured && (
                        <div className="absolute top-3 right-3">
                          <Badge className="bg-yellow-500/90 backdrop-blur-sm">
                            <Star className="w-3 h-3 mr-1 fill-current" />
                            Featured
                          </Badge>
                        </div>
                      )}
                    </div>
                  )}
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          {!event.posterImage && (
                            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                              <Calendar className="w-6 h-6 text-primary" />
                            </div>
                          )}
                          <div>
                            <h3 className="text-xl font-semibold text-foreground">
                              {event.title}
                            </h3>
                            <p className="text-muted-foreground">
                              {event.organizer}
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <Badge variant="outline">{event.category}</Badge>
                          {getStatusBadge(event)}
                          {event.featured && !event.posterImage && (
                            <Badge className="bg-yellow-500">
                              <Star className="w-3 h-3 mr-1" />
                              Featured
                            </Badge>
                          )}
                        </div>
                      </div>
                      {event.registrationDeadline && (
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">
                            Registration Deadline
                          </p>
                          <p className="font-medium text-destructive">
                            {formatDate(event.registrationDeadline)}
                          </p>
                        </div>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-muted-foreground">
                      {event.description}
                    </p>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-primary" />
                          <span className="font-medium">Date:</span>
                          <span>
                            {formatDate(event.date)}
                            {event.endDate && event.endDate !== event.date && (
                              <> - {formatDate(event.endDate)}</>
                            )}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-primary" />
                          <span className="font-medium">Time:</span>
                          <span>{formatTime(event.date)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-primary" />
                          <span className="font-medium">Venue:</span>
                          <span>{event.venue}</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <DollarSign className="w-4 h-4 text-green-500" />
                          <span className="font-medium">Entry Fee:</span>
                          <span>{event.entryFee}</span>
                        </div>
                        {event.maxParticipants > 0 && (
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4 text-blue-500" />
                            <span className="font-medium">Registered:</span>
                            <span>
                              {event.registeredParticipants}/{event.maxParticipants}
                            </span>
                          </div>
                        )}
                        {event.prizes && (
                          <div className="flex items-center gap-2">
                            <Star className="w-4 h-4 text-yellow-500" />
                            <span className="font-medium">Prizes:</span>
                            <span>{event.prizes}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {event.highlights && event.highlights.length > 0 && (
                      <div>
                        <span className="font-medium">Highlights:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {event.highlights.map((highlight, idx) => (
                            <Badge
                              key={idx}
                              variant="outline"
                              className="text-xs"
                            >
                              {highlight}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-4 border-t">
                      <div className="text-sm text-muted-foreground">
                        Organized by{" "}
                        <span className="font-medium">
                          {event.organizer}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        {isRegistered(event) ? (
                          <Button className="bg-primary" disabled>
                            <CheckCircle className="w-4 h-4 mr-1" /> Registered
                          </Button>
                        ) : event.status === "Open" &&
                        (event.maxParticipants === 0 ||
                          event.registeredParticipants < event.maxParticipants) && (
                          <Button
                            className="bg-green-600 hover:bg-green-700"
                            onClick={() => handleRegister(event)}
                            disabled={processingEventId === event._id}
                          >
                            {processingEventId === event._id ? (
                              <><Loader2 className="w-4 h-4 mr-1 animate-spin" /> Processing...</>
                            ) : (
                              <>Register{!isFreeEvent(event) ? ` (${event.entryFee})` : ""}</>
                            )}
                          </Button>
                        )}
                        <Button variant="outline" onClick={() => handleOpenView(event)}>
                          View Details
                          <Eye className="w-3 h-3 ml-1" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>

        {/* View Details Modal */}
        <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold flex items-center gap-2">
                <Eye className="w-6 h-6 text-primary" />
                Event Details
              </DialogTitle>
            </DialogHeader>
            {selectedEvent && (
              <div className="space-y-5 py-4">
                {/* Poster Image */}
                {selectedEvent.posterImage && (
                  <div className="rounded-lg overflow-hidden border border-border">
                    <img
                      src={selectedEvent.posterImage}
                      alt={selectedEvent.title}
                      className="w-full object-contain max-h-72"
                    />
                  </div>
                )}

                {/* Title & Badges */}
                <div>
                  <h2 className="text-2xl font-bold text-foreground">{selectedEvent.title}</h2>
                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    <Badge variant="outline">{selectedEvent.category}</Badge>
                    {getStatusBadge(selectedEvent)}
                    {selectedEvent.featured && (
                      <Badge className="bg-yellow-500">
                        <Star className="w-3 h-3 mr-1 fill-current" /> Featured
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Description */}
                {selectedEvent.description && (
                  <div>
                    <Label className="text-sm font-semibold text-muted-foreground">Description</Label>
                    <p className="text-foreground mt-1">{selectedEvent.description}</p>
                  </div>
                )}

                {/* Details Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground flex items-center gap-1">
                      <Calendar className="w-3 h-3" /> Date
                    </Label>
                    <p className="font-medium">
                      {formatDate(selectedEvent.date)}
                      {selectedEvent.endDate && selectedEvent.endDate !== selectedEvent.date
                        ? ` — ${formatDate(selectedEvent.endDate)}`
                        : ""}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="w-3 h-3" /> Time
                    </Label>
                    <p className="font-medium">{formatTime(selectedEvent.date)}</p>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground flex items-center gap-1">
                      <MapPin className="w-3 h-3" /> Venue
                    </Label>
                    <p className="font-medium">{selectedEvent.venue}</p>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Organizer</Label>
                    <p className="font-medium">{selectedEvent.organizer}</p>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground flex items-center gap-1">
                      <DollarSign className="w-3 h-3" /> Entry Fee
                    </Label>
                    <p className="font-medium">{selectedEvent.entryFee}</p>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground flex items-center gap-1">
                      <Users className="w-3 h-3" /> Registered
                    </Label>
                    <p className="font-medium">
                      {selectedEvent.registeredParticipants || 0}
                      {selectedEvent.maxParticipants > 0
                        ? ` / ${selectedEvent.maxParticipants}`
                        : " (Unlimited)"}
                    </p>
                  </div>
                </div>

                {/* Prizes */}
                {selectedEvent.prizes && (
                  <div>
                    <Label className="text-xs text-muted-foreground flex items-center gap-1">
                      <Trophy className="w-3 h-3" /> Prizes
                    </Label>
                    <p className="font-medium mt-1">{selectedEvent.prizes}</p>
                  </div>
                )}

                {/* Highlights */}
                {selectedEvent.highlights && selectedEvent.highlights.length > 0 && (
                  <div>
                    <Label className="text-xs text-muted-foreground">Highlights</Label>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {selectedEvent.highlights.map((h, i) => (
                        <Badge key={i} variant="outline" className="text-xs">{h}</Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Registration Deadline */}
                {selectedEvent.registrationDeadline && (
                  <div>
                    <Label className="text-xs text-muted-foreground">Registration Deadline</Label>
                    <p className="font-medium text-destructive mt-1">
                      {formatDate(selectedEvent.registrationDeadline)}
                    </p>
                  </div>
                )}

                {/* Contact Info */}
                {(selectedEvent.contactEmail || selectedEvent.contactPhone) && (
                  <div className="grid grid-cols-2 gap-4">
                    {selectedEvent.contactEmail && (
                      <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground">Contact Email</Label>
                        <p className="font-medium">{selectedEvent.contactEmail}</p>
                      </div>
                    )}
                    {selectedEvent.contactPhone && (
                      <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground">Contact Phone</Label>
                        <p className="font-medium">{selectedEvent.contactPhone}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex justify-between items-center pt-4 border-t">
                  <div>
                    {isRegistered(selectedEvent) ? (
                      <Button className="bg-primary" disabled>
                        <CheckCircle className="w-4 h-4 mr-1" /> Registered
                      </Button>
                    ) : selectedEvent.status === "Open" &&
                      (selectedEvent.maxParticipants === 0 ||
                        selectedEvent.registeredParticipants < selectedEvent.maxParticipants) ? (
                      <Button
                        className="bg-green-600 hover:bg-green-700"
                        onClick={() => handleRegister(selectedEvent)}
                        disabled={processingEventId === selectedEvent._id}
                      >
                        {processingEventId === selectedEvent._id ? (
                          <><Loader2 className="w-4 h-4 mr-1 animate-spin" /> Processing...</>
                        ) : (
                          <>Register{!isFreeEvent(selectedEvent) ? ` (${selectedEvent.entryFee})` : ""}</>
                        )}
                      </Button>
                    ) : null}
                  </div>
                  <Button variant="outline" onClick={() => setIsViewModalOpen(false)}>Close</Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </StudentLayout>
  );
};

export default StudentEvents;
