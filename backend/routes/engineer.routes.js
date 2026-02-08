import express from "express";
import dotenv from "dotenv";
import { prisma } from "../prisma/client.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";
import { checkAuth } from "../middlewares/checkAuth.js";

dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET;
const engineerRouter = express.Router();


engineerRouter.get("/dashboard", (req, res) => {
    res.json({ message: "Engineer dashboard", user: req.user });
});

engineerRouter.post("/login", async(req, res)=>{
    const {email, password} = req.body;

    if(!email || !password){
        return res.status(400).json({message: "All fields are required!",});
    }

    try {
        const engineer = await prisma.engineer.findUnique({
            where: {
                email: email,
            }
        })

        if(!engineer){
            return res.status(404).json({message: "Engineer not found"});
        }

        const isPasswordValid = await bcrypt.compare(password, engineer.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: "Invalid password" });
        }
    
        const token = jwt.sign({
            id: engineer.id,
            email: engineer.email,
            role: "engineer",
        }, JWT_SECRET, { expiresIn: "7d" });
    
        res.cookie("token", token , {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });
    
        res.json({ message: "Login successful", id: engineer.id });
    } 
    catch (e) {
        console.log(e);
        return res.status(500).json({ message: "Internal server error" });
    }
});

engineerRouter.use(checkAuth);

engineerRouter.get("/tickets", async(req, res) => {
    if(req.user.role !== "engineer"){
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

export default engineerRouter;