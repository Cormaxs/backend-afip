import { Product } from '../models/index.js'; 

class ProductRepository {
  // Agrega un nuevo producto
    async addProduct(productData) {
        const newProduct = new Product(productData);
        return await newProduct.save();
    }
    //busca un producto por ID
    async findById(id) {
        return await Product.findById(id);
    }

    //busca todos los productos de todas las empresas
    async findAll(options = {}) {
      const { page = 1, limit = 10, category, sortBy, order } = options;
      const query = {};
  
      if (category) {
          query.category = category;
      }
  
      // 1. Obtener el total de productos que coinciden con la consulta
      const totalProducts = await Product.countDocuments(query);
  
      let productsQuery = Product.find(query)
                                 .skip((page - 1) * limit)
                                 .limit(parseInt(limit));
  
      if (sortBy) {
          const sortOrder = order === 'desc' ? -1 : 1;
          productsQuery = productsQuery.sort({ [sortBy]: sortOrder });
      }
  
      const products = await productsQuery.exec();
  
      // 2. Calcular la información de paginación
      const totalPages = Math.ceil(totalProducts / limit);
      const currentPage = parseInt(page);
      const hasNextPage = currentPage < totalPages;
      const hasPrevPage = currentPage > 1;
      const nextPage = hasNextPage ? currentPage + 1 : null;
      const prevPage = hasPrevPage ? currentPage - 1 : null;
  
      // 3. Devolver los productos y la información de paginación
      return {
          products,
          pagination: {
              totalProducts,
              totalPages,
              currentPage,
              limit: parseInt(limit),
              hasNextPage,
              hasPrevPage,
              nextPage,
              prevPage,
          }
      };
  } 
    //busca productos de empresa especifica
    async get_products_company(company_id, page = 1, limit = 10, category, producto, marca, puntoVenta, sortBy, order) {
      // --- (El código para validar page y limit no cambia) ---
      //console.log("Filtros recibidos ->", { page, limit, category, producto, marca, puntoVenta });
      page = parseInt(page);
      limit = parseInt(limit);
  
      if (isNaN(page) || page < 1) { page = 1; }
      if (isNaN(limit) || limit < 1) { limit = 10; }
  
      const query = { empresa: company_id };
  
      // Filtros específicos
      if (category) {
          query.categoria = category;
      }
      if (marca) {
          // Se mantiene la búsqueda flexible para marca
          query.marca = { $regex: marca, $options: 'i' };
      }
  
      // ====================== INICIO DEL CAMBIO ======================
      // NUEVO: Filtro por Punto de Venta
      // Si se proporciona un puntoVenta (y no es un string vacío), se añade a la query.
      if (puntoVenta) {
          query.puntoVenta = puntoVenta;
      }
      // ======================= FIN DEL CAMBIO ========================
  
      // Búsqueda avanzada por palabras individuales en producto, marca y categoría
      if (producto) {
          const searchWords = producto.trim().split(/\s+/);
          
          // Esta condición se combina con las anteriores (empresa, categoria, marca, puntoVenta)
          query.$and = searchWords.map(word => ({
              $or: [
                  { producto: { $regex: word, $options: 'i' } },
                  { marca: { $regex: word, $options: 'i' } },
                  { categoria: { $regex: word, $options: 'i' } }
              ]
          }));
      }
  
      try {
          // --- (El resto de la lógica para contar, ordenar y paginar no necesita cambios) ---
          
          const totalProducts = await Product.countDocuments(query);
          let productsQuery = Product.find(query);
  
          if (sortBy) {
              const sortOrder = order === 'desc' ? -1 : 1;
              productsQuery = productsQuery.sort({ [sortBy]: sortOrder });
          }
  
          const products = await productsQuery
              .skip((page - 1) * limit)
              .limit(limit)
              .exec();
  
          const totalPages = Math.ceil(totalProducts / limit);
          const hasNextPage = page < totalPages;
          const hasPrevPage = page > 1;
          const nextPage = hasNextPage ? page + 1 : null;
          const prevPage = hasPrevPage ? page - 1 : null;
  
          return {
              products,
              pagination: {
                  totalProducts,
                  currentPage: page,
                  totalPages,
                  limit,
                  hasNextPage,
                  hasPrevPage,
                  nextPage,
                  prevPage,
              },
          };
      } catch (error) {
          console.error("Error al obtener productos de la empresa:", error);
          throw new Error("No se pudieron obtener los productos de la empresa en este momento.");
      }
  }

    // Actualiza un producto específico por ID
    async updateProduct(id, updateData) {
        return await Product.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
    }
    //actualiza stock de productos al venderlos
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
          if (stockResultante < -10) {
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
//elimina producto por ID
    async deleteProduct(id) {
        return await Product.findByIdAndDelete(id);
    }

    async deleteProductAll(idEmpresa) {
      const resultado = await Product.deleteMany({ empresa: idEmpresa });
      return resultado;
  }
    //busca por codigo de barras
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


  async  get_category_empresa(idEmpresa) {
    // Valida que se haya proporcionado un idEmpresa
    if (!idEmpresa) {
      throw new Error("El ID de la empresa es requerido.");
    }
  
    try {
      // Utiliza el método distinct() para obtener las categorías únicas.
      // 1er argumento: El campo del cual quieres los valores únicos ('categoria').
      // 2do argumento: El filtro para los documentos ({ empresa: idEmpresa }).
      const categories = await Product.distinct('categoria', { empresa: idEmpresa });
      return categories;
      
    } catch (error) {
      console.error("Error al obtener las categorías de la empresa:", error);
      throw new Error("No se pudieron obtener las categorías en este momento.");
    }
  }


  async  get_marca_empresa(idEmpresa) {
    // Valida que se haya proporcionado un idEmpresa
    if (!idEmpresa) {
      throw new Error("El ID de la empresa es requerido.");
    }
  
    try {
      // Utiliza el método distinct() para obtener las categorías únicas.
      // 1er argumento: El campo del cual quieres los valores únicos ('categoria').
      // 2do argumento: El filtro para los documentos ({ empresa: idEmpresa }).
      const categories = await Product.distinct('marca', { empresa: idEmpresa });
      return categories;
      
    } catch (error) {
      console.error("Error al obtener las categorías de la empresa:", error);
      throw new Error("No se pudieron obtener las categorías en este momento.");
    }
  }

}

export default new ProductRepository();