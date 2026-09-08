import { Router } from 'express';
import { firebaseAuth } from '../controllers/auth.controller.js';

const router = Router();

router.post('/google', firebaseAuth);

export default router;