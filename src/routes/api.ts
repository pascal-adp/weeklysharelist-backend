import { Router } from "express";

import spotifyAuthRoutes from '@/routes/auth';
import userRoutes from '@/routes/protected/user';
import spotifyRoutes from '@/routes/protected/spotify';

import { authenticatonMiddleware } from "@/middlewares/authentication";

const router = Router();

router.use("/auth/spotify", spotifyAuthRoutes);

// ONLY AUTHENTICATED USERS CAN ACCESS THESE ROUTES:
router.use(authenticatonMiddleware)

router.use("/user", userRoutes);
router.use("/spotify", spotifyRoutes);

export default router