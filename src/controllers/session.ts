import { type Request, type Response } from 'express';

export const sessionStatusController = async (req: Request, res: Response) => {
    if (req.session.userId) {
        res.status(200).json({ status: "authenticated" });
    }
    else {
        res.status(401).json({ status: "unauthenticated" });
    }
}