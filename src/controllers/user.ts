import { type Request, type Response } from 'express';

import { getDbUserByUserId } from '@/services/db';

export const getUserInfoController = async (req: Request, res: Response) => {
    const userId = req.session.userId!;
    const user = await getDbUserByUserId(userId);
    // console.log(user)

    if (user) {
        res.status(200).json({
            name: user.name,
            image: user.image
        });
    }
    else {
        res.status(404).json({});
    }
};