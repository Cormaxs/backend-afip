import { Router } from "express";
import {CreateCompany, updateCompany, deleteCompany, getCompany} from "../../../controllers/company/CRUD.controller.js";

const companyRoutes = Router();

companyRoutes.post("/create", CreateCompany);
companyRoutes.post("/update/:id", updateCompany);
companyRoutes.delete("/delete/:id", deleteCompany);
companyRoutes.get("/get", getCompany);

//agregar a futuro rutas de 
//filtros, relacion de empresas y productos/usuarios
export default companyRoutes;