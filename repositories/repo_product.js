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

    async updateProductVentas(productsToUpdate) {
      try {
        //console.log("Productos a actualizar:", productsToUpdate);
    
        const updatedProducts = [];
        for (const productInfo of productsToUpdate) {
          const { id, cantidadARestar } = productInfo;
    
         // console.log(`Intentando actualizar producto ID: ${id}, Cantidad a restar: ${cantidadARestar}`);
    
          // --- Validación de stock antes de actualizar ---
          // Primero, obtenemos el producto para verificar su stock actual
          const product = await Product.findById(id);
    
          if (!product) {
            throw new Error(`Producto con ID ${id} no encontrado. No se pudo procesar la venta.`);
          }
    
          // Calculamos el stock resultante
          const stockResultante = product.stock_disponible - cantidadARestar;
    
          // Si el stock resultante es negativo, lanzamos un error
          if (stockResultante < 0) {
            throw new Error(
              `No hay suficiente stock para el producto "${product.descripcion}" (ID: ${id}). ` +
              `Stock actual: ${product.stock_disponible}. Cantidad solicitada: ${cantidadARestar}.`
            );
          }
          // --- Fin de la validación de stock ---
    
          // Si el stock es suficiente, procedemos con la actualización
          const updatedProduct = await Product.findByIdAndUpdate(
            id,
            {
              $inc: { stock_disponible: -cantidadARestar } // Resta la cantidad al stock_disponible
            },
            { new: true, runValidators: true } // new: true devuelve el documento actualizado; runValidators: true ejecuta las validaciones del esquema
          );
    
          // Aunque ya validamos antes, esta es una doble verificación si findByIdAndUpdate por alguna razón no retorna nada
          if (!updatedProduct) {
            throw new Error(`Producto con ID ${id} no se pudo actualizar después de la validación inicial.`);
          }
          updatedProducts.push(updatedProduct);
        }
    
        return updatedProducts; // Devuelve un array con todos los productos actualizados
    
      } catch (error) {
        console.error('Error al actualizar el producto(s) y restar stock:', error);
        throw error; // Re-lanza el error para que sea manejado por el código que llama
      }
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