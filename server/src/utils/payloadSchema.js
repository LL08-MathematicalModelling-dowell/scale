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
    workspaceId: z.string(),
    workspaceName: z.string(),
    portfolio: z.string(),
    userId: z.string(),

    dataType: z.enum(["Real_Data", "Learning_Data", "Testing_Data", "Archived_Data"]).default("Real_Data"),
    productType: z.enum(['voice_of_customer', 'llx_teacher']),

    scaleTypePreference: z.preprocess(
        (val, ctx) => {
            const productType = ctx.parent?.productType;
            if (productType === "llx_teacher") {
                return z.enum(["llx"]).parse(val);
            }
            return z.enum(["nps", "likert", "nps_lite", "stapel", "percent", "percent_sum", "likert_two_point"]).parse(val);
        },
        z.enum(["nps", "likert", "nps_lite", "stapel", "percent", "percent_sum","likert_two_point", "llx"]).default("nps")
    ),

    scaleDesignPreference: z.array(
        z.object({
            scaleType: z.string(),
            scaleId: z.string(),
            design: z.enum(["default", "custom"]).default("default"),
        })
    ),

    brandName: z.string().optional(),
    productName: z.string().optional(),

    questionToDisplay: z.preprocess((val, ctx) => {
        const scaleType = ctx.parent?.scaleTypePreference;
        const productName = ctx.parent?.productName || 'this product';
        const brandName = ctx.parent?.brandName || 'this brand';

        if (!val) {
            if (scaleType === "likert") {
                return "Would you like to recommend this product to your friends/colleagues?";
            } else if (scaleType === "nps") {
                return "On a scale of 0 -10, how would you rate our product/service?";
            } else if (scaleType === "llx") {
                return "HOW DO YOU EVALUATE TODAY'S LEARNING?";
            }
            return "How would you rate your experience?";
        }

        if (scaleType === "likert" || scaleType === "likert_two_point") {
            return z.enum([
                "Would you like to recommend this product to your friends/colleagues?",
                `Would you like to recommend ${productName} to your friends/colleagues?`,
                `Would you like to recommend ${brandName} to your friends/colleagues?`,
                `Would you like to recommend ${productName} from ${brandName} to your friends/colleagues?`,
            ]).parse(val);
        } else if (scaleType === "nps") {
            return z.enum([
                "On a scale of 0 -10, how would you rate our product/service?",
                `On a scale of 0 -10, how would you rate ${productName}?`,
                `On a scale of 0 -10, how would you rate ${brandName}?`,
                `On a scale of 0 -10, how would you rate ${productName} from ${brandName}?`,
            ]).parse(val);
        } else if (scaleType === "llx") {
            return z.literal("HOW DO YOU EVALUATE TODAY'S LEARNING?").parse(val);
        }

        return z.string().parse(val); 
    }, z.string()),

    notificationDuration: z.enum(["monthly", "biweekly", "quarterly", "everyday"]).default("monthly"),
    isActive: z.boolean().optional(),
    timezone: z.string(),
    reportTimeDuration: z.enum(["twenty_four_hours", "seven_days", "fifteen_days", "thirty_days", "ninety_days", "one_year"]).default("ninety_days")
});


const updatePreferenceSchema = z.object({
  scaleTypePreference: z.enum([
      "nps", "likert", "nps_lite", "stapel", "percent", "percent_sum", "llx","likert_two_point"
  ]).optional(),
  
  scaleDesignPreference: z.array(z.object({
      scaleType: z.string(),
      scaleId: z.string().nonempty(),
      design: z.enum(["default", "custom"]).default("default"),
  })).optional(),
  
  notificationDuration: z.enum([
      "monthly", "biweekly", "quarterly", "everyday"
  ]).optional(),

  dataType: z.enum(["Real_Data", "Learning_Data", "Testing_Data", "Archived_Data"]).optional(),

  questionToDisplay: z.string().optional()
}).refine(data => {
  
  if (data.scaleTypePreference) {
      const productName = data.productName || 'this product';
      const brandName = data.brandName || 'this brand';

      if (data.scaleTypePreference === "likert" || data.scaleTypePreference === "likert_two_point") {
          data.questionToDisplay = `Would you like to recommend ${productName} to your friends/colleagues?`;
      } else if (data.scaleTypePreference === "nps") {
          data.questionToDisplay = `On a scale of 0 -10, how would you rate ${productName}?`;
      }
  }
  return Object.keys(data).length > 0; // Ensure at least one field is present for update.
}, {
  message: "At least one field must be provided for update."
});


const emailFeedbackSchema = z.object({
    workspaceId: z.string().min(10).max(1000),
    customerName: z.string().min(6).max(32),
    customerEmail: z.string().optional(),
    location: z.string().optional(),
    latitude: z.number().optional(),
    longitude: z.number().optional(),
    scaleDesign: z.string().optional(),
    scaleResponse: z.number().optional(),
    description : z.string().optional(),
    type: z.string().optional(),
    formattedDate: z.string().optional()
})
export {
    sendOtpSchema,
    validateOtpSchema,
    locationSchema,
    preferenceSchema,
    updatePreferenceSchema,
    emailFeedbackSchema
}