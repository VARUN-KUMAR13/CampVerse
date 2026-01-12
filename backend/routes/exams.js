const express = require('express');
const router = express.Router();
const Exam = require('../models/Exam');

// GET all exams
router.get('/', async (req, res) => {
    try {
        const exams = await Exam.find().sort({ date: 1 });
        res.json(exams);
    } catch (error) {
        console.error('Error fetching exams:', error);
        res.status(500).json({ message: 'Error fetching exams', error: error.message });
    }
});

// GET upcoming exams (for students)
router.get('/upcoming', async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const exams = await Exam.find({
            date: { $gte: today },
            status: { $in: ['Scheduled', 'Ongoing'] }
        }).sort({ date: 1 });

        res.json(exams);
    } catch (error) {
        console.error('Error fetching upcoming exams:', error);
        res.status(500).json({ message: 'Error fetching upcoming exams', error: error.message });
    }
});

// GET single exam by ID
router.get('/:id', async (req, res) => {
    try {
        const exam = await Exam.findById(req.params.id);
        if (!exam) {
            return res.status(404).json({ message: 'Exam not found' });
        }
        res.json(exam);
    } catch (error) {
        console.error('Error fetching exam:', error);
        res.status(500).json({ message: 'Error fetching exam', error: error.message });
    }
});

// POST create new exam
router.post('/', async (req, res) => {
    try {
        const examData = req.body;

        // Generate exam_id if not provided
        if (!examData.exam_id) {
            examData.exam_id = `EXAM${Date.now()}`;
        }

        const exam = new Exam(examData);
        const savedExam = await exam.save();

        res.status(201).json(savedExam);
    } catch (error) {
        console.error('Error creating exam:', error);
        if (error.code === 11000) {
            return res.status(400).json({ message: 'Exam ID already exists' });
        }
        res.status(500).json({ message: 'Error creating exam', error: error.message });
    }
});

// PUT update exam
router.put('/:id', async (req, res) => {
    try {
        const exam = await Exam.findByIdAndUpdate(
            req.params.id,
            { ...req.body, updatedAt: Date.now() },
            { new: true, runValidators: true }
        );

        if (!exam) {
            return res.status(404).json({ message: 'Exam not found' });
        }

        res.json(exam);
    } catch (error) {
        console.error('Error updating exam:', error);
        res.status(500).json({ message: 'Error updating exam', error: error.message });
    }
});

// PATCH update exam status
router.patch('/:id/status', async (req, res) => {
    try {
        const { status } = req.body;

        if (!['Scheduled', 'Ongoing', 'Completed', 'Postponed', 'Cancelled'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }

        const exam = await Exam.findByIdAndUpdate(
            req.params.id,
            { status, updatedAt: Date.now() },
            { new: true }
        );

        if (!exam) {
            return res.status(404).json({ message: 'Exam not found' });
        }

        res.json(exam);
    } catch (error) {
        console.error('Error updating exam status:', error);
        res.status(500).json({ message: 'Error updating exam status', error: error.message });
    }
});

// DELETE exam
router.delete('/:id', async (req, res) => {
    try {
        const exam = await Exam.findByIdAndDelete(req.params.id);

        if (!exam) {
            return res.status(404).json({ message: 'Exam not found' });
        }

        res.json({ message: 'Exam deleted successfully', exam });
    } catch (error) {
        console.error('Error deleting exam:', error);
        res.status(500).json({ message: 'Error deleting exam', error: error.message });
    }
});

module.exports = router;
