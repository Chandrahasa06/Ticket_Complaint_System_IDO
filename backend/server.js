import express from "express";
import dotenv from "dotenv";
import { prisma } from "./prisma/client.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";
import { checkAuth } from "./middlewares/checkAuth.js";
import userRouter from "./routes/user.routes.js";
import engineerRouter from "./routes/engineer.routes.js";
import technicianRouter from "./routes/technician.routes.js";
import adminRouter from "./routes/admin.routes.js";


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

app.use("/api/user", userRouter);
app.use("/api/engineer", engineerRouter);
app.use("/api/technician", technicianRouter);
app.use("/api/admin", adminRouter);

app.post("/logout", (req, res)=>{
    res.clearCookie("token");
    res.json({message: "Logged out successfully"});
});

app.listen(port, ()=>{
    console.log(`Server listening on port ${port}`);
})


