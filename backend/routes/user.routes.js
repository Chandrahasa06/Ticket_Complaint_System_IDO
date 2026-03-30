import express from "express";
import dotenv from "dotenv";
import { prisma } from "../prisma/client.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";
import { checkAuth } from "../middlewares/checkAuth.js";
import multer from "multer";
import path from "path";
import fs from "fs";
import otpGenerator from "otp-generator";
import { sendOTPEmail } from "../middlewares/OTPmailer.js";
import { OAuth2Client } from "google-auth-library";

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET;
const userRouter = express.Router();

// Multer setup for image uploads
const uploadDir = "uploads/tickets";
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif|webp/;
    const ext = allowed.test(path.extname(file.originalname).toLowerCase());
    const mime = allowed.test(file.mimetype);
    if (ext && mime) cb(null, true);
    else cb(new Error("Only image files are allowed!"));
  },
});

userRouter.get("/dashboard", (req, res) => {
    res.json({ message: "User dashboard", user: req.user });
});

userRouter.post("/register", async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ message: "All fields are required!" });
  }

  if (!email.endsWith("@iiti.ac.in")) {
    return res.status(400).json({
      message: "Only @iiti.ac.in email addresses are allowed!"
    });
  }

  try {
    const existingUser = await prisma.user.findUnique({
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

    const user = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
        isGoogle: false
      }
    });

    return res.status(201).json({
      message: "User added",
      id: user.id
    });

  } catch (e) {
    console.error(e);
    return res.status(500).json({
      message: "Internal server error"
    });
  }
});

userRouter.post("/send-otp", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email || !email.endsWith("@iiti.ac.in")) {
      return res.status(400).json({ message: "Invalid email" });
    }

    const user = await prisma.user.findUnique({
        where: {
            email: email,
        }
    })

    if(user){
        return res.status(409).json({ message: "Email already exists" });
    }

    const otp = otpGenerator.generate(6, {
      upperCaseAlphabets: false,
      lowerCaseAlphabets: false,
      specialChars: false,
    });

    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    await prisma.otp.upsert({
      where: { email },
      update: { otp, expiresAt },
      create: { email, otp, expiresAt },
    });

    await sendOTPEmail(email, otp);

    res.json({ message: "OTP sent to email" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to send OTP" });
  }
});

userRouter.post("/verify-otp", async (req, res) => {
  try {
    const { email, otp } = req.body;

    const record = await prisma.otp.findUnique({
      where: { email },
    });

    if (!record) {
      return res.status(400).json({ message: "No OTP found" });
    }

    if (new Date() > record.expiresAt) {
      await prisma.otp.delete({ where: { email } });
      return res.status(400).json({ message: "OTP expired" });
    }

    if (record.otp !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    await prisma.otp.delete({
      where: { email },
    });

    res.json({ message: "OTP verified" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

userRouter.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "All fields are required!" });
  }

  if (!email.endsWith("@iiti.ac.in")) {
    return res.status(400).json({
      message: "Only @iiti.ac.in email addresses are allowed!"
    });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.isGoogle && !user.password) {
      return res.status(400).json({
        message: "This account uses Google login.",
        useGoogle: true
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid password" });
    }

    const token = jwt.sign(
      {
        id: user.id,
        username: user.username,
        email: user.email,
        role: "user"
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
      message: "Login successful",
      id: user.id,
      username: user.username,
      email: user.email,
    });

  } catch (e) {
    console.error(e);
    return res.status(500).json({
      message: "Internal server error"
    });
  }
});

userRouter.post("/google-login", async(req, res) => {
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

    if (!email || !email.endsWith("@iiti.ac.in")) {
      return res.status(400).json({
        message: "Only @iiti.ac.in Google accounts are allowed"
      });
    }

    let user = await prisma.user.findUnique({
      where: { email }
    });

    // Existing normal account → attach Google login too
    if (user && !user.isGoogle) {
      user = await prisma.user.update({
        where: { email },
        data: {
          isGoogle: true
        }
      });
    }

    // First time Google user
    if (!user) {
      user = await prisma.user.create({
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
        id: user.id,
        username: user.username,
        email: user.email,
        role: "user"
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
      id: user.id,
      username: user.username,
      email: user.email,
    });

  } catch (e) {
    console.error(e);
    return res.status(500).json({
      message: "Google login failed"
    });
  }
});

// FORGOT PASSWORD - send OTP (only for existing users)
userRouter.post("/forgot-password/send-otp", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email || !email.endsWith("@iiti.ac.in")) {
      return res.status(400).json({ message: "Invalid email" });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: "No account found with this email" });
    }

    const otp = otpGenerator.generate(6, {
      upperCaseAlphabets: false,
      lowerCaseAlphabets: false,
      specialChars: false,
    });

    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    await prisma.otp.upsert({
      where: { email },
      update: { otp, expiresAt },
      create: { email, otp, expiresAt },
    });

    await sendOTPEmail(email, otp);

    res.json({ message: "OTP sent to email" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to send OTP" });
  }
});

