import { asyncHandler } from "../utils/asyncHandler.js";
import { getCurrentTimestamp } from "../utils/helper.js"

const healthCheckService = asyncHandler(async (req, res) => {
    const now = getCurrentTimestamp();

    return res
        .status(200)
        .json({ 
            success: true,
            version: "1.0.0",
            status: "UP",
            timestamp: now,
            server_time: now,
            message: "OTP services is running fine" 
        });
});

export { 
    healthCheckService
};
