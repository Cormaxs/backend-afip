import { Router } from "express";
import { create_Factura } from "../controllers/facturas/factura_sola.js";

export const facturas_Router = Router();

facturas_Router.post("/create", create_Factura);

facturas_Router.post("/create/A", create_Factura);
facturas_Router.post("/create/B", create_Factura);
facturas_Router.post("/create/C", create_Factura);

