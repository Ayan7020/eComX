/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import express from 'express';
import cors from "cors";
import proxy from "express-http-proxy";
import morgan from "morgan";
import ratelimit from "express-rate-limit";
import swaggeui from "swagger-ui-express";
import axios from "axios";
import cookieParser from "cookie-parser";

const app = express();

app.use(
  cors({
    origin: ["http://localhost:3000"],
    allowedHeaders: ['Authorization', 'Content-Type'],
    credentials: true,
  })
)

app.use(morgan("dev"))
app.use(express.json({ limit: "100mb" }))
app.use(express.urlencoded({ limit: '100mb' }))
app.use(cookieParser());
app.set("trust proxy", 1)


const limiter = ratelimit({
  windowMs: 15 * 60 * 1000,
  max: (req: any) => (req.user ? 1000 : 100),
  message: { error: "Too many request, Please try again later!" },
  standardHeaders: true,
  legacyHeaders: true,
  keyGenerator: (req: any) => req.ip,
})

app.use(limiter);

app.get('/gateway-health', (req, res) => {
  res.send({ message: 'Welcome to api-gateway!' });
});

app.use('/', proxy("http://localhost:6001"));

const port = process.env.PORT || 8080;
const server = app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}/api`);
});
server.on('error', console.error);
