import { Router } from "express";

import { addSongController, deleteSongController, getSharelistSongsController } from "@/controllers/sharelist";

const router = Router();

router.post("/addSong", addSongController);
router.get("/getSongs", getSharelistSongsController);
router.delete("/deleteSong/:spotifyTrackId", deleteSongController);

export default router;