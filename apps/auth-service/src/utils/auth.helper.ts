import crypto from "crypto";
import { ValidationError } from "../../../../packages/error-handler";
import { NextFunction, Request, Response } from "express";
import redis from "../../../../packages/lib/redis";
import { sendEmail } from "./sendEmail";
import prisma from "@packages/lib/prisma";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const validateRegistrationData = (data: any, userType: "user" | "seller") => {

    const { name, email, password, phone_number, country } = data;

    if (!name || !email || !password || (userType === "seller" && (!phone_number || !country))) {
        console.log(data)
        throw new ValidationError("Missing required Fields");
    }

    if (!emailRegex.test(email)) {
        throw new ValidationError("Invalid Email Format!");
    }
}

export const checkOtpRestrictions = async (email: string, next: NextFunction) => {
    if (await redis.get(`otp_lock:${email}`)) {
        throw new ValidationError("Account locked due to multiple failed attempts! Try again after 30 minutes!")
    }
    if (await redis.get(`otp_spam_lock:${email}`)) {
        throw new ValidationError("Too many OTP requests! please wait 1 hour before sending request again!")
    }
    if (await redis.get(`otp_cooldown:${email}`)) {
        throw new ValidationError("Please wait 1 minute before requesting a new OTP!")
    }
}

export const trackOTPRequests = async (email: string, next: NextFunction) => {
    const otpRequestkey = `otp_request_count:${email}`;
    let otpRequests = parseInt((await redis.get(otpRequestkey)) || "0")
    if (otpRequests >= 2) {
        await redis.set(`otp_spam_lock:${email}`, "locked", "EX", 3600)
        throw new ValidationError("Too many OTP requests. please wait 1 hour before requesting again")
    }

    await redis.set(otpRequestkey, otpRequests + 1, "EX", 3600)
}

export const sendOTP = async (name: string, email: string, template: string) => {
    const otp = crypto.randomInt(1000, 9999).toString();
    await sendEmail(email, "Verify your email", template, { name, otp })
    await redis.set(`otp:${email}`, otp, "EX", 300);
    await redis.set(`otp_cooldown:${email}`, "true", "EX", 60)
}

export const verifyOtp = async (email: string, otp: string) => {
    const storedOtp = await redis.get(`otp:${email}`);
    if (!storedOtp) {
        throw new ValidationError("Invalid or expired OTP!")
    }
    const failedAttemptKey = `otp_attempts:${email}`
    const failedAttempt = parseInt((await redis.get(failedAttemptKey)) || "0")

    if (storedOtp !== otp) {
        if (failedAttempt >= 2) {
            await redis.set(`otp_lock:${email}`, "true", "EX", 1800)
            await redis.del(`otp:${email}`, failedAttemptKey)
            throw new ValidationError("Too many failed attempts. your account is locked for 30 minutes!")
        }
        await redis.set(failedAttemptKey, failedAttempt + 1, "EX", 300)
        throw new ValidationError(`Incorrect OTP. ${2 - failedAttempt} attempts left.`)
    }

    await redis.del(`otp:${email}`, failedAttemptKey)
}

export const handleForgotPassword = async (req: Request, res: Response, next: NextFunction, userType: "user" | "seller") => {
    try {
        const { email } = req.body;

        if (!email) {
            throw new ValidationError("Email is required")
        }

        const user = userType === "user" ?
            await prisma.users.findUnique({ where: { email: email } })
            : await prisma.sellers.findUnique({ where: { email: email } })

        if (!user) {
            throw new ValidationError(`${userType} is required`)
        }

        await checkOtpRestrictions(email, next);
        await trackOTPRequests(email, next);
        await sendOTP(user.name, email, userType === "user" ? "forgot-password-user-mail" : "forgot-password-seller-mail")
        res.status(200).json({
            message: "otp sent to mail. Please verify your account"
        })
    } catch (error) {
        next(error)
    }
}

export const verifyForgotPasswordOtp = async (req: Request, res: Response, next: NextFunction, userType: "user" | "seller") => {
    try {
        const { email, otp } = req.body;

        if (!email || !otp) {
            throw new ValidationError("Email and otp is required")
        }

        await verifyOtp(email, otp);
        res.status(200).json({
            message: "Otp verified. you can reset your password"
        })
    } catch (error) {
        next(error)
    }
}