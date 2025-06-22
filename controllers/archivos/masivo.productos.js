import productoService from '../../services/up-masivo-db/tienda-nube.js'; 
import { Empresa, PuntoDeVenta } from '../../models/index.js'; 
import mongoose from 'mongoose';

/**
 * Controlador para la migración masiva de productos.
 * Maneja la solicitud HTTP, valida los IDs de la empresa y punto de venta,
 * y delega el procesamiento del archivo al servicio.
 */
export const migrarDb = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No se ha subido ningún archivo.' });
    }

    const { empresaId, puntoVentaId } = req.params;
    console.log(`[Controlador] Iniciando para Empresa ID: ${empresaId}, Punto de Venta ID: ${puntoVentaId}`);

    if (!empresaId || !puntoVentaId) {
      return res.status(400).json({ message: 'Se requiere el ID de la empresa y del punto de venta para la migración de productos.' });
    }

    if (!mongoose.Types.ObjectId.isValid(empresaId) || !mongoose.Types.ObjectId.isValid(puntoVentaId)) {
      return res.status(400).json({ message: 'IDs de empresa o punto de venta inválidos.' });
    }

    const existingEmpresa = await Empresa.findById(empresaId);
    if (!existingEmpresa) {
      return res.status(404).json({ message: `Empresa con ID ${empresaId} no encontrada.` });
    }
    const existingPuntoVenta = await PuntoDeVenta.findById(puntoVentaId);
    if (!existingPuntoVenta) {
      return res.status(404).json({ message: `Punto de venta con ID ${puntoVentaId} no encontrado.` });
    }

    const { buffer: fileBuffer, originalname: originalFileName, mimetype: fileMimetype } = req.file;

    // Delega la lógica principal al servicio
    const result = await productoService.migrateProductsFromFile(
      fileBuffer,
      originalFileName,
      fileMimetype,
      empresaId,
      puntoVentaId
    );

    res.status(200).json(result);

  } catch (error) {
    console.error("[Controlador] Error general en migrarDb:", error);

    // Manejo de errores específicos lanzados desde el servicio o generales
    if (error.message.includes('Tipo de archivo no permitido') || error.message.includes('El archivo está vacío')) {
      return res.status(415).json({ message: error.message });
    }
    if (error.message === 'File too large') { // Asumiendo que `multer` podría lanzar esto
      return res.status(413).json({ message: 'El archivo es demasiado grande. El tamaño máximo permitido es 50MB.' });
    }
    if (error.name === 'ValidationError') { // Errores de validación de Mongoose si se detectan en el repo
      const errorsList = Object.keys(error.errors).map(key => error.errors[key].message);
      return res.status(400).json({ message: 'Error de validación de Mongoose al guardar productos.', errors: errorsList });
    }
    if (error.code === 11000) { // Errores de duplicado de MongoDB
      const duplicateKey = Object.keys(error.keyValue)[0];
      return res.status(409).json({
        message: `Error de duplicado: El ${duplicateKey} con valor '${error.keyValue[duplicateKey]}' ya existe.`,
        details: error.keyValue,
      });
    }

    res.status(500).json({ message: 'Error interno del servidor al procesar el archivo o guardar productos.', error: error.message });
  }
};