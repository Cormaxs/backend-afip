import { Router } from "express";
import {abrirCaja, cerrarCaja, agregarTransaccionCajaController, getCajaByIdController, getCajaByIdEmpresaController} from "../../../controllers/registro-cajas/crud-caja.js";

const registroCajas_routes = Router();

registroCajas_routes.post("/abrirCaja", abrirCaja)
registroCajas_routes.post("/cerrarcaja/:idCaja", cerrarCaja)


registroCajas_routes.post('/:idCaja/transaccion', agregarTransaccionCajaController); // Para agregar un ingreso o egreso
registroCajas_routes.get('/:idCaja', getCajaByIdController); // Opcional: para obtener el detalle de una caja
registroCajas_routes.get('/empresa/:idEmpresa', getCajaByIdEmpresaController); // Opcional: para obtener el detalle de una caja

export default registroCajas_routes;