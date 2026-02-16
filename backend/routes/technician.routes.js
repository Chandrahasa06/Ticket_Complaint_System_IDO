import express from "express";
import dotenv from "dotenv";
import { prisma } from "../prisma/client.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";
import { checkAuth } from "../middlewares/checkAuth.js";

dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET;
const technicianRouter = express.Router();


technicianRouter.get("/dashboard", (req, res) => {
    res.json({ message: "Technician dashboard", user: req.user });
});


technicianRouter.post("/register", async(req, res)=>{
    const { username, email, password } = req.body;
    
    if(!username || !email || !password){
        return res.status(400).json({message: "All fields are required!",});
    }
    
    
    try {
        const hashed_password = await bcrypt.hash(password,10);
        
        const technician = await prisma.technician.create({
            data: {
                username: username,
                email: email,
                password: hashed_password,
            }
        })
        res.status(201).json({ message: "Technician added", id: technician.id });
    } 
    catch (e) {
        if (e.code === "P2002") {
        return res.status(409).json({
            message: "Email already exists",
        });
        }

        res.status(500).json({
        message: "Internal server error",
        });    
        console.log(e);
    }
});


technicianRouter.post("/login", async(req, res)=>{
    const {email, password} = req.body;

    if(!email || !password){
        return res.status(400).json({message: "All fields are required!",});
    }

    try {
        const technician = await prisma.technician.findUnique({
            where: {
                email: email,
            }
        })

        if(!technician){
            return res.status(404).json({message: "Technician not found"});
        }

        const isPasswordValid = await bcrypt.compare(password, technician.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: "Invalid password" });
        }
    
        const token = jwt.sign({
            id: technician.id,
            email: technician.email,
            role: "technician",
        }, JWT_SECRET, { expiresIn: "7d" });
    
        res.cookie("token", token , {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });
    
        res.json({ message: "Login successful", id: technician.id });
    } 
    catch (e) {
        console.log(e);
        return res.status(500).json({ message: "Internal server error" });
    }
});

technicianRouter.use(checkAuth);

export default technicianRouter;