import express from "express";
import dotenv from "dotenv";
import { prisma } from "./prisma/client.js";
import bcrypt from "bcrypt";

dotenv.config();
const app = express();
app.use(express.json());
const port = 3000;

app.get("/", (req, res) => {
    res.send("Hello, World!");
});

app.post("/register", async(req, res)=>{
    const username = req.body["username"];
    const email = req.body["email"];
    const password = req.body["password"];

    
    if(!username || !email || !password){
        return res.status(400).json({message: "All fields are required!",});
    }
    
    const hashed_password = await bcrypt.hash(password,10);
    
    try {
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

app.get("/users", async(req, res)=>{
    const users = await prisma.user.findMany();
    res.json(users);
});

app.listen(port, ()=>{
    console.log(`Server listening on port ${port}`);
})