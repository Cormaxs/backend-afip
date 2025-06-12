import { Router } from "express";
import {add_product, update_product, delete_product, get_product_by_id, get_all_products} from "../../../controllers/productos/product_controllers.js";


const product_Router = Router();

product_Router.post("/add",add_product);

product_Router.post("/update/:id", update_product);

product_Router.delete("/delete/:id",delete_product);

product_Router.get("/get/:id",get_product_by_id)

product_Router.get("/get", get_all_products);

export default product_Router;