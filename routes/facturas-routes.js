import { Router } from "express";
import { create_Factura } from "../controllers/facturas/factura_sola.js";

export const facturas_Router = Router();

facturas_Router.get("/", (req, res) => {res.send("Facturas Page");});

facturas_Router.post("/create", create_Factura);