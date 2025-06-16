
import { Router } from "express";
import {registerVendedor, loginVendedor, updateVendedor, deleteVendedor} from "../../../controllers/vendedor/vendedor_controllers.js";


const vendorRoutes = Router();

vendorRoutes.post("/register", registerVendedor)
vendorRoutes.post("/login", loginVendedor)
vendorRoutes.post("/update/:id", updateVendedor)
vendorRoutes.delete("/delete/:id", deleteVendedor)

export default vendorRoutes;