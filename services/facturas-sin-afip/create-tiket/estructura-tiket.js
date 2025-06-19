// ticketGenerator.js
// Importar pdfmake y vfs_fonts para entorno Node.js (ES6 Modules)
// Asegúrate de tener "type": "module" en tu package.json
import pdfMake from 'pdfmake/build/pdfmake.js';
import * as pdfFonts from 'pdfMake/build/vfs_fonts.js';
pdfMake.vfs = pdfFonts.vfs;

/**
 * Genera un objeto de definición para PDFMake con los datos de un ticket de kiosco.
 * @param {object} datos - Objeto con la información de la venta.
 * @returns {object} Definición del documento PDF para PDFMake.
 */
function generarDefinicionTicket(datos) {
    const {
        ventaId,
        fechaHora,
        puntoDeVenta,
        tipoComprobante,
        numeroComprobante,
        items,
        totales,
        pago,
        cliente, // Opcional
        observaciones, // Opcional
        cajero, // Nuevo: nombre del cajero
        transaccionId, // Nuevo: ID de transacción interna
        sucursal // Nuevo: nombre de sucursal
    } = datos;

    // Calcular el total de ítems
    const totalItemsCount = items.reduce((sum, item) => sum + item.cantidad, 0);

    // --- Función auxiliar para una línea divisoria (ahora más profesional) ---
    const getSeparator = (char = '-', length = 38) => ({
        text: char.repeat(length),
        alignment: 'center',
        fontSize: 6,
        color: '#BBBBBB',
        margin: [0, 2, 0, 2] // Márgenes muy ajustados
    });

    // Contenido de los ítems
    const itemsTableBody = [
        // Encabezado de la tabla
        [{ text: 'CANT.', style: 'tableHeader', alignment: 'center' },
         { text: 'DESCRIPCIÓN', style: 'tableHeader' },
         { text: 'P. UNIT.', style: 'tableHeader', alignment: 'right' },
         { text: 'TOTAL', style: 'tableHeader', alignment: 'right' }]
    ];

    // Filas de los ítems
    items.forEach(item => {
        itemsTableBody.push([
            { text: item.cantidad.toString(), alignment: 'center', fontSize: 7 },
            { text: item.descripcion.toUpperCase(), fontSize: 7 }, // Descripción en mayúsculas
            { text: `${item.precioUnitario.toFixed(2)}`, alignment: 'right', fontSize: 7 }, // Sin "$" aquí, ya está en el total
            { text: `${item.totalItem.toFixed(2)}`, alignment: 'right', fontSize: 7 }
        ]);
    });

    const docDefinition = {
        pageSize: { width: 226.77, height: 'auto' }, // 80mm de ancho (226.77 puntos), altura automática
        pageMargins: [ 8, 8, 8, 8 ], // Márgenes muy pequeños

        content: [
            // --- Encabezado del Comercio ---
            { text: 'MI KIOSCO AMIGO S.A.', style: 'shopHeader', alignment: 'center', margin: [0, 0, 0, 2] },
            { text: 'Av. Siempre Viva 742 - Catamarca, Argentina', alignment: 'center', fontSize: 7, color: '#444444' },
            { text: 'CUIT: 20-12345678-9 | Ing. Brutos: 20-98765432-1', alignment: 'center', fontSize: 7, color: '#444444', margin: [0, 0, 0, 5] },
            { text: `Sucursal: ${sucursal || 'Principal'}`, alignment: 'center', fontSize: 7, color: '#444444', margin: [0, 0, 0, 8] },


            getSeparator('=') , // Separador robusto

            // --- Detalles del Comprobante ---
            {
                columns: [
                    { text: 'TICKET:', bold: true, fontSize: 8.5 },
                    { text: `${tipoComprobante.toUpperCase()}`, fontSize: 8.5, alignment: 'right' }
                ],
                margin: [0, 2, 0, 1]
            },
            {
                columns: [
                    { text: 'Nº COMPROBANTE:', bold: true, fontSize: 8.5 },
                    { text: numeroComprobante, fontSize: 8.5, alignment: 'right' }
                ],
                margin: [0, 0, 0, 1]
            },
            {
                columns: [
                    { text: 'FECHA:', bold: true, fontSize: 7.5, color: '#555555' },
                    { text: fechaHora.split(' ')[0], fontSize: 7.5, alignment: 'right', color: '#555555' } // Solo fecha
                ],
                margin: [0, 0, 0, 1]
            },
            {
                columns: [
                    { text: 'HORA:', bold: true, fontSize: 7.5, color: '#555555' },
                    { text: fechaHora.split(' ')[1], fontSize: 7.5, alignment: 'right', color: '#555555' } // Solo hora
                ],
                margin: [0, 0, 0, 1]
            },
            {
                columns: [
                    { text: 'CAJERO:', bold: true, fontSize: 7.5, color: '#555555' },
                    { text: (cajero || 'N/A').toUpperCase(), fontSize: 7.5, alignment: 'right', color: '#555555' }
                ],
                margin: [0, 0, 0, 1]
            },
            {
                columns: [
                    { text: 'TRANS. ID:', bold: true, fontSize: 7.5, color: '#555555' },
                    { text: (transaccionId || ventaId), fontSize: 7.5, alignment: 'right', color: '#555555' } // Usar ventaId si no hay transaccionId
                ],
                margin: [0, 0, 0, 8]
            },

            getSeparator('-'),

            // --- Tabla de Ítems ---
            {
                table: {
                    widths: ['auto', '*', 'auto', 'auto'],
                    body: itemsTableBody
                },
                layout: {
                    hLineWidth: function(i, node) { return (i === 0 || i === 1 || i === node.table.body.length) ? 0.8 : 0; },
                    vLineWidth: function(i, node) { return 0; },
                    hLineColor: function(i, node) { return '#BBBBBB'; },
                    paddingLeft: function(i, node) { return 2; }, // Reducido el padding
                    paddingRight: function(i, node) { return 2; },
                    paddingTop: function(i, node) { return 3; },
                    paddingBottom: function(i, node) { return 3; }
                },
                margin: [0, 5, 0, 5]
            },

            // Total de ítems
            { text: `TOTAL DE ARTÍCULOS: ${totalItemsCount}`, alignment: 'right', fontSize: 7.5, bold: true, margin: [0, 2, 0, 8] },

            getSeparator('='),

            // --- Totales ---
            {
                columns: [
                    { text: 'SUBTOTAL:', alignment: 'right', bold: true, fontSize: 9.5, color: '#333333' },
                    { text: `$ ${totales.subtotal.toFixed(2)}`, alignment: 'right', bold: true, fontSize: 9.5, color: '#333333' }
                ],
                margin: [0, 0, 0, 2]
            },
            totales.descuento > 0 && {
                columns: [
                    { text: 'DESCUENTO:', alignment: 'right', bold: true, fontSize: 9.5, color: '#E53935' },
                    { text: `- $ ${totales.descuento.toFixed(2)}`, alignment: 'right', bold: true, fontSize: 9.5, color: '#E53935' }
                ],
                margin: [0, 0, 0, 2]
            },
            { canvas: [{ type: 'line', x1: 120, y1: 0, x2: 206.77, y2: 0, lineWidth: 0.7, lineColor: '#666666' }], margin: [0, 3, 0, 3] }, // Línea bajo el subtotal
            {
                columns: [
                    { text: 'TOTAL A PAGAR', alignment: 'right', bold: true, fontSize: 14, color: '#000000' },
                    { text: `$ ${totales.totalPagar.toFixed(2)}`, alignment: 'right', bold: true, fontSize: 14, color: '#000000' }
                ],
                margin: [0, 5, 0, 10]
            },

            getSeparator('='),

            // --- Información de Pago ---
            {
                columns: [
                    { text: 'MÉTODO DE PAGO:', bold: true, fontSize: 8.5 },
                    { text: pago.metodo.toUpperCase(), fontSize: 8.5, alignment: 'right' }
                ],
                margin: [0, 0, 0, 2]
            },
            pago.metodo === 'Efectivo' && pago.montoRecibido !== undefined && {
                columns: [
                    { text: 'MONTO RECIBIDO:', bold: true, fontSize: 8.5 },
                    { text: `$ ${pago.montoRecibido.toFixed(2)}`, fontSize: 8.5, alignment: 'right' }
                ],
                margin: [0, 0, 0, 2]
            },
            pago.metodo === 'Efectivo' && pago.cambio !== undefined && {
                columns: [
                    { text: 'CAMBIO:', bold: true, fontSize: 8.5 },
                    { text: `$ ${pago.cambio.toFixed(2)}`, fontSize: 8.5, alignment: 'right' }
                ],
                margin: [0, 0, 0, 8]
            },

            cliente && getSeparator('-'),
            // --- Información del Cliente (Opcional) ---
            cliente && cliente.nombre && {
                text: 'CLIENTE:',
                fontSize: 8.5,
                bold: true,
                margin: [0, 5, 0, 2],
                color: '#444444'
            },
            cliente && cliente.nombre && {
                columns: [
                    { text: 'Nombre:', fontSize: 7.5, color: '#555555' },
                    { text: cliente.nombre.toUpperCase(), fontSize: 7.5, alignment: 'right', color: '#555555' }
                ],
                margin: [0, 0, 0, 1]
            },
            cliente && cliente.dniCuit && {
                columns: [
                    { text: 'DNI/CUIT:', fontSize: 7.5, color: '#555555' },
                    { text: cliente.dniCuit, fontSize: 7.5, alignment: 'right', color: '#555555' }
                ],
                margin: [0, 0, 0, 1]
            },
            cliente && cliente.condicionIVA && {
                columns: [
                    { text: 'IVA:', fontSize: 7.5, color: '#555555' },
                    { text: cliente.condicionIVA.toUpperCase(), fontSize: 7.5, alignment: 'right', color: '#555555' }
                ],
                margin: [0, 0, 0, 5]
            },

            observaciones && getSeparator('-'),
            // --- Observaciones (Opcional) ---
            observaciones && {
                text: 'OBSERVACIONES:',
                fontSize: 8.5,
                bold: true,
                margin: [0, 5, 0, 2],
                color: '#444444'
            },
            observaciones && {
                text: observaciones,
                fontSize: 7.5,
                margin: [0, 0, 0, 10],
                color: '#555555'
            },

            getSeparator('='),

            // --- Pie de Página Profesional ---
            { text: '¡GRACIAS POR SU COMPRA!', style: 'footerGracias', alignment: 'center', margin: [0, 5, 0, 2] },
            { text: 'Visite nuestro sitio web para ofertas exclusivas.', alignment: 'center', fontSize: 7.5, color: '#555555', margin: [0, 0, 0, 2] },
            { text: 'Conserve este ticket para cambios o devoluciones.', alignment: 'center', fontSize: 7.5, color: '#555555', margin: [0, 0, 0, 5] },
            { text: 'Horario de atención: 9:00 a 21:00 hs.', alignment: 'center', fontSize: 7, color: '#777777', margin: [0, 0, 0, 2] },
            { text: 'Línea de atención al cliente: 0800-KIOSCO (5467)', alignment: 'center', fontSize: 7, color: '#777777', margin: [0, 0, 0, 5] },
            { text: 'Cód. Verif. ' + ventaId.split('-')[1] + fechaHora.replace(/[^0-9]/g, ''), alignment: 'center', fontSize: 6, color: '#999999', margin: [0, 5, 0, 0] },
            
            // --- ATRIBUCIÓN FACSTOCK ---
            { text: 'Sistema de Facturación desarrollado por Facstock.com', alignment: 'center', fontSize: 6, color: '#888888', margin: [0, 5, 0, 0] }
        ],
        styles: {
            shopHeader: {
                fontSize: 14,
                bold: true,
                color: '#333333'
            },
            tableHeader: {
                bold: true,
                fontSize: 7.5,
                color: 'black',
                fillColor: '#DDDDDD', // Un gris un poco más oscuro para el encabezado de la tabla
                alignment: 'left', // Alineación a la izquierda por defecto para coherencia
                paddingBottom: 4
            },
            footerGracias: {
                fontSize: 10.5,
                bold: true,
                color: '#000000'
            }
        },
        defaultStyle: {
            fontSize: 7.5,
            color: '#333333'
        }
    };

    return docDefinition;
}

/**
 * Función principal para crear un ticket PDF sin integración con AFIP.
 * Recibe los datos y devuelve una Promesa que resuelve con el Buffer del PDF.
 * NO GUARDA EL ARCHIVO, solo lo genera.
 * @param {object} datos - Objeto con la información de la venta.
 * @returns {Promise<Buffer>} Una promesa que resuelve con el Buffer del PDF generado.
 */
export async function createTicketSinAfip(datos) {
    return new Promise((resolve, reject) => {
        try {
            const docDefinition = generarDefinicionTicket(datos);
            const pdfDoc = pdfMake.createPdf(docDefinition);

            pdfDoc.getBuffer((buffer) => {
                resolve(buffer);
            });
        } catch (error) {
            console.error('Error al generar el ticket PDF:', error);
            reject(error);
        }
    });
}