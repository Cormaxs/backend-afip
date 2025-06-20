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

    async get_products_company(company_id, page = 1, limit = 10, category, producto, sortBy, order) {
        if (!company_id) {
          throw new Error("Se requiere un ID de empresa para obtener sus productos.");
        }
      console.log(company_id, page, limit, category, producto)
        const query = { empresa: company_id }; // Asume que tu modelo Producto tiene un campo 'empresa' para el ID de la empresa
      
        // Add category filter if provided
        if (category) {
          query.category = category;
        }
      
        // Add product name search if provided (using a case-insensitive regex for flexibility)
        if (producto) {
          query.producto = { $regex: producto, $options: 'i' }; // Assuming 'name' is the product field
        }
      
        let productsQuery = Product.find(query);
      
        // Apply sorting if sortBy is provided
        if (sortBy) {
          const sortOrder = order === 'desc' ? -1 : 1;
          productsQuery = productsQuery.sort({ [sortBy]: sortOrder });
        }
      
        // Apply pagination
        productsQuery = productsQuery
          .skip((page - 1) * limit)
          .limit(parseInt(limit));
      
        return await productsQuery.exec();
      }

    async updateProduct(id, updateData) {
        return await Product.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
    }

    async deleteProduct(id) {
        return await Product.findByIdAndDelete(id);
    }


    async findByBarcode(idEmpresa, puntoVenta, codBarra) {
      console.log(`${idEmpresa} ${puntoVenta} ${codBarra}`)
try{
      const query = {
          empresa: idEmpresa,
          puntoVenta: puntoVenta,
          codigoBarra: codBarra
      };
const resivido = await Product.findOne(query);
console.log(resivido)
      return resivido;
    }catch(err){
    console.error(err)
    }
  }
}

export default new ProductRepository();