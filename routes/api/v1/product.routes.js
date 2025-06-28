import { Router } from "express";
import {add_product, update_product, delete_product, get_product_by_id, 
    get_all_products, get_all_products_company_controllers, get_product_codBarra} from "../../../controllers/productos/product_controllers.js";


const product_Router = Router();

product_Router.post("/add",add_product);

product_Router.post("/update/:id", update_product);

product_Router.delete("/delete/:id",delete_product);

product_Router.get("/get/:id",get_product_by_id);//producto especifico

product_Router.get("/get", get_all_products);//todos los productos de todas las empresas

product_Router.get("/:id",get_all_products_company_controllers); //obtiene todos los productos de una empresa 
                                                                //especifica solo o con filtros, nombre, categoria, etc

product_Router.get("/get/:codBarra/:idEmpresa/:puntoVenta", get_product_codBarra)

export default product_Router;