import { Response, NextFunction } from "express";
import { AuthError } from "../error-handler";

export const isSeller = (req: any, res: Response, next: NextFunction) => {
    if (req.role !== "seller") {
        return next(new AuthError("acess denied! You are not a seller."));
    }
    next();
}

export const isUser = (req: any, res: Response, next: NextFunction) => {
    if (req.role !== "user") {
        return next(new AuthError("acess denied! You are not a user."));
    }
    next();
}