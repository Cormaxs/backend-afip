import {create_point_sales_services, get_point_sales_services} from "../../services/point_sales_services.js";

export async function createPointSale(req, res) {
    try{
        const crado = await create_point_sales_services(req.body);
        if(crado){
            return res.status(201).json({message: "Punto de venta creado correctamente", data: crado});
        }
        return res.status(400).json({message: "No se pudo crear el punto de venta. Verifique los datos enviados."});
    }catch(err){
        console.error("Error al crear el punto de venta:", err);
        return res.status(500).json({message: "Error interno del servidor. Intente nuevamente más tarde."});
    }
}

export async function getPointSales(req, res){
    try{
        const {id} = req.params;
        const puntos = await get_point_sales_services(id);
        if(puntos){
            return res.status(200).json(puntos);
        }res.status(400).json("error")
        
    }catch(err){
        console.error(err)
    }
}