import { Router } from "express";

import { topTrackController } from "@/controllers/spotify";

const router = Router();

router.get("/top/tracks", topTrackController)

export default router;