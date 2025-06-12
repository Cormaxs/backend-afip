import { Product } from '../models/index.js'; 

class ProductRepository {
    async addProduct(productData) {
        const newProduct = new Product(productData);
        return await newProduct.save();
    }
    async findById(id) {
        return await Product.findById(id);
    }

    async findAll(options = {}) {
        const { page = 1, limit = 10, category, sortBy, order } = options;
        const query = {};
        if (category) {
            query.category = category; 
        }
        let productsQuery = Product.find(query)
                                 .skip((page - 1) * limit)
                                 .limit(parseInt(limit));
        if (sortBy) {
            const sortOrder = order === 'desc' ? -1 : 1;
            productsQuery = productsQuery.sort({ [sortBy]: sortOrder });
        }
        return await productsQuery.exec();
    }

    async updateProduct(id, updateData) {
        return await Product.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
    }

    async deleteProduct(id) {
        return await Product.findByIdAndDelete(id);
    }
}

export default new ProductRepository();