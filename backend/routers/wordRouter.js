import {getWords, getWordDetail} from "../controllers/wordController.js";
import {verifyToken } from "../middlewares/authMiddleware.js";
import express from 'express'

const router = express.Router();

router.get('/', verifyToken, getWords);
router.get("/:id", verifyToken, getWordDetail);

export default router