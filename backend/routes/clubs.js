const express = require('express');
const router = express.Router();
const Club = require('../models/Club');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

// @route   GET /api/clubs
// @desc    Get all clubs
// @access  Authenticated users
router.get('/', authenticateToken, async (req, res) => {
    try {
        const { status, category, recruitmentStatus, page = 1, limit = 20 } = req.query;

        // Build filter
        let filter = { isActive: true };

        if (status) {
            filter.status = status;
        } else {
            filter.status = 'Active';
        }

        if (category && category !== 'all') {
            filter.category = category;
        }

        if (recruitmentStatus && recruitmentStatus !== 'all') {
            filter.recruitmentStatus = recruitmentStatus;
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const clubs = await Club.find(filter)
            .populate('postedBy', 'name collegeId')
            .sort({ featured: -1, createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await Club.countDocuments(filter);

        res.json({
            clubs,
            pagination: {
                current: parseInt(page),
                pages: Math.ceil(total / parseInt(limit)),
                total
            }
        });
    } catch (error) {
        console.error('Error fetching clubs:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// @route   GET /api/clubs/:id
// @desc    Get single club by ID
// @access  Authenticated users
router.get('/:id', authenticateToken, async (req, res) => {
    try {
        const club = await Club.findById(req.params.id)
            .populate('postedBy', 'name collegeId email');

        if (!club) {
            return res.status(404).json({ message: 'Club not found' });
        }

        res.json({
            ...club.toObject(),
            isRecruitmentOpen: club.isRecruitmentOpen()
        });
    } catch (error) {
        console.error('Error fetching club:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// @route   POST /api/clubs
// @desc    Create new club
// @access  Admin, Faculty
router.post('/', authenticateToken, authorizeRoles(['admin', 'faculty']), async (req, res) => {
    try {
        console.log('=== CREATE CLUB ===');
        console.log('User:', req.user?.collegeId, 'Role:', req.user?.role);
        console.log('Request body:', JSON.stringify(req.body, null, 2));

        const clubData = {
            ...req.body,
            postedBy: req.user._id,
            status: req.body.status || 'Active'
        };

        // Validate required fields
        if (!clubData.club_id || !clubData.name || !clubData.category || !clubData.description) {
            console.log('Missing required fields!');
            return res.status(400).json({
                message: 'Missing required fields: club_id, name, category, description'
            });
        }

        // Check if club_id already exists
        const existingClub = await Club.findOne({ club_id: clubData.club_id });
        if (existingClub) {
            console.log('Club ID already exists:', clubData.club_id);
            return res.status(400).json({
                message: 'Club ID already exists. Please use a unique club ID.'
            });
        }

        const club = new Club(clubData);
        await club.save();
        console.log('✅ Club saved successfully! ID:', club._id);

        await club.populate('postedBy', 'name collegeId');

        res.status(201).json({
            message: 'Club created successfully',
            club
        });
    } catch (error) {
        console.error('❌ Error creating club:', error);
        if (error.name === 'ValidationError') {
            return res.status(400).json({
                message: 'Validation error',
                errors: Object.values(error.errors).map(err => err.message)
            });
        }
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// @route   PUT /api/clubs/:id
// @desc    Update club
// @access  Admin, Faculty (own clubs)
router.put('/:id', authenticateToken, authorizeRoles(['admin', 'faculty']), async (req, res) => {
    try {
        const club = await Club.findById(req.params.id);

        if (!club) {
            return res.status(404).json({ message: 'Club not found' });
        }

        // Check authorization
        if (req.user.role !== 'admin' && !club.postedBy.equals(req.user._id)) {
            return res.status(403).json({ message: 'Not authorized to edit this club' });
        }

        Object.assign(club, req.body);
        await club.save();

        res.json({
            message: 'Club updated successfully',
            club
        });
    } catch (error) {
        console.error('Error updating club:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// @route   DELETE /api/clubs/:id
// @desc    Delete club (soft delete)
// @access  Admin, Faculty (own clubs)
router.delete('/:id', authenticateToken, authorizeRoles(['admin', 'faculty']), async (req, res) => {
    try {
        const club = await Club.findById(req.params.id);

        if (!club) {
            return res.status(404).json({ message: 'Club not found' });
        }

        // Check authorization
        if (req.user.role !== 'admin' && !club.postedBy.equals(req.user._id)) {
            return res.status(403).json({ message: 'Not authorized to delete this club' });
        }

        // Soft delete
        club.isActive = false;
        await club.save();

        res.json({ message: 'Club deleted successfully' });
    } catch (error) {
        console.error('Error deleting club:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// @route   GET /api/clubs/:id/members
// @desc    Get list of students who joined the club
// @access  Admin, Faculty
router.get('/:id/members', authenticateToken, authorizeRoles(['admin', 'faculty']), async (req, res) => {
    try {
        const club = await Club.findById(req.params.id);
        if (!club) {
            return res.status(404).json({ message: 'Club not found' });
        }

        const User = require('../models/User');
        const members = await User.find(
            { collegeId: { $in: club.joinedStudents || [] }, role: 'student' },
            'name collegeId email branch year section'
        ).sort({ name: 1 });

        res.json({ members, total: members.length });
    } catch (error) {
        console.error('Error fetching club members:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// @route   POST /api/clubs/:id/join
// @desc    Join a club
// @access  Students, Admin
router.post('/:id/join', authenticateToken, authorizeRoles(['student', 'admin']), async (req, res) => {
    try {
        const club = await Club.findById(req.params.id);

        if (!club) {
            return res.status(404).json({ message: 'Club not found' });
        }

        if (!club.isRecruitmentOpen()) {
            return res.status(400).json({ message: 'Recruitment is closed for this club' });
        }

        const studentId = req.user.collegeId;

        // Check if already joined
        if (club.joinedStudents && club.joinedStudents.includes(studentId)) {
            return res.status(400).json({ message: 'You have already joined this club' });
        }

        // Add student to joined list
        if (!club.joinedStudents) {
            club.joinedStudents = [];
        }
        club.joinedStudents.push(studentId);
        club.memberCount = club.joinedStudents.length;
        await club.save();

        res.json({
            message: 'Successfully joined the club',
            club
        });
    } catch (error) {
        console.error('Error joining club:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

module.exports = router;
