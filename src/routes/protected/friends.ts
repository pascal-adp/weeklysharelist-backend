import { getAllFriendsController, shareFriendController } from '@/controllers/friends';
import { Router } from 'express'

const router = Router();

router.get("/getAll", getAllFriendsController);
router.get("/share", shareFriendController);

export default router;