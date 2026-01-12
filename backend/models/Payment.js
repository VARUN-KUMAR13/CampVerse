const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
    orderId: {
        type: String,
        required: true,
        unique: true
    },
    paymentId: {
        type: String,
        default: null
    },
    signature: {
        type: String,
        default: null
    },
    studentId: {
        type: String,
        required: true,
        index: true
    },
    studentName: {
        type: String
    },
    email: {
        type: String
    },
    amount: {
        type: Number,
        required: true
    },
    currency: {
        type: String,
        default: 'INR'
    },
    feeType: {
        type: String,
        enum: ['Academic', 'Hostel', 'Transport', 'Optional', 'Other'],
        default: 'Other'
    },
    feeDescription: {
        type: String
    },
    academicYear: {
        type: String
    },
    status: {
        type: String,
        enum: ['created', 'pending', 'success', 'failed', 'refunded'],
        default: 'created'
    },
    razorpayResponse: {
        type: mongoose.Schema.Types.Mixed
    },
    receipt: {
        type: String
    },
    notes: {
        type: mongoose.Schema.Types.Mixed
    }
}, {
    timestamps: true
});

// Generate receipt number
paymentSchema.pre('save', function (next) {
    if (!this.receipt) {
        this.receipt = `RCP-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    }
    next();
});

module.exports = mongoose.model('Payment', paymentSchema);
