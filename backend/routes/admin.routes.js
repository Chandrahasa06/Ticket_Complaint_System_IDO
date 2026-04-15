import express from "express";
import dotenv from "dotenv";
import { prisma } from "../prisma/client.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { checkAuth } from "../middlewares/checkAuth.js";
import { OAuth2Client } from "google-auth-library";
import { createCommentNotifications } from "../utils/commentNotifications.js";

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
            username: admin.username,
            email: admin.email,
            role: "admin",
        }, JWT_SECRET, { expiresIn: "7d" });
        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge:7 * 24 * 60 * 60 * 1000,
        });
        return res.json({
        message: "Login successful",
        id: admin.id,
        username: admin.username,
        email: admin.email,
      });

    } catch (e) {
      console.error(e);
      return res.status(500).json({
        message: "Internal server error"
      });
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

    if (admin && !admin.isGoogle) {
      admin = await prisma.admin.update({
        where: { email },
        data: {
          isGoogle: true
        }
      });
    }

    if (!admin) {
      return res.status(403).json({
        message: "No admin account exists for this email. Please contact the devs."
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
      maxAge: 7 * 24 * 60 * 60 * 1000
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
            include: {
                prev: true,
                user: {
                    select: { username: true, phone: true }
                },
            },
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

// GET single ticket by ID (with comments)
adminRouter.get("/tickets/:id", async(req, res) => {
    if(req.user.role !== "admin"){
        return res.status(403).json({ message: "Access denied" });
    }
    try {
        const ticket = await prisma.ticket.findUnique({
            where: { id: Number(req.params.id) },
            include: {
                prev: true,
                user: {
                    select: { username: true, phone: true }
                },
                comments: {
                    orderBy: { createdAt: "asc" },
                    include: {
                        admin:    { select: { id: true, username: true } },
                        engineer: { select: { id: true, username: true, department: true } },
                    },
                },
            },
        });
        if(!ticket) return res.status(404).json({ message: "Ticket not found" });

        const comments = ticket.comments.map(c => ({
            id: c.id,
            body: c.body,
            authorRole: c.authorRole,
            authorName: c.authorRole === "admin"
                ? c.admin?.username
                : c.engineer?.username,
            authorDepartment: c.authorRole === "engineer"
                ? c.engineer?.department
                : null,
            createdAt: c.createdAt,
            updatedAt: c.updatedAt,
        }));

        res.json({ ticket: { ...ticket, comments } });
    }
    catch(e) {
        console.log(e);
        return res.status(500).json({ message: "Internal server error" });
    }
});

// POST add comment to a ticket (admin)
adminRouter.post("/tickets/:id/comments", async(req, res) => {
    if(req.user.role !== "admin"){
        return res.status(403).json({ message: "Access denied" });
    }
    const { body } = req.body;
    if(!body || !body.trim()){
        return res.status(400).json({ message: "Comment body is required." });
    }
    try {
        const ticket = await prisma.ticket.findUnique({ where: { id: Number(req.params.id) } });
        if(!ticket) return res.status(404).json({ message: "Ticket not found" });

        const comment = await prisma.ticketComment.create({
            data: {
                body: body.trim(),
                authorRole: "admin",
                ticketId: Number(req.params.id),
                adminId: req.user.id,
            },
            include: {
                admin: { select: { id: true, username: true } },
            },
        });
        await createCommentNotifications(Number(req.params.id), "admin", req.user.username, ticket.subject);
        res.status(201).json({
            message: "Comment added",
            comment: {
                id: comment.id,
                body: comment.body,
                authorRole: comment.authorRole,
                authorName: comment.admin.username,
                authorDepartment: null,
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

// PATCH edit a comment (admin can only edit their own comments)
adminRouter.patch("/tickets/:ticketId/comments/:commentId", async(req, res) => {
    if(req.user.role !== "admin"){
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
        if(comment.authorRole !== "admin" || comment.adminId !== req.user.id){
            return res.status(403).json({ message: "You can only edit your own comments." });
        }

        const updated = await prisma.ticketComment.update({
            where: { id: Number(req.params.commentId) },
            data: { body: body.trim() },
            include: {
                admin: { select: { id: true, username: true } },
            },
        });

        res.json({
            message: "Comment updated",
            comment: {
                id: updated.id,
                body: updated.body,
                authorRole: updated.authorRole,
                authorName: updated.admin.username,
                authorDepartment: null,
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

// DELETE a comment (admin can only delete their own comments)
adminRouter.delete("/tickets/:ticketId/comments/:commentId", async(req, res) => {
    if(req.user.role !== "admin"){
        return res.status(403).json({ message: "Access denied" });
    }
    try {
        const comment = await prisma.ticketComment.findUnique({
            where: { id: Number(req.params.commentId) },
        });
        if(!comment) return res.status(404).json({ message: "Comment not found" });
        if(comment.authorRole !== "admin" || comment.adminId !== req.user.id){
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

// GET all engineers
adminRouter.get("/engineers", async(req, res) => {
    if(req.user.role !== "admin"){
        return res.status(403).json({ message: "Access denied" });
    }
    try {
        const engineers = await prisma.engineer.findMany({
            orderBy: { username: "asc" },
            select: { id: true, username: true, email: true, department: true},
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
            select: { id: true, username: true, email: true, department: true, area: true },
        });
        res.json({ technicians });
    }
    catch(e) {
        console.log(e);
        res.status(500).json({ message: "Internal server error" });
    }
});

// GET /api/admin/tickets-over-time?range=month
adminRouter.get("/tickets-over-time", async (req, res) => {
  if (req.user.role !== "admin") return res.status(403).json({ message: "Access denied" });

  const range = req.query.range || "month";
  const from = req.query.from ? new Date(req.query.from) : null;
  const to = req.query.to ? new Date(req.query.to + "T23:59:59.999Z") : null;

  try {
    const tickets = await prisma.ticket.findMany({
      where: {
        ...(from || to ? {
          createdAt: {
            ...(from ? { gte: from } : {}),
            ...(to   ? { lte: to   } : {}),
          }
        } : {})
      },
      select: { createdAt: true, status: true }
    });

    const grouped = {};

    tickets.forEach(ticket => {
      const date = new Date(ticket.createdAt);
      let key;
      if (range === "day") {
        key = date.toISOString().slice(0, 10);
      } else if (range === "month") {
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      } else {
        key = `${date.getFullYear()}`;
      }

      if (!grouped[key]) {
        grouped[key] = { date: key, total: 0, PENDING: 0, OVERDUE: 0, RESOLVED: 0, CLOSED: 0 };
      }
      grouped[key].total++;
      if (grouped[key][ticket.status] !== undefined) grouped[key][ticket.status]++;
    });

    const data = Object.values(grouped).sort((a, b) => a.date.localeCompare(b.date));
    res.json({ data });
  } catch (e) {
    console.error(e);
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

// GET notifications for admin
adminRouter.get("/notifications", async (req, res) => {
  if (req.user.role !== "admin")
    return res.status(403).json({ message: "Access denied" });
  try {
    const notifications = await prisma.notification.findMany({
      where: { recipientType: "admin", recipientId: req.user.id },
      orderBy: { createdAt: "desc" },
      take: 20,
    });
    res.json({ notifications });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Internal server error" });
  }
});

// PATCH mark all admin notifications as read
adminRouter.patch("/notifications/read", async (req, res) => {
  if (req.user.role !== "admin")
    return res.status(403).json({ message: "Access denied" });
  try {
    await prisma.notification.updateMany({
      where: { recipientType: "admin", recipientId: req.user.id, isRead: false },
      data: { isRead: true },
    });
    res.json({ success: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Internal server error" });
  }
});

export default adminRouter;