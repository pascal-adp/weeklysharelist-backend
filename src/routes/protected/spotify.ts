import { Router } from "express";

import { topTrackController, searchTrackController } from "@/controllers/spotify";

const router = Router();

router.get("/top/tracks", topTrackController)
router.get("/search", searchTrackController)

export default router;