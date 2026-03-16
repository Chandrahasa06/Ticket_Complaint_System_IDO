import express from "express";
import dotenv from "dotenv";
import { prisma } from "../prisma/client.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { checkAuth } from "../middlewares/checkAuth.js";

dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET;
const engineerRouter = express.Router();

engineerRouter.post("/register", async (req, res) => {
    const { username, email, password, department } = req.body;

    if (!username || !email || !password || !department) {
        return res.status(400).json({ message: "All fields are required!" });
    }

    try {
        const hashed_password = await bcrypt.hash(password, 10);

        const engineer = await prisma.engineer.create({
            data: {
                username: username,
                email: email,
                password: hashed_password,
                department: department,
            }
        });

        res.status(201).json({ message: "Engineer added", id: engineer.id });
    } catch (e) {
        if (e.code === "P2002") {
            return res.status(409).json({ message: "Email already exists" });
        }
        console.log(e);
        res.status(500).json({ message: "Internal server error" });
    }
});

engineerRouter.post("/login", async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: "All fields are required!" });
    }

    try {
        const engineer = await prisma.engineer.findUnique({
            where: { email: email }
        });

        if (!engineer) {
            return res.status(404).json({ message: "Engineer not found" });
        }

        const isPasswordValid = await bcrypt.compare(password, engineer.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: "Invalid password" });
        }

        const token = jwt.sign({
            id: engineer.id,
            email: engineer.email,
            role: "engineer",
            department: engineer.department,
        }, JWT_SECRET, { expiresIn: "7d" });

        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        res.json({ message: "Login successful", id: engineer.id, department: engineer.department });
    } catch (e) {
        console.log(e);
        return res.status(500).json({ message: "Internal server error" });
    }
});

// Protected routes below
engineerRouter.use(checkAuth);

engineerRouter.get("/dashboard", (req, res) => {
    res.json({ message: "Engineer dashboard", user: req.user });
});

engineerRouter.get("/tickets", async (req, res) => {
    if (req.user.role !== "engineer") {
        return res.status(403).json({ message: "Access denied" });
    }

    try {
        const status = req.query.status;
        const pg = parseInt(req.query.pg) || 1;
        const take = 50;
        const skip = (pg - 1) * take;

        const tickets = await prisma.ticket.findMany({
            where: (status && status !== "ALL") ? { status: status } : undefined,
            orderBy: { createdAt: "desc" },
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
    } catch (e) {
        console.log(e);
        return res.status(500).json({ message: "Internal server error" });
    }
});

engineerRouter.post("/change-password", async (req, res) => {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
        return res.status(400).json({ message: "All fields are required!" });
    }

    if (newPassword.length < 6) {
        return res.status(400).json({ message: "New password must be at least 6 characters!" });
    }

    try {
        const engineer = await prisma.engineer.findUnique({
            where: { id: req.user.id }
        });

        if (!engineer) {
            return res.status(404).json({ message: "Engineer not found" });
        }

        const isPasswordValid = await bcrypt.compare(currentPassword, engineer.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: "Current password is incorrect" });
        }

        const hashed_password = await bcrypt.hash(newPassword, 10);

        await prisma.engineer.update({
            where: { id: req.user.id },
            data: { password: hashed_password }
        });

        res.json({ message: "Password changed successfully" });
    } catch (e) {
        console.log(e);
        return res.status(500).json({ message: "Internal server error" });
    }
});

export default engineerRouter;