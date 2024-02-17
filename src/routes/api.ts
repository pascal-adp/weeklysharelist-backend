import { Router } from "express";

import spotifyAuthRoutes from '@/routes/auth';
import userRoutes from '@/routes/protected/user';

const router = Router();

router.use("/auth/spotify", spotifyAuthRoutes);
router.use("/user", userRoutes);

export default router