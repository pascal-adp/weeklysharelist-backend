import { Router } from 'express';
import cookieParser from 'cookie-parser'

import { callbackController, loginController } from '@/controllers/auth/auth';

const router = Router();

router.use(cookieParser(process.env.COOKIE_SECRET))

router.get("/login", loginController);
router.get("/callback", callbackController);

export default router;