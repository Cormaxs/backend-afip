import { registerUser, comparePassword } from '../utils/bcrypt.js';
import UserRepository from '../repositories/repo_auth.js';


export async function loginUser_services(username, password) {
    try {
        const existe = await UserRepository.findByUsername(username);
        if (!existe) {
            console.error(`Intento de inicio de sesión fallido para el usuario: ${username}. Usuario no encontrado.`);
            throw new Error("Credenciales inválidas."); 
        }
        const passwordMatch = await comparePassword(password, existe.password);
        if (!passwordMatch) {
            console.error(`Intento de inicio de sesión fallido para el usuario: ${username}. Contraseña incorrecta.`);
            throw new Error("Credenciales inválidas.");
        }
        return existe;

    } catch (error) {
        console.error(`Error en loginUser_services para ${username}: ${error.message}`);
        throw error; 
    }
}

export async function registerUser_services(datos) {
    try {
        datos.password = await registerUser(datos.password);
        console.log("Contraseña hasheada y lista para guardar.");
        const usuarioCreado = await UserRepository.create(datos);
        if (usuarioCreado) {
            console.log(`Usuario '${usuarioCreado.username || datos.username}' registrado correctamente.`);
            return usuarioCreado;
        } else {
            console.error("UserRepository.create no lanzó un error, pero no devolvió el usuario creado. Posible problema de lógica en el repositorio.");
            throw new Error("No se pudo completar el registro del usuario por un error interno.");
        }

    } catch (error) {
        console.error(`Error en registerUser_services para el usuario '${datos.username || "desconocido"}':`, error.message);

        if (error.message.includes("duplicate key") || error.message.includes("usuario ya existe")) {
            throw new Error("El nombre de usuario ya está en uso. Por favor, elige otro.");
        }
        else {
            throw new Error("No se pudo registrar el usuario. Inténtalo de nuevo más tarde.");
        }
    }
}

export async function updateUser_services(datos) {
    try {
        if (!datos || !datos.id) {
            console.error("Error en updateUser_services: ID de usuario no proporcionado para la actualización.");
            throw new Error("ID de usuario es requerido para la actualización.");
        }
        const updatedUser = await UserRepository.update(datos.id, datos);
        if (updatedUser) {
            console.log(`Usuario con ID ${datos.id} actualizado correctamente.`);
            return updatedUser;
        } else {
            console.error(`Error en updateUser_services: No se encontró el usuario con ID ${datos.id} para actualizar o la operación no tuvo efecto.`);
            throw new Error("No se pudo actualizar el usuario. El usuario no existe o no se realizaron cambios.");
        }

    } catch (error) {
        console.error(`Error general en updateUser_services para ID ${datos ? datos.id : 'desconocido'}:`, error.message);
        if (error.message.includes("ID de usuario es requerido")) {
             throw error; 
        }
        else {
            throw new Error("No se pudo actualizar el usuario debido a un error interno.");
        }
    }
}


export async function deleteUser_services(id) {
    try {
        if (!id) {
            console.error("Error en deleteUser_services: ID de usuario no proporcionado para la eliminación.");
            throw new Error("ID de usuario es requerido para la eliminación.");
        }
        const deletedUser = await UserRepository.delete(id);
        if (deletedUser) {
            console.log(`Usuario con ID ${id} eliminado correctamente.`);
            return deletedUser; 
        } else {
            console.error(`Error en deleteUser_services: No se encontró el usuario con ID ${id} para eliminar o ya fue eliminado.`);
            throw new Error("No se pudo eliminar el usuario. El usuario no existe o ya ha sido eliminado.");
        }
    } catch (error) {
        console.error(`Error general en deleteUser_services para ID ${id || 'desconocido'}:`, error.message);
        if (error.message.includes("ID de usuario es requerido")) {
            throw error; 
        }
        else {
            throw new Error("No se pudo eliminar el usuario debido a un error interno.");
        }
    }
}

//creo una clase para verificar si el usuario ya existe, puedo usarla instancia de UserRepository
class AuthService {
    constructor() {
        this.UserRepository = UserRepository; // Asigna la instancia del repositorio
    }

    async UserExist(username) {
        const existe = await this.UserRepository.findByUsername(username);
        return existe ? true : false;
    }
}

export default new AuthService(); // Exporta una instancia de la clase AuthService