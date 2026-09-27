import express from "express";
import {
  getMyDeck,
  addWordToDeck,
  updateDeckWord,
  removeWordFromDeck,
  createCustomDeckWord,
} from "../controllers/deckController.js";
import { verifyToken } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Protezione globale su tutte le operazioni del mazzo personale
router.use(verifyToken);

router.get("/", getMyDeck);
router.post("/", addWordToDeck);
router.put("/:id", updateDeckWord);
router.delete("/:id", removeWordFromDeck);
router.post('/custom', verifyToken, createCustomDeckWord);

export default router;