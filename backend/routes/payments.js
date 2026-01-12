const express = require('express');
const router = express.Router();
const Razorpay = require('razorpay');
const crypto = require('crypto');
const Payment = require('../models/Payment');

// Initialize Razorpay instance
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
});

// Create a new order
router.post('/create-order', async (req, res) => {
    try {
        const { amount, studentId, studentName, email, feeType, feeDescription, academicYear, notes } = req.body;

        if (!amount || amount <= 0) {
            return res.status(400).json({ error: 'Invalid amount' });
        }

        if (!studentId) {
            return res.status(400).json({ error: 'Student ID is required' });
        }

        // Create Razorpay order
        const options = {
            amount: Math.round(amount * 100), // Convert to paise
            currency: 'INR',
            receipt: `rcpt_${Date.now()}`,
            notes: {
                studentId,
                studentName: studentName || '',
                feeType: feeType || 'Other',
                academicYear: academicYear || '',
                ...notes
            }
        };

        const order = await razorpay.orders.create(options);

        // Save order to database
        const payment = new Payment({
            orderId: order.id,
            studentId,
            studentName,
            email,
            amount,
            feeType: feeType || 'Other',
            feeDescription,
            academicYear,
            status: 'created',
            notes
        });

        await payment.save();

        res.json({
            success: true,
            order: {
                id: order.id,
                amount: order.amount,
                currency: order.currency,
                receipt: order.receipt
            },
            key: process.env.RAZORPAY_KEY_ID
        });
    } catch (error) {
        console.error('Error creating order:', error);
        res.status(500).json({ error: 'Failed to create order', details: error.message });
    }
});

// Verify payment and update status
router.post('/verify', async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
            return res.status(400).json({ error: 'Missing payment details' });
        }

        // Verify signature
        const body = razorpay_order_id + '|' + razorpay_payment_id;
        const expectedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(body.toString())
            .digest('hex');

        const isValid = expectedSignature === razorpay_signature;

        if (!isValid) {
            // Update payment status to failed
            await Payment.findOneAndUpdate(
                { orderId: razorpay_order_id },
                {
                    status: 'failed',
                    razorpayResponse: { razorpay_order_id, razorpay_payment_id, razorpay_signature, verified: false }
                }
            );
            return res.status(400).json({ error: 'Invalid signature', verified: false });
        }

        // Update payment status to success
        const payment = await Payment.findOneAndUpdate(
            { orderId: razorpay_order_id },
            {
                status: 'success',
                paymentId: razorpay_payment_id,
                signature: razorpay_signature,
                razorpayResponse: { razorpay_order_id, razorpay_payment_id, razorpay_signature, verified: true }
            },
            { new: true }
        );

        res.json({
            success: true,
            verified: true,
            payment: {
                orderId: payment.orderId,
                paymentId: payment.paymentId,
                amount: payment.amount,
                status: payment.status,
                receipt: payment.receipt
            }
        });
    } catch (error) {
        console.error('Error verifying payment:', error);
        res.status(500).json({ error: 'Failed to verify payment', details: error.message });
    }
});

// Get payment history for a student
router.get('/history/:studentId', async (req, res) => {
    try {
        const { studentId } = req.params;
        const { status, feeType, year } = req.query;

        const query = { studentId };
        if (status) query.status = status;
        if (feeType) query.feeType = feeType;
        if (year) query.academicYear = year;

        const payments = await Payment.find(query)
            .sort({ createdAt: -1 })
            .limit(50);

        res.json({ success: true, payments });
    } catch (error) {
        console.error('Error fetching payment history:', error);
        res.status(500).json({ error: 'Failed to fetch payment history' });
    }
});

// Get a single payment by order ID
router.get('/order/:orderId', async (req, res) => {
    try {
        const { orderId } = req.params;
        const payment = await Payment.findOne({ orderId });

        if (!payment) {
            return res.status(404).json({ error: 'Payment not found' });
        }

        res.json({ success: true, payment });
    } catch (error) {
        console.error('Error fetching payment:', error);
        res.status(500).json({ error: 'Failed to fetch payment' });
    }
});

// Get summary statistics for a student
router.get('/summary/:studentId', async (req, res) => {
    try {
        const { studentId } = req.params;
        const { year } = req.query;

        const query = { studentId, status: 'success' };
        if (year) query.academicYear = year;

        const payments = await Payment.find(query);

        const summary = {
            totalPaid: payments.reduce((sum, p) => sum + p.amount, 0),
            transactionCount: payments.length,
            byFeeType: {}
        };

        payments.forEach(p => {
            if (!summary.byFeeType[p.feeType]) {
                summary.byFeeType[p.feeType] = 0;
            }
            summary.byFeeType[p.feeType] += p.amount;
        });

        res.json({ success: true, summary });
    } catch (error) {
        console.error('Error fetching payment summary:', error);
        res.status(500).json({ error: 'Failed to fetch payment summary' });
    }
});

module.exports = router;
