import { PuntoDeVenta } from '../models/index.js'; 

class PuntoDeVentaRepository {
    async addPuntoDeVenta(PuntoDeVentaData) {
        const newPuntoDeVenta = new PuntoDeVenta(PuntoDeVentaData);
        return await newPuntoDeVenta.save();
    }
    async findById(id) {
        return await PuntoDeVenta.findById(id);
    }

    async findAll(options = {}) {
        const { page = 1, limit = 10, category, sortBy, order } = options;
        const query = {};
        if (category) {
            query.category = category; 
        }
        let PuntoDeVentasQuery = PuntoDeVenta.find(query)
                                 .skip((page - 1) * limit)
                                 .limit(parseInt(limit));
        if (sortBy) {
            const sortOrder = order === 'desc' ? -1 : 1;
            PuntoDeVentasQuery = PuntoDeVentasQuery.sort({ [sortBy]: sortOrder });
        }
        return await PuntoDeVentasQuery.exec();
    }

    async updatePuntoDeVenta(id, updateData) {
        return await PuntoDeVenta.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
    }

    async deletePuntoDeVenta(id) {
        return await PuntoDeVenta.findByIdAndDelete(id);
    }
}

export default new PuntoDeVentaRepository();