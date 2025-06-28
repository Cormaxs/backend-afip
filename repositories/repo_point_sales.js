import { PuntoDeVenta } from '../models/index.js'; 

class PuntoDeVentaRepository {
    async addPuntoDeVenta(PuntoDeVentaData) {
        const newPuntoDeVenta = new PuntoDeVenta(PuntoDeVentaData);
        return await newPuntoDeVenta.save();
    }
    async findById(id) {
        return await PuntoDeVenta.findById(id);
    }

    async findAll(empresaId, options = {}) {
        const { page = 1, limit = 10, sortBy, order } = options;
        const query = { empresa: empresaId }; // Filtra por el ID de la empresa
    
        // 1. Obtener el total de Puntos de Venta que coinciden con la consulta
        const totalPuntosDeVenta = await PuntoDeVenta.countDocuments(query);
    
        let PuntoDeVentasQuery = PuntoDeVenta.find(query)
            .skip((page - 1) * limit)
            .limit(parseInt(limit));
    
        if (sortBy) {
            const sortOrder = order === 'desc' ? -1 : 1;
            PuntoDeVentasQuery = PuntoDeVentasQuery.sort({
                [sortBy]: sortOrder
            });
        }
    
        const puntosDeVenta = await PuntoDeVentasQuery.exec();
    
        // 2. Calcular la información de paginación
        const totalPages = Math.ceil(totalPuntosDeVenta / limit);
        const currentPage = parseInt(page);
        const hasNextPage = currentPage < totalPages;
        const hasPrevPage = currentPage > 1;
        const nextPage = hasNextPage ? currentPage + 1 : null;
        const prevPage = hasPrevPage ? currentPage - 1 : null;
    
        // 3. Devolver los Puntos de Venta y la información de paginación
        return {
            puntosDeVenta,
            pagination: {
                totalPuntosDeVenta,
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
    

    async updatePuntoDeVenta(id, updateData) {
        return await PuntoDeVenta.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
    }

    async deletePuntoDeVenta(id) {
        return await PuntoDeVenta.findByIdAndDelete(id);
    }
}

export default new PuntoDeVentaRepository();