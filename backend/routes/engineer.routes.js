
import express from "express";
import dotenv from "dotenv";
import { prisma } from "../prisma/client.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { checkAuth } from "../middlewares/checkAuth.js";

dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET;
const engineerRouter = express.Router();
 
engineerRouter.get("/dashboard", (req, res) => {
    res.json({ message: "Engineer dashboard", user: req.user });
});
 
engineerRouter.post("/register", async(req, res) => {
    const { username, email, password, department, phone, employeeId } = req.body;
 
    if(!username || !email || !password || !department){
        return res.status(400).json({ message: "All fields are required!" });
    }

    try {
        const hashed_password = await bcrypt.hash(password, 10);

        const engineer = await prisma.engineer.create({
            data: {
                username,
                email,
                password: hashed_password,
                department,
                phone: phone || "",
                employeeId: employeeId || "",
            }
        });

        res.status(201).json({ message: "Engineer added", id: engineer.id });
    }
    catch(e) {
        if(e.code === "P2002") return res.status(409).json({ message: "Email already exists" });
        res.status(500).json({ message: "Internal server error" });
        console.log(e);
        res.status(500).json({ message: "Internal server error" });
    }
});
 
engineerRouter.post("/login", async(req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: "All fields are required!" });
    }

    try {
        const engineer = await prisma.engineer.findUnique({ where: { email } });
 
        if(!engineer) return res.status(404).json({ message: "Engineer not found" });
 
        const isPasswordValid = await bcrypt.compare(password, engineer.password);
        if(!isPasswordValid) return res.status(401).json({ message: "Invalid password" });
 
        const token = jwt.sign({
            id: engineer.id,
            email: engineer.email,
            username: engineer.username,
            role: "engineer",
            department: engineer.department,
        }, JWT_SECRET, { expiresIn: "15m" });
    
        res.cookie("token", token , {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 15 * 60 * 1000, // 15 minutes
        });

        res.json({ message: "Login successful", id: engineer.id, department: engineer.department });
    } catch (e) {
        console.log(e);
        return res.status(500).json({ message: "Internal server error" });
    }
});
 
engineerRouter.use(checkAuth);
 
// GET full profile
engineerRouter.get("/profile", async(req, res) => {
    if(req.user.role !== "engineer"){
        return res.status(403).json({ message: "Access denied" });
    }
    try {
        const engineer = await prisma.engineer.findUnique({
            where: { id: req.user.id },
            select: { id: true, username: true, email: true, department: true, phone: true, employeeId: true }
        });
        res.json({ engineer });
    } catch(e) {
        console.log(e);
        return res.status(500).json({ message: "Internal server error" });
    }
});
 
engineerRouter.get("/tickets", async(req, res) => {
    if(req.user.role !== "engineer"){
        return res.status(403).json({ message: "Access denied" });
    }

    try {
        const status = req.query.status;
        const pg = parseInt(req.query.pg) || 1;
        const take = 50;
        const skip = (pg-1)*take;
 
        const dept = req.user.department;
        const whereCondition = {
            type: dept,
            ...(status && status !== "ALL" ? { status } : {}),
        };
 
        const tickets = await prisma.ticket.findMany({
            where: whereCondition,
            orderBy: { createdAt: 'desc' },
            skip, take,
        });
 
        const totalTickets = await prisma.ticket.count({ where: whereCondition });
 
        res.json({ tickets, pagination: { pg, totalTickets } });
    }
    catch(e) {
        console.log(e);
        return res.status(500).json({ message: "Internal server error" });
    }
});
 
engineerRouter.get("/technicians", async(req, res) => {
    if(req.user.role !== "engineer"){
        return res.status(403).json({ message: "Access denied" });
    }
 
    try {
        const dept = req.user.department;
        const technicians = await prisma.technician.findMany({
            where: { department: dept },
            orderBy: { username: 'asc' },
        });
        res.json({ technicians });
    }
    catch(e) {
        console.log(e);
        return res.status(500).json({ message: "Internal server error" });
    }
});
 
export default engineerRouter;