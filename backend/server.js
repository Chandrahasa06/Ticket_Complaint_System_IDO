import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { prisma } from "./prisma/client.js";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";
import { checkAuth } from "./middlewares/checkAuth.js";
import userRouter from "./routes/user.routes.js";
import engineerRouter from "./routes/engineer.routes.js";
import technicianRouter from "./routes/technician.routes.js";
import adminRouter from "./routes/admin.routes.js";
import pushRouter from './routes/push.routes.js';
import "./cron/overdue.js";

dotenv.config({ path: new URL('.env', import.meta.url).pathname });

const app = express();
const port = 3000;
const JWT_SECRET = process.env.JWT_SECRET;

// ── Middleware FIRST ──────────────────────────────────────────────────────────
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// ── Routes ────────────────────────────────────────────────────────────────────
app.get("/", (req, res) => res.send("Hello, World!"));
app.get("/health", (req, res) => res.json({ status: "ok" }));

app.use("/api/user", userRouter);
app.use("/api/engineer", engineerRouter);
app.use("/api/technician", technicianRouter);
app.use("/api/admin", adminRouter);
app.use("/api/push", pushRouter);

app.post('/logout', (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  });
  res.json({ message: 'Logged out' });
});

app.get("/protectedRoute", (req, res) => {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ message: "Login required" });
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    return res.json(payload);
  } catch(e) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
});

// ── Start ─────────────────────────────────────────────────────────────────────
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});