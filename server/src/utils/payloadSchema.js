import { z } from "zod";

const sendOtpSchema = z.object({
    email: z.string().email(),
    userId: z.string().min(6).max(32)
})

const validateOtpSchema = z.object({
    email: z.string().email(),
    userId: z.string().min(6).max(32),
    otp: z.string().min(6).max(6)
})
export {
    sendOtpSchema,
    validateOtpSchema
}