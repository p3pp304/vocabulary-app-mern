import express from "express";
import {
	getFlashcards,
	saveFlashcardSessionScore,
	submitReview,
} from "../controllers/flashcardController.js";
import { verifyToken } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.use(verifyToken);

router.get("/", getFlashcards);
router.post("/sessions", saveFlashcardSessionScore);
router.post("/:deckItemId/review", submitReview);

export default router;