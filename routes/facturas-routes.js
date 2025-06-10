import { Router } from "express";
import {facturaCompleta} from "../controllers/facturas/crear-factura/obtener-datos.js";

export const facturas_Router = Router();

//requiere los datos de id, afipRequestData, facturaData -> json
facturas_Router.post("/create/FacturaCompleta", facturaCompleta);

