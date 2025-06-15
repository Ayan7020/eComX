import express, { Router } from "express";
import { userRegisteration } from "../controller/auth.controller";

const router:Router = express.Router();

router.post("/user-registration",userRegisteration)

export default router;