import {Caja} from "../models/index.js";
import {User} from "../models/index.js";

class CajaRepository{

    async findById(cajaId) {
        return await Caja.findById(cajaId).exec();
    }

    async findByIdEmpresa(empresaId, options = {}) {
        // 1. Desestructurar opciones (se añade 'estado')
        const {
            page = 1,
            limit = 10,
            sortBy,
            order,
            puntoVenta,
            vendedor,
            fechaDesde,
            fechaHasta,
            estado // <-- AÑADIDO: puede ser 'abierta', 'cerrada' o undefined/null para 'todas'
        } = options;
    
        // 2. Construir la consulta base
        const query = { empresa: empresaId };
    
        try {
            // 3. Añadir filtros a la consulta dinámicamente
    
            // --- Filtro por Vendedor (búsqueda por nombre) ---
            if (vendedor) {
                const vendedorIds = await User.find({
                    nombre: new RegExp(vendedor, 'i')
                }).select('_id');
                
                if (vendedorIds.length > 0) {
                    query.vendedorAsignado = { $in: vendedorIds.map(u => u._id) };
                } else {
                    return { cajas: [], pagination: { totalDocs: 0, totalPages: 0, currentPage: 1 } };
                }
            }
    
            // --- Filtro por Punto de Venta ---
            if (puntoVenta) {
                query.puntoDeVenta = puntoVenta;
            }
    
            // --- Filtro por Estado (Abierta / Cerrada) ---  // <-- SECCIÓN AÑADIDA
            if (estado) {
                if (estado === 'abierta') {
                    // Si la caja está abierta, 'fechaCierre' no debe existir.
                    query.fechaCierre = { $exists: false };
                } else if (estado === 'cerrada') {
                    // Si la caja está cerrada, 'fechaCierre' debe existir.
                    query.fechaCierre = { $exists: true };
                }
                // Si 'estado' es cualquier otro valor ('todas', etc.), no se aplica este filtro.
            }
    
            // --- Filtro por Rango de Fechas ---
            const dateFilter = {};
            if (fechaDesde) {
                dateFilter.$gte = new Date(fechaDesde);
            }
            if (fechaHasta) {
                const endDate = new Date(fechaHasta);
                endDate.setUTCHours(23, 59, 59, 999);
                dateFilter.$lte = endDate;
            }
    
            if (Object.keys(dateFilter).length > 0) {
                query.fechaApertura = dateFilter;
            }
    
            // 4. Ejecutar la consulta con paginación, orden y 'populate'
            const totalDocs = await Caja.countDocuments(query);
            
            let cajasQuery = Caja.find(query)
                .populate('puntoDeVenta', 'nombre')
                .populate('vendedorAsignado', 'nombre')
                .skip((page - 1) * limit)
                .limit(parseInt(limit));
    
            // Aplicar ordenamiento
            const sortOptions = {};
            if (sortBy) {
                sortOptions[sortBy] = order === 'desc' ? -1 : 1;
            } else {
                sortOptions['fechaApertura'] = -1;
            }
            cajasQuery = cajasQuery.sort(sortOptions);
    
            const cajas = await cajasQuery.exec();
    
            // 5. Calcular y devolver la paginación junto con los resultados
            const totalPages = Math.ceil(totalDocs / limit);
            const currentPage = parseInt(page);
    
            return {
                cajas,
                pagination: {
                    totalDocs,
                    totalPages,
                    currentPage,
                    limit: parseInt(limit),
                    hasNextPage: currentPage < totalPages,
                    hasPrevPage: currentPage > 1,
                    nextPage: currentPage < totalPages ? currentPage + 1 : null,
                    prevPage: currentPage > 1 ? currentPage - 1 : null,
                }
            };
    
        } catch (error) {
            console.error(`Error en CajaRepository.findByIdEmpresa (${empresaId}):`, error.message);
            throw new Error(`No se pudieron obtener las cajas por empresa: ${error.message}`);
        }
    }


    async abrirCaja(datos){
        const { empresa, puntoDeVenta, vendedorAsignado, montoInicial, fechaApertura, nombreCaja } = datos;
        try {
            // Crear una nueva instancia del modelo Caja
            const nuevaCaja = new Caja({
                empresa,
                puntoDeVenta,
                vendedorAsignado,
                montoInicial,
                nombreCaja,
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