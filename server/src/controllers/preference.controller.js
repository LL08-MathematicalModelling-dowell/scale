import { asyncHandler } from "../utils/asyncHandler.js";
import PayloadValidationServices from "../services/validation.services.js";
import Preference from "../models/preference.schema.js";
import { preferenceSchema,updatePreferenceSchema } from "../utils/payloadSchema.js";


const createPreference = asyncHandler(async (req, res) => {
    const { workspaceId, workspaceName, portfolio, userId, scaleTypePreference, scaleDesignPreference, notificationDuration } = req.body;

    const validationResult = PayloadValidationServices.validateData(preferenceSchema, {
        workspaceId, 
        workspaceName, 
        portfolio, 
        userId, 
        scaleTypePreference, 
        scaleDesignPreference,  
        notificationDuration
    });

    if (!validationResult.isValid) {
        return res.status(400).json({
            success: false,
            message: "Invalid payload",
            errors: validationResult.errors
        });
    }

    const newPreference = await Preference.create({
        workspaceId, 
        workspaceName, 
        portfolio, 
        userId, 
        scaleTypePreference, 
        scaleDesignPreference,
        notificationDuration
    });

    if (!newPreference) {
        return res.status(400).json({
            success: false,
            message: "Failed to create preference"
        });
    }

    return res.status(200).json({
        success: true,
        message: "Preference created successfully",
        response: newPreference
    });
});

const userPreference = asyncHandler(async (req, res) => {
    const { workspaceId, userId } = req.params;

    const preference = await Preference.findOne({ workspaceId, userId });

    if (!preference) {
        return res.status(404).json({
            success: false,
            message: "Preference not found for the given workspaceId and userId"
        });
    }

    return res.status(200).json({
        success: true,
        message: "Preference fetched successfully",
        response: preference
    });
});

const updateUserPreference = asyncHandler(async (req, res) => {
    const { workspaceId, userId } = req.params;
    const { scaleTypePreference, scaleDesignPreference, notificationDuration } = req.body;

    const validationResult = PayloadValidationServices.validateData(updatePreferenceSchema, {
        scaleTypePreference,
        scaleDesignPreference,
        notificationDuration
    });

    if (!validationResult.isValid) {
        return res.status(400).json({
            success: false,
            message: "Invalid payload",
            errors: validationResult.errors
        });
    }

    const updateData = {};
    if (scaleTypePreference) updateData.scaleTypePreference = scaleTypePreference;
    if (scaleDesignPreference) updateData.scaleDesignPreference = scaleDesignPreference;
    if (notificationDuration) updateData.notificationDuration = notificationDuration;

    const updatedPreference = await Preference.findOneAndUpdate(
        { workspaceId, userId },  
        { $set: updateData },      
        { new: true }              
    );

    if (!updatedPreference) {
        return res.status(404).json({
            success: false,
            message: "Preference not found for the given workspaceId and userId"
        });
    }

    return res.status(200).json({
        success: true,
        message: "Preference updated successfully",
        response: updatedPreference
    });
});

export {
    createPreference,
    userPreference,
    updateUserPreference
}
    
