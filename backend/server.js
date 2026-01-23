import express from "express";
import dotenv from "dotenv";
import { prisma } from "./prisma/client.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";
import { checkAuth } from "./middlewares/checkAuth.js";
import userRoutes from "./routes/user.routes.js";
import engineerRoutes from "./routes/engineer.routes.js";
import technicianRoutes from "./routes/technician.routes.js";
import adminRoutes from "./routes/admin.routes.js";


dotenv.config();
const app = express();
app.use(express.json());
app.use(cookieParser());
const port = 3000;
const JWT_SECRET = process.env.JWT_SECRET;
const router = express.Router();

// router.get("/", home);

router.use(checkAuth);

app.get("/", (req, res) => {
    res.send("Hello, World!");
});

app.post("/register", async(req, res)=>{
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
        res.status(201).json({ message: "User added", userId: user.id });
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

app.post("/login", async(req, res)=>{
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
    
        res.json({ message: "Login successful", userId: user.id });
    } 
    catch (e) {
        console.log(e);
        return res.status(500).json({ message: "Internal server error" });
    }
});

app.post("/logout", (req, res)=>{
    res.clearCookie("token");
    res.json({message: "Logout successful"});
    res.redirect("/");
});

app.get("/check", async(req, res)=>{
    checkAuth(req, res);
});

app.use("/api/user", userRoutes);
app.use("/api/engineer", engineerRoutes);
app.use("/api/technician", technicianRoutes);
app.use("/api/admin", adminRoutes);

app.listen(port, ()=>{
    console.log(`Server listening on port ${port}`);
})


