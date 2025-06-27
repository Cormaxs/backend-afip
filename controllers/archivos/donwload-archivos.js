import path from 'path';
import url from 'url'; // Importa el módulo 'url'
import fs from 'fs';   // Importa el módulo 'fs'

// Reemplazo de __dirname para módulos ES
const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function getPdfEmpresa(req, res) {
  try {
    const {idAdmin, ventaId } = req.params;
    const baseDirectory = path.join(__dirname, '..', '..', 'raiz-users');

    // Construye la ruta completa del archivo PDF
    const filename = `${ventaId}.pdf`;
    const filePath = path.join(
      baseDirectory,
      idAdmin,
      'tickets',
      filename
    );

    //console.log('Ruta del archivo solicitada:', filePath);

    // Verifica si el archivo existe
    if (!fs.existsSync(filePath)) {
      console.warn(`Archivo no encontrado: ${filePath}`);
      return res.status(404).send('Archivo PDF no encontrado.');
    }

    // Envía el archivo para descarga
    res.sendFile(filePath, (err) => {
      if (err) {
        console.error('Error al descargar el archivo:', err);
        if (res.headersSent) {
          console.error('Cabeceras ya enviadas, no se puede enviar respuesta de error al cliente.');
        } else {
          res.status(500).send('Error interno del servidor al intentar descargar el archivo.');
        }
      } else {
        console.log('Archivo descargado exitosamente:', filePath);
      }
    });

  } catch (err) {
    console.error('Error en getPdfEmpresa:', err);
    res.status(500).send('Ocurrió un error inesperado en el servidor.');
  }
}