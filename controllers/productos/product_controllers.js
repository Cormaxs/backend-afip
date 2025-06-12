import { add_product_services, update_product_services, delete_product_services, get_product_by_id_services, get_all_products_services } from '../../services/product_services.js'; // Asegúrate de importar todas las funciones de servicio necesarias



export async function add_product(req, res) {
    try {
        const productData = req.body; 
        const newProduct = await add_product_services(productData);
        if(newProduct){
          return res.status(201).json(newProduct);  
        }
        return res.status(400).json({ error: "No se pudo agregar el producto. Verifica los datos proporcionados." }); // 400 Bad Request
        
    } catch (error) {
        console.error("Error en add_product (controlador):", error.message);
        if (error.message.includes("ya existe") || error.message.includes("duplicate key")) {
            return res.status(409).json({ error: "El producto con este nombre o ID ya existe." }); // 409 Conflict
        } else if (error.message.includes("datos inválidos") || error.message.includes("validación")) {
            return res.status(400).json({ error: "Datos de producto inválidos. Por favor, verifica la información." }); // 400 Bad Request
        }
        return res.status(500).json({ error: "No se pudo agregar el producto debido a un error interno del servidor." });
    }
}



export async function update_product(req, res) {
    try {
        const productId = req.params.id;
        const updateData = req.body; 

        const updatedProduct = await update_product_services(productId, updateData);
        if (!updatedProduct) {
            return res.status(404).json({ error: "Producto no encontrado para actualizar." });
        }
        return res.status(200).json(updatedProduct);
    } catch (error) {
        console.error("Error en update_product (controlador):", error.message);

        if (error.message.includes("ID no proporcionado")) {
            return res.status(400).json({ error: "ID del producto es requerido para la actualización." }); 
        } else if (error.message.includes("no encontrado para actualizar") || error.message.includes("no existe")) {
            return res.status(404).json({ error: "El producto especificado no fue encontrado." }); 
        } else if (error.message.includes("datos inválidos") || error.message.includes("validación")) {
            return res.status(400).json({ error: "Datos de actualización inválidos. Por favor, verifica la información." });
        }
        return res.status(500).json({ error: "No se pudo actualizar el producto debido a un error interno del servidor." });
    }
}


export async function delete_product(req, res) {
    try {
        const productId = req.params.id;
        const deletedProduct = await delete_product_services(productId);
        if (!deletedProduct) {
            return res.status(404).json({ error: "Producto no encontrado para eliminar." }); // 404 Not Found
        }
        return res.status(200).json({ message: "Producto eliminado correctamente.", product: deletedProduct });
    } catch (error) {
        console.error("Error en delete_product (controlador):", error.message);
        if (error.message.includes("ID no proporcionado")) {
            return res.status(400).json({ error: "ID del producto es requerido para la eliminación." }); // 400 Bad Request
        } else if (error.message.includes("no encontrado para eliminar") || error.message.includes("no existe")) {
            return res.status(404).json({ error: "El producto especificado no fue encontrado." }); // 404 Not Found
        }
        return res.status(500).json({ error: "No se pudo eliminar el producto debido a un error interno del servidor." });
    }
}


export async function get_product_by_id(req, res) {
    try {
        const productId = req.params.id;
        const product = await get_product_by_id_services(productId);

        if (!product) {
            return res.status(404).json({ error: "Producto no encontrado." });
        }
        return res.status(200).json(product);
    } catch (error) {
        console.error("Error en get_product_by_id (controlador):", error.message);
        if (error.message.includes("ID no proporcionado") || error.message.includes("ID inválido")) {
            return res.status(400).json({ error: "ID de producto inválido o no proporcionado." });
        }
        return res.status(500).json({ error: "Error interno del servidor al obtener el producto." });
    }
}


export async function get_all_products(req, res) {
    try {
        const { page, limit, category } = req.query; 

        const products = await get_all_products_services({ page, limit, category });

        if (!products || products.length === 0) {
            return res.status(204).json({ message: "No hay productos disponibles." });
        }

        return res.status(200).json(products);
    } catch (error) {
        console.error("Error en get_all_products (controlador):", error.message);
        return res.status(500).json({ error: "Error interno del servidor al obtener la lista de productos." });
    }
}