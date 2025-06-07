import ProductRepository from '../repositories/repo_product.js';

export async function add_product_services(producto) {
    const creado = await ProductRepository.addProduct(producto);
    return creado;
}

export async function update_product_services(producto) {
    const actualizado = await ProductRepository.updateProduct(producto);
    return actualizado;
}

export async function delete_product_services(id) { 
    const eliminado = await ProductRepository.deleteProduct(id.id);
    return eliminado;
}