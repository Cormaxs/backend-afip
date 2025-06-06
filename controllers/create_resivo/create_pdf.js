import pdfMake from 'pdfmake/build/pdfmake.js';
import pdfFonts from 'pdfmake/build/vfs_fonts.js';
import fs from 'fs';
import { createFacturaDocDefinition } from './estructura_pdf.js'; // Asumo que renombraste facturaDefinition.js a estructura_pdf.js


// --- Asigna las fuentes virtuales a pdfMake ---
pdfMake.vfs = pdfFonts.vfs;

// --- Función asincrónica principal para generar la factura ---
export async function generateFacturaPdf(datos, qrBase64) {
  try {
    

    // Agrega el Base64 del QR a tus datos de factura
    const datosConQr = {
      ...datos,
      comprobante: {
        ...datos.comprobante,
        qrImage: qrBase64 // Añadimos la imagen del QR aquí
      }
    };

    // 1. Llama a la función `createFacturaDocDefinition` pasándole los datos CON el QR.
    const docDefinition = createFacturaDocDefinition(datosConQr);

    // 2. Crea la instancia del documento PDF.
    const pdfDoc = pdfMake.createPdf(docDefinition);

    // 3. Envuelve la operación pdfDoc.getBuffer en una Promise.
    // Esto nos permite usar 'await' y esperar a que el PDF se genere y guarde.
    const outputPath = await new Promise((resolve, reject) => {
      pdfDoc.getBuffer((buffer) => {
        const filePath = `./facturas-pdf/factura${datos.comprobante.tipo.replace(' ', '_')}_${datos.comprobante.numero}.pdf`;
        try {
          fs.writeFileSync(filePath, buffer);
          console.log(`PDF de factura generado y guardado en: ${filePath}`);
          resolve(filePath); // Resuelve la promesa con la ruta del archivo cuando esté listo
        } catch (err) {
          console.error('Error al escribir el archivo PDF:', err);
          reject(err); // Rechaza la promesa si hay un error al escribir
        }
      });
    });

    return outputPath;
  } catch (error) {
    console.error('Error general al generar la factura:', error);
    throw error; // Relanzamos el error para que quien llame a la función pueda manejarlo
  }
}

// --- Ejemplo de cómo llamar a la función desde otra parte de tu código ---
// Importa tus datos de ejemplo desde donde los tengas definidos
// Por ejemplo, si los tienes en un archivo `datosFactura.js`:
// import { datosFacturaEjemplo } from './datosFactura.js';

