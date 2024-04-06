import { addFriendUUID, getAllFriendsByUserId } from "@/services/db";
import { type Request, type Response } from "express";

export const getAllFriendsController = async (req: Request, res: Response) => {
    try {
        const userId = req.session.userId;
    
        if (!userId) {
            throw new Error("userId could not be retrieved from session")
        }
        const friends = await getAllFriendsByUserId(userId)
        res.status(200).json(friends)
    }
    catch(error) {
        res.status(400).json({error: error})
    }
}

export const shareFriendController = async (req: Request, res: Response) => {
    try {
        const userId = req.session.userId;

        if (!userId) {
            throw new Error("userId could not be retrieved from session")
        }

        const uuid = crypto.randomUUID();
        const expires_at = Date.now() + 30 * 60 * 1000; // 30 minutes

        const dbRes = await addFriendUUID(userId, uuid, expires_at);        
        console.log(dbRes)

        res.status(200).json({ uuid: uuid })
    }
    catch(error) {
        res.status(400).json({error: error})
    }
}