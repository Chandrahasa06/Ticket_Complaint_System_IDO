import express from "express";
import dotenv from "dotenv";
import { prisma } from "../prisma/client.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { checkAuth } from "../middlewares/checkAuth.js";
import { OAuth2Client } from "google-auth-library";

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET;
const adminRouter = express.Router();

adminRouter.post("/register", async(req, res) => {
    const { username, email, password } = req.body;
    if(!username || !email || !password){
        return res.status(400).json({ message: "All fields are required!" });
    }
    try {
        const existingUser = await prisma.admin.findUnique({
      where: { email }
    });

    if (existingUser) {
      if (existingUser.isGoogle) {
        return res.status(409).json({
          message: "This account uses Google login.",
          useGoogle: true
        });
      }

      return res.status(409).json({
        message: "Email already exists"
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const admin = await prisma.admin.create({
      data: {
        username,
        email,
        password: hashedPassword,
        isGoogle: false
      }
    });

    return res.status(201).json({
      message: "Admin added",
      id: admin.id
    });

  } catch (e) {
    console.error(e);
    return res.status(500).json({
      message: "Internal server error"
    });
}
});

adminRouter.post("/login", async(req, res) => {
    const { email, password } = req.body;
    if(!email || !password){
        return res.status(400).json({ message: "All fields are required!" });
    }
    try {
        const admin = await prisma.admin.findUnique({ where: { email } });
        if(!admin) return res.status(404).json({ message: "Admin not found" });
            if (admin.isGoogle && !admin.password) {
      return res.status(400).json({
        message: "This account uses Google login.",
        useGoogle: true
      });
    }
        const isPasswordValid = await bcrypt.compare(password, admin.password);
        if(!isPasswordValid) return res.status(401).json({ message: "Invalid password" });
        const token = jwt.sign({
            id: admin.id,
            email: admin.email,
            role: "admin",
        }, JWT_SECRET, { expiresIn: "15m" });
        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge:15* 60 * 1000,
        });
        res.json({ message: "Login successful", id: admin.id });
    } catch(e) {    
        console.log(e);
console.log(VITE_GOOGLE_CLIENT_ID);
        return res.status(500).json({ message: "Internal server error" });
    }
});
        
adminRouter.post("/google-login", async(req, res) => {
  try {
    const { credential } = req.body;

    if (!credential) {
      return res.status(400).json({
        message: "Google credential missing"
      });
    }

    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID
    });

    const payload = ticket.getPayload();

    const email = payload.email;
    const username = payload.name;

    let admin = await prisma.admin.findUnique({
      where: { email }
    });

    // Existing normal account → attach Google login too
    if (admin && !admin.isGoogle) {
      admin = await prisma.admin.update({
        where: { email },
        data: {
          isGoogle: true
        }
      });
    }

    // First time Google user
    if (!admin) {
      admin = await prisma.admin.create({
        data: {
          username,
          email,
          password: null,
          isGoogle: true
        }
      });
    }

    const token = jwt.sign(
      {
        id: admin.id,
        username: admin.username,
        email: admin.email,
        role: "admin"
      },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 15 * 60 * 1000
    });

    return res.json({
      message: "Google login successful",
      id: admin.id,
      username: admin.username,
      email: admin.email,
    });

  } catch (e) {
    console.error(e);
    return res.status(500).json({
      message: "Google login failed"
    });
    }
});

adminRouter.use(checkAuth);

adminRouter.get("/dashboard", (req, res) => {
    res.json({ message: "Admin dashboard", user: req.user });
});

adminRouter.get("/tickets", async(req, res) => {
    if(req.user.role !== "admin"){
        return res.status(403).json({ message: "Access denied" });
    }
    try {
        const status = req.query.status;
        const pg = parseInt(req.query.pg) || 1;
        const take = 50;
        const skip = (pg - 1) * take;
        const tickets = await prisma.ticket.findMany({
            where: (status && status !== "ALL") ? { status } : undefined,
            orderBy: { createdAt: "desc" },
            skip, take,
            include: { prev: true },
        });
        const totalTickets = await prisma.ticket.count({
            where: (status && status !== "ALL") ? { status } : undefined,
        });
        res.json({ tickets, pagination: { pg, totalTickets } });
    }
    catch(e) {
        console.log(e);
        return res.status(500).json({ message: "Internal server error" });
    }
});

// GET all engineers
adminRouter.get("/engineers", async(req, res) => {
    if(req.user.role !== "admin"){
        return res.status(403).json({ message: "Access denied" });
    }
    try {
        const engineers = await prisma.engineer.findMany({
            orderBy: { username: "asc" },
            select: { id: true, username: true, email: true, department: true, phone: true, employeeId: true },
        });
        res.json({ engineers });
    }
    catch(e) {
        console.log(e);
        res.status(500).json({ message: "Internal server error" });
    }
});

// GET all technicians
adminRouter.get("/technicians", async(req, res) => {
    if(req.user.role !== "admin"){
        return res.status(403).json({ message: "Access denied" });
    }
    try {
        const technicians = await prisma.technician.findMany({
            orderBy: { username: "asc" },
            select: { id: true, username: true, email: true, department: true, area: true, phone: true, employeeId: true },
        });
        res.json({ technicians });
    }
    catch(e) {
        console.log(e);
        res.status(500).json({ message: "Internal server error" });
    }
});

// DELETE engineer by ID
adminRouter.delete("/engineer/:id", async(req, res) => {
    if(req.user.role !== "admin"){
        return res.status(403).json({ message: "Access denied" });
    }
    try {
        await prisma.engineer.delete({
            where: { id: Number(req.params.id) },
        });
        res.json({ message: "Engineer deleted successfully" });
    }
    catch(e) {
        if(e.code === "P2025") return res.status(404).json({ message: "Engineer not found" });
        console.log(e);
        res.status(500).json({ message: "Internal server error" });
    }
});

// DELETE technician by ID
adminRouter.delete("/technician/:id", async(req, res) => {
    if(req.user.role !== "admin"){
        return res.status(403).json({ message: "Access denied" });
    }
    try {
        await prisma.technician.delete({
            where: { id: Number(req.params.id) },
        });
        res.json({ message: "Technician deleted successfully" });
    }
    catch(e) {
        if(e.code === "P2025") return res.status(404).json({ message: "Technician not found" });
        console.log(e);
        res.status(500).json({ message: "Internal server error" });
    }
});

// PATCH update technician area
adminRouter.patch("/technician/:id/area", async(req, res) => {
    if(req.user.role !== "admin"){
        return res.status(403).json({ message: "Access denied" });
    }
    const { area } = req.body;
    if(!area || (Array.isArray(area) && area.length === 0)){
        return res.status(400).json({ message: "Please select at least one area." });
    }
    try {
        const updated = await prisma.technician.update({
            where: { id: Number(req.params.id) },
            data: { area: Array.isArray(area) ? area.join(",") : area },
        });
        res.json({ message: "Area updated successfully", technician: updated });
    }
    catch(e) {
        if(e.code === "P2025") return res.status(404).json({ message: "Technician not found" });
        console.log(e);
        res.status(500).json({ message: "Internal server error" });
    }
});

export default adminRouter;