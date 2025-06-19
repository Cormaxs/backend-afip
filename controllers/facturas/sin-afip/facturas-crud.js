// controllers/tuControlador.js (o donde esté tu función sinAfip)
import { createSinAfip, getTiketsCompanyServices } from "../../../services/facturas-sin-afip/f_sin_afip_crud_services.js";

export async function sinAfip(req, res) {
    try {
        // Desestructuramos 'datos' y 'idEmpresa' del cuerpo de la solicitud
        const { datos, idEmpresa } = req.body;
        
        // Asumimos que 'id' viene de los parámetros de la URL
        // Por ejemplo, si la ruta es /api/tickets/:idUsuario
        const { id } = req.params; 
        console.log("ingrearon -> ", datos, id, idEmpresa)
        // Validaciones de existencia de datos críticos
        if (!id) {
            return res.status(400).json({ message: "El ID de usuario es requerido en la ruta." });
        }
        if (!idEmpresa) {
            return res.status(400).json({ message: "El ID de empresa es requerido en el cuerpo de la solicitud." });
        }
        if (!datos) {
            return res.status(400).json({ message: "El objeto 'datos' de la venta es requerido en el cuerpo de la solicitud." });
        }
        
        // Llamamos al servicio para crear el ticket, pasando todos los datos necesarios
        const resultadoTicket = await createSinAfip(datos, id, idEmpresa); 

        // Enviamos una respuesta exitosa con los detalles del ticket creado
        res.status(201).json(resultadoTicket);

    } catch (err) {
        // Capturamos cualquier error que se propague desde el servicio
        console.error("Error en el controlador sinAfip:", err);
        
        // En un entorno de producción, considera no exponer `err.message` directamente por seguridad.
        // Podrías devolver un mensaje más genérico o loguear el error completo internamente.
        res.status(500).json({ 
            message: "Ocurrió un error interno al procesar el ticket.",
            error: err.message 
        });
    }
}

export async function getTiketsCompany(req, res) {
    try {
        const { id } = req.params; // Usamos id para mayor claridad

        // 1. Validación: Asegurarse de que el ID de la empresa es válido y está presente
        if (!id) {
            return res.status(400).json({ message: "El ID de la empresa es requerido en los parámetros de la URL." });
        }

        // 2. Llamada al servicio: Obtener los tickets de la empresa
        const tiketsCompany = await getTiketsCompanyServices(id);

        // 3. Respuesta exitosa: Enviar los tickets encontrados
        // Si no se encuentran tickets, el servicio debería devolver un array vacío,
        // por lo que un status 200 sigue siendo apropiado.
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