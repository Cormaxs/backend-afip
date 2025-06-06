import Product from '../models/product.js';


class ProductRepository {

    async addProduct (product) {
        const newProduct = new Product(product);
        return await newProduct.save();
    }
   
}

export default new ProductRepository();