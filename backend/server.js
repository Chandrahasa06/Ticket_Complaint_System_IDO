import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { prisma } from "./prisma/client.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";
import { checkAuth } from "./middlewares/checkAuth.js";
import userRouter from "./routes/user.routes.js";
import engineerRouter from "./routes/engineer.routes.js";
import technicianRouter from "./routes/technician.routes.js";
import adminRouter from "./routes/admin.routes.js";
import "./cron/overdue.js";


dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());
app.use(cookieParser());
const port = 3000;
const JWT_SECRET = process.env.JWT_SECRET;
const router = express.Router();

// router.get("/", home);

router.use(checkAuth);

app.get("/", (req, res) => {
    res.send("Hello, World!");
});

app.use("/api/user", userRouter);
app.use("/api/engineer", engineerRouter);
app.use("/api/technician", technicianRouter);
app.use("/api/admin", adminRouter);

app.post("/logout", (req, res)=>{
    res.clearCookie("token");
    res.json({message: "Logged out successfully"});
});

app.listen(port, ()=>{
    console.log(`Server listening on port ${port}`);
})

