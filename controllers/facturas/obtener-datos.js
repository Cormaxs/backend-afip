import { createXML } from "../../services/afip/4/armarXML.js";//convierte a json
import { create_Factura } from "../../services/facturas/ensamblar-pdf.js"; //crea la factura en pdf
import {facEmitidasControllers} from "../../services/facturas/facturas-emitidas-controller.js"; //guarda la factura en la base de datos
import {getNumComprobante} from "../../services/facturas/facturas_services.js";
export async function facturaCompleta(req, res) {
    try {
        const { id, afipRequestData, facturaData } = req.body; // Desestructuramos para mayor claridad
        // 1. Validar datos de entrada mínimos
        if (!id || !afipRequestData || !facturaData) {
            return res.status(400).json({ 
                message: "Faltan datos esenciales para procesar la factura.",
                details: "Asegúrate de proporcionar 'id', 'afipRequestData' y 'facturaData'."
            });
        }
        // 2. Comunicarse con AFIP para obtener el CAE
        // El `createXML` debería lanzar un error si algo falla en la comunicación o si AFIP no responde.
        const empresa = "684b20ec17d809f55dd91864";
        const puntoVenta = "684da1f02cca1783265e873f";
        const numero = (await getNumComprobante(empresa, puntoVenta)+1);
        console.log("factura emitida -> ", numero, typeof(numero))
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