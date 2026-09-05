import { deleteWord, updateWord, createWord, getWords, protect } from "../controllers/wordController";
import express from 'express'

const router = express.Router();

router.get('/words', protect, getWords);
router.post('/words', protect, createWord);
router.put('/word/:id', protect, updateWord);
router.delete('/word/:id', protect, deleteWord);

export default router