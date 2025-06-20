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

export async function get_all_products_company_services( company_id, page, limit, category, producto ){
        const products = await ProductRepository.get_products_company( company_id, page, limit, category, producto );
        console.log("encontrado -> ",products)
        return products;
}

export async function get_product_codBarra_services(idEmpresa, puntoVenta, codBarra){
    console.log(`${idEmpresa} ${puntoVenta} ${codBarra}`)
        return ProductRepository.findByBarcode(idEmpresa, puntoVenta, codBarra)
}