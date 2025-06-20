// services/facturas-sin-afip/f_sin_afip_crud_services.js
import { createTicketSinAfip as generatePdfTicket } from './create-tiket/estructura-tiket.js';
import fs from 'fs';
import path from 'path';
import TicketEmitidoRepository from "../../repositories/repo_tikets.js";

export async function createSinAfip(datos, idUsuario, idEmpresa, datosEmpresa) {
    // Validación clave de los ítems de la venta
    if (!datos.items || !Array.isArray(datos.items) || datos.items.length === 0) {
        console.error("Error de validación: 'items' no es un array válido o está vacío en los datos recibidos:", JSON.stringify(datos, null, 2));
        throw new Error("Los ítems de la venta son requeridos y deben ser un array no vacío.");
    }

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
        // Si datos.fechaHora no se proporciona, ya parsedFechaHora es new Date(),
        // pero podemos emitir una advertencia si se espera una fecha.
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
        // El formato esperado ahora es VKYYYYMMDD-PUNTO_DE_VENTA_ID-####
        // por lo tanto, esperamos 3 partes
        if (parts.length === 3) {
            const lastDatePart = parts[0].substring(2); // 'YYYYMMDD' de 'VKYYYYMMDD'
            // Comprobamos si la fecha del último ventaId coincide con la fecha actual
            // y si el punto de venta coincide (aunque el repo ya lo filtra, es una doble seguridad)
            if (lastDatePart === formattedDateForVentaId && parts[1] === puntoDeVentaActual) {
                nextVentaIdConsecutive = parseInt(parts[2], 10) + 1; // El consecutivo es la tercera parte
            }
        }
        // Si el formato del lastVentaId no es el esperado, el consecutivo se reinicia a 1
        // (esto es útil si cambias el formato o si hay datos antiguos)
    }

    const formattedVentaIdConsecutive = padNumber(nextVentaIdConsecutive, 4);
    // Nuevo formato para ventaId: VKYYYYMMDD-ID_PUNTO_DE_VENTA-CONSECUTIVO
    const nextVentaId = `VK${formattedDateForVentaId}-${puntoDeVentaActual}-${formattedVentaIdConsecutive}`;

    // Generar numeroComprobante (ej: 0001-00001234)
    const lastNumeroComprobante = await TicketEmitidoRepository.findLastNumeroComprobante(
        idEmpresa,
        puntoDeVentaActual
    );
    let nextComprobanteNumero = 1;
    let serieComprobante = '0001'; // Valor por defecto

    if (lastNumeroComprobante) {
        const parts = lastNumeroComprobante.split('-');
        if (parts.length === 2) {
            serieComprobante = parts[0];
            nextComprobanteNumero = parseInt(parts[1], 10) + 1;
        }
    }
    const formattedComprobanteNumero = padNumber(nextComprobanteNumero, 8);
    const nextNumeroComprobante = `${serieComprobante}-${formattedComprobanteNumero}`;

    // Preparar datos para el generador de PDF
    const updatedDatosForPdf = {
        ...datos, // Esto ya incluye 'items' si 'datos' original los tenía
        // Formatea parsedFechaHora a string para el PDF, ya que `estructura-tiket.js` lo espera así.
        fechaHora: parsedFechaHora.toLocaleDateString('es-AR') + ' ' + parsedFechaHora.toLocaleTimeString('es-AR'),
        ventaId: nextVentaId,
        numeroComprobante: nextNumeroComprobante
    };
    const pdfBuffer = await generatePdfTicket(updatedDatosForPdf, datosEmpresa);

    // Definir nombre y ruta del archivo PDF incluyendo el punto de venta
    const ticketFileName = `ticket_PDV-${puntoDeVentaActual}_${nextVentaId}.pdf`;
    const ticketFilePath = path.join(userTicketsDir, ticketFileName);

    // Guardar el PDF en el archivo
    fs.writeFileSync(ticketFilePath, pdfBuffer);

    // Preparar datos para el repositorio
    const ticketDataForDB = {
        ...datos, // Propagamos todas las propiedades existentes de 'datos'
        idEmpresa: idEmpresa,
        puntoDeVenta: puntoDeVentaActual, // Aseguramos que esté presente
        numeroComprobanteInterno: nextComprobanteInterno,
        pdfPath: ticketFilePath,
        ventaId: nextVentaId,
        fechaHora: parsedFechaHora, // Se guarda como objeto Date en la DB
        numeroComprobante: nextNumeroComprobante,
        // Los campos como 'items', 'totales', 'pago', 'cliente', etc., ya son parte de 'datos'
        // y se incluyen automáticamente con el spread operator '...datos'.
        // Solo sobrescribimos o añadimos aquí lo que es específico de este servicio.
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
