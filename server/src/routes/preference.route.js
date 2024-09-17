import { Router } from "express";
import { createPreference, userPreference, updateUserPreference } from "../controllers/preference.controller.js";
const router = Router();

router.post("/", createPreference);
router.get("/:workspaceId/:userId", userPreference);
router.put("/:workspaceId/:userId", updateUserPreference);

export default router;
