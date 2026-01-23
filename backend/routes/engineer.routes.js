import express from "express";
import { checkAuth } from "../middlewares/checkAuth.js";

const router = express.Router();

router.use(checkAuth);

router.get("/tickets", (req, res) => {
    res.json({ message: "Engineer tickets" });
});

router.post("/assign/:ticketId", (req, res) => {
    res.json({ message: "Technician assigned" });
});

export default router;
