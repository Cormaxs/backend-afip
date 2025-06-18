import { register_company, update_company,delete_company, get_company, get_company_all } from "../../services/company_services.js";

// Crear una nueva empresa
export async function CreateCompany(req, res) {
    try {
        const datos = req.body;
        console.log(datos)
        const creada = await register_company(datos);
        if (creada) {
            return res.status(201).json(creada);
        }
        res.status(400).json("Company not created");
    } catch (error) {
        if (error.message.includes("duplicate key") || error.message.includes("usuario ya existe")) {
            return res.status(409).json({ message: "El nombre de usuario o cuit ya está en uso. Por favor, elige otro." }); // 409 Conflict
        } else if (error.message.includes("No se pudo completar el el registro del usuario por un error interno en la base de datos.")) {
            return res.status(500).json({ message: "Error interno del servidor al registrar la empresa. Por favor, inténtalo de nuevo más tarde." }); // 500 Internal Server Error
        } else {
            return res.status(500).json({ message: "No se pudo registrar la empresa. Inténtalo de nuevo más tarde." }); // 500 Genérico
        }
    }
}

export async function updateCompany(req, res) {
    try {
        const {  datos } = req.body;
        const {id} = req.params; 
        const updated = await update_company(id, datos);

        if (updated) {
            return res.status(200).json(updated); // 200 OK para una actualización exitosa

        }
        return res.status(404).json({ message: "Empresa no encontrada para actualizar." });


    } catch (error) {
        // Aquí puedes manejar diferentes tipos de errores.
        // Si el error indica que el ID no existe, puedes enviar un 404.
        if (error.message.includes("No se pudo actualizar la empresa")) {
            return res.status(400).json({ message: error.message }); // O un 404 si el error es más específico sobre no encontrar
        }
        // Puedes agregar más condiciones para otros tipos de errores (ej. validación de datos).

        console.error("Error al actualizar la empresa:", error);
        return res.status(500).json({ message: "Error interno del servidor al intentar actualizar la empresa." });
    }
}

export async function deleteCompany(req, res) {
    try{
        const {id} = req.params; 
        const result = await delete_company(id);
        if (result) {
            return res.status(200).json(result); // 200 OK para una eliminación exitosa
        }
        return res.status(404).json({ "message": result });
    }catch(err){
        console.error("Error al eliminar la empresa:", err);
        return res.status(500).json({ message: "Error interno del servidor al intentar eliminar la empresa." });
    }
}

export async function getCompany(req, res) {
    try{
        const {id} = req.params;
        const result = await get_company(id);
        if(result){
            return res.status(200).json(result); // 200 OK para una consulta exitosa
        }
        return res.status(404).json({ result });
    }catch(err){
        console.error("Error al obtener la empresa:", err);
        return res.status(500).json({ message: "Error interno del servidor al intentar obtener la empresa." });
    }
}

export async function getCompanyAll(req, res) {
    try{
        const result = await get_company_all();
      //  console.log("controllers -> ",result)
        if(result){
            return res.status(200).json(result); // 200 OK para una consulta exitosa
        }
        return res.status(404).json( result );
    }catch(err){
        console.error("Error al obtener la empresa:", err);
        return res.status(500).json({ message: "Error interno del servidor al intentar obtener la empresa." });
    }
}