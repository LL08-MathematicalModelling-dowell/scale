import mongoose from 'mongoose';

const otpSchema = new mongoose.Schema({
    otp: {
        type: String,
        required: true,
    },
    userId: {
        type: String,
        required: true,
    },
    attempts: {
        type: Number,
        default: 0,
        min: 0,
        max: 3
    },
    email: {
        type: String,
        required: true
    },
    isActive: {
        type: Boolean,
        default: true
    },
    expiresAt: {
        type: Date,
        required: true,
    },
},{timestamps: true})

export default mongoose.model('Otp', otpSchema);