import { Router } from 'express';
import { sessionStatusController } from '@/controllers/session';

const router = Router();

router.use("/status", sessionStatusController)

export default router;