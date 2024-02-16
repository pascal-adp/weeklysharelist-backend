import { type Request, type Response, type NextFunction } from "express";

export const errorMiddleware = async (err: Error, req: Request, res: Response, next: NextFunction) => {
    
}