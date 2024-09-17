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

const preferenceSchema = z.object({
    workspaceId: z.string().nonempty(),
    workspaceName: z.string().nonempty(),
    portfolio: z.string().nonempty(),
    userId: z.string().nonempty(),
    scaleTypePreference: z.enum(["nps", "likert", "nps_lite", "stapel", "percent", "percent_sum"]).default("nps"),
    scaleDesignPreference: z.array(z.object({
        scaleType: z.string(),
        scaleId: z.string().nonempty(),
        design: z.enum(["default", "custom"]).default("default"),
    })),
    notificationDuration: z.enum(["monthly", "biweekly", "quarterly"]).default("monthly"),
    isActive: z.boolean().optional()
});

const updatePreferenceSchema = z.object({
  scaleTypePreference: z.enum(["nps", "likert", "nps_lite", "stapel", "percent", "percent_sum"]).default("nps"),
  scaleDesignPreference: z.array(z.object({
      scaleType: z.string(),
      scaleId: z.string(),
      design: z.enum(["default", "custom"]).default("default"),
  })).optional(),
  notificationDuration: z.enum(["monthly", "biweekly", "quarterly"]).optional()
}).refine(data => Object.keys(data).length > 0, {
  message: "At least one field (scaleTypePreference, scaleDesignPreference, notificationDuration) must be provided."
});
  
export {
    sendOtpSchema,
    validateOtpSchema,
    locationSchema,
    preferenceSchema,
    updatePreferenceSchema
}