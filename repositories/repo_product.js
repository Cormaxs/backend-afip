import Product from '../models/product.js';


class ProductRepository {

    async addProduct (product) {
        const newProduct = new Product(product);
        return await newProduct.save();
    }

    async updateProduct (producto) { 
       return  Product.findByIdAndUpdate(producto.id, producto, { new: true });
    }

    async deleteProduct (productoId) {
        return await Product.findByIdAndDelete(productoId);
    }
   
}

export default new ProductRepository();