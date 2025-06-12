import {createVendedor_services} from '../../services/vendedor_services.js';

export async function createVendedor(req, res) {
    try{
        const creado = await createVendedor_services(req.body);
        if(creado){
            return res.status(201).json({message: "Vendedor creado exitosamente", creado});
        }
       return res.status(400).json({message: "Error al crear el vendedor"});
    }catch(err){
        console.error("Error al crear el vendedor:", err);
        return res.status(500).json({message: "Error interno del servidor"});
    }
    } 