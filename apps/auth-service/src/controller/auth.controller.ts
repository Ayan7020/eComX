import { NextFunction, Request, Response } from "express";
import { checkOtpRestrictions, sendOTP, trackOTPRequests, validateRegistrationData, verifyOtp } from "../utils/auth.helper";
import prisma from "@packages/lib/prisma";
import { ValidationError } from "@packages/error-handler";
import bcryptjs from "bcryptjs"

export const userRegisteration = async (req: Request, res: Response, next: NextFunction) => {
    try {
        validateRegistrationData(req.body, "user");
        const { name, email } = req.body;
        const existingUser = await prisma.users.findUnique({ where: { email: email } })

        if (existingUser) {
            return next(new ValidationError("User already exists with this email!"))
        };

        await checkOtpRestrictions(email, next);
        await trackOTPRequests(email, next);
        await sendOTP(name, email, "user-activation-mail")
        res.status(200).json({
            message: "otp sent to mail. Please verify your account"
        })
    } catch (error) {
        return next(error);
    }
}

export const verifyUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email, otp, password, name } = req.body;
        if (!email || !otp || !password || !name) {
            return next(new ValidationError("All Fields are required!!!"))
        }
        const existingUser = await prisma.users.findUnique({ where: { email: email } })
        if (existingUser) {
            return next(new ValidationError("User already exists with this email!"))
        };

        await verifyOtp(email, otp)
        const hashedPassword = await bcryptjs.hash(password, 10);
        console.log("in user")
        await prisma.users.create({
            data: {
                name: name,
                email: email,
                password: hashedPassword,
            }
        })

        res.status(201).json({
            success: true,
            message: "User Register successfully"
        });
    } catch (error) {
        return next(error)
    }
}