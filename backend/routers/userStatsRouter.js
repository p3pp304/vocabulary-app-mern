import express from "express";
import { getUserStats } from "../controllers/userStatsController.js";
import { verifyToken } from "../middlewares/authMiddleware.js";

const router = express.Router();
router.get("/stats", verifyToken, getUserStats);

export default router;