import { Router } from "express";
import {createPointSale} from "../../../controllers/point-sales/point-sales-controllers.js";

const point_salesRoutes = Router();

point_salesRoutes.post("/create",createPointSale )

export default point_salesRoutes;