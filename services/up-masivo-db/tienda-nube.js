import * as XLSX from 'xlsx';
import mongoose from 'mongoose';
import productoRepository from '../../repositories/repo_up_masiva_db.js'; // Importa el repositorio

/**
 * Función auxiliar para convertir valores a números de forma segura.
 * Si el valor no es un número válido, devuelve el defaultValue.
 * Si el valor es negativo, lo convierte a 0 (especialmente útil para stock).
 *
 */
const safeNumber = (value, defaultValue = 0) => {
  const num = Number(value);
  if (isNaN(num)) {
    return defaultValue;
  }
  if (num < 0) {
    return 0;
  }
  return num;
};

/**
 * Función auxiliar para obtener el valor de la columna, manejando mayúsculas/minúsculas.
 */
const getColumnValue = (rowObj, columnNames) => {
  for (const name of columnNames) {
    if (rowObj[name] !== undefined) {
      return rowObj[name];
    }
  }
  return undefined;
};

/**
 * Procesa una fila de datos del archivo y la mapea a un objeto ProductData.
 * Realiza validaciones críticas para campos requeridos por el esquema.
 */
const processProductData = (row, empresaId, puntoVentaId, rowNumber) => {
  const errors = [];

  const newProductData = {
    empresa: new mongoose.Types.ObjectId(empresaId),
    puntoVenta: puntoVentaId ? new mongoose.Types.ObjectId(puntoVentaId) : undefined,

    codigoInterno: String(getColumnValue(row, ['codigointerno', 'Identificador de URL']) || '0').trim(),
    codigoBarra: safeNumber(getColumnValue(row, ['SKU'])),

    producto: String(getColumnValue(row, ['Nombre']) || '').trim(), 
    descripcion: String(getColumnValue(row, ['Descripcion']) || '').trim(),
    marca: String(getColumnValue(row, ['Marca']) || '').trim(),
    categoria: String(getColumnValue(row, ['Categorias', 'categoria']) || '').trim(),
    
    unidadMedida: String(getColumnValue(row, ['unidadmedida', 'UnidadMedida']) || '94').trim(),
    
    ancho_cm: safeNumber(getColumnValue(row, ['ancho', 'Ancho'])),
    alto_cm: safeNumber(getColumnValue(row, ['alto', 'Alto'])),
    profundidad_cm: safeNumber(getColumnValue(row, ['profundidad', 'Profundidad'])),
    peso_kg: safeNumber(getColumnValue(row, ['pesokg', 'Peso'])),

    precioCosto: safeNumber(getColumnValue(row, ['precio', 'Precio'])),
    precioLista: safeNumber(getColumnValue(row, ['preciolista', 'PrecioLista'])),
    alic_IVA: safeNumber(getColumnValue(row, ['aliciva', 'AlicIVA', 'IVA']), 21),
    markupPorcentaje: safeNumber(getColumnValue(row, ['markupporcentaje', 'MarkupPorcentaje']), 0),

    stock_disponible: safeNumber(getColumnValue(row, ['stock', 'Stock'])),
    stockMinimo: safeNumber(getColumnValue(row, ['stockminimo', 'StockMinimo']), 0),
    ubicacionAlmacen: String(getColumnValue(row, ['ubicacionalmacen', 'UbicacionAlmacen']) || '').trim(),
    activo: (getColumnValue(row, ['activo', 'Mostrar en tienda']) !== undefined && String(getColumnValue(row, ['activo', 'Mostrar en tienda'])).toLowerCase() === 'no') ? false : true,
  };

  if (newProductData.precioLista === 0 || newProductData.precioLista === undefined) {
    newProductData.precioLista = newProductData.precioCosto;
  }
  
  if (!newProductData.producto || newProductData.producto.length < 3) {
    errors.push(`'producto' (Nombre) es obligatorio y debe tener al menos 3 caracteres.`);
  }
  if (!newProductData.categoria || newProductData.categoria.length < 2) {
    errors.push(`'categoria' (Categorias) es obligatoria y debe tener al menos 2 caracteres.`);
  }
  if (isNaN(newProductData.precioCosto) || newProductData.precioCosto < 0) {
    errors.push(`'precioCosto' (Precio) es obligatorio y debe ser un número no negativo.`);
  }
  if (isNaN(newProductData.alic_IVA) || newProductData.alic_IVA < 0 || newProductData.alic_IVA > 100) {
    errors.push(`'alic_IVA' es obligatoria y debe ser un número entre 0 y 100.`);
  }
  if (isNaN(newProductData.stock_disponible)) {
    errors.push(`'stock_disponible' (Stock) es obligatorio y debe ser un número.`);
  }

  if (errors.length > 0) {
    return { product: null, errors: `Fila ${rowNumber}: ${errors.join('; ')}. Datos originales: ${JSON.stringify(row)}` };
  }

  return { product: newProductData, errors: null };
};

/**
 * Servicio para la migración de productos desde un archivo.
 */
class ProductoService {
  constructor(productoRepository) {
    this.productoRepository = productoRepository;
  }

  /**
   * Procesa un archivo de productos para su migración a la base de datos.
   */
  async migrateProductsFromFile(fileBuffer, originalFileName, fileMimetype, empresaId, puntoVentaId) {
    console.log(`[Servicio DB] Archivo recibido: ${originalFileName} (Tipo: ${fileMimetype})`);

    let jsonData;

    if (
      fileMimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || // .xlsx
      fileMimetype === 'application/vnd.ms-excel' // .xls
    ) {
      const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      jsonData = XLSX.utils.sheet_to_json(worksheet);
    } else if (fileMimetype === 'text/csv') {
      const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      jsonData = XLSX.utils.sheet_to_json(worksheet);
    } else {
      throw new Error('Tipo de archivo no permitido. Solo se aceptan archivos Excel (.xlsx, .xls) o CSV (.csv).');
    }

    if (jsonData.length === 0) {
      throw new Error('El archivo está vacío o no contiene datos procesables.');
    }

    console.log(`[Servicio DB] Filas leídas del archivo: ${jsonData.length}. Primeras 3 filas procesadas:`, jsonData.slice(0, 3));

    const productsToInsert = [];
    const validationErrors = [];

    for (let i = 0; i < jsonData.length; i++) {
      const row = jsonData[i];
      const rowNumber = i + 2; // +2 porque la fila 1 es el encabezado y el índice comienza en 0

      const { product, errors } = processProductData(row, empresaId, puntoVentaId, rowNumber);

      if (product) {
        productsToInsert.push(product);
      } else if (errors) {
        validationErrors.push(errors);
      }
    }

    if (productsToInsert.length === 0) {
      return {
        message: 'No se pudieron procesar productos válidos para insertar.',
        totalRecordsInFile: jsonData.length,
        recordsAttemptedToInsert: 0,
        recordsProcessedSuccessfully: 0,
        validationErrors: validationErrors,
        dbInsertErrors: [],
      };
    }

    const { successfulInsertsCount, dbInsertErrors } = await this.productoRepository.insertManyProducts(productsToInsert);

    return {
      message: `Migración de productos finalizada.`,
      totalRecordsInFile: jsonData.length,
      recordsAttemptedToInsert: productsToInsert.length,
      recordsProcessedSuccessfully: successfulInsertsCount,
      validationErrors: validationErrors,
      dbInsertErrors: dbInsertErrors,
    };
  }
}

export default new ProductoService(productoRepository); 