import mongoose from 'mongoose';

const preferenceSchema = new mongoose.Schema({
    workspaceId: {
        type: String,
        required: true,
    },
    workspaceName: {
        type: String,
        required: true,
    },
    portfolio: {  
        type: String,
        required: true,
    },
    userId: {
        type: String,
        required: true,
    },
    scaleTypePreference: {
        type: String,
        required: true,
    },
    scaleDesignPreference: [
        {
            scaleType: { type: String , required: true },
            scaleId: { type: String, required: true },
            design: {
                type: String,
                enum: ["default", "custom"],
                default: "default" 
            }
        }
    ],
    isActive: {
        type: Boolean,
        default: true,
    },
    notificationDuration: {
        type: String,
        enum: ["monthly", "biweekly", "quarterly"],
        default: "monthly"
    }
}, { timestamps: true });

export default mongoose.model('Preference', preferenceSchema);
