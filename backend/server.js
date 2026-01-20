import express from "express";
import dotenv from "dotenv";
import prisma from "./prisma/client.js";

dotenv.config();
const app = express();
app.use(express.json());
const port = 3000;

app.get("/", (req,res)=>{
    res.send("Server running :)");
})

app.listen(port, ()=>{
    console.log(`Server listening on port ${port}`);
})