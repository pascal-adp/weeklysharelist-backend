import { Router } from "express";

import { authenticatonMiddleware } from "@/middlewares/authentication";

const router = Router();

router.use(authenticatonMiddleware)

router.get("/info", (req, res) => {
    console.log(req.session);
    res.send("User data");
})

export default router