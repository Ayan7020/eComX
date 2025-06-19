import { NextFunction, Request, Response } from "express";
import { checkOtpRestrictions, handleForgotPassword, sendOTP, trackOTPRequests, validateRegistrationData, verifyForgotPasswordOtp, verifyOtp } from "../utils/auth.helper";
import prisma from "@packages/lib/prisma";
import { AuthError, ValidationError } from "@packages/error-handler";
import bcryptjs from "bcryptjs"
import jwt, { JsonWebTokenError } from "jsonwebtoken"
import { setCookie } from "../utils/cookies/setCookie";

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

export const loginUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return next(new ValidationError("All Fields are required!!!"))
        }
        const existingUser = await prisma.users.findUnique({ where: { email: email } })
        if (!existingUser) {
            return next(new ValidationError("User doesn't exists"))
        };
        const isMatch = await bcryptjs.compare(password, existingUser.password!)
        if (!isMatch) {
            return next(new AuthError("Invalid Email or Password"))
        }

        const accesToken = jwt.sign({ id: existingUser.id, role: "User" }, process.env.ACCESS_TOKEN_SECRET as string, { expiresIn: "15m" })
        const refreshToken = jwt.sign({ id: existingUser.id, role: "User" }, process.env.REFRESH_TOKEN_SECRET as string, { expiresIn: "7d" })

        setCookie(res, "refresh_token", refreshToken)
        setCookie(res, "access_token", accesToken)

        res.status(200).json({
            message: "Login Successfull",
            user: {
                id: existingUser.id,
                email: existingUser.email,
                name: existingUser.name
            }
        })


    } catch (error) {
        return next(error)
    }
}

export const refreshToken = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const refresh_token = req.cookies.refresh_token;
        if (!refresh_token) {
            throw new ValidationError("Unauthorized! no refresh token!");
        }
        const decoded = jwt.verify(
            refresh_token,
            process.env.REFRESH_TOKEN_SECRET as string
        ) as {
            id: string,
            role: string
        }
        if (!decoded || !decoded.id || !decoded.role) {
            return new JsonWebTokenError("Forbidden Invalid refresh Token.")
        }
        const User = await prisma.users.findUnique({
            where: {
                id: decoded.id
            }
        })

        if (!User) {
            return new AuthError("Fobidden! User don't found")
        }

        const newaccessToken = jwt.sign({ id: User.id, role: "User" }, process.env.ACCESS_TOKEN_SECRET as string, { expiresIn: "15m" })
        setCookie(res, "access_token", newaccessToken)

        return res.status(201).json({
            success: true
        })

    } catch (error) {
        return next(error)
    }
}

export const getUser = async (req: any, res: Response, next: NextFunction) => {
    try {
        const user = req.user;
        return res.status(200).json({
            success: true,
            user
        })
    } catch (error) {
        return next(error)
    }
}

export const userForgotPassword = async (req: Request, res: Response, next: NextFunction) => {
    await handleForgotPassword(req, res, next, "user");
}

export const verifyUserPassword = async (req: Request, res: Response, next: NextFunction) => {
    await verifyForgotPasswordOtp(req, res, next, "user")
}

export const resetUserPassword = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email, newPassword } = req.body;
        if (!email || !newPassword) {
            return next(new ValidationError("Email and new Password are required!!!"))
        }

        const existingUser = await prisma.users.findUnique({ where: { email: email } })
        if (!existingUser) {
            return next(new ValidationError("User doesn't exists"))
        };

        const isSamePassword = await bcryptjs.compare(newPassword, existingUser.password!)

        if (isSamePassword) {
            return next(new ValidationError("New password cannot be same as the old password!"))
        }

        const hashedPassword = await bcryptjs.hash(newPassword, 10)
        await prisma.users.update({
            where: {
                email: email
            },
            data: {
                password: hashedPassword
            }
        })

        res.status(200).json({
            message: "password reset successfully"
        })
    } catch (error) {
        return next(error)
    }
}

export const regiserSeller = async (req: Request, res: Response, next: NextFunction) => {
    try {
        validateRegistrationData(req.body, "seller")
        const { name, email } = req.body;
        const existingUser = await prisma.sellers.findUnique({ where: { email: email } })

        if (existingUser) {
            throw new ValidationError("seller already exists")
        }

        await checkOtpRestrictions(email, next)
        await trackOTPRequests(email, next)
        await sendOTP(name,email,"seller-activation")

        res.status(200).json({
            message: "Otp sent to email. Please verify our account."
        })
    } catch (error) {
        next(error)
    }
}