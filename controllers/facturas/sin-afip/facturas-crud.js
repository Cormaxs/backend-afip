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
        const { idEmpresa } = req.params; // Captura el ID de la empresa de los parámetros de la URL
        
        // **Clave aquí:** Combina req.params (para el ID) y req.query (para la paginación/ordenamiento)
        // Puedes pasar directamente req.query como las 'options' a tu servicio,
        // ya que Express parsea los query params como un objeto.
        const options = req.query; 
        
        console.log("ID de Empresa (params): ", idEmpresa);
        console.log("Opciones de paginación (query): ", options);

        // Llama al servicio, pasando el idEmpresa de la empresa y las opciones combinadas
        const result = await getTiketsCompanyServices(idEmpresa, options); 
        
        // Envía la respuesta con los tickets y la información de paginación
        res.status(200).json(result);

    } catch (err) {
        console.error("Error en el controlador getTiketsCompany:", err);

        res.status(500).json({
            message: "Ocurrió un error al obtener los tickets de la empresa.",
            error: err.message 
        });
    }
}