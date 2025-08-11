import { createXML } from "../../services/afip/4/armarXML.js";//convierte a json
import { create_Factura } from "../../services/facturas/ensamblar-pdf.js"; //crea la factura en pdf
import {facEmitidasControllers} from "../../services/facturas/facturas-emitidas-controller.js"; //guarda la factura en la base de datos
import {getNumComprobante, getFacturas_services} from "../../services/facturas/facturas_services.js";
import {update_product_ventas_services} from "../../services/product_services.js"; //actualiza la cantidad de productos vendidos
import { notaDePedidoEmitida } from '../../services/facturas/notas-de-pedido-services.js';
import FacturaEmitidaRepository from "../../repositories/repo_facturas.js";
import fs from 'fs/promises';

export async function facturasCompletaAfip(req, res) {
    try {
        console.log("Datos recibidos en facturaCompleta:", req.body); // Para depuración, puedes eliminarlo en producción
        const { id, afipRequestData, facturaData, idEmpresa,puntoVenta } = req.body; // Desestructuramos para mayor claridad
        // 2. Comunicarse con AFIP para obtener el CAE
        // El `createXML` debería lanzar un error si algo falla en la comunicación o si AFIP no responde.
        const numero = (await getNumComprobante(idEmpresa, puntoVenta)+1);
        //console.log("factura emitida -> ", numero, typeof(numero))
        const aprobarFactura = await createXML(afipRequestData, id, numero); 

        // 3. Verificar la respuesta de AFIP
        const necesario = aprobarFactura?.Envelope?.Body?.FECAESolicitarResponse?.FECAESolicitarResult?.FeDetResp?.FECAEDetResponse;

        // Validar que la estructura de respuesta de AFIP sea la esperada
        if (!necesario || !necesario.Resultado) {
            console.error("Estructura de respuesta inesperada de AFIP:", aprobarFactura);
            return res.status(500).json({
                message: "Error interno al procesar la respuesta de AFIP. La estructura es inesperada.",
                afipResponse: aprobarFactura // Envía la respuesta completa para depuración si es necesario
            });
        }

        if (necesario.Resultado === "A") { // Factura Aprobada por AFIP
            // Asignar el CAE y su fecha de vencimiento
            facturaData.comprobante.cae = necesario.CAE;
            facturaData.comprobante.fechaVtoCae = necesario.CAEFchVto;
            
            // Formatear y asignar el número de comprobante
            const puntoVentaFormateado = String(facturaData.comprobante.puntoVenta).padStart(5, '0');
            const numeroComprobanteFormateado = String(necesario.CbteDesde).padStart(8, '0'); 
            facturaData.comprobante.numero = `${puntoVentaFormateado}-${numeroComprobanteFormateado}`;
            
            // 4.crea pdf y Guardar la factura en tu base de datos
            const facturaGenerada = await create_Factura(facturaData, id);
           // console.log("antes de pasar para base de datos",facturaData)
            await facEmitidasControllers(facturaData, facturaGenerada);
            // 5. Enviar respuesta exitosa al cliente
            return res.status(201).json({ 
                message: "Factura generada y aprobada por AFIP exitosamente.",
                factura: facturaGenerada,
                afipDetails: {
                    cae: necesario.CAE,
                    fechaVtoCae: necesario.CAEFchVto,
                    numeroComprobante: necesario.CbteDesde
                }
            });

        } else { // Factura Rechazada por AFIP
            console.error("La factura fue rechazada por AFIP:", necesario.Observaciones || aprobarFactura);
            return res.status(400).json({
                message: "La factura fue rechazada por AFIP.",
                afipErrors: necesario.Observaciones || [{ Msg: "Razón de rechazo no especificada." }], // Asegura un formato consistente
                afipResponse: aprobarFactura // Puede ser útil para depurar
            });
        }

    } catch (error) {
        // Manejo centralizado de cualquier error que se lance en el `try`
        console.error("Error en facturaCompleta (controlador):", error);

        // Puedes refinar los tipos de errores que atrapas aquí
        if (error.message.includes("Error de comunicación con AFIP") || error.message.includes("WSAA")) {
            return res.status(503).json({ // 503 Service Unavailable
                message: "Problema de comunicación con el servicio de AFIP. Intente de nuevo más tarde.",
                details: error.message
            });
        } else if (error.message.includes("Token o Sign inválido")) { // Ejemplo de un error específico de AFIP
            return res.status(401).json({
                message: "Error de autenticación con AFIP. Revise sus credenciales.",
                details: error.message
            });
        } else if (error.message.includes("No se pudo crear la factura en la base de datos")) { // Si `create_Factura` lanza un error
            return res.status(500).json({
                message: "La factura fue aprobada por AFIP, pero no se pudo guardar en nuestra base de datos.",
                details: error.message
            });
        }
        // Error genérico para cualquier otro caso no manejado específicamente
        return res.status(500).json({
            message: "Ha ocurrido un error inesperado al procesar la factura. Intente de nuevo más tarde.",
            details: error.message // Incluir el mensaje de error para depuración
        });
    }
}




const RECEPTOR_IVA_MAP = {
    'Responsable Inscripto': { condicionIVACodigo: 1, docTipo: 80, docNro: null },
    'Consumidor Final': { condicionIVACodigo: 5, docTipo: 99, docNro: "0" },
    'Monotributista': { condicionIVACodigo: 4, docTipo: 80, docNro: null },
    'Exento': { condicionIVACodigo: 3, docTipo: 80, docNro: null },
};


//genera todas las facturas, tanto con afip y sin afip, pero sin mandar a afip
export async function NotaDePedido(req, res) {
    try {
        console.log("Datos recibidos en notasdepedidos:", req.body);

        // Desestructuración de datos: extraemos los datos de factura y otros campos clave
        const { id, idEmpresa, puntoVenta, facturaData } = req.body;
        
        // El id del vendedor se obtiene directamente del body, no de facturaData.comprobante
        const idVendedor = id;

        if (!idVendedor) {
            return res.status(400).json({
                message: "Falta el ID del vendedor.",
                details: "El campo 'id' es obligatorio para guardar la factura."
            });
        }
       // console.log("comprobante tipo -> ", facturaData.comprobante.tipo)
        // 1. Obtener el siguiente número de comprobante para notas de pedido.
        // Asumiendo que `FacturaEmitidaRepository` tiene una función para esto.


        //antes de crear la factura resto la cantidad de productos
        const restado = await update_product_ventas_services(facturaData);
        console.log("restado -> ", restado, "datos -> ", facturaData);
        const tipoComprobante = facturaData.comprobante.tipo;
        const ultimoNumero = await FacturaEmitidaRepository.findLastNotaDePedidoInterno(idEmpresa, puntoVenta, tipoComprobante);
        const nuevoNumero = ultimoNumero ? parseInt(ultimoNumero) + 1 : 1;
       // console.log("ultimo numero -> ", ultimoNumero, "nuevo numero -> ", nuevoNumero, tipoComprobante);
        // 2. Formatear el número de comprobante.
        const puntoVentaFormateado = String(facturaData.comprobante.puntoVenta).padStart(5, '0');
        const numeroComprobanteFormateado = String(nuevoNumero).padStart(8, '0');
        const numeroComprobanteCompleto = `${puntoVentaFormateado}-${numeroComprobanteFormateado}`;

        // 3. Crear el PDF.
        // Modifica el objeto facturaData en memoria para incluir el nuevo número
        // antes de enviarlo a la función de creación del PDF.
        facturaData.comprobante.numero = numeroComprobanteCompleto;

        // La función `create_Factura` debe devolver la ruta del archivo generado.
        const rutaFactura = await create_Factura(facturaData, idVendedor);

        // --- Mapeo y validación de datos para la base de datos ---
        const receptorCondition = facturaData.receptor?.condicionIVA || 'Consumidor Final';
        const receptorMap = RECEPTOR_IVA_MAP[receptorCondition] || RECEPTOR_IVA_MAP['Consumidor Final'];

        const receptorData = {
            razonSocial: facturaData.receptor?.razonSocial || "Consumidor Final",
            cuit: facturaData.receptor?.cuit || null,
            docTipo: receptorMap.docTipo,
            docNro: facturaData.receptor?.docNro || receptorMap.docNro || "0",
            condicionIVA: receptorCondition,
            condicionIVACodigo: receptorMap.condicionIVACodigo,
            domicilio: facturaData.receptor?.domicilio || "Sin domicilio",
            localidad: facturaData.receptor?.localidad || "Sin localidad",
            provincia: facturaData.receptor?.provincia || "Sin provincia",
            email: facturaData.receptor?.email || "sin_email@example.com"
        };
        
        const itemsParaGuardar = facturaData.items.map(item => {
            // Usa valores predeterminados para evitar errores si los campos no existen
            const precioUnitario = item.precioUnitario || 0;
            const cantidad = item.cantidad || 0;
            const descuentoMonto = item.descuento || 0;
            const alicuotaIVA = item.alicuotaIVA || 0;
            
            // Calculos basados en la estructura del item
            const importeNetoItem = (cantidad * precioUnitario) - descuentoMonto;
            const importeIVAItem = importeNetoItem * (alicuotaIVA / 100);
            const importeTotalItem = importeNetoItem + importeIVAItem;

            return {
                ...item,
                importeNetoItem: importeNetoItem,
                importeIVAItem: importeIVAItem,
                importeTotalItem: importeTotalItem
            };
        });
        
        // Calcula los totales finales a partir de los ítems
        const importeNetoFinal = itemsParaGuardar.reduce((sum, item) => sum + item.importeNetoItem, 0);
        const importeIVAFinal = itemsParaGuardar.reduce((sum, item) => sum + item.importeIVAItem, 0);
        const importeTotalFinal = itemsParaGuardar.reduce((sum, item) => sum + item.importeTotalItem, 0);

        // Lógica de pago y saldo
        const montoPagado = facturaData.pagos?.monto || 0;
        const saldoPendiente = Math.max(0, importeTotalFinal - montoPagado);
        
        // 4. Construir el objeto final para la base de datos
        const datosParaGuardar = {
            empresa: idEmpresa,
            vendedor: idVendedor,
            puntoDeVenta: puntoVenta,
            
            tipoComprobante: facturaData.comprobante?.tipo || 'NOTA DE PEDIDO',
            numeroComprobanteInterno: nuevoNumero,
            numeroComprobanteCompleto: numeroComprobanteCompleto,
            fechaEmision: new Date(),
            cae: null,
            fechaVtoCae: null,
            estadoAFIP: 'NO_APLICA',
            observacionesAFIP: "Comprobante no fiscal.",
            leyendaAFIP: "Comprobante no fiscal.",
            
            receptor: receptorData,
            items: itemsParaGuardar,
            
            importeNeto: importeNetoFinal,
            importeIVA: importeIVAFinal,
            importeTributos: facturaData.totales?.importeOtrosTributos || 0,
            importeExento: facturaData.totales?.importeExento || 0,
            importeNoGravado: facturaData.totales?.importeNetoNoGravado || 0,
            importeTotal: importeTotalFinal,
            
            metodoPago: facturaData.pagos?.formaPago || "Desconocido",
            montoPagado: montoPagado,
            saldoPendiente: saldoPendiente,
            pagos: [{ metodo: facturaData.pagos?.formaPago, monto: montoPagado, fecha: new Date() }],
            fechaPago: new Date(),
            estadoPago: saldoPendiente <= 0 ? "Pagado" : "Pendiente",
            
            observaciones: facturaData.observaciones || "Sin observaciones.",
            qrDataString: null,
            qrCodeImageUrl: null,
            ubicacion: rutaFactura // Se guarda la ruta del archivo generado
        };
        
        // 5. Guardar la nota de pedido en la base de datos.
        await notaDePedidoEmitida(datosParaGuardar);

        // 6. Leer el archivo PDF del disco y enviarlo al cliente.
        const pdfBuffer = await fs.readFile(rutaFactura);
        
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="Nota_De_Pedido_X_${numeroComprobanteCompleto}.pdf"`);
        return res.status(201).send(pdfBuffer);

    } catch (err) {
        console.error("Error en NotaDePedido (controlador):", err);
        return res.status(500).json({
            message: "Ha ocurrido un error al procesar la nota de pedido.",
            details: err.message
        });
    }
}


export async function getFacturas(req, res) {
    try{
        const options = req.query; 

        console.log("recibido -> ", options);
        
        const respuesta = await getFacturas_services(options);
        res.send(respuesta); 
    }catch(err){
        console.error("Error en getFacturas (controlador):", err);
        return res.status(500).json({
            message: "Ha ocurrido un error al obtener las facturas.",
            details: err.message
        });
    }
}