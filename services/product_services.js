import ProductRepository from '../repositories/repo_product.js';

export async function add_product_services(productData) {
    const creado = await ProductRepository.addProduct(productData);
    if (creado) {
        return creado;
    }
    return ("No se pudo crear el producto. Posible problema en el repositorio o datos inválidos.");
}

export async function update_product_services(id, updateData) {
    const actualizado = await ProductRepository.updateProduct(id, updateData);
    if (actualizado) {   
        return actualizado;
    }
  return("No se pudo actualizar el producto. El producto no existe o no se realizaron cambios.");
}

export async function delete_product_services(id) {
    const eliminado = await ProductRepository.deleteProduct(id);
    if (eliminado) {
        return eliminado; 
    } return("No se pudo eliminar el producto. El producto no existe o ya ha sido eliminado.");
  
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

export async function get_all_products_company_services( company_id, page, limit, category ){
    try {
        // Aquí podrías añadir lógica de negocio adicional si fuera necesaria,
        // como validar el company_id o transformar los datos antes de pasarlos al repositorio.

        const products = await ProductRepository.get_products_company( company_id, page, limit, category );
        return products;
    } catch (error) {
        console.error("Error en get_all_products_by_company_id_service:", error.message);
        throw error; // Propaga el error para que el controlador lo maneje
    }
}