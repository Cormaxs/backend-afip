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

    //busca tickets por id
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

    //busca la ultima venta
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
    //busca el ultimo comprobante
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

    //busca por punto de venta
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

   //busca tickets por ID de empresa con paginación y ordenamiento
    async findByEmpresaId(idEmpresa, options = {}) {
        // Validar el ID de la empresa
        if (!mongoose.Types.ObjectId.isValid(idEmpresa)) {
            throw new Error('ID de empresa inválido para la búsqueda por empresa.');
        }

        const { page = 1, limit = 10, sortBy, order } = options;
        const query = { idEmpresa: idEmpresa }; // Filtra por el ID de la empresa

        // 1. Obtener el total de Tickets que coinciden con la consulta
        const totalTickets = await Ticket.countDocuments(query);

        let ticketsQuery = Ticket.find(query)
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        // Opcional: Añadir lógica de ordenamiento si la necesitas
        if (sortBy) {
            const sortOrder = order === 'desc' ? -1 : 1;
            ticketsQuery = ticketsQuery.sort({
                [sortBy]: sortOrder
            });
        }

        const tickets = await ticketsQuery.exec();

        // 2. Calcular la información de paginación
        const totalPages = Math.ceil(totalTickets / limit);
        const currentPage = parseInt(page);
        const hasNextPage = currentPage < totalPages;
        const hasPrevPage = currentPage > 1;
        const nextPage = hasNextPage ? currentPage + 1 : null;
        const prevPage = hasPrevPage ? currentPage - 1 : null;

        // 3. Devolver los Tickets y la información de paginación
        return {
            tickets,
            pagination: {
                totalTickets,
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

}

export default new TicketEmitidoRepository();