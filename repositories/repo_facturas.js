import {FacturaEmitida} from "../models/index.js";

class FacturaEmitidaRepository{
     // Crea un nuevo usuario en la base de datos
     async create(FacturaEmitidaData) {
        const newFacturaEmitida = new FacturaEmitida(FacturaEmitidaData);
        return await newFacturaEmitida.save();
    }

    async update(id, updateData) {
        return await FacturaEmitida.findByIdAndUpdate(id, updateData, { new: true });
    }

    async delete(id) {
        return await FacturaEmitida.findByIdAndDelete(id);
    } 
    async findById(id) {
        return await FacturaEmitida.findById(id);
    }

     
    //conseguir el ultimo numero de comprobante interno
     async findLastComprobanteInterno(empresaId, puntoDeVentaId) {
       // console.log("Desde repositories (findLastComprobanteInterno): Empresa ID:", empresaId, "Punto de Venta ID:", puntoDeVentaId);

        try {
            const lastFactura = await FacturaEmitida.findOne({
                empresa: empresaId,
                puntoDeVenta: puntoDeVentaId
            })
            .sort({ numeroComprobanteInterno: -1 }) // Ordena de forma descendente
            .limit(1) // Limita a un solo resultado (el último)
            .select('numeroComprobanteInterno') // Selecciona solo el campo que te interesa
            .exec(); // Ejecuta la consulta

            // Si se encontró una factura, devuelve su numeroComprobanteInterno,
            // de lo contrario, devuelve 0.
            return lastFactura ? lastFactura.numeroComprobanteInterno : 0;
        } catch (error) {
            console.error("Error al buscar el último comprobante interno por empresa y punto de venta:", error);
            throw error; // Propaga el error para que el controlador lo maneje
        }
    }

    //Buscar numero de comprobante especifico
    async findByDetails(puntoDeVentaId, empresaId, numeroComprobanteInterno) {
        return await FacturaEmitida.findOne({
            puntoDeVenta: puntoDeVentaId,
            empresa: empresaId,
            numeroComprobanteInterno: numeroComprobanteInterno
        });
    }
}

export default new FacturaEmitidaRepository(); 