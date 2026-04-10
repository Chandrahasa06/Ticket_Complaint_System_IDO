import express from "express";
import dotenv from "dotenv";
import { prisma } from "../prisma/client.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { checkAuth } from "../middlewares/checkAuth.js";
import { OAuth2Client } from "google-auth-library";
import { sendPushToUser } from '../utils/notify.js';

import { sendCloseEmail, sendResolveEmail } from "../middlewares/mailer.js";

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET;
const technicianRouter = express.Router();

technicianRouter.post("/register", async(req, res) => {
    const { username, email, password, department, area} = req.body;

    if(!username || !email || !password || !department || !area){
        return res.status(400).json({ message: "All fields are required!" });
    }

    try {
        const existingUser = await prisma.technician.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(409).json({
        message: "Email already exists"
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const technician = await prisma.technician.create({
      data: {
        username,
        email,
        password: hashedPassword,
        department,
        area: Array.isArray(area) ? area.join(",") : area
      }
    });

    return res.status(201).json({
      message: "Technician added",
      id: technician.id
    });

  } catch (e) {
    console.error(e);
    return res.status(500).json({
      message: "Internal server error"
    });
    }
});

technicianRouter.post("/login", async(req, res) => {
    const { email, password } = req.body;

    if(!email || !password){
        return res.status(400).json({ message: "All fields are required!" });
    }

    try {
        const technician = await prisma.technician.findUnique({ where: { email } });

        if(!technician) return res.status(404).json({ message: "Technician not found" });
    if (technician.isGoogle && !technician.password) {
      return res.status(400).json({
        message: "This account uses Google login.",
        useGoogle: true
      });
    }
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

        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        return res.json({
        message: "Login successful",
        id: technician.id,
        username: technician.username,
        email: technician.email,
      });

    } catch (e) {
      console.error(e);
      return res.status(500).json({
        message: "Internal server error"
      });
    }
  });
        
technicianRouter.post("/google-login", async(req, res) => {
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

    let technician = await prisma.technician.findUnique({
      where: { email }
    });

    if (technician && !technician.isGoogle) {
      technician = await prisma.technician.update({
        where: { email },
        data: {
          isGoogle: true
        }
      });
    }

    if (!technician) {
      return res.status(403).json({
        message: "No technician account exists for this email. Please contact the admin."
      });
    }

    const token = jwt.sign(
      {
        id: technician.id,
        email: technician.email,
        username: technician.username,
        role: "technician",
        department: technician.department,
        area: technician.area,
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
      id: technician.id,
      username: technician.username,
      email: technician.email,
    });

  } catch (e) {
    console.error(e);
    return res.status(500).json({
      message: "Google login failed"
    });
    }
});

// ── All routes below require authentication ──────────────────────────────────
technicianRouter.use(checkAuth);

technicianRouter.get("/dashboard", (req, res) => {
    res.json({ message: "Technician dashboard", user: req.user });
});

// GET full profile
technicianRouter.get("/profile", async(req, res) => {
    if(req.user.role !== "technician"){
        return res.status(403).json({ message: "Access denied" });
    }
    try {
        const technician = await prisma.technician.findUnique({
            where: { id: req.user.id },
            select: { id: true, username: true, email: true, department: true, area: true }
        });
        res.json({ technician });
    } catch(e) {
        console.log(e);
        return res.status(500).json({ message: "Internal server error" });
    }
});

// PATCH change password
technicianRouter.patch("/change-password", async(req, res) => {
    if(req.user.role !== "technician"){
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
        const technician = await prisma.technician.findUnique({
            where: { id: req.user.id },
            select: { password: true },
        });

        if(!technician){
            return res.status(404).json({ message: "Technician not found." });
        }

        const isMatch = await bcrypt.compare(currentPassword, technician.password);
        if(!isMatch){
            return res.status(401).json({ message: "Current password is incorrect." });
        }

        const isSame = await bcrypt.compare(newPassword, technician.password);
        if(isSame){
            return res.status(400).json({ message: "New password must differ from your current password." });
        }

        const hashedNew = await bcrypt.hash(newPassword, 10);
        await prisma.technician.update({
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

// GET single ticket by ID with comments
// FIX: authorId is now included in each comment so the frontend can
//      determine ownership without mixing up technician vs engineer comments.
technicianRouter.get("/tickets/:id", async(req, res) => {
    if(req.user.role !== "technician"){
        return res.status(403).json({ message: "Access denied" });
    }
    try {
        const ticket = await prisma.ticket.findUnique({
            where: { id: Number(req.params.id) },
            include: {
                user: { select: { username: true, email: true } },
                prev: true,
                comments: {
                    orderBy: { createdAt: "asc" },
                    include: {
                        admin: { select: { id: true, username: true } },
                        engineer: { select: { id: true, username: true, department: true } },
                        technician: { select: { id: true, username: true, department: true } },
                    },
                },
            },
        });

        if(!ticket) return res.status(404).json({ message: "Ticket not found" });

        if(ticket.type !== req.user.department){
            return res.status(403).json({ message: "Access denied. This ticket belongs to a different department." });
        }

        const technicianAreas = req.user.area
            ? req.user.area.split(",").map(a => a.trim())
            : [];

        if(!technicianAreas.includes(ticket.area)){
            return res.status(403).json({ message: "Access denied. This ticket is outside your area." });
        }

        const formattedComments = ticket.comments.map(c => ({
            id: c.id,
            body: c.body,
            authorRole: c.authorRole,
            // ── FIX: expose the numeric ID of whoever wrote this comment ──
            // The frontend uses this to decide whether to show edit/delete buttons.
            authorId:
                c.authorRole === "admin"
                    ? c.admin?.id
                    : c.authorRole === "technician"
                        ? c.technician?.id
                        : c.engineer?.id,
            authorName:
                c.authorRole === "admin"
                    ? c.admin?.username
                    : c.authorRole === "technician"
                        ? c.technician?.username
                        : c.engineer?.username,
            authorDepartment:
                c.authorRole === "technician"
                    ? c.technician?.department
                    : c.engineer?.department ?? null,
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

// POST add comment to a ticket (technician)
technicianRouter.post("/tickets/:id/comments", async(req, res) => {
    if(req.user.role !== "technician"){
        return res.status(403).json({ message: "Access denied" });
    }

    const { body } = req.body;
    if(!body || !body.trim()){
        return res.status(400).json({ message: "Comment body is required." });
    }

    try {
        const ticket = await prisma.ticket.findUnique({ where: { id: Number(req.params.id) } });
        if(!ticket) return res.status(404).json({ message: "Ticket not found" });

        if(ticket.type !== req.user.department){
            return res.status(403).json({ message: "Access denied. This ticket belongs to a different department." });
        }

        const technicianAreas = req.user.area
            ? req.user.area.split(",").map(a => a.trim())
            : [];

        if(!technicianAreas.includes(ticket.area)){
            return res.status(403).json({ message: "Access denied. This ticket is outside your area." });
        }

        const comment = await prisma.ticketComment.create({
            data: {
                body: body.trim(),
                authorRole: "technician",
                ticketId: Number(req.params.id),
                technicianId: req.user.id,
            },
            include: {
                technician: { select: { id: true, username: true, department: true } },
            },
        });

        res.status(201).json({
            message: "Comment added",
            comment: {
                id: comment.id,
                body: comment.body,
                authorRole: comment.authorRole,
                authorId: comment.technician.id,   // ── FIX: include authorId
                authorName: comment.technician.username,
                authorDepartment: comment.technician.department,
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

// PATCH edit a comment (technician can only edit their own comments)
technicianRouter.patch("/tickets/:ticketId/comments/:commentId", async(req, res) => {
    if(req.user.role !== "technician"){
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

        if(comment.authorRole !== "technician" || comment.technicianId !== req.user.id){
            return res.status(403).json({ message: "You can only edit your own comments." });
        }

        const updated = await prisma.ticketComment.update({
            where: { id: Number(req.params.commentId) },
            data: { body: body.trim() },
            include: {
                technician: { select: { id: true, username: true, department: true } },
            },
        });

        res.json({
            message: "Comment updated",
            comment: {
                id: updated.id,
                body: updated.body,
                authorRole: updated.authorRole,
                authorId: updated.technician.id,   // ── FIX: include authorId
                authorName: updated.technician.username,
                authorDepartment: updated.technician.department,
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

// DELETE a comment (technician can only delete their own comments)
technicianRouter.delete("/tickets/:ticketId/comments/:commentId", async(req, res) => {
    if(req.user.role !== "technician"){
        return res.status(403).json({ message: "Access denied" });
    }

    try {
        const comment = await prisma.ticketComment.findUnique({
            where: { id: Number(req.params.commentId) },
        });
        if(!comment) return res.status(404).json({ message: "Comment not found" });

        if(comment.authorRole !== "technician" || comment.technicianId !== req.user.id){
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

// PATCH resolve a ticket
technicianRouter.patch("/tickets/:id/resolve", async(req, res) => {
    if(req.user.role !== "technician")
        return res.status(403).json({ message: "Access denied" });
    try {
        const { remark } = req.body;

        const ticket = await prisma.ticket.update({
            where: { id: Number(req.params.id) },
            data: { status: "RESOLVED" },
            include: { user: true },
        });

        await sendResolveEmail(ticket.user.email, ticket.user.username, ticket.subject, remark);

        await sendPushToUser(ticket.userId, {
            title: "Ticket Resolved ✅",
            body: `Your ticket #${ticket.id} "${ticket.subject}" has been resolved.`,
            url: `/user/dashboard`
        });

        res.json({ message: "Ticket resolved", ticket });
    } catch(e) {
        console.log(e);
        return res.status(500).json({ message: "Internal server error" });
    }
});

// PATCH close a ticket
technicianRouter.patch("/tickets/:id/close", async(req, res) => {
    if(req.user.role !== "technician")
        return res.status(403).json({ message: "Access denied" });
    try {
        const { remark } = req.body;

        const ticket = await prisma.ticket.update({
            where: { id: Number(req.params.id) },
            data: { status: "CLOSED" },
            include: { user: true }
        });

        await sendCloseEmail(ticket.user.email, ticket.user.username, ticket.subject, remark);

        await sendPushToUser(ticket.userId, {
            title: "Ticket Closed 🔒",
            body: `Your ticket #${ticket.id} "${ticket.subject}" has been closed.`,
            url: `/user/dashboard`
        });

        res.json({ message: "Ticket closed", ticket });
    } catch(e) {
        console.log(e);
        return res.status(500).json({ message: "Internal server error" });
    }
});

// GET notifications for this technician
technicianRouter.get("/notifications", async (req, res) => {
  if (req.user.role !== "technician") return res.status(403).json({ message: "Access denied" });
  try {
    const notifications = await prisma.notification.findMany({
      where: { technicianId: req.user.id },
      orderBy: { createdAt: "desc" },
      take: 30,
    });
    res.json({ notifications });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Internal server error" });
  }
});

// PATCH mark all notifications as read
technicianRouter.patch("/notifications/read", async (req, res) => {
  if (req.user.role !== "technician") return res.status(403).json({ message: "Access denied" });
  try {
    await prisma.notification.updateMany({
      where: { technicianId: req.user.id, isRead: false },
      data: { isRead: true },
    });
    res.json({ message: "All marked as read" });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Internal server error" });
  }
});

export default technicianRouter;