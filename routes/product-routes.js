import { Router } from "express";
import {add_product} from "../controllers/product_controllers.js";

export const product_Router = Router();

product_Router.get("/", (req, res) => {
    res.send("Products Page");
});

product_Router.post("/add",add_product);

