import { asyncHandler } from "../utils/asyncHandler.js";
import { getCurrentTimestamp } from "../utils/helper.js"
import os from "os";

const healthCheckService = asyncHandler(async (req, res) => {
    const now = getCurrentTimestamp();

    return res
        .status(200)
        .json({ 
            success: true,
            version: "1.3.1",
            status: "UP",
            timestamp: now,
            server_time: now,
            message: "Micro services API is running fine" 
        });
});

export { 
    healthCheckService
};
