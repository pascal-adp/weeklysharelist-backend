import { Router } from "express";

import spotifyAuthRoutes from '@/routes/auth';
import sessionRoutes from '@/routes/session';
import userRoutes from '@/routes/protected/user';
import spotifyRoutes from '@/routes/protected/spotify';
import sharelistRoutes from '@/routes/protected/sharelist';
import friendsRoutes from '@/routes/protected/friends';

import { authenticatonMiddleware } from "@/middlewares/authentication";

const router = Router();

router.use("/auth/spotify", spotifyAuthRoutes);
router.use("/session", sessionRoutes)

// ONLY AUTHENTICATED USERS CAN ACCESS THESE ROUTES:
router.use(authenticatonMiddleware)

router.use("/user", userRoutes);
router.use("/spotify", spotifyRoutes);
router.use("/sharelist", sharelistRoutes);
router.use("/friends", friendsRoutes);

export default router