import express from "express";
import dotenv from "dotenv";
import { prisma } from "../prisma/client.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";
import { checkAuth } from "../middlewares/checkAuth.js";

dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET;
const userRouter = express.Router();


userRouter.get("/dashboard", (req, res) => {
    res.json({ message: "User dashboard", user: req.user });
});

userRouter.post("/register", async(req, res)=>{
    const { username, email, password } = req.body;
    
    if(!username || !email || !password){
        return res.status(400).json({message: "All fields are required!",});
    }
    
    
    try {
        const hashed_password = await bcrypt.hash(password,10);
        
        const user = await prisma.user.create({
            data: {
                username: username,
                email: email,
                password: hashed_password,
            }
        })
        res.status(201).json({ message: "User added", id: user.id });
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


userRouter.post("/login", async(req, res)=>{
    const {email, password} = req.body;

    if(!email || !password){
        return res.status(400).json({message: "All fields are required!",});
    }

    try {
        const user = await prisma.user.findUnique({
            where: {
                email: email,
            }
        })
        
        if(!user){
            return res.status(404).json({message: "User not found"});
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.status(401).json({ message: "Invalid password" });
        }
    
        const token = jwt.sign({
            id: user.id,
            username: user.username,
            email: user.email,
            role: "user",
        }, JWT_SECRET, { expiresIn: "7d" });
    
        res.cookie("token", token , {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });
    
        res.json({ message: "Login successful", id: user.id });
    } 
    catch (e) {
        console.log(e);
        return res.status(500).json({ message: "Internal server error" });
    }
});


userRouter.use(checkAuth);

userRouter.get("/tickets", async(req, res)=>{
    if(req.user.role !== "user"){
        return res.status(403).json({ message: "Access denied" });
    }

    try{
        const status = req.query.status;
        const pg = parseInt(req.query.page) || 1;
        const take = 10;
        const skip = (pg - 1) * take;
        
        const user = await prisma.user.findUnique({
            where: {
                id: req.user.id,
            },
            include: {
                tickets: {
                    where: (status && status !== "ALL") ? { status: status } : { undefined },
                    orderBy: {createdAt: 'desc'},
                    skip: skip,
                    take: take,
                }
            }
        });

        const totalTickets = await prisma.ticket.count({
            where: {
                userId: req.user.id,
                status: (status && status !== "ALL") ? { status: status } : undefined,
            }
        })

        res.json({ 
            tickets: user.tickets,
            pagination: {
                page: pg,
                totalTickets: totalTickets,
            }
         });
    } catch (e) {
        console.log(e);
        return res.status(500).json({ message: "Internal server error" });
    }
});


userRouter.post("/raise", async(req, res) => {
    if(req.user.role !== "user"){
        return res.status(403).json({ message: "Access denied" });
    }

    const { type, subtype, subject, body } = req.body;

    if (!type || !subtype || !subject || !body) {
        return res.status(400).json({ message: "All fields are required!" });
    }

    try {
        const ticket = await prisma.ticket.create({
            data: {
                type: type,
                subtype: subtype,
                subject: subject,
                body: body,
                status: "PENDING",
                userId: req.user.id,
            }
        })

        res.json({ message: "Ticket raised successfully", ticketId: ticket.id });
    
    } catch (e) {
        console.log(e);
        return res.status(500).json({ message: "Internal server error" });
    }
});

export default userRouter;
