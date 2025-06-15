import crypto from "crypto";
import { ValidationError } from "../../../../packages/error-handler";
import { NextFunction } from "express";
import redis from "../../../../packages/lib/redis";
import { sendEmail } from "./sendEmail";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const validateRegistrationData = (data: any, userType: "user" | "seller") => {

    const { name, email, password, phone_number, country } = data;

    if (!name || !email || !password || (userType === "seller" && !phone_number || !country)) {
        throw new ValidationError("Missing required Fields");
    }

    if (!emailRegex.test(email)) {
        throw new ValidationError("Invalid Email Format!");
    }
}

export const checkOtpRestrictions = async (email: string, next: NextFunction) => {
    if (await redis.get(`otp_lock:${email}`)) {
        return next(new ValidationError("Account locked due to multiple failed attempts! Try again after 30 minutes!"))
    }
    if (await redis.get(`otp_spam_lock:${email}`)) {
        return next(new ValidationError("Too many OTP requests! please wait 1 hour before sending request again!"))
    }
    if (await redis.get(`otp_cooldown:${email}`)) {
        return next(new ValidationError("Please wait 1 minute before requesting a new OTP!"))
    }
}

export const trackOTPRequests = async (email: string, next: NextFunction) => {
    const otpRequestkey = `otp_request_count:${email}`;
    let otpRequests = parseInt((await redis.get(otpRequestkey)) || "0")
    if (otpRequests >= 2) {
        await redis.set(`otp_spam_lock:${email}`, "locked", "EX", 3600)
        return next(new ValidationError("Too many OTP requests. please wait 1 hour before requesting again"))
    }

    await redis.set(otpRequestkey, otpRequests + 1, "EX", 3600)
}

export const sendOTP = async (name: string, email: string, template: string) => {
    const otp = crypto.randomInt(1000, 9999).toString();
    await sendEmail(email, "Verify your email", template, { name, otp })
    await redis.set(`otp:${email}`, otp, "EX", 300);
    await redis.set(`otp_cooldown:${email}`, "true", "EX", 60)
}