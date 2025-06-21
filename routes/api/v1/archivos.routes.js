import { Router } from "express";
import {getPdfEmpresa} from "../../../controllers/archivos/donwload-archivos.js";


const archivos_routes = Router();

//requiere el params -> idAdmin, ventaId
archivos_routes.get("/descargar/:idAdmin/:ventaId", getPdfEmpresa)

export default archivos_routes; 