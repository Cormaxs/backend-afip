import { Router } from "express";
import {facturasCompletaAfip, NotaDePedido,getFacturas} from "../../../controllers/facturas/obtener-datos.js";
//import {facEmitidasControllers} from "../../../controllers/facturas/facturas-emitidas-controller.js";

const facturas_Router = Router();

//requiere los datos de id, afipRequestData, facturaData -> json, creo la factura, luego le paso los datos a factura emitida
facturas_Router.post("/create/FacturaCompleta", facturasCompletaAfip);


//pruebas desde el frontend, distintos tipos de facturas
facturas_Router.post("/create/probar-facturas", NotaDePedido);

//facturas_Router.post("/facEmitida", facEmitidasControllers);


//buscar facturas
facturas_Router.get("/get/facturas", getFacturas);

export default facturas_Router;