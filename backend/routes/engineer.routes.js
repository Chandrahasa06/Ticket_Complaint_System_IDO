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
const engineerRouter = express.Router();

engineerRouter.post("/register", async(req, res) => {
    const { username, email, password, department } = req.body;

    if(!username || !email || !password || !department ){
        return res.status(400).json({ message: "All fields are required!" });
    }

    try {
        const existingUser = await prisma.engineer.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(409).json({
        message: "Email already exists"
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const engineer = await prisma.engineer.create({
      data: {
        username,
        email,
        password: hashedPassword,
        department,
      }
    });

    return res.status(201).json({
      message: "Engineer added",
      id: engineer.id
    });

  } catch (e) {
    console.error(e);
    return res.status(500).json({
      message: "Internal server error"
    });
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

        if (engineer.isGoogle && !engineer.password) {
          return res.status(400).json({
          message: "This account uses Google login.",
          useGoogle: true
      });
    }

        const isPasswordValid = await bcrypt.compare(password, engineer.password);
        if(!isPasswordValid) return res.status(401).json({ message: "Invalid password" });

        const token = jwt.sign({
            id: engineer.id,
            email: engineer.email,
            username: engineer.username,
            role: "engineer",
            department: engineer.department,
        }, JWT_SECRET, { expiresIn: "7d" });
    
        res.cookie("token", token , {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        return res.json({
        message: "Login successful",
        id: engineer.id,
        username: engineer.username,
        email: engineer.email,
        department: engineer.department
      });

    } catch (e) {
      console.error(e);
      return res.status(500).json({
        message: "Internal server error"
      });
    }
  });
        
engineerRouter.post("/google-login", async(req, res) => {
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

    let engineer = await prisma.engineer.findUnique({
      where: { email }
    });

    if (engineer && !engineer.isGoogle) {
      engineer = await prisma.engineer.update({
        where: { email },
        data: {
          isGoogle: true
        }
      });
    }

    if (!engineer) {
      return res.status(403).json({
        message: "No engineer account exists for this email. Please contact the admin."
      });
    }

    const token = jwt.sign(
      {
        id: engineer.id,
        email: engineer.email,
        username: engineer.username,
        role: "engineer",
        department: engineer.department,
      },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    return res.json({
      message: "Google login successful",
      id: engineer.id,
      username: engineer.username,
      email: engineer.email,
    });

  } catch (e) {
    console.error(e);
    return res.status(500).json({
      message: "Google login failed"
    });
    } 
});

engineerRouter.use(checkAuth);

engineerRouter.get("/dashboard", (req, res) => {
    res.json({ message: "Engineer dashboard", user: req.user });
});

engineerRouter.get("/profile", async(req, res) => {
    if(req.user.role !== "engineer"){
        return res.status(403).json({ message: "Access denied" });
    }
    try {
        const engineer = await prisma.engineer.findUnique({
            where: { id: req.user.id },
            select: { id: true, username: true, email: true, department: true }
        });
        res.json({ engineer });
    } catch(e) {
        console.log(e);
        return res.status(500).json({ message: "Internal server error" });
    }
});

engineerRouter.patch("/change-password", async(req, res) => {
    if(req.user.role !== "engineer"){
        return res.status(403).json({ message: "Access denied" });
    }

    const { currentPassword, newPassword } = req.body;

    if(!currentPassword || !newPassword){
        return res.status(400).json({ message: "All fields are required." });
    }

    if(newPassword.length < 6){
        return res.status(400).json({ message: "New password must be at least 6 characters." });
    }

    try {
        const engineer = await prisma.engineer.findUnique({
            where: { id: req.user.id },
            select: { password: true },
        });

        if(!engineer){
            return res.status(404).json({ message: "Engineer not found." });
        }

        const isMatch = await bcrypt.compare(currentPassword, engineer.password);
        if(!isMatch){
            return res.status(401).json({ message: "Current password is incorrect." });
        }

        const isSame = await bcrypt.compare(newPassword, engineer.password);
        if(isSame){
            return res.status(400).json({ message: "New password must differ from your current password." });
        }

        const hashedNew = await bcrypt.hash(newPassword, 10);
        await prisma.engineer.update({
            where: { id: req.user.id },
            data: { password: hashedNew },
        });

        res.json({ message: "Password changed successfully." });
    }
    catch(e) {
        console.log(e);
        res.status(500).json({ message: "Internal server error" });
    }
});

// GET tickets for engineer's department
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
            orderBy: { createdAt: "desc" },
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

// GET ticket details with comments (engineer can only see tickets of their department)
engineerRouter.get("/tickets/:id", async(req, res) => {
    if(req.user.role !== "engineer"){
        return res.status(403).json({ message: "Access denied" });
    }
    try {
        const ticket = await prisma.ticket.findUnique({
            where: { id: Number(req.params.id) },
            include: {
                prev: true,
                comments: {
                    orderBy: { createdAt: "asc" },
                    include: {
                        admin: { select: { id: true, username: true } },
                        engineer: { select: { id: true, username: true, department: true } },
                    },
                },
            },
        });

        if(!ticket) return res.status(404).json({ message: "Ticket not found" });

        // Engineer can only view tickets from their own department
        if(ticket.type !== req.user.department){
            return res.status(403).json({ message: "Access denied. This ticket belongs to a different department." });
        }

        const formattedComments = ticket.comments.map(c => ({
            id: c.id,
            body: c.body,
            authorRole: c.authorRole,                          // "admin" | "engineer"
            authorName: c.admin?.username ?? c.engineer?.username,
            authorDepartment: c.engineer?.department ?? null,  // only for engineer
            createdAt: c.createdAt,
            updatedAt: c.updatedAt,
        }));

        res.json({ ticket: { ...ticket, comments: formattedComments } });
    }
    catch(e) {
        console.log(e);
        return res.status(500).json({ message: "Internal server error" });
    }
});

// POST add comment to a ticket (engineer)
engineerRouter.post("/tickets/:id/comments", async(req, res) => {
    if(req.user.role !== "engineer"){
        return res.status(403).json({ message: "Access denied" });
    }
    const { body } = req.body;
    if(!body || !body.trim()){
        return res.status(400).json({ message: "Comment body is required." });
    }
    try {
        const ticket = await prisma.ticket.findUnique({ where: { id: Number(req.params.id) } });
        if(!ticket) return res.status(404).json({ message: "Ticket not found" });

        // Engineer can only comment on tickets from their own department
        if(ticket.type !== req.user.department){
            return res.status(403).json({ message: "Access denied. This ticket belongs to a different department." });
        }

        const comment = await prisma.ticketComment.create({
            data: {
                body: body.trim(),
                authorRole: "engineer",
                ticketId: Number(req.params.id),
                engineerId: req.user.id,
            },
            include: {
                engineer: { select: { id: true, username: true, department: true } },
            },
        });

        res.status(201).json({
            message: "Comment added",
            comment: {
                id: comment.id,
                body: comment.body,
                authorRole: comment.authorRole,
                authorName: comment.engineer.username,
                authorDepartment: comment.engineer.department,
                createdAt: comment.createdAt,
                updatedAt: comment.updatedAt,
            },
        });
    }
    catch(e) {
        console.log(e);
        return res.status(500).json({ message: "Internal server error" });
    }
});

// PATCH edit a comment (engineer can only edit their own comments)
engineerRouter.patch("/tickets/:ticketId/comments/:commentId", async(req, res) => {
    if(req.user.role !== "engineer"){
        return res.status(403).json({ message: "Access denied" });
    }
    const { body } = req.body;
    if(!body || !body.trim()){
        return res.status(400).json({ message: "Comment body is required." });
    }
    try {
        const comment = await prisma.ticketComment.findUnique({
            where: { id: Number(req.params.commentId) },
        });
        if(!comment) return res.status(404).json({ message: "Comment not found" });
        if(comment.authorRole !== "engineer" || comment.engineerId !== req.user.id){
            return res.status(403).json({ message: "You can only edit your own comments." });
        }

        const updated = await prisma.ticketComment.update({
            where: { id: Number(req.params.commentId) },
            data: { body: body.trim() },
            include: {
                engineer: { select: { id: true, username: true, department: true } },
            },
        });

        res.json({
            message: "Comment updated",
            comment: {
                id: updated.id,
                body: updated.body,
                authorRole: updated.authorRole,
                authorName: updated.engineer.username,
                authorDepartment: updated.engineer.department,
                createdAt: updated.createdAt,
                updatedAt: updated.updatedAt,
            },
        });
    }
    catch(e) {
        console.log(e);
        return res.status(500).json({ message: "Internal server error" });
    }
});

// DELETE a comment (engineer can only delete their own comments)
engineerRouter.delete("/tickets/:ticketId/comments/:commentId", async(req, res) => {
    if(req.user.role !== "engineer"){
        return res.status(403).json({ message: "Access denied" });
    }
    try {
        const comment = await prisma.ticketComment.findUnique({
            where: { id: Number(req.params.commentId) },
        });
        if(!comment) return res.status(404).json({ message: "Comment not found" });
        if(comment.authorRole !== "engineer" || comment.engineerId !== req.user.id){
            return res.status(403).json({ message: "You can only delete your own comments." });
        }

        await prisma.ticketComment.delete({ where: { id: Number(req.params.commentId) } });
        res.json({ message: "Comment deleted" });
    }
    catch(e) {
        console.log(e);
        return res.status(500).json({ message: "Internal server error" });
    }
});

// GET technicians in same department
engineerRouter.get("/technicians", async(req, res) => {
    if(req.user.role !== "engineer"){
        return res.status(403).json({ message: "Access denied" });
    }

    try {
        const dept = req.user.department;
        const technicians = await prisma.technician.findMany({
            where: { department: dept },
            orderBy: { username: "asc" },
        });
        res.json({ technicians });
    }
    catch(e) {
        console.log(e);
        return res.status(500).json({ message: "Internal server error" });
    }
});

export default engineerRouter;