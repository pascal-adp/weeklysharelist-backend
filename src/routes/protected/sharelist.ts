import { Router } from "express";

import { addSongController } from "@/controllers/sharelist";

const router = Router();

router.post("/addSong", addSongController);

export default router;