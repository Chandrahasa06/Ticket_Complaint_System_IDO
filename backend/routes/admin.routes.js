import express from "express";
import { checkAuth } from "../middlewares/checkAuth.js";

const router = express.Router();

router.use(checkAuth);

router.get("/all-tickets", (req, res) => {
    res.json({ message: "All tickets (Admin)" });
});

router.get("/overdue", (req, res) => {
    res.json({ message: "Overdue tickets" });
});

export default router;
