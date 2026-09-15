import {getWords} from "../controllers/wordController.js";
import {verifyToken } from "../middlewares/authMiddleware.js";
import express from 'express'

const router = express.Router();

router.get('/', verifyToken, getWords);

export default router