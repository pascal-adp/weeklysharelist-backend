import { Router } from "express";
import spotifyAuthRoutes from '@/routes/auth';

const router = Router();

router.use("/auth/spotify", spotifyAuthRoutes);

export default router