import { getDbAccountByUserId, updateDbAccountToken } from '@/services/db';
import { getSpotifyRefreshToken } from '@/services/spotify';
import { PrismaClient } from '@prisma/client';
import { type Request, type Response, type NextFunction } from 'express';

const prisma = new PrismaClient();

export const authenticatonMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    if (!req.session) {
        const err = new Error('Unauthorized');
        next(err);
    }
    else {
        const account = await getDbAccountByUserId(req.session.userId!)

        if (account) {
            if (account.expires_at! < (Date.now() / 1000)) {
                const token = await getSpotifyRefreshToken(account.refresh_token!)
                await updateDbAccountToken(account.id, token.access_token, token.refresh_token, token.expires_in + (Date.now() / 1000))
                req.session.spotifyAccessToken = token.access_token
                req.session.save(err => {
                    if(err) {
                      console.log(err)
                    }
                });
            }
        }
    }
    next();
}