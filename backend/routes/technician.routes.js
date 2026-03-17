import express from "express";
import dotenv from "dotenv";
import { prisma } from "../prisma/client.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { checkAuth } from "../middlewares/checkAuth.js";
dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET;
const technicianRouter = express.Router();
<<<<<<< Updated upstream

technicianRouter.post("/register", async (req, res) => {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
=======
 
technicianRouter.get("/dashboard", (req, res) => {
    res.json({ message: "Technician dashboard", user: req.user });
});
 
technicianRouter.post("/register", async(req, res) => {
    const { username, email, password, department, area, phone, employeeId } = req.body;
 
    if(!username || !email || !password || !department || !area){
>>>>>>> Stashed changes
        return res.status(400).json({ message: "All fields are required!" });
    }
 
    try {
        const hashed_password = await bcrypt.hash(password, 10);
 
        const technician = await prisma.technician.create({
            data: {
                username,
                email,
                password: hashed_password,
                department,
                area: Array.isArray(area) ? area.join(",") : area,
                phone: phone || "",
                employeeId: employeeId || "",
            }
        });
 
        res.status(201).json({ message: "Technician added", id: technician.id });
<<<<<<< Updated upstream
    } catch (e) {
        if (e.code === "P2002") {
            return res.status(409).json({ message: "Email already exists" });
        }
=======
    }
    catch(e) {
        if(e.code === "P2002") return res.status(409).json({ message: "Email already exists" });
        res.status(500).json({ message: "Internal server error" });
>>>>>>> Stashed changes
        console.log(e);
        res.status(500).json({ message: "Internal server error" });
    }
});
<<<<<<< Updated upstream

technicianRouter.post("/login", async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: "All fields are required!" });
    }

    try {
        const technician = await prisma.technician.findUnique({
            where: { email: email }
        });

        if (!technician) {
            return res.status(404).json({ message: "Technician not found" });
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

=======
 
technicianRouter.post("/login", async(req, res) => {
    const { email, password } = req.body;
 
    if(!email || !password){
        return res.status(400).json({ message: "All fields are required!" });
    }
 
    try {
        const technician = await prisma.technician.findUnique({ where: { email } });
 
        if(!technician) return res.status(404).json({ message: "Technician not found" });
 
        const isPasswordValid = await bcrypt.compare(password, technician.password);
        if(!isPasswordValid) return res.status(401).json({ message: "Invalid password" });
 
        const token = jwt.sign({
            id: technician.id,
            email: technician.email,
            username: technician.username,
            role: "technician",
            department: technician.department,
            area: technician.area,
        }, JWT_SECRET, { expiresIn: "7d" });
 
>>>>>>> Stashed changes
        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });
<<<<<<< Updated upstream

        res.json({ message: "Login successful", id: technician.id });
    } catch (e) {
=======
 
        res.json({ message: "Login successful", id: technician.id });
    }
    catch(e) {
>>>>>>> Stashed changes
        console.log(e);
        return res.status(500).json({ message: "Internal server error" });
    }
});
<<<<<<< Updated upstream

// Protected routes below
technicianRouter.use(checkAuth);

technicianRouter.get("/dashboard", (req, res) => {
    res.json({ message: "Technician dashboard", user: req.user });
});

technicianRouter.post("/change-password", async (req, res) => {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
        return res.status(400).json({ message: "All fields are required!" });
    }

    if (newPassword.length < 6) {
        return res.status(400).json({ message: "New password must be at least 6 characters!" });
    }

    try {
        const technician = await prisma.technician.findUnique({
            where: { id: req.user.id }
        });

        if (!technician) {
            return res.status(404).json({ message: "Technician not found" });
        }

        const isPasswordValid = await bcrypt.compare(currentPassword, technician.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: "Current password is incorrect" });
        }

        const hashed_password = await bcrypt.hash(newPassword, 10);

        await prisma.technician.update({
            where: { id: req.user.id },
            data: { password: hashed_password }
        });

        res.json({ message: "Password changed successfully" });
    } catch (e) {
=======
 
technicianRouter.use(checkAuth);
 
// GET full profile
technicianRouter.get("/profile", async(req, res) => {
    if(req.user.role !== "technician"){
        return res.status(403).json({ message: "Access denied" });
    }
    try {
        const technician = await prisma.technician.findUnique({
            where: { id: req.user.id },
            select: { id: true, username: true, email: true, department: true, area: true, phone: true, employeeId: true }
        });
        res.json({ technician });
    } catch(e) {
>>>>>>> Stashed changes
        console.log(e);
        return res.status(500).json({ message: "Internal server error" });
    }
});
<<<<<<< Updated upstream

export default technicianRouter;
=======
 
// GET tickets matching technician's area AND department
technicianRouter.get("/tickets", async(req, res) => {
    if(req.user.role !== "technician"){
        return res.status(403).json({ message: "Access denied" });
    }
 
    try {
        const technicianAreas = req.user.area
            ? req.user.area.split(",").map(a => a.trim())
            : [];
        const technicianDept = req.user.department;
        const status = req.query.status;
 
        const allTickets = await prisma.ticket.findMany({
            where: {
                type: technicianDept,
                ...(status && status !== "ALL" ? { status } : {}),
            },
            orderBy: { createdAt: "desc" },
            include: { user: { select: { username: true, email: true } } },
        });
 
        const tickets = allTickets.filter(ticket =>
            technicianAreas.some(a => ticket.area === a)
        );
 
        res.json({ tickets, total: tickets.length });
    }
    catch(e) {
        console.log(e);
        return res.status(500).json({ message: "Internal server error" });
    }
});
 
technicianRouter.patch("/tickets/:id/resolve", async(req, res) => {
    if(req.user.role !== "technician"){
        return res.status(403).json({ message: "Access denied" });
    }
    try {
        const ticket = await prisma.ticket.update({
            where: { id: Number(req.params.id) },
            data: { status: "RESOLVED" },
        });
        res.json({ message: "Ticket resolved", ticket });
    }
    catch(e) {
        console.log(e);
        return res.status(500).json({ message: "Internal server error" });
    }
});
 
technicianRouter.patch("/tickets/:id/close", async(req, res) => {
    if(req.user.role !== "technician"){
        return res.status(403).json({ message: "Access denied" });
    }
    try {
        const ticket = await prisma.ticket.update({
            where: { id: Number(req.params.id) },
            data: { status: "CLOSED" },
        });
        res.json({ message: "Ticket closed", ticket });
    }
    catch(e) {
        console.log(e);
        return res.status(500).json({ message: "Internal server error" });
    }
});
 
export default technicianRouter;
 
>>>>>>> Stashed changes
