import { asyncHandler } from "../utils/asyncHandler.js";
import PayloadValidationServices from "../services/validation.services.js";
import OTP from "../models/otp.schema.js";
import { sendOtpSchema, validateOtpSchema } from "../utils/payloadSchema.js";
import moment from "moment";
import { generateAlphanumericOtp } from "../utils/helper.js";
import { sendEmail } from "../services/email.services.js";

const sendOtpToUser = asyncHandler(async (req, res) => {
    const { email, userId } = req.body;

    const validationResult = PayloadValidationServices.validateData(sendOtpSchema, { email, userId });
    if (!validationResult.isValid) {
        return res.status(400).json({
            success: false,
            message: "Invalid payload",
            errors: validationResult.errors
        });
    }

    const existingOtp = await OTP.findOne({
        email,
        userId,
        isActive: true,
        expiresAt: { $gt: new Date() },
        attempts: { $lt: 3 }
    });

    if (existingOtp) {
        return res.status(200).json({
            success: true,
            message: "An existing OTP is still valid. Please use the existing OTP in your email."
        });
    }

    const otp = generateAlphanumericOtp(6);

    const expiresAt = moment().add(10, 'minutes').toDate();

    const newOtp = await OTP.create({
        otp,
        userId,
        email,
        expiresAt
    });

    if (!newOtp) {
        return res.status(500).json({
            success: false,
            message: "Failed to send OTP. Please try again."
        });
    }

    const sendEmailToUser = await sendEmail(
        email, 
        email,
        otp
    )

    if(!sendEmailToUser.success) {
        return res
        .status(400)
        .json({
            success: false,
            message: "Failed to send email. Please try again."
        })
    }

    return res
    .status(200)
    .json({
        success: true,
        message: "OTP has been sent to your email"
    });
});

const validateOtp = asyncHandler(async (req, res) => {
    const { email, userId, otp } = req.body;

    const validationResult = PayloadValidationServices.validateData(validateOtpSchema, { 
        email, 
        userId, 
        otp 
    });

    if (!validationResult.isValid) {
        return res.status(400).json({
            success: false,
            message: "Invalid payload",
            errors: validationResult.errors
        });
    }

    const otpRecord = await OTP.findOne({ email, userId, isActive: true }).sort({ createdAt: -1 });

    if (!otpRecord) {
        return res.status(404).json({
            success: false,
            message: "OTP not found or already used, Create new one",
        });
    }

    if (new Date() > otpRecord.expiresAt) {
        return res.status(400).json({
            success: false,
            message: "OTP has expired",
        });
    }

    if (otpRecord.attempts >= 3) {
        otpRecord.isActive = false;
        await otpRecord.save();
        return res.status(429).json({
            success: false,
            message: "Maximum OTP validation attempts reached. Please request a new OTP.",
        });
    }

    if (otpRecord.otp !== otp) {
        otpRecord.attempts += 1;
        await otpRecord.save();
        return res.status(400).json({
            success: false,
            message: "Invalid OTP",
            attemptsLeft: 3 - otpRecord.attempts,
        });
    }

    otpRecord.isActive = false;
    await otpRecord.save();

    return res.status(200).json({
        success: true,
        message: "OTP validated successfully",
    });
});

export { 
    sendOtpToUser,
    validateOtp
};
