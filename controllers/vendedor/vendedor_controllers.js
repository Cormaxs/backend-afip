import { registerVendedor_services, loginVendedor_services, updateVendedor_services, deleteVendedor_services} from '../../services/vendedor_services.js';

export async function registerVendedor(req, res) {
    try {
        const creado = await registerVendedor_services(req.body);
        
        // Esta parte se mantiene igual, solo se ejecuta si todo sale bien.
        if (creado) {
            return res.status(201).json({ message: "Empleado creado exitosamente", creado });
        }

        // Este return es redundante si el servicio lanza un error en caso de fallo.
        // Se puede eliminar para simplificar.
        // return res.status(400).json({ message: "Error al crear el vendedor" });

    } catch (err) {
        // --- AQUÍ ESTÁ LA LÓGICA MEJORADA ---

        // 1. Verificamos si es un error de clave duplicada de MongoDB.
        if (err.code === 11000) {
            // 2. Extraemos el campo que causó el conflicto (ej. 'username' o 'email').
            const campoDuplicado = Object.keys(err.keyValue)[0];
            const valorDuplicado = err.keyValue[campoDuplicado];

            const mensaje = `El ${campoDuplicado} '${valorDuplicado}' ya está en uso.`;
            
            // 3. Enviamos un error 409 (Conflict), que es más apropiado que 400 o 500.
            return res.status(409).json({ message: mensaje });
        }

        // 4. Si es cualquier otro error, mantenemos el error 500 genérico.
        console.error("Error no controlado al crear el vendedor:", err);
        return res.status(500).json({ message: "Error interno del servidor. Por favor, contacte a soporte." });
    }
}

export async function loginVendedor(req, res) {
    try {
        console.log("entrante -> ", req.body)
        const { username, password } = req.body;
        const user = await loginVendedor_services(username, password);
        return res.status(200).json(user); // O un token JWT aquí
    } catch (error) {
        console.error(`Error en el controlador login: ${error.message}`);
        return res.status(401).json({ error: "Usuario o contraseña incorrectos." });
    }
}


export async function updateVendedor(req, res) {
    try {
        const id = req.params.id; 
        const datos = req.body;
        const actualizados = await updateVendedor_services(id, datos);
        if (!actualizados) {
            return res.status(404).json({ error: "Usuario no encontrado para actualizar." });
        }
        return res.status(200).json({ message: "Usuario actualizado correctamente.", user: actualizados });
    } catch (error) {
        console.error(`Error en el controlador update para ID ${req.params.id || 'desconocido'}:`, error.message);
        if (error.message.includes("ID de usuario es requerido")) {
            return res.status(400).json({ error: error.message });
        } else if (error.message.includes("No se pudo actualizar el usuario. El usuario no existe o no se realizaron cambios.")) {
            return res.status(404).json({ error: error.message }); // Podría ser 404 si el servicio indica que no existe
        } else {
            return res.status(500).json({ error: "No se pudo actualizar el usuario debido a un error interno." });
        }
    }
  }
  
  export async function deleteVendedor(req, res) {
    try {
        const id = req.params.id;
        const eliminado = await deleteVendedor_services(id);
        if (!eliminado) {
            return res.status(404).json({ error: "Usuario no encontrado para eliminar." });
        }
        return res.status(200).json({ message: "Usuario eliminado correctamente.", user: eliminado });
    } catch (error) {
        console.error(`Error en el controlador deleteUser para ID ${req.params.id || 'desconocido'}:`, error.message);
        if (error.message.includes("ID de usuario es requerido")) {
            return res.status(400).json({ error: error.message });
        } else if (error.message.includes("No se pudo eliminar el usuario. El usuario no existe o ya ha sido eliminado.")) {
            return res.status(404).json({ error: error.message }); // Podría ser 404
        } else {
            return res.status(500).json({ error: "No se pudo eliminar el usuario debido a un error interno." });
        }
    }
  }

