import {Caja} from "../models/index.js";

class CajaRepository{

    async findById(cajaId) {
        return await Caja.findById(cajaId).exec();
    }

    async findByIdEmpresa(empresaId, options = {}) {
        const { page = 1, limit = 10, sortBy, order } = options;
        const query = { empresa: empresaId }; // <-- ¡Clave aquí! Filtrar por el campo 'empresa'

        try {
            // 1. Obtener el total de cajas que coinciden con la consulta
            const totalCajas = await Caja.countDocuments(query);

            let cajasQuery = Caja.find(query)
                .skip((page - 1) * limit)
                .limit(parseInt(limit));

            // Aplicar ordenamiento si se especifica
            if (sortBy) {
                const sortOrder = order === 'desc' ? -1 : 1;
                cajasQuery = cajasQuery.sort({
                    [sortBy]: sortOrder
                });
            }

            const cajas = await cajasQuery.exec();

            // 2. Calcular la información de paginación
            const totalPages = Math.ceil(totalCajas / limit);
            const currentPage = parseInt(page);
            const hasNextPage = currentPage < totalPages;
            const hasPrevPage = currentPage > 1;
            const nextPage = hasNextPage ? currentPage + 1 : null;
            const prevPage = hasPrevPage ? currentPage - 1 : null;

            // 3. Devolver las cajas y la información de paginación
            return {
                cajas,
                pagination: {
                    totalCajas,
                    totalPages,
                    currentPage,
                    limit: parseInt(limit),
                    hasNextPage,
                    hasPrevPage,
                    nextPage,
                    prevPage,
                }
            };

        } catch (error) {
            console.error(`Error en CajaRepository.findByIdEmpresa (${empresaId}):`, error.message);
            throw new Error(`No se pudieron obtener las cajas por empresa: ${error.message}`);
        }
    }


    async abrirCaja(datos){
        const { empresa, puntoDeVenta, vendedorAsignado, montoInicial, fechaApertura } = datos;
        try {
            // Crear una nueva instancia del modelo Caja
            const nuevaCaja = new Caja({
                empresa,
                puntoDeVenta,
                vendedorAsignado,
                montoInicial,
                fechaApertura: fechaApertura || Date.now(), // Si no se proporciona, se usa la fecha actual
                // fechaApertura se establecerá por defecto con Date.now() en el esquema
                // estado se establecerá por defecto como 'Abierta' en el esquema
                // ingresos, egresos, montoFinalEsperado, diferencia, transacciones comenzarán en 0 o vacíos
            });
    
            // Guardar la nueva caja en la base de datos
            const cajaGuardada = await nuevaCaja.save();
    
            console.log(`Caja abierta exitosamente con ID: ${cajaGuardada._id}`);
            return cajaGuardada;
    
        } catch (error) {
            console.error("Error al abrir la caja:", error.message);
            // Puedes lanzar el error original o uno más específico
            throw new Error(`No se pudo abrir la caja: ${error.message}`);
        }
    }


    async cerrarCaja(cajaId, datosCierre) {
        const { montoFinalReal, observacionesCierre, ingresos, egresos } = datosCierre;
        try {
            // 3. Buscar la caja por ID y asegurar que esté abierta
            const caja = await Caja.findById(cajaId);
    
            if (!caja) {
                throw new Error('Caja no encontrada.');
            }
    
            if (caja.estado === 'Cerrada') {
                throw new Error('La caja ya se encuentra cerrada.');
            }
    
            // 5. Calcular el monto final esperado
            caja.montoFinalEsperado = caja.montoInicial + caja.ingresos - caja.egresos;
    
            // 6. Asignar el monto final real y calcular la diferencia
            caja.montoFinalReal = montoFinalReal;
            caja.diferencia = caja.montoFinalReal - caja.montoFinalEsperado;
    
            // 7. Establecer la fecha y el estado de cierre
            caja.fechaCierre = new Date(); // Establece la fecha y hora de cierre actuales
            caja.estado = 'Cerrada';
    
            // 8. Añadir observaciones si existen
            if (observacionesCierre) {
                caja.observacionesCierre = observacionesCierre;
            }
    
            // 9. Guardar los cambios en la base de datos
            const cajaCerrada = await caja.save();
    
            console.log(`Caja ${cajaId} cerrada exitosamente.`);
            return cajaCerrada;
    
        } catch (error) {
            console.error(`Error al cerrar la caja ${cajaId}:`, error.message);
            throw new Error(`No se pudo cerrar la caja: ${error.message}`);
        }
    }


    async agregarTransaccion(cajaId, transaccionData) {
        const { tipo, monto, descripcion, referencia } = transaccionData;

        if (!['ingreso', 'egreso'].includes(tipo)) {
            throw new Error('Tipo de transacción inválido. Debe ser "ingreso" o "egreso".');
        }
        try {
            const caja = await Caja.findById(cajaId);

            if (!caja) {
                throw new Error('Caja no encontrada.');
            }
            if (caja.estado === 'Cerrada') {
                throw new Error('No se pueden agregar transacciones a una caja cerrada.');
            }

            const nuevaTransaccion = {
                tipo,
                monto,
                descripcion,
                fecha: new Date(), // Fecha actual para la transacción
                ...(referencia && { referencia: mongoose.Types.ObjectId(referencia) }) // Agrega referencia si existe
            };

            caja.transacciones.push(nuevaTransaccion);

            // Actualizar los totales de ingresos/egresos de la caja principal
            if (tipo === 'ingreso') {
                caja.ingresos += monto;
            } else if (tipo === 'egreso') {
                caja.egresos += monto;
            }

            // Opcional: Puedes optar por recalcular montoFinalEsperado aquí,
            // o solo al final del cierre. Depende de si quieres que ese campo
            // refleje el estado actual en tiempo real o solo al finalizar.
            // caja.montoFinalEsperado = caja.montoInicial + caja.ingresos - caja.egresos;

            return await caja.save();

        } catch (error) {
            console.error(`Error en CajaRepository.agregarTransaccion (${cajaId}):`, error.message);
            throw new Error(`Error al agregar transacción: ${error.message}`);
        }
    }
}

export default new CajaRepository();