import express from "express";
import dotenv from "dotenv";
import { prisma } from "../prisma/client.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";
import { checkAuth } from "../middlewares/checkAuth.js";

dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET;
const adminRouter = express.Router();


adminRouter.get("/dashboard", (req, res) => {
    res.json({ message: "Admin dashboard", user: req.user });
});

adminRouter.post("/login", async(req, res)=>{
    const {email, password} = req.body;

    if(!email || !password){
        return res.status(400).json({message: "All fields are required!",});
    }

    try {
        const admin = await prisma.admin.findUnique({
            where: {
                email: email,
            }
        })
        
        if(!admin){
            return res.status(404).json({message: "Admin not found"});
        }

        const isPasswordValid = await bcrypt.compare(password, admin.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: "Invalid password" });
        }
    
        const token = jwt.sign({
            id: admin.id,
            email: admin.email,
            role: "admin",
        }, JWT_SECRET, { expiresIn: "7d" });
    
        res.cookie("token", token , {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });
    
        res.json({ message: "Login successful", id: admin.id });
    } 
    catch (e) {
        console.log(e);
        return res.status(500).json({ message: "Internal server error" });
    }
});

adminRouter.use(checkAuth);

export default adminRouter;
