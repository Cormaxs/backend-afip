import { Router } from "express";

const archivos_routes = Router();

//requiere el params -> id de la empresa, body -> el punto de venta y el ventaId
archivos_routes.get("/descargar/:idEmpresa", (req, res) =>{
    
})

export default archivos_routes;