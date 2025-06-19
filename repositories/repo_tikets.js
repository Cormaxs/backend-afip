// repositories/repo_tikets.js
import { Ticket } from "../models/index.js";
import mongoose from 'mongoose';

class TicketEmitidoRepository {
    async create(ticketData) {
        if (ticketData.idEmpresa && !mongoose.Types.ObjectId.isValid(ticketData.idEmpresa)) {
            throw new Error('ID de empresa inválido para la creación del ticket.');
        }
        const newTicketEmitido = new Ticket(ticketData);
        return await newTicketEmitido.save();
    }

    async update(id, updateData) {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new Error('ID de ticket inválido para la actualización.');
        }
        return await Ticket.findByIdAndUpdate(id, updateData, { new: true });
    }

    async delete(id) {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new Error('ID de ticket inválido para la eliminación.');
        }
        return await Ticket.findByIdAndDelete(id);
    }

    async findById(id) {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new Error('ID de ticket inválido para la búsqueda.');
        }
        return await Ticket.findById(id);
    }

    async findLastComprobanteInterno(idEmpresa, puntoDeVenta) {
        try {
            if (!mongoose.Types.ObjectId.isValid(idEmpresa)) {
                throw new Error('ID de empresa inválido para buscar el último comprobante interno.');
            }
            const lastTicket = await Ticket.findOne({
                idEmpresa: idEmpresa,
                puntoDeVenta: puntoDeVenta
            })
            .sort({ numeroComprobanteInterno: -1 })
            .limit(1)
            .select('numeroComprobanteInterno')
            .exec();

            return lastTicket ? lastTicket.numeroComprobanteInterno : 0;
        } catch (error) {
            console.error("Error al buscar el último comprobante interno:", error);
            throw error;
        }
    }

    async findLastVentaId(idEmpresa, puntoDeVenta) {
        try {
            if (!mongoose.Types.ObjectId.isValid(idEmpresa)) {
                throw new Error('ID de empresa inválido para buscar el último ventaId.');
            }

            const lastTicket = await Ticket.findOne({
                idEmpresa: idEmpresa,
                puntoDeVenta: puntoDeVenta
            })
            .sort({ ventaId: -1 })
            .limit(1)
            .select('ventaId')
            .exec();

            return lastTicket ? lastTicket.ventaId : null;
        } catch (error) {
            console.error("Error al buscar el último ventaId:", error);
            throw error;
        }
    }
    
    async findLastNumeroComprobante(idEmpresa, puntoDeVenta) {
        try {
            if (!mongoose.Types.ObjectId.isValid(idEmpresa)) {
                throw new Error('ID de empresa inválido para buscar el último numeroComprobante.');
            }

            const lastTicket = await Ticket.findOne({
                idEmpresa: idEmpresa,
                puntoDeVenta: puntoDeVenta
            })
            .sort({ numeroComprobante: -1 })
            .limit(1)
            .select('numeroComprobante')
            .exec();

            return lastTicket ? lastTicket.numeroComprobante : null;
        } catch (error) {
            console.error("Error al buscar el último numeroComprobante:", error);
            throw error;
        }
    }

    async findByDetails(puntoDeVenta, idEmpresa, numeroComprobanteInterno) {
        if (!mongoose.Types.ObjectId.isValid(idEmpresa)) {
            throw new Error('ID de empresa inválido para buscar por detalles.');
        }

        return await Ticket.findOne({
            puntoDeVenta: puntoDeVenta,
            idEmpresa: idEmpresa,
            numeroComprobanteInterno: numeroComprobanteInterno
        });
    }

   
    async findByEmpresaId(idEmpresa) {
        if (!mongoose.Types.ObjectId.isValid(idEmpresa)) {
            throw new Error('ID de empresa inválido para la búsqueda por empresa.');
        }
        return await Ticket.find({ idEmpresa: idEmpresa }).exec();
    }
}

export default new TicketEmitidoRepository();