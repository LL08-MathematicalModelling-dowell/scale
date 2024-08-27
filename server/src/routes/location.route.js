import { Router } from "express";
import { saveLocation } from "../controllers/location.controller.js";

const router = Router();

router.post("/save-location", saveLocation);

export default router;
