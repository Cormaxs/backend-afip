import {Vendedor} from '../models/index.js';


class VendedorRepository {
    // Busca un usuario por su nombre de usuario
    async findByUsername(username) {
        return await Vendedor.findOne({ Vendedorname });
    }

    // Crea un nuevo usuario en la base de datos
    async create(VendedorData) {
        const newVendedor = new Vendedor(VendedorData);
        return await newVendedor.save();
    }

    // Busca un usuario por su ID
    async findById(id) {
        return await Vendedor.findById(id);
    }
    

    // Actualiza un usuario
    async update(id, updateData) {
        return await Vendedor.findByIdAndUpdate(id, updateData, { new: true });
    }

    // Elimina un usuario
    async delete(id) {
        return await Vendedor.findByIdAndDelete(id);
    }
    async deleteVendedorAndProducts(id) {
        // Aquí podrías implementar la lógica para eliminar un usuario y sus productos asociados
        // Por ejemplo, si tienes un modelo de Producto que tiene una referencia al usuario
        // await Product.deleteMany({ VendedorId: id });
        return await Vendedor.findByIdAndDelete(id);
    }

   
}


export default new VendedorRepository();