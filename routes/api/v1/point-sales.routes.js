import { Router } from "express";
import {createPointSale, getPointSales} from "../../../controllers/point-sales/point-sales-controllers.js";

const point_salesRoutes = Router();

point_salesRoutes.post("/create",createPointSale );

point_salesRoutes.get("/:id",getPointSales )

export default point_salesRoutes;