import { type Request, type Response, type NextFunction } from 'express';

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
    if (!req.session) {
        const err = new Error('Unauthorized'); 
        next(err);
    }
    next();
}