import { getAllFriendsController } from '@/controllers/friends';
import { Router } from 'express'

const router = Router();

router.get("/getAll", getAllFriendsController);
router.get("/add")