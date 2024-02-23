import { getUserInfoController } from "@/controllers/user";
import { Router } from "express";

const router = Router();

router.get("/info", getUserInfoController);

export default router