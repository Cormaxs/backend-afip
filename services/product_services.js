import ProductRepository from '../repositories/repo_product.js';

export async function add_product_services(productData) {
    const marca = await ProductRepository.findOrCreateMarcaId(productData.marca, productData.empresa);
    const categoria = await ProductRepository.findOrCreateCategoriaId(productData.marca, productData.empresa);


    const finalProductData = {
        ...productData,
        marca: marca,
        categoria: categoria,
    };

    
    const creado = await ProductRepository.addProduct(finalProductData);
    if (creado) {
        return creado;
    }
    return ("No se pudo crear el producto. Posible problema en el repositorio o datos inválidos.");
}

export async function update_product_services(id, updateData) {
    try {
        // Lógica de "buscar o crear" para Marca y Categoría antes de actualizar
        if (updateData.marca) {
            const marca = await ProductRepository.findOrCreateMarcaId(updateData.marca, updateData.empresa);
            updateData.marca = marca;
        }

        if (updateData.categoria) {
            const categoria = await ProductRepository.findOrCreateCategoriaId(updateData.categoria, updateData.empresa);
            updateData.categoria = categoria;
        }

        const actualizado = await ProductRepository.updateProduct(id, updateData);
        if (actualizado) {
            return actualizado;
        }
        return ("No se pudo actualizar el producto. El producto no existe o no se realizaron cambios.");
    } catch (error) {
        // Propagar el error para que el controlador lo maneje
        console.error("Error en update_product_services:", error);
        throw error;
    }
}

export async function delete_product_services(id) {
    const eliminado = await ProductRepository.deleteProduct(id);
    if (eliminado) {
        return eliminado; 
    } return("No se pudo eliminar el producto. El producto no existe o ya ha sido eliminado.");
  
}

export async function delete_product_all_services(idEmpresa) {
    const resultado = await ProductRepository.deleteProductAll(idEmpresa);
    return resultado;
}

export async function get_product_by_id_services(id) {
    
    const product = await ProductRepository.findById(id);
   if(product){
       return product;
   }
    return false;
}

export async function get_all_products_services(options = {}) {
    const products = await ProductRepository.findAll(options); 
    if(products){
        return products;
    }
    return false;
} 

export async function get_all_products_company_services( company_id, page, limit, category, producto, marca, puntoVenta ){
        const products = await ProductRepository.get_products_company( company_id, page, limit, category, producto, marca, puntoVenta );
        return products;
}

export async function get_all_category_company_services( idEmpresa, query ){
    
    const {idPuntoVenta} = query;
        const products = await ProductRepository.get_category_empresa( idEmpresa, idPuntoVenta );
      
        return products;
}

export async function get_all_marca_company_services( idEmpresa, query ){
    const {idPuntoVenta} = query;
        const products = await ProductRepository.get_marca_empresa( idEmpresa, idPuntoVenta );
        return products;
}

export async function deleted_marca_company_services(marcaNombre, idEmpresa) {
    // Paso 1: Busca el ID de la marca por su nombre
    const marca = await ProductRepository.verificarMarcaExistente(marcaNombre, idEmpresa);

    if (!marca) {
        throw new Error(`La marca '${marcaNombre}' no existe para esta empresa.`);
    }

    const idMarca = marca._id;

    // Paso 2: Llama a la función del repositorio con el ID
    const result = await ProductRepository.deleteMarca(idMarca, idEmpresa);

    return result;
}


export async function deleted_categoria_company_services(categoriaNombre, idEmpresa) {
    const categoria = await ProductRepository.verificarCategoriaExistente(categoriaNombre, idEmpresa);

    if (!categoria) {
        // ✅ CORRECCIÓN: El mensaje de error ahora es específico de "categoría"
        throw new Error(`La categoría '${categoriaNombre}' no existe para esta empresa.`);
    }

    const idCategoria = categoria._id;

    // Paso 2: Llama a la función del repositorio con el ID correcto
    const result = await ProductRepository.deleteCategoria(idCategoria, idEmpresa);

    return result;
}

export async function get_product_codBarra_services(idEmpresa, puntoVenta, codBarra){
        return ProductRepository.findByBarcode(idEmpresa, puntoVenta, codBarra)
}


export async function update_product_ventas_services(updateData) {
   
    const productsToUpdate = updateData.items.map(item => ({
        id: item.idProduct || item._id, // Asegúrate de que el ID del producto sea correcto
        cantidadARestar: item.cantidad
      }));
    const actualizado = await ProductRepository.updateProductVentas(productsToUpdate);
    if (actualizado) {   
        return actualizado;
    }
  return("No se pudo actualizar el producto. El producto no existe o no se realizaron cambios.");
} 

export async function get_product_agotados_services(idEmpresa, idPuntoVenta, paginacion) {
    const {page, limit} = paginacion;
    const agotados = await ProductRepository.getProductAgotados(idEmpresa, idPuntoVenta, page, limit);
  return agotados;
}


export async function get_total_inventario_services(idEmpresa, idPuntoVenta) {
    const agotados = await ProductRepository.priceInventario(idEmpresa, idPuntoVenta);
  return agotados;
}






export async function create_or_update_categoria_services(nombreNuevo, idEmpresa, nombreAntiguo) {
    if (!nombreNuevo || !idEmpresa) {
        throw new Error("El nombre de la categoría y el ID de la empresa son obligatorios.");
    }
    const categoria = await ProductRepository.createOrUpdateCategoria(nombreNuevo, idEmpresa, nombreAntiguo);
    return categoria;
}

export async function create_or_update_marca_services(nombreNuevo, idEmpresa, nombreAntiguo) {
    if (!nombreNuevo || !idEmpresa) {
        throw new Error("El nombre de la marca y el ID de la empresa son obligatorios.");
    }
    const marca = await ProductRepository.createOrUpdateMarca(nombreNuevo, idEmpresa, nombreAntiguo);
    return marca;
}