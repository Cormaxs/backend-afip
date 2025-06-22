import { Product } from '../models/index.js'; 

class ProductoRepository {
  /**
   * Inserta múltiples productos en la base de datos.
   * Maneja errores de inserción masiva y duplicados.
   * @param {Array<object>} productsToInsert - Array de objetos de datos de producto.
   * @returns {object} Objeto con el conteo de inserciones exitosas y errores de DB.
   */
  async insertManyProducts(productsToInsert) {
    let successfulInsertsCount = 0;
    let dbInsertErrors = [];

    try {
      const result = await Product.insertMany(productsToInsert, { ordered: false });
      successfulInsertsCount = result.length;
      console.log(`[Repo DB] ${successfulInsertsCount} productos insertados exitosamente.`);
    } catch (dbError) {
      console.error("[Repo DB] Error durante la inserción masiva en DB:", dbError);
      if (dbError.code === 11000 && dbError.writeErrors) {
        dbInsertErrors = dbError.writeErrors.map(err => ({
          index: err.index,
          code: err.code,
          message: err.errmsg || err.message,
          op: err.op,
        }));
        successfulInsertsCount = dbError.result && dbError.result.nInserted ? dbError.result.nInserted : 0;
        console.warn(`[Repo DB] Se insertaron ${successfulInsertsCount} productos exitosamente. ${dbInsertErrors.length} fallaron debido a errores de DB (ej. duplicados).`);
      } else {
        throw dbError; // Relanza otros tipos de errores de DB
      }
    }
    return { successfulInsertsCount, dbInsertErrors };
  }
}

export default new ProductoRepository(); 