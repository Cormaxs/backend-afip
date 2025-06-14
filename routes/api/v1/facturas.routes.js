import { Router } from "express";
import {facturaCompleta} from "../../../controllers/facturas/crear-factura/obtener-datos.js";
//import {facEmitidasControllers} from "../../../controllers/facturas/facturas-emitidas-controller.js";

const facturas_Router = Router();

//requiere los datos de id, afipRequestData, facturaData -> json, creo la factura, luego le paso los datos a factura emitida
facturas_Router.post("/create/FacturaCompleta", facturaCompleta);

//facturas_Router.post("/facEmitida", facEmitidasControllers);

export default facturas_Router;