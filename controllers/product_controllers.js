import {add_product_services, update_product_services, delete_product_services} from '../services/product_services.js';


export async function add_product(req, res) {
  
    const producto = await add_product_services(req.body);

    res.send(`${producto}`);
}

export async function update_product(req, res) {
    // Implement the update logic here
    const actualizado = await update_product_services(req.body);
   res.status(200).send(`Product updated successfully:`, actualizado);
}

export async function delete_product(req, res) {
    // Implement the delete logic here
    const eliminado = await delete_product_services(req.body);
   res.status(200).send(`Product deleted successfully:`, eliminado);
}