import express from 'express';
import { registrati, accedi, logout, fetchUser } from '../controllers/userController.js';

const router = express.Router();  // router gestisce le rotte correllate

router.post('/registrati', registrati);
router.post('/accedi', accedi);
router.get('/esci', logout);
router.get('/fetchUser', fetchUser);

export default router;