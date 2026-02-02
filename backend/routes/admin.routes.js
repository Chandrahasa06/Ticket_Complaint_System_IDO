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

adminRouter.post("/register", async(req, res)=>{
    const { username, email, password } = req.body;
    
    if(!username || !email || !password){
        return res.status(400).json({message: "All fields are required!",});
    }
    
    
    try {
        const hashed_password = await bcrypt.hash(password,10);
        
        const admin = await prisma.admin.create({
            data: {
                username: username,
                email: email,
                password: hashed_password,
            }
        })
        res.status(201).json({ message: "Admin added", id: admin.id });
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

adminRouter.get("/tickets", async(req, res) => {
    if(req.user.role !== "admin"){
        return res.status(403).json({ message: "Access denied" });
    }

    try{
        const status = req.query.status;
        const pg = parseInt(req.query.pg) || 1;
        const take = 50;
        const skip = (pg-1)*take;

        const tickets = await prisma.ticket.findMany({
            where: (status && status !== "ALL") ? { status: status } : undefined,
            orderBy: { createdAt: 'desc' },
            skip: skip,
            take: take,
        });

        const totalTickets = await prisma.ticket.count({
            where: (status && status !== "ALL") ? { status: status } : undefined,
        });

        res.json({ 
            tickets: tickets,
            pagination: {
                pg: pg,
                totalTickets: totalTickets,
            }
        });
    }
    catch (e) {
        console.log(e);
        return res.status(500).json({ message: "Internal server error" });
    }
});

export default adminRouter;