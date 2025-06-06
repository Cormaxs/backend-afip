import ProductRepository from '../repositories/repo_product.js';

export async function add_product_services(producto) {

    const creado = await ProductRepository.addProduct(producto);
    return creado;
}