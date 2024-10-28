import { asyncHandler } from "../utils/asyncHandler.js";
import PayloadValidationServices from "../services/validation.services.js";
import Preference from "../models/preference.schema.js";
import { preferenceSchema,updatePreferenceSchema, emailFeedbackSchema } from "../utils/payloadSchema.js";
import { sendEmailToOwner } from "../config/producer.config.js"


const createPreference = asyncHandler(async (req, res) => {
    
    const {
        workspaceId, workspaceName, portfolio, userId, scaleTypePreference,
        scaleDesignPreference, notificationDuration, dataType, productType, brandName, productName
    } = req.body;
    
    const validationResult = PayloadValidationServices.validateData(preferenceSchema, {
        workspaceId, 
        workspaceName, 
        portfolio, 
        userId, 
        scaleTypePreference,
        scaleDesignPreference, 
        notificationDuration, 
        dataType, 
        productType, 
        brandName, 
        productName
    });

    
    if (!validationResult.isValid) {
        return res.status(400).json({
            success: false,
            message: "Invalid payload",
            errors: validationResult.errors
        });
    }

    const existingPreference = await Preference.findOne({ workspaceId, userId, productType });

    if (existingPreference) {
        return res.status(400).json({
            success: false,
            message: "Preference already exists for the given workspaceId and userId and productType",
        });
    }

    const newPreference = await Preference.create(validationResult.validatedData);

    if (!newPreference) {
        return res.status(400).json({
            success: false,
            message: "Failed to create preference"
        });
    }

    return res.status(201).json({
        success: true,
        message: "Preference created successfully",
        response: newPreference
    });
});

const userPreference = asyncHandler(async (req, res) => {
    const { workspaceId, userId, productType } = req.params;

    if(!workspaceId || !userId || !productType) {
        return res.status(400).json({
            success: false,
            message: "Missing required parameters: workspaceId, userId, and productType"
        });
    }
    console.log(workspaceId, userId, productType);
    
    const preference = await Preference.findOne({ workspaceId, userId });

    if (!preference) {
        return res.status(404).json({
            success: false,
            message: "Preference not found for the given workspaceId and userId, productType"
        });
    }

    return res.status(200).json({
        success: true,
        message: "Preference fetched successfully",
        response: preference
    });
});

const updateUserPreference = asyncHandler(async (req, res) => {
    const { workspaceId, userId, productType } = req.params;
    const { scaleTypePreference, scaleDesignPreference, notificationDuration, dataType, productName, brandName } = req.body;

    // Create an object for validation
    const payload = {
        scaleTypePreference,
        scaleDesignPreference,
        notificationDuration,
        dataType,
        productName,
        brandName
    };

    // Validate the payload
    const validationResult = PayloadValidationServices.validateData(updatePreferenceSchema, payload);

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
    if (dataType) updateData.dataType = dataType;

    // Set questionToDisplay based on the validated payload
    updateData.questionToDisplay = validationResult.validatedData.questionToDisplay;

    const updatedPreference = await Preference.findOneAndUpdate(
        { workspaceId, userId, productType },  
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


const deletePreference = asyncHandler(async (req,res) => {
    const { workspaceId } = req.params;

    const preference = await Preference.findOneAndDelete({ workspaceId });

    if (!preference) {
        return res.status(404).json({
            success: false,
            message: "Preference not found for the given workspaceId and userId"
        });
    }

    return res.status(200).json({
        success: true,
        message: "Preference deleted successfully"
    });
})

const sendFeedbackEmail = asyncHandler(async (req, res) => {
    const { workspaceId, customerName, customerEmail, location, latitude, longitude, scaleResponse,description , type, formattedDate } = req.body

    const validationResult = PayloadValidationServices.validateData(emailFeedbackSchema, {
        workspaceId, 
        customerName, 
        customerEmail, 
        location, 
        latitude, 
        longitude, 
        scaleResponse,
        description,
        type,
        formattedDate
    })

    if (!validationResult.isValid) {
        return res.status(400).json({
            success: false,
            message: "Invalid payload",
            errors: validationResult.errors
        });
    }

    const data = {
        workspaceId,
        customerName,
        customerEmail,
        location,
        latitude,
        longitude,
        scaleResponse,
        description,
        type,
        formattedDate
    }

    sendEmailToOwner(data)


    return res
    .status(200)
    .json({
        success: true,
        message: "Feedback email sent successfully",
    });
    
});
export {
    createPreference,
    userPreference,
    updateUserPreference,
    deletePreference,
    sendFeedbackEmail
}
    
