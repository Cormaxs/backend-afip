import { Router } from "express";

export const gerente_router = Router(); 

gerente_router.get("/", (req, res) => {         
    res.send("Gerente Home");
});