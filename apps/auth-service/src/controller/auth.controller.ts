import { NextFunction, Request, Response } from "express";
import { checkOtpRestrictions, handleForgotPassword, sendOTP, trackOTPRequests, validateRegistrationData, verifyForgotPasswordOtp, verifyOtp } from "../utils/auth.helper";
import prisma from "@packages/lib/prisma";
import { AuthError, ValidationError } from "@packages/error-handler";
import bcryptjs from "bcryptjs"
import jwt, { JsonWebTokenError } from "jsonwebtoken"
import { setCookie } from "../utils/cookies/setCookie";
import Stripe from "stripe";


const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

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

        const accesToken = jwt.sign({ id: existingUser.id, role: "user" }, process.env.ACCESS_TOKEN_SECRET as string, { expiresIn: "15m" })
        const refreshToken = jwt.sign({ id: existingUser.id, role: "user" }, process.env.REFRESH_TOKEN_SECRET as string, { expiresIn: "7d" })

        setCookie(res, "refresh_token", refreshToken)
        setCookie(res, "access_token", accesToken)

        res.clearCookie("seller-refresh-token")
        res.clearCookie("seller-access-token")

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

export const refreshToken = async (req: any, res: Response, next: NextFunction) => {
    try {
        const refresh_token = req.cookies["refresh_token"] || req.cookies["seller-refresh-token"] || req.headers.authorization?.split(" ")[1];
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

        let account
        if (decoded.role === "user") {
            account = await prisma.users.findUnique({
                where: {
                    id: decoded.id
                }
            })
        } else if (decoded.role === "seller") {
            account = await prisma.sellers.findUnique({
                where: {
                    id: decoded.id
                }
            })
        } 

        if (!account) {
            return new AuthError("Fobidden! Account don't found")
        }

        const newaccessToken = jwt.sign({ id: account.id, role: decoded.role }, process.env.ACCESS_TOKEN_SECRET as string, { expiresIn: "15m" })
        
        if(decoded.role === "user") {
            setCookie(res, "access_token", newaccessToken)
        } else if (decoded.role === "seller") {
            setCookie(res,"seller-access-token",newaccessToken)
        }

        req.role = decoded.role

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
        await sendOTP(name, email, "seller-activation")

        res.status(200).json({
            message: "Otp sent to email. Please verify our account."
        })
    } catch (error) {
        next(error)
    }
}

export const verifySeller = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email, otp, password, name, phone_number, country } = req.body;

        if (!email || !otp || !password || !name || !phone_number || !country) {
            throw new ValidationError("All Fields are required")
        }

        const existingUser = await prisma.sellers.findUnique({ where: { email: email } })

        if (existingUser) {
            throw new ValidationError("Selller alreay exists")
        }

        await verifyOtp(email, otp)
        const hashedPassword = await bcryptjs.hash(password, 10)

        const seller = await prisma.sellers.create({
            data: {
                name: name,
                email: email,
                password: hashedPassword,
                country: country,
                phone_number: phone_number
            }
        })

        res.status(200).json({
            message: "Seller register successfully",
            seller: {
                id: seller.id
            }
        })

    } catch (error) {
        next(error)
    }
}

export const createShop = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { name, bio, address, openning_hours, website, category, sellerId } = req.body;

        if (!name || !bio || !address || !openning_hours || !category || !sellerId) {
            throw new ValidationError("All Fields are required")
        }

        const shopData: any = {
            name: name,
            bio: bio,
            address: address,
            opening_hours: openning_hours,
            category: category,
            sellerId: sellerId
        }

        if (website && website.trim() !== "") {
            shopData.website = website
        }

        const shop = await prisma.shops.create({ data: shopData })

        res.status(200).json({
            success: true,
            shop
        })

    } catch (error) {
        next(error)
    }
}

export const createStripeCOnnectLink = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { sellerId } = req.body
        if (!sellerId) {
            throw new ValidationError("Seller Id is not present")
        }

        const seller = await prisma.sellers.findUnique({
            where: {
                id: sellerId
            }
        });
        if (!seller) {
            throw new ValidationError("Seller is not available with this id!")
        }
        const account = await stripe.accounts.create({
            type: "express",
            email: seller.email,
            country: "GB",
            capabilities: {
                card_payments: { requested: true },
                transfers: { requested: true }
            }
        });

        await prisma.sellers.update({
            where: {
                id: sellerId
            },
            data: {
                stripeId: account.id
            }
        })

        const accountLink = await stripe.accountLinks.create({
            account: account.id,
            refresh_url: `http://localhost:3000/success`,
            return_url: `http://localhost:3000/success`,
            type: "account_onboarding"
        })

        res.json({
            url: accountLink.url
        })

    } catch (error) {
        next(error)
    }
}

export const LoginSeller = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return next(new ValidationError("All Fields are required!!!"))
        }
        const existingUser = await prisma.sellers.findUnique({ where: { email: email } })
        if (!existingUser) {
            return next(new ValidationError("Seller doesn't exists"))
        };
        const isMatch = await bcryptjs.compare(password, existingUser.password!)
        if (!isMatch) {
            return next(new AuthError("Invalid Email or Password"))
        }

        const accesToken = jwt.sign({ id: existingUser.id, role: "seller" }, process.env.ACCESS_TOKEN_SECRET as string, { expiresIn: "15m" })
        const refreshToken = jwt.sign({ id: existingUser.id, role: "seller" }, process.env.REFRESH_TOKEN_SECRET as string, { expiresIn: "7d" })

        setCookie(res, "seller-refresh-token", refreshToken)
        setCookie(res, "seller-access-token", accesToken)

        res.clearCookie("access_token")
        res.clearCookie("refresh_token")

        res.status(200).json({
            message: "Login Successfull",
            seller: {
                id: existingUser.id,
                email: existingUser.email,
                name: existingUser.name
            }
        })


    } catch (error) {
        return next(error)
    }
}

export const getSeller = async (req: any, res: Response, next: NextFunction) => {
    try {
        const seller = req.seller;
        return res.status(200).json({
            success: true,
            seller
        })
    } catch (error) {
        return next(error)
    }
}