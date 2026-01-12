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

        // Increment registered participants
        event.registeredParticipants += 1;
        await event.save();

        res.json({
            message: 'Registration successful',
            event
        });
    } catch (error) {
        console.error('Error registering for event:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

module.exports = router;
