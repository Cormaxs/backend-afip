import { createSinAfip, getTiketsCompanyServices } from "../../../services/facturas-sin-afip/f_sin_afip_crud_services.js";
import {get_company} from "../../../services/company_services.js";

export async function sinAfip(req, res) {
    try {
        const { datos, idEmpresa } = req.body;
        const { id } = req.params; 
        console.log(datos, id, idEmpresa)
        const datosEmpresa = await get_company(idEmpresa);
        // Llamamos al servicio para crear el ticket, pasando todos los datos necesarios
        const resultadoTicket = await createSinAfip(datos, id, idEmpresa, datosEmpresa); 
        // Enviamos una respuesta exitosa con los detalles del ticket creado
        res.status(201).json(resultadoTicket);

    } catch (err) {
        // Capturamos cualquier error que se propague desde el servicio
        console.error("Error en el controlador sinAfip:", err);
        res.status(500).json({ 
            message: "Ocurrió un error interno al procesar el ticket.",
            error: err.message 
        });
    }
}

export async function getTiketsCompany(req, res) {
    try {
        const { id } = req.params;
        // 2. Llamada al servicio: Obtener los tickets de la empresa
        const tiketsCompany = await getTiketsCompanyServices(id);
        res.status(200).json(tiketsCompany);

    } catch (err) {
        // 4. Manejo de errores: Capturar y responder a cualquier error
        console.error("Error en el controlador getTiketsCompany:", err);

        // Mensaje de error general para el cliente, puedes loguear el 'err' completo internamente
        res.status(500).json({
            message: "Ocurrió un error al obtener los tickets de la empresa.",
            error: err.message // En producción, considera no exponer err.message directamente por seguridad.
        });
    }
}