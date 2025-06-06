import {add_product_services} from '../services/product_services.js';


export async function add_product(req, res) {
  
    const producto = await add_product_services(req.body);

    res.send(`${producto}`);
}