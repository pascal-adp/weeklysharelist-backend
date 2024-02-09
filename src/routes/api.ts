import { Router } from "express";
import spotifyAuthRoutes from './auth/spotify';

const router = Router();

router.use("/auth/spotify", spotifyAuthRoutes);

export default router