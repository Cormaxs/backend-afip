
import { Router } from "express";
import {createVendedor} from "../../../controllers/vendedor/vendedor_controllers.js";


const vendorRoutes = Router();

vendorRoutes.post("/create", createVendedor)

export default vendorRoutes;