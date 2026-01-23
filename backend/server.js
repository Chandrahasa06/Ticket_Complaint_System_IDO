import express from "express";
import dotenv from "dotenv";
import { prisma } from "./prisma/client.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";
import { checkAuth } from "./middlewares/checkAuth.js";

dotenv.config();
const app = express();
app.use(express.json());
app.use(cookieParser());
const port = 3000;
const JWT_SECRET = process.env.JWT_SECRET;

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
            email: user.email,
        }, JWT_SECRET, { expiresIn: "7d" });
    
        res.cookie("token", token , {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            maxAge: 7 * 24 * 60 * 60 * 1000,
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

app.listen(port, ()=>{
    console.log(`Server listening on port ${port}`);
})