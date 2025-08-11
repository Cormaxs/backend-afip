import pdfMake from 'pdfmake/build/pdfmake.js';
import pdfFonts from 'pdfmake/build/vfs_fonts.js';
import fs from 'fs';
import path from 'path'; 
import { fileURLToPath } from 'url'; 
import { dirname } from 'path';     

import { createFacturaDocDefinition } from './estructura_pdf.js';

// --- Asigna las fuentes virtuales a pdfMake ---
pdfMake.vfs = pdfFonts.vfs;


const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// --- Función asincrónica principal para generar la factura ---
export async function generateFacturaPdf(datos, id, qrBase64) {
  try {
    // Agrega el Base64 del QR a tus datos de factura
    const datosConQr = {
      ...datos,
      comprobante: {
        ...datos.comprobante,
        qrImage: qrBase64 
      }
    };
    const docDefinition = createFacturaDocDefinition(datosConQr);
    // Crea la instancia del documento PDF.
    const pdfDoc = pdfMake.createPdf(docDefinition);

    // Envuelve la operación pdfDoc.getBuffer en una Promise.
    const outputPath = await new Promise((resolve, reject) => {
      pdfDoc.getBuffer((buffer) => {
        const fileName = `${datos.comprobante.tipo.replace(' ', '_')}_${datos.comprobante.numero}.pdf`;
        const userDirPath = path.join(__dirname, '..', '..','..', 'raiz-users', id, 'facturas-pdf');
        const filePath = path.join(userDirPath, fileName);
        // Asegúrate de que el directorio exista. Si no, lo crea recursivamente.
        fs.mkdirSync(userDirPath, { recursive: true });
        try {
          fs.writeFileSync(filePath, buffer);
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