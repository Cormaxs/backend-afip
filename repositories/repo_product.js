import { Product, Marca, Categoria } from '../models/index.js';
import mongoose from 'mongoose';

class ProductRepository {
    // Agrega un nuevo producto
    async addProduct(productData) {
        const newProduct = new Product(productData);
        return await newProduct.save();
    }

    async findOrCreateCategoriaId(nombre, empresaId) {
        let categoria = await Categoria.findOne({ nombre: nombre, empresa: empresaId });
        if (!categoria) {
            categoria = new Categoria({ nombre: nombre, empresa: empresaId });
            await categoria.save();
        }
        return categoria._id;
    }

    async findOrCreateMarcaId(nombre, empresaId) {
        let marca = await Marca.findOne({ nombre: nombre, empresa: empresaId });
        if (!marca) {
            marca = new Marca({ nombre: nombre, empresa: empresaId });
            await marca.save();
        }
        return marca._id;
    }

    //busca un producto por ID
    async findById(id) {
        return await Product.findById(id).populate('categoria').populate('marca');
    }

    //busca todos los productos de todas las empresas
    async findAll(options = {}) {
        const { page = 1, limit = 10, category, sortBy, order } = options;
        const query = {};

        if (category) {
            query.category = category;
        }

        const totalProducts = await Product.countDocuments(query);

        let productsQuery = Product.find(query)
            .skip((page - 1) * limit)
            .limit(parseInt(limit))
            .populate('categoria')
            .populate('marca');

        if (sortBy) {
            const sortOrder = order === 'desc' ? -1 : 1;
            productsQuery = productsQuery.sort({ [sortBy]: sortOrder });
        }

        const products = await productsQuery.exec();

        const totalPages = Math.ceil(totalProducts / limit);
        const currentPage = parseInt(page);
        const hasNextPage = currentPage < totalPages;
        const hasPrevPage = currentPage > 1;
        const nextPage = hasNextPage ? currentPage + 1 : null;
        const prevPage = hasPrevPage ? currentPage - 1 : null;

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
    
    // --- FUNCIÓN MODIFICADA PARA BUSCAR SIN ERRORES ---
    async get_products_company(company_id, page = 1, limit = 10, category, producto, marca, puntoVenta, sortBy, order) {
        page = parseInt(page);
        limit = parseInt(limit);

        if (isNaN(page) || page < 1) { page = 1; }
        if (isNaN(limit) || limit < 1) { limit = 10; }

        const query = { empresa: company_id };

        try {
            // 1. Convertir los nombres de marca y categoría a sus respectivos IDs
            let categoryId = null;
            if (category) {
                const foundCategory = await Categoria.findOne({ nombre: category, empresa: company_id });
                if (foundCategory) {
                    categoryId = foundCategory._id;
                    query.categoria = categoryId;
                }
            }

            let marcaId = null;
            if (marca) {
                const foundMarca = await Marca.findOne({ nombre: marca, empresa: company_id });
                if (foundMarca) {
                    marcaId = foundMarca._id;
                    query.marca = marcaId;
                }
            }

            if (puntoVenta) {
                query.puntoVenta = puntoVenta;
            }

            // 2. Manejar la búsqueda avanzada de texto
            if (producto) {
                const searchWords = producto.trim().split(/\s+/);
                
                // Construir un array de condiciones para el $and
                const andConditions = searchWords.map(word => {
                    const regex = new RegExp(word, 'i');
                    return {
                        $or: [
                            { producto: regex },
                            { descripcion: regex },
                            // Aquí usamos el ID para la búsqueda, si se encontró
                            ...(categoryId ? [{ categoria: categoryId }] : []),
                            ...(marcaId ? [{ marca: marcaId }] : []),
                        ]
                    };
                });
                
                // Combinar la query existente con las condiciones de búsqueda
                query.$and = andConditions;
            }

            const totalProducts = await Product.countDocuments(query);
            let productsQuery = Product.find(query)
                .populate('categoria', 'nombre')
                .populate('marca', 'nombre');

            if (sortBy) {
                const sortOrder = order === 'desc' ? -1 : 1;
                productsQuery = productsQuery.sort({ [sortBy]: sortOrder });
            }

            const products = await productsQuery
                .skip((page - 1) * limit)
                .limit(limit)
                .lean()
                .exec();

            const formattedProducts = products.map(p => ({
                ...p,
                marca: p.marca ? p.marca.nombre : null,
                categoria: p.categoria ? p.categoria.nombre : null,
            }));

            const totalPages = Math.ceil(totalProducts / limit);
            const hasNextPage = page < totalPages;
            const hasPrevPage = page > 1;
            const nextPage = hasNextPage ? page + 1 : null;
            const prevPage = hasPrevPage ? page - 1 : null;

            return {
                products: formattedProducts,
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
    // --- FIN DE LA FUNCIÓN MODIFICADA ---

    // Actualiza un producto específico por ID
    async updateProduct(id, updateData) {
        return await Product.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
    }

    //actualiza stock de productos al venderlos
    async updateProductVentas(productsToUpdate) {
        try {
            const updatedProducts = [];
            for (const productInfo of productsToUpdate) {
                const { id, cantidadARestar } = productInfo;
                const product = await Product.findById(id);

                if (!product) {
                    throw new Error(`Producto con ID ${id} no encontrado. No se pudo procesar la venta.`);
                }

                const stockResultante = product.stock_disponible - cantidadARestar;
                if (stockResultante < -10) {
                    throw new Error(
                        `No hay suficiente stock para el producto "${product.descripcion}" (ID: ${id}). ` +
                        `Stock actual: ${product.stock_disponible}. Cantidad solicitada: ${cantidadARestar}.`
                    );
                }
                const updatedProduct = await Product.findByIdAndUpdate(
                    id,
                    { $inc: { stock_disponible: -cantidadARestar } },
                    { new: true, runValidators: true }
                );
                if (!updatedProduct) {
                    throw new Error(`Producto con ID ${id} no se pudo actualizar después de la validación inicial.`);
                }
                updatedProducts.push(updatedProduct);
            }
            return updatedProducts;
        } catch (error) {
            console.error('Error al actualizar el producto(s) y restar stock:', error);
            throw error;
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
        try {
            const query = {
                empresa: idEmpresa,
                puntoVenta: puntoVenta,
                codigoBarra: codBarra
            };
            const resivido = await Product.findOne(query);
            return resivido;
        } catch (err) {
            console.error(err)
        }
    }

    async get_category_empresa(idEmpresa) {
        if (!idEmpresa) {
            throw new Error("El ID de la empresa es requerido.");
        }
        try {
            const categories = await Categoria.find({ empresa: idEmpresa }).distinct('nombre');
            return categories;
        } catch (error) {
            console.error("Error al obtener las categorías de la empresa:", error);
            throw new Error("No se pudieron obtener las categorías en este momento.");
        }
    }

    async get_marca_empresa(idEmpresa) {
        if (!idEmpresa) {
            throw new Error("El ID de la empresa es requerido.");
        }
        try {
            const marcas = await Marca.find({ empresa: idEmpresa }).distinct('nombre');
            return marcas;
        } catch (error) {
            console.error("Error al obtener las marcas de la empresa:", error);
            throw new Error("No se pudieron obtener las marcas en este momento.");
        }
    }

    async verificarMarcaExistente(nombreMarca, idEmpresa) {
        const existente = await Marca.findOne({ nombre: nombreMarca, empresa: idEmpresa });
        return existente
    }
    
    async verificarCategoriaExistente(nombreCategoria, idEmpresa) {
        const existente = await Categoria.findOne({ nombre: nombreCategoria, empresa: idEmpresa });
        return existente
    }

    async deleteMarca(idMarca, idEmpresa) {
        // La consulta del repositorio DEBE usar el ID (idMarca)
        const desvinculacionResult = await Product.updateMany(
            { empresa: idEmpresa, marca: idMarca },
            { $unset: { marca: "" } }
        );

        const eliminacionMarcaResult = await Marca.deleteOne({ _id: idMarca, empresa: idEmpresa });

        return {
            message: 'Operación finalizada.',
            productos_modificados: desvinculacionResult.modifiedCount,
            marcas_eliminadas: eliminacionMarcaResult.deletedCount,
        };
    }

    async deleteCategoria(idCategoria, idEmpresa) {
        // La consulta del repositorio DEBE usar el ID (idCategoria)
        const desvinculacionResult = await Product.updateMany(
            { empresa: idEmpresa, categoria: idCategoria },
            { $unset: { categoria: "" } }
        );

        // ✅ CORRECCIÓN: Se usa el modelo Categoria para la eliminación
        const eliminacionCategoriaResult = await Categoria.deleteOne({ _id: idCategoria, empresa: idEmpresa });

        // ✅ CORRECCIÓN: Se modifican las variables y mensajes de retorno
        return {
            message: 'Operación finalizada.',
            productos_modificados: desvinculacionResult.modifiedCount,
            categorias_eliminadas: eliminacionCategoriaResult.deletedCount,
        };
    }

    async getProductAgotados(idEmpresa, puntoDeVenta, page = 1, limit = 10) {
        try {
            if (!mongoose.Types.ObjectId.isValid(idEmpresa)) {
                throw new Error('ID de empresa inválido.');
            }
            const filtro = {
                empresa: new mongoose.Types.ObjectId(idEmpresa),
                stock_disponible: { $lte: 0 }
            };
            if (puntoDeVenta && mongoose.Types.ObjectId.isValid(puntoDeVenta)) {
                filtro.puntoVenta = new mongoose.Types.ObjectId(puntoDeVenta);
            }
            const [totalDocs, docs] = await Promise.all([
                Product.countDocuments(filtro),
                Product.find(filtro)
                    .sort({ stock_disponible: 1, producto: 1 })
                    .limit(Number(limit))
                    .skip((Number(page) - 1) * Number(limit))
                    .lean()
            ]);

            const totalPages = Math.ceil(totalDocs / limit);

            return {
                docs,
                totalDocs,
                limit: Number(limit),
                totalPages,
                page: Number(page),
                hasNextPage: Number(page) < totalPages,
                hasPrevPage: Number(page) > 1,
            };

        } catch (error) {
            console.error("Error en MetricasRepository.getProductAgotados:", error);
            throw error;
        }
    }


    async priceInventario(idEmpresa, puntoDeVenta) {
        try {
            if (!mongoose.Types.ObjectId.isValid(idEmpresa)) {
                throw new Error('ID de empresa inválido.');
            }
            const matchFilter = {
                empresa: new mongoose.Types.ObjectId(idEmpresa),
                stock_disponible: { $gt: 0 }
            };
            if (puntoDeVenta && mongoose.Types.ObjectId.isValid(puntoDeVenta)) {
                matchFilter.puntoVenta = new mongoose.Types.ObjectId(puntoDeVenta);
            }
            const resultadoAgregacion = await Product.aggregate([
                { $match: matchFilter },
                {
                    $group: {
                        _id: null,
                        valorTotal: { $sum: { $multiply: ["$stock_disponible", "$precioCosto"] } }
                    }
                }
            ]);

            const valorTotalInventario = resultadoAgregacion.length > 0 ? resultadoAgregacion[0].valorTotal : 0;
            return {
                valorTotalInventario: valorTotalInventario
            };

        } catch (error) {
            console.error("Error en MetricasRepository.priceInventario:", error);
            throw error;
        }
    }




    async createOrUpdateCategoria(nombreNuevo, idEmpresa, nombreAntiguo = null) {
        if (!nombreNuevo || !idEmpresa) {
            throw new Error("El nombre de la categoría y el ID de la empresa son obligatorios.");
        }
        
        // La consulta usa el nombreAntiguo para encontrar el documento.
        // Si no se proporciona, busca por el nombreNuevo.
        const query = { empresa: idEmpresa, nombre: nombreAntiguo || nombreNuevo };
        const update = { nombre: nombreNuevo.trim() };
        
        const categoria = await Categoria.findOneAndUpdate(
            query,
            update,
            { new: true, upsert: true, runValidators: true }
        );
        return categoria;
    }

   
    async createOrUpdateMarca(nombreNuevo, idEmpresa, nombreAntiguo = null) {
        if (!nombreNuevo || !idEmpresa) {
            throw new Error("El nombre de la marca y el ID de la empresa son obligatorios.");
        }

        const query = { empresa: idEmpresa, nombre: nombreAntiguo || nombreNuevo };
        const update = { nombre: nombreNuevo.trim() };

        const marca = await Marca.findOneAndUpdate(
            query,
            update,
            { new: true, upsert: true, runValidators: true }
        );
        return marca;
    }





}

export default new ProductRepository();