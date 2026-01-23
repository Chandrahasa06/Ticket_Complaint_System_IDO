import express from "express";
import { checkAuth } from "../middlewares/checkAuth.js";

const router = express.Router();

router.use(checkAuth);

router.get("/dashboard", (req, res) => {
    res.json({ message: "User dashboard", user: req.user });
});

router.post("/raise-ticket", (req, res) => {
    res.json({ message: "Ticket raised by user" });
});

export default router;
