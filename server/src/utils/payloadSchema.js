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

const locationSchema = z.object({
    workspaceId: z.string(),
    latitude: z.number(),
    longitude: z.number(),
    userId: z.string().optional(),
    event: z.enum(['registration', 'login', 'scanned']),
    scaleId: z.string().optional(),
  }).refine((data) => data.event !== 'scanned' || data.scaleId !== undefined, {
    message: 'scaleId is required when event is scanned',
    path: ['scaleId']
  });
  
  
export {
    sendOtpSchema,
    validateOtpSchema,
    locationSchema
}