import { Router } from "express";
import spotifyAuthRoutes from './auth/spotifyAuth';

const router = Router();

router.use("/auth/spotify", spotifyAuthRoutes);

export default router