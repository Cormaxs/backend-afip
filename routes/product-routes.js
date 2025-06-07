import { Router } from "express";
import {add_product, update_product, delete_product} from "../controllers/product_controllers.js";

export const product_Router = Router();

product_Router.post("/add",add_product);

product_Router.post("/update", update_product);

product_Router.delete("/delete",delete_product);

