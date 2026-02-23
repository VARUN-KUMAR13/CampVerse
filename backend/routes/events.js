const express = require('express');
const router = express.Router();
const Event = require('../models/Event');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

// @route   GET /api/events
// @desc    Get all events
// @access  Authenticated users
router.get('/', authenticateToken, async (req, res) => {
    try {
        const { status, category, featured, page = 1, limit = 20 } = req.query;

        // Build filter
        let filter = { isActive: true };

        if (status) {
            filter.status = status;
        } else {
            // Default: show Open and Upcoming events
            filter.status = { $in: ['Open', 'Upcoming', 'Ongoing'] };
        }

        if (category && category !== 'all') {
            filter.category = category;
        }

        if (featured === 'true') {
            filter.featured = true;
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const events = await Event.find(filter)
            .populate('postedBy', 'name collegeId')
            .sort({ featured: -1, date: 1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await Event.countDocuments(filter);

        res.json({
            events,
            pagination: {
                current: parseInt(page),
                pages: Math.ceil(total / parseInt(limit)),
                total
            }
        });
    } catch (error) {
        console.error('Error fetching events:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// @route   GET /api/events/:id
// @desc    Get single event by ID
// @access  Authenticated users
router.get('/:id', authenticateToken, async (req, res) => {
    try {
        const event = await Event.findById(req.params.id)
            .populate('postedBy', 'name collegeId email');

        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }

        // Increment view count
        await event.incrementViewCount();

        res.json({
            ...event.toObject(),
            isRegistrationOpen: event.isRegistrationOpen()
        });
    } catch (error) {
        console.error('Error fetching event:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// @route   POST /api/events
// @desc    Create new event
// @access  Admin, Faculty
router.post('/', authenticateToken, authorizeRoles(['admin', 'faculty']), async (req, res) => {
    try {
        console.log('=== CREATE EVENT ===');
        console.log('User:', req.user?.collegeId, 'Role:', req.user?.role);
        console.log('Request body:', JSON.stringify(req.body, null, 2));

        const eventData = {
            ...req.body,
            postedBy: req.user._id,
            status: req.body.status || 'Open'
        };

        // Validate required fields
        if (!eventData.event_id || !eventData.title || !eventData.category || !eventData.date || !eventData.venue || !eventData.organizer) {
            console.log('Missing required fields!');
            return res.status(400).json({
                message: 'Missing required fields: event_id, title, category, date, venue, organizer'
            });
        }

        // Check if event_id already exists
        const existingEvent = await Event.findOne({ event_id: eventData.event_id });
        if (existingEvent) {
            console.log('Event ID already exists:', eventData.event_id);
            return res.status(400).json({
                message: 'Event ID already exists. Please use a unique event ID.'
            });
        }

        const event = new Event(eventData);
        await event.save();
        console.log('✅ Event saved successfully! ID:', event._id);

        await event.populate('postedBy', 'name collegeId');

        res.status(201).json({
            message: 'Event created successfully',
            event
        });
    } catch (error) {
        console.error('❌ Error creating event:', error);
        if (error.name === 'ValidationError') {
            return res.status(400).json({
                message: 'Validation error',
                errors: Object.values(error.errors).map(err => err.message)
            });
        }
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// @route   PUT /api/events/:id
// @desc    Update event
// @access  Admin, Faculty (own events)
router.put('/:id', authenticateToken, authorizeRoles(['admin', 'faculty']), async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);

        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }

        // Check authorization
        if (req.user.role !== 'admin' && !event.postedBy.equals(req.user._id)) {
            return res.status(403).json({ message: 'Not authorized to edit this event' });
        }

        Object.assign(event, req.body);
        await event.save();

        res.json({
            message: 'Event updated successfully',
            event
        });
    } catch (error) {
        console.error('Error updating event:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// @route   DELETE /api/events/:id
// @desc    Delete event (soft delete)
// @access  Admin, Faculty (own events)
router.delete('/:id', authenticateToken, authorizeRoles(['admin', 'faculty']), async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);

        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }

        // Check authorization
        if (req.user.role !== 'admin' && !event.postedBy.equals(req.user._id)) {
            return res.status(403).json({ message: 'Not authorized to delete this event' });
        }

        // Soft delete
        event.isActive = false;
        await event.save();

        res.json({ message: 'Event deleted successfully' });
    } catch (error) {
        console.error('Error deleting event:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// @route   POST /api/events/:id/register
// @desc    Register for an event
// @access  Students
router.post('/:id/register', authenticateToken, authorizeRoles(['student']), async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);

        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }

        if (!event.isRegistrationOpen()) {
            return res.status(400).json({ message: 'Registration is closed for this event' });
        }

        const studentId = req.user.collegeId;

        // Check if already registered
        if (event.registeredStudents && event.registeredStudents.includes(studentId)) {
            return res.status(400).json({ message: 'You are already registered for this event' });
        }

        // Check max participants
        if (event.maxParticipants > 0 && event.registeredParticipants >= event.maxParticipants) {
            return res.status(400).json({ message: 'Event is full. Registration closed.' });
        }

        // For paid events, require paymentId
        const isFree = !event.entryFee || event.entryFee === 'Free' || event.entryFee === '0' || event.entryFee === '₹0';
        if (!isFree && !req.body.paymentId) {
            return res.status(400).json({ message: 'Payment is required for this event' });
        }

        // Register the student
        if (!event.registeredStudents) {
            event.registeredStudents = [];
        }
        event.registeredStudents.push(studentId);
        event.registeredParticipants = event.registeredStudents.length;
        await event.save();

        res.json({
            message: 'Registration successful',
            event,
            registered: true
        });
    } catch (error) {
        console.error('Error registering for event:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// @route   GET /api/events/:id/check-registration
// @desc    Check if current user is registered for an event
// @access  Students
router.get('/:id/check-registration', authenticateToken, async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);

        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }

        const studentId = req.user.collegeId;
        const isRegistered = event.registeredStudents && event.registeredStudents.includes(studentId);

        res.json({ registered: isRegistered });
    } catch (error) {
        console.error('Error checking registration:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// @route   GET /api/events/:id/registrations
// @desc    Get list of registered students for an event (admin)
// @access  Admin, Faculty
router.get('/:id/registrations', authenticateToken, authorizeRoles(['admin', 'faculty']), async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);

        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }

        const isFree = !event.entryFee || event.entryFee === 'Free' || event.entryFee === '0' || event.entryFee === '₹0';

        const User = require('../models/User');
        const studentIds = event.registeredStudents || [];

        // Fetch detailed student info from User model
        const users = await User.find(
            { collegeId: { $in: studentIds }, role: 'student' },
            'name collegeId email branch year section'
        ).sort({ name: 1 });

        // Build a map for quick lookup
        const userMap = {};
        users.forEach(u => { userMap[u.collegeId] = u; });

        const registrations = studentIds.map((collegeId, index) => {
            const user = userMap[collegeId];
            return {
                sno: index + 1,
                _id: user?._id || collegeId,
                collegeId,
                name: user?.name || 'Unknown',
                email: user?.email || '',
                branch: user?.branch || '',
                year: user?.year || '',
                section: user?.section || '',
                paymentStatus: isFree ? 'Free' : 'Paid',
            };
        });

        res.json({
            total: registrations.length,
            maxParticipants: event.maxParticipants,
            entryFee: event.entryFee,
            registrations,
        });
    } catch (error) {
        console.error('Error fetching registrations:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

module.exports = router;
