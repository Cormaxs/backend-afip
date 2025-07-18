import { add_product_services, update_product_services, delete_product_services, 
    get_product_by_id_services, get_all_products_services, 
    get_all_products_company_services, get_product_codBarra_services,
    delete_product_all_services, get_all_category_company_services,
    get_all_marca_company_services, get_product_agotados_services,
    get_total_inventario_services } from '../../services/product_services.js'; // Asegúrate de importar todas las funciones de servicio necesarias



export async function add_product(req, res) {
    try {
        const productData = req.body; 
        console.log(productData)
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

export async function delete_product_all(req, res) {
    try {
        const { idEmpresa } = req.params;
        if (!idEmpresa) {
            return res.status(400).json({ error: "El ID de la empresa es requerido." });
        }

        // Llama al servicio para ejecutar la lógica
        const resultado = await delete_product_all_services(idEmpresa);

        // Envía una respuesta exitosa, informando cuántos productos se eliminaron.
        // Incluso si se eliminaron 0, la operación fue exitosa.
        return res.status(200).json({
            message: `Operación completada. Se eliminaron ${resultado.deletedCount} productos.`,
            deletedCount: resultado.deletedCount
        });

    } catch (error) {
        console.error("Error en el controlador delete_product_all:", error.message);
        // Error genérico para cualquier problema en la base de datos.
        return res.status(500).json({ error: "No se pudieron eliminar los productos debido a un error interno." });
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


export async function get_all_products_company_controllers(req, res) {
    try {
        const { page, limit, category, product, marca, puntoVenta } = req.query;
        // Cambiamos 'id' a 'company_id' para mayor claridad, asumiendo que tu ruta es algo como /products/company/:company_id
        const { id } = req.params; 
        console.log(id, page , limit, category, product, marca, puntoVenta)
        const products = await get_all_products_company_services( 
            id, // Pasamos el ID de la empresa al servicio
            page, 
            limit, 
            category,
            product, 
            marca,
            puntoVenta
        );

        if (!products || products.length === 0) {
            return res.status(204).json({ message: "No hay productos disponibles para esta empresa." });
        }

        return res.status(200).json(products);
    } catch (error) {
        console.error("Error en get_all_products_company (controlador):", error.message);
        // Puedes ser más específico en el error si 'error' tiene un código/mensaje de error más detallado
        return res.status(500).json({ error: "Error interno del servidor al obtener los productos de la empresa." });
    }
}


export async function get_all_category_company_controllers(req, res) {
    try {
        // Cambiamos 'id' a 'company_id' para mayor claridad, asumiendo que tu ruta es algo como /products/company/:company_id
        const { idEmpresa } = req.params; 
        console.log("desde categoria controlers : empresa -> ", idEmpresa,"puntoVenta categoria -> ", req.query.idPuntoVenta)
        const categorys = await get_all_category_company_services( idEmpresa, req.query);

        if (!categorys || categorys.length === 0) {
            return res.status(204).json({ message: "No hay categorias disponibles para esta empresa." });
        }

        return res.status(200).json(categorys);
    } catch (error) {
        console.error("Error en get_all_products_company (controlador):", error.message);
        // Puedes ser más específico en el error si 'error' tiene un código/mensaje de error más detallado
        return res.status(500).json({ error: "Error interno del servidor al obtener los productos de la empresa." });
    }
}



export async function get_all_marca_company_controllers(req, res) {
    try {
        // Cambiamos 'id' a 'company_id' para mayor claridad, asumiendo que tu ruta es algo como /products/company/:company_id
        const { idEmpresa } = req.params; 
        console.log("desde marca controlers : empresa -> ", idEmpresa,"puntoVenta marca -> ", req.query.idPuntoVenta)
        const categorys = await get_all_marca_company_services( idEmpresa, req.query);

        if (!categorys || categorys.length === 0) {
            return res.status(204).json({ message: "No hay categorias disponibles para esta empresa." });
        }

        return res.status(200).json(categorys);
    } catch (error) {
        console.error("Error en get_all_products_company (controlador):", error.message);
        // Puedes ser más específico en el error si 'error' tiene un código/mensaje de error más detallado
        return res.status(500).json({ error: "Error interno del servidor al obtener los productos de la empresa." });
    }
}


export async function get_product_codBarra(req, res){
    try{
        const {idEmpresa, puntoVenta, codBarra} = req.params;
        console.log("entrada -> ",req.body);
        const encontrado = await get_product_codBarra_services(idEmpresa, puntoVenta, codBarra);
        res.send(encontrado)
    }catch(err){

    }
}

export async function get_product_agotados(req, res){
    try{
        const {idEmpresa, idPuntoVenta} = req.params;

        const respuesta = await get_product_agotados_services(idEmpresa, idPuntoVenta, req.query)
        res.send(respuesta)
    }catch(err){
        console.error("Error en get_product_agotados (controlador):", err.message);
        return res.status(500).json({ error: "Error interno del servidor al obtener productos agotados." });
    }
}


export async function get_totalInventario(req, res){
    try{
        const {idEmpresa, idPuntoVenta} = req.params;

        const respuesta = await get_total_inventario_services(idEmpresa, idPuntoVenta)
        res.send(respuesta)
    }catch(err){
        console.error("Error en get_product_agotados (controlador):", err.message);
        return res.status(500).json({ error: "Error interno del servidor al obtener productos agotados." });
    }
}