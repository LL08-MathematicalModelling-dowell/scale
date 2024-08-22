import { Router } from "express";
import { sendOtpToUser, validateOtp } from "../controllers/otp.controller.js";

const router = Router();

router.post("/send-otp", sendOtpToUser);
router.post("/validate-otp", validateOtp);

export default router;
