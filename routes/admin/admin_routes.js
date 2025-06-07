import { Router } from "express";

export const admin_router = Router();


admin_router.get("/", (req, res) => {
    res.send("Admin Home");
});