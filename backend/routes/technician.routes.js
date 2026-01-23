import express from "express";
import { checkAuth } from "../middlewares/checkAuth.js";

const router = express.Router();

router.use(checkAuth);

router.get("/assigned", (req, res) => {
    res.json({ message: "Technician assigned tickets" });
});

router.post("/resolve/:ticketId", (req, res) => {
    res.json({ message: "Ticket resolved" });
});

export default router;