// FORGOT PASSWORD - verify OTP then reset password
userRouter.post("/forgot-password/reset", async (req, res) => {
  try {
    const { email, newPassword } = req.body;  // ← remove otp from here

    if (!email || !newPassword) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const hashed = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { email },
      data: { password: hashed },
    });

    res.json({ message: "Password reset successful" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

userRouter.use(checkAuth);

userRouter.get("/tickets", async (req, res) => {
    if(req.user.role !== "user") return res.status(403).json({ message: "Access denied" });

    try {
        const status = req.query.status;
        const pg = parseInt(req.query.page) || 1;
        const take = 10;
        const skip = (pg - 1) * take;

        let whereCondition = { userId: req.user.id };
        if(status && status !== "ALL") whereCondition.status = status;

        const tickets = await prisma.ticket.findMany({
            where: whereCondition,
            orderBy: { createdAt: "desc" },
            skip, take,
        });

        const totalTickets = await prisma.ticket.count({ where: whereCondition });

        res.json({ tickets, pagination: { page: pg, totalTickets } });
    } catch(e) {
        console.log(e);
        return res.status(500).json({ message: "Internal server error" });
    }
});

// NEW: Get a single ticket by ID (used for viewing previous ticket in follow-up)
userRouter.get("/tickets/:id", async (req, res) => {
    if(req.user.role !== "user") return res.status(403).json({ message: "Access denied" });

    try {
        const ticket = await prisma.ticket.findUnique({
            where: {
                id: Number(req.params.id),
                userId: req.user.id,
            }
        });

        if(!ticket) return res.status(404).json({ message: "Ticket not found" });

        res.json({ ticket });
    } catch(e) {
        console.log(e);
        return res.status(500).json({ message: "Internal server error" });
    }
});

userRouter.post("/raise", upload.single("image"), async(req, res) => {
    if(req.user.role !== "user") return res.status(403).json({ message: "Access denied" });

    const { type, subject, body, area, location } = req.body;

    if(!type || !subject || !body || !area || !location) {
        return res.status(400).json({ message: "All fields are required!" });
    }

    try {
        const imageUrl = req.file ? `/uploads/tickets/${req.file.filename}` : "";

        const ticket = await prisma.ticket.create({
            data: {
                type, subject, body,
                area, location, imageUrl,
                status: "PENDING",
                userId: req.user.id,
            }
        });

        res.json({ message: "Ticket raised successfully", ticketId: ticket.id });
    } catch(e) {
        console.log(e);
        return res.status(500).json({ message: "Internal server error" });
    }
});

userRouter.put("/tickets/:id/satisfied", async (req, res) => {
    if(req.user.role !== "user") return res.status(403).json({ message: "Access denied" });

    try {
        const ticket = await prisma.ticket.update({
            where: { id: Number(req.params.id), userId: req.user.id },
            data: { satisfied: true }
        });
        res.json({ message: "Ticket marked as satisfied", ticket });
    } catch(err) {
        console.log(err);
        res.status(500).json({ error: "Failed to update ticket" });
    }
});

// CANCEL TICKET - deletes the ticket completely
userRouter.delete("/tickets/:id/cancel", async(req, res) => {
    if(req.user.role !== "user") return res.status(403).json({ message: "Access denied" });

    try {
        const ticket = await prisma.ticket.findUnique({
            where: { id: Number(req.params.id) }
        });
        if(!ticket) return res.status(404).json({ message: "Ticket not found" });
        if(ticket.userId !== req.user.id) return res.status(403).json({ message: "Access denied" });
        if(ticket.status !== "PENDING") return res.status(400).json({ message: "Only pending tickets can be cancelled" });

        await prisma.ticket.delete({
            where: { id: Number(req.params.id) }
        });
        res.json({ message: "Ticket cancelled successfully" });
    } catch(e) {
        console.log(e);
        return res.status(500).json({ message: "Internal server error" });
    }
});
userRouter.post("/followup", async (req, res) => {
    if (req.user.role !== "user") {
        return res.status(403).json({ message: "Access denied" });
    }

    const { type, subject, body, prevId } = req.body;

    if (!type || !subject || !body || !prevId) {
        return res.status(400).json({ message: "All fields are required!" });
    }

    try {
        const originalTicket = await prisma.ticket.findUnique({
            where: { id: Number(prevId) }
        });

        if (!originalTicket) {
            return res.status(404).json({ message: "Original ticket not found" });
        }

        const ticket = await prisma.ticket.create({
            data: {
                type,
                subject,
                body,
                location: originalTicket.location,
                area: originalTicket.area,
                prevId: Number(prevId),
                status: "PENDING",
                userId: req.user.id,
                imageUrl: originalTicket.imageUrl
            }
        });

        res.json({
            message: "Follow-up ticket raised successfully",
            ticketId: ticket.id
        });

    } catch (e) {
        console.error("Followup error:", e);
        return res.status(500).json({ message: "Internal server error" });
    }
});

export default userRouter;