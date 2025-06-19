// create-tiket/create-sin-afip.js
import { createTicketSinAfip as generatePdfTicket } from './create-tiket/estructura-tiket.js';
import fs from 'fs';
import path from 'path';
import TicketEmitidoRepository from "../../repositories/repo_tikets.js";
import mongoose from 'mongoose';

/**
 * Genera un ticket PDF sin integración con AFIP, lo guarda y registra la información en la base de datos.
 *
 * @param {object} datos - Objeto con la información de la venta para el ticket.
 * @param {string} idUsuario - El ID del usuario asociado a la ruta de guardado del PDF.
 * @param {string} idEmpresa - El ID de la empresa emisora del ticket.
 * @returns {Promise<object>} Información del ticket guardado (ruta PDF, ID de DB, números generados).
 */
export async function createSinAfip(datos, idUsuario, idEmpresa) {
    // Validaciones iniciales
    console.log("en services->", datos)
    if (!idUsuario) {
        throw new Error('ID de usuario es requerido para guardar el PDF.');
    }
    if (!idEmpresa || !mongoose.Types.ObjectId.isValid(idEmpresa)) {
        throw new Error('ID de empresa válido es requerido.');
    }

    // Configuración de rutas
    const projectRoot = path.resolve();
    const userTicketsDir = path.join(projectRoot, 'raiz-users', idUsuario, 'tickets');

    // Crear la carpeta si no existe
    await fs.promises.mkdir(userTicketsDir, { recursive: true });

    // Parseo de fecha y hora
    let parsedFechaHora;
    if (datos.fechaHora) {
        const [fechaStr, horaStr] = datos.fechaHora.split(' '); 
        const [dia, mes, anio] = fechaStr.split('/'); 
        const isoLikeDateString = `${anio}-${mes}-${dia}T${horaStr}`;
        parsedFechaHora = new Date(isoLikeDateString);

        if (isNaN(parsedFechaHora.getTime())) {
            console.warn(`Advertencia: La fecha "${datos.fechaHora}" resultó en "Invalid Date". Usando la fecha actual.`);
            parsedFechaHora = new Date();
        }
    } else {
        parsedFechaHora = new Date();
    }

    const puntoDeVentaActual = datos.puntoDeVenta;

    // Generar numeroComprobanteInterno
    const lastComprobanteInterno = await TicketEmitidoRepository.findLastComprobanteInterno(
        idEmpresa,
        puntoDeVentaActual
    );
    const nextComprobanteInterno = lastComprobanteInterno + 1;

    // Generar ventaId (ej: VK20250618-0001)
    const ticketDate = parsedFechaHora;
    const year = ticketDate.getFullYear();
    const month = String(ticketDate.getMonth() + 1).padStart(2, '0');
    const day = String(ticketDate.getDate()).padStart(2, '0');
    const formattedDateForVentaId = `${year}${month}${day}`;

    const lastVentaId = await TicketEmitidoRepository.findLastVentaId(idEmpresa, puntoDeVentaActual);
    let nextVentaIdConsecutive = 1;
    if (lastVentaId) {
        const parts = lastVentaId.split('-');
        if (parts.length === 2) {
            const lastDatePart = parts[0].substring(2);
            if (lastDatePart === formattedDateForVentaId) {
                nextVentaIdConsecutive = parseInt(parts[1], 10) + 1;
            }
        }
    }
    const formattedVentaIdConsecutive = String(nextVentaIdConsecutive).padStart(4, '0');
    const nextVentaId = `VK${formattedDateForVentaId}-${formattedVentaIdConsecutive}`;

    // Generar numeroComprobante (ej: 0001-00001234)
    const lastNumeroComprobante = await TicketEmitidoRepository.findLastNumeroComprobante(
        idEmpresa,
        puntoDeVentaActual
    );
    let nextComprobanteNumero = 1;
    let serieComprobante = '0001'; 

    if (lastNumeroComprobante) {
        const parts = lastNumeroComprobante.split('-');
        if (parts.length === 2) {
            serieComprobante = parts[0]; 
            nextComprobanteNumero = parseInt(parts[1], 10) + 1;
        }
    }
    const formattedComprobanteNumero = String(nextComprobanteNumero).padStart(8, '0');
    const nextNumeroComprobante = `${serieComprobante}-${formattedComprobanteNumero}`;

    // Preparar datos para el generador de PDF
    const updatedDatosForPdf = {
        ...datos, 
        ventaId: nextVentaId, 
        numeroComprobante: nextNumeroComprobante 
    };
    const pdfBuffer = await generatePdfTicket(updatedDatosForPdf);

    // Definir nombre y ruta del archivo PDF
    const ticketFileName = `ticket_${nextVentaId}.pdf`;
    const ticketFilePath = path.join(userTicketsDir, ticketFileName);

    // Guardar el PDF en el archivo
    fs.writeFileSync(ticketFilePath, pdfBuffer);

    // Preparar datos para el repositorio
    const ticketDataForDB = {
        idEmpresa: idEmpresa,
        puntoDeVenta: puntoDeVentaActual,
        numeroComprobanteInterno: nextComprobanteInterno,
        pdfPath: ticketFilePath,

        ventaId: nextVentaId,
        fechaHora: parsedFechaHora, 
        tipoComprobante: datos.tipoComprobante,
        numeroComprobante: nextNumeroComprobante,

        items: datos.items,
        totales: datos.totales,
        pago: datos.pago,
        cliente: datos.cliente,
        observaciones: datos.observaciones,
        cajero: datos.cajero,
        transaccionId: datos.transaccionId,
        sucursal: datos.sucursal,
    };

    // Guardar los datos del ticket en la base de datos
    const savedTicketInDB = await TicketEmitidoRepository.create(ticketDataForDB);

    // Devolver la respuesta
    return {
        message: "Ticket generado, guardado y registrado exitosamente.",
        pdfFilePath: ticketFilePath,
        databaseRecordId: savedTicketInDB._id,
        numeroComprobanteInterno: nextComprobanteInterno,
        ventaId: nextVentaId,
        numeroComprobante: nextNumeroComprobante
    };
}


export async function getTiketsCompanyServices(idEmpresa){
    return TicketEmitidoRepository.findByEmpresaId(idEmpresa);
}