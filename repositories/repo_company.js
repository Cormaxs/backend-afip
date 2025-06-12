import {Empresa} from "../models/index.js";

class EmpresaRepository{
     // Crea un nuevo usuario en la base de datos
     async create(empresaData) {
        const newEmpresa = new Empresa(empresaData);
        return await newEmpresa.save();
    }

    async update(id, updateData) {
        return await Empresa.findByIdAndUpdate(id, updateData, { new: true });
    }

    async delete(id) {
        return await Empresa.findByIdAndDelete(id);
    } 
    async findById(id) {
        return await Empresa.findById(id);
    }
}

export default new EmpresaRepository(); 