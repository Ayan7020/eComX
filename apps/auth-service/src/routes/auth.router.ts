import express, { Router } from "express";
import { createShop, createStripeCOnnectLink, getSeller, getUser, LoginSeller, loginUser, refreshToken, regiserSeller, resetUserPassword, userForgotPassword, userRegisteration, verifySeller, verifyUser, verifyUserPassword } from "../controller/auth.controller";
import isAuthenticated from "@packages/middleware/isAuthenticated";
import { isSeller, isUser } from "@packages/middleware/authorizedRole";

const router: Router = express.Router();

router.post("/user-registration", userRegisteration)
router.post("/verify-user", verifyUser)
router.post("/login-user", loginUser)
router.post("/refresh-token-user", refreshToken)
router.post("/forgot-password-user", userForgotPassword)
router.post("/verify-forgot-password-user", verifyUserPassword)
router.post("/reset-password-user", resetUserPassword)
router.get("/logged-in-user", isAuthenticated, isUser, getUser)

router.post("/seller-registration", regiserSeller)
router.post("/verify-seller-registration", verifySeller)
router.post("/create-shop", createShop)

router.post("/create-stripe-link", createStripeCOnnectLink)
router.post("/login-seller", LoginSeller)
router.get("/logged-in-seller", isAuthenticated, isSeller, LoginSeller)



export default router;