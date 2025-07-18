// services/facturas-sin-afip/f_sin_afip_crud_services.js
import { createTicketSinAfip as generatePdfTicket } from './create-tiket/estructura-tiket.js';
import fs from 'fs';
import path from 'path';
import TicketEmitidoRepository from "../../repositories/repo_tikets.js";
import {update_product_ventas_services} from "../product_services.js";

export async function createSinAfip(datos, idUsuario, idEmpresa, datosEmpresa) {
    // Validaciones esenciales reincorporadas para asegurar robustez
   // console.log("en services->", datos); // Log para depuración, si es necesario

 //restar la cantidad del producto
        const restado = await update_product_ventas_services(datos);
 // console.log(restado);

    // Configuración de rutas para guardar el PDF
    const projectRoot = path.resolve();
    const userTicketsDir = path.join(projectRoot, 'raiz-users', idUsuario, 'tickets');

    // Crear la carpeta si no existe
    await fs.promises.mkdir(userTicketsDir, { recursive: true });

    // Helper para formatear números, usado para padStart
    const padNumber = (num, length) => String(num).padStart(length, '0');

    // Parseo de fecha y hora
    let parsedFechaHora = new Date(); // Valor por defecto: fecha y hora actuales
    if (datos.fechaHora) {
        const [fechaStr, horaStr] = datos.fechaHora.split(' ');
        const [dia, mes, anio] = fechaStr.split('/');
        const isoLikeDateString = `${anio}-${mes}-${dia}T${horaStr}`;
        const tempDate = new Date(isoLikeDateString);

        if (!isNaN(tempDate.getTime())) { // Si la fecha parseada es válida
            parsedFechaHora = tempDate;
        } else {
            console.warn(`Advertencia: La fecha "${datos.fechaHora}" resultó en "Invalid Date". Usando la fecha actual.`);
        }
    } else {
        console.warn("Advertencia: 'fechaHora' no proporcionada en los datos. Usando la fecha y hora actuales.");
    }

    const puntoDeVentaActual = datos.puntoDeVenta;

    // Generar numeroComprobanteInterno
    const lastComprobanteInterno = await TicketEmitidoRepository.findLastComprobanteInterno(
        idEmpresa,
        puntoDeVentaActual
    );
    const nextComprobanteInterno = lastComprobanteInterno + 1;

    // Generar ventaId (ej: VK20250618-PUNTO_DE_VENTA_ID-0001)
    const ticketDate = parsedFechaHora;
    const year = ticketDate.getFullYear();
    const month = padNumber(ticketDate.getMonth() + 1, 2);
    const day = padNumber(ticketDate.getDate(), 2);
    const formattedDateForVentaId = `${year}${month}${day}`;

    const lastVentaId = await TicketEmitidoRepository.findLastVentaId(idEmpresa, puntoDeVentaActual);
    let nextVentaIdConsecutive = 1;

    // Si ya existe un ventaId anterior para esta empresa y punto de venta
    if (lastVentaId) {
        const parts = lastVentaId.split('-');
        if (parts.length === 3) {
            const lastDatePart = parts[0].substring(2);
            if (lastDatePart === formattedDateForVentaId && parts[1] === puntoDeVentaActual) {
                nextVentaIdConsecutive = parseInt(parts[2], 10) + 1;
            }
        }
    }

    const formattedVentaIdConsecutive = padNumber(nextVentaIdConsecutive, 4);
    const nextVentaId = `VK${formattedDateForVentaId}-${puntoDeVentaActual}-${formattedVentaIdConsecutive}`;

    // Generar numeroComprobante (ej: 0001-00001234)
    const serieComprobante = datos.numeroComprobante; 

    // EXPLICACIÓN: Buscamos el último comprobante que coincida no solo con la empresa y
    // el punto de venta, sino también con la SERIE que mandó el frontend.
    const lastNumeroComprobante = await TicketEmitidoRepository.findLastNumeroComprobante(
        idEmpresa,
        puntoDeVentaActual,
        serieComprobante // <-- Pasamos la serie del frontend al repositorio
    );
    
    let nextComprobanteNumero = 1;

    // Si encontramos un comprobante anterior CON ESTA MISMA SERIE...
    if (lastNumeroComprobante) {
        const parts = lastNumeroComprobante.split('-');
        if (parts.length === 2) {
            // ...calculamos el siguiente número secuencial. Ya no sobreescribimos la serie.
            nextComprobanteNumero = parseInt(parts[1], 10) + 1;
        }
    }

    // Formateamos y construimos el número de comprobante final.
    const formattedComprobanteNumero = padNumber(nextComprobanteNumero, 8);
    const nextNumeroComprobante = `${serieComprobante}-${formattedComprobanteNumero}`;


    // Preparar datos para el generador de PDF
    const updatedDatosForPdf = {
        ...datos,
        fechaHora: parsedFechaHora.toLocaleDateString('es-AR') + ' ' + parsedFechaHora.toLocaleTimeString('es-AR'),
        ventaId: nextVentaId,
        numeroComprobante: nextNumeroComprobante
    };
    const pdfBuffer = await generatePdfTicket(updatedDatosForPdf, datosEmpresa);

    // Definir nombre y ruta del archivo PDF (simplificado como se solicitó)
    const ticketFileName = `${nextVentaId}.pdf`; // CAMBIO AQUÍ: Nombre del archivo solo con ventaId
    const ticketFilePath = path.join(userTicketsDir, ticketFileName);

    // Guardar el PDF en el archivo
    fs.writeFileSync(ticketFilePath, pdfBuffer);

    // Preparar datos para el repositorio
    const ticketDataForDB = {
        ...datos,
        idEmpresa: idEmpresa,
        puntoDeVenta: puntoDeVentaActual,
        numeroComprobanteInterno: nextComprobanteInterno,
        pdfPath: ticketFilePath,
        ventaId: nextVentaId,
        fechaHora: parsedFechaHora,
        numeroComprobante: nextNumeroComprobante,
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

//busca los tickets en comprobantes
export async function getTiketsCompanyServices(idEmpresa, options) {
    return TicketEmitidoRepository.findByEmpresaId(idEmpresa, options);
}
