import { asyncHandler } from "../utils/asyncHandler.js";
import PayloadValidationServices from "../services/validation.services.js";
import { dowelltime } from "../services/dowellclock.services.js";
import { locationSchema } from "../utils/payloadSchema.js";
import { saveLocationData } from "../config/producer.config.js";


const saveLocation = asyncHandler(async(req,res)=>{
    const { workspaceId, latitude, longitude, event,scaleId,userId } = req.body;

    const validationResult = PayloadValidationServices.validateData(locationSchema, {
        workspaceId, 
        latitude, 
        longitude,
        event,
        scaleId,
        userId
    });

    if (!validationResult.isValid) {
        return res.status(400).json({
            success: false,
            message: "Invalid payload",
            errors: validationResult.errors
        });
    }
    const { find } = require('geo-tz')
    const timezone = find(latitude, longitude) 

    const dataToBeSaved = {
        workspaceId,
        latitude,
        longitude,
        event,
        createdAt: new Date().toISOString(),
        dowelltime: dowelltime(timezone)
    };

    if (scaleId) {
        dataToBeSaved.scaleId = scaleId;
    }

    if (userId) {
        dataToBeSaved.scaleId = userId;
    }

    await saveLocationData(dataToBeSaved)

    return res.status(200).json({
        success: true,
        message: "Location saved successfully",
        response: dataToBeSaved
    });
})

export { 
    saveLocation 
};