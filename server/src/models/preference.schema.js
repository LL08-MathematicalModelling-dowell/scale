import mongoose from 'mongoose';

const preferenceSchema = new mongoose.Schema({
    workspaceId: {
      type: String,
      required: true
    },
    workspaceName: {
      type: String,
      required: true
    },
    portfolio: {
      type: String,
      required: true
    },
    userId: {
      type: String,
      required: true
    },
    scaleTypePreference: {
      type: String,
      required: true,
      enum: ["nps", "likert", "nps_lite", "stapel", "percent", "percent_sum", "llx", "likert_two_point"]
    },
    scaleDesignPreference: [
      {
        scaleType: { type: String, required: true },
        scaleId: { type: String, required: true },
        design: { type: String, enum: ["default", "custom"], default: "default" }
      }
    ],
    
    brandName: {
      type: String,
      required: function () {
        return this.scaleTypePreference === 'nps' || this.scaleTypePreference === 'likert' || this.scaleTypePreference === 'likert_two_point';
      }
    },
    productName: {
      type: String,
      required: function () {
        return this.scaleTypePreference === 'nps' || this.scaleTypePreference === 'likert' || this.scaleTypePreference === 'likert_two_point';
      }
    },
    questionToDisplay: {
        type: String,
        required: true,
    },
    notificationDuration: {
      type: String,
      enum: ["monthly", "biweekly", "quarterly", "everyday"],
      default: "monthly"
    },
    dataType:{
      type: String,
      required: true
    },
    productType: {
      type: String,
      required: true
    },
    isActive: {
      type: Boolean,
      default: true
    },
    reportTimeDuration: {
      type: String,
      enum: ["twenty_four_hours", "seven_days", "fifteen_days", "thirty_days", "ninety_days", "one_year"],
      default: "ninety_days"
    },
    timezone: {
      type: String,
      required: true
    }
  }, { timestamps: true });
  

export default mongoose.model('Preference', preferenceSchema);
