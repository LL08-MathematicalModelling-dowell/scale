import { Router } from "express";
import { createPreference, userPreference, updateUserPreference, deletePreference, sendFeedbackEmail } from "../controllers/preference.controller.js";
const router = Router();

router.post("/", createPreference);
router.get("/:workspaceId/:userId/:productType", userPreference);
router.put("/:workspaceId/:userId/:productType", updateUserPreference);
router.delete("/:workspaceId", deletePreference);
router.post("/send-email-feedback", sendFeedbackEmail);

export default router;
