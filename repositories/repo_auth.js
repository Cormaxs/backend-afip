
import User from '../models/user.js';

class UserRepository {
    // Busca un usuario por su nombre de usuario
    async findByUsername(username) {
        return await User.findOne({ username });
    }

    // Crea un nuevo usuario en la base de datos
    async create(userData) {
        // La contraseña hasheada debe venir de la capa de servicio.
        const newUser = new User(userData);
        return await newUser.save();
    }

    // Busca un usuario por su ID
    async findById(id) {
        return await User.findById(id);
    }

    // Actualiza un usuario
    async update(id, updateData) {
        return await User.findByIdAndUpdate(id, updateData, { new: true });
    }

    // Elimina un usuario
    async delete(id) {
        return await User.findByIdAndDelete(id);
    }

   
}


export default new UserRepository();