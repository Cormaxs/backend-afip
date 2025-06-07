import { Router } from "express";


export const vendedor_router = Router();

vendedor_router.get("/", (req, res) => {
    res.send("Vendedor Home");
});