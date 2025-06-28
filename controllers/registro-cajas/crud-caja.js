import {abrirCajaServices, cerrarCajaServices, agregarTransaccionCaja, getCajaById, getCajasByIdEmpresa} from "../../services/cajas/crud-cajas-services.js";



export async function abrirCaja(req, res){
  
console.log(req.body)
    try{
        const abierta = await abrirCajaServices(req.body);
        res.send(abierta)
    }catch(err){

    }
}

export async function cerrarCaja(req, res){
    const {idCaja} = req.params;
    console.log(req.body)
        try{
            const abierta = await cerrarCajaServices(idCaja ,req.body);
            res.send(abierta)
        }catch(err){
    
        }
    }


    export async function agregarTransaccionCajaController(req, res) {
        try {
            const { idCaja } = req.params; // ID de la caja a la que se agrega la transacción
            const transaccionData = req.body; // { tipo, monto, descripcion, referencia? }
    
            const cajaActualizada = await agregarTransaccionCaja(idCaja, transaccionData);
            res.status(200).json({
                message: "Transacción registrada exitosamente.",
                caja: cajaActualizada
            });
        } catch (err) {
            console.error("Error en agregarTransaccionCajaController:", err.message);
            res.status(err.message.includes('inválido') || err.message.includes('encontrada') || err.message.includes('cerrada') || err.message.includes('positivo') ? 400 : 500).json({
                message: "Error al registrar la transacción.",
                error: err.message
            });
        }
    }
    
    // Opcional: Controlador para obtener una caja específica (útil para ver su estado actual)
    export async function getCajaByIdController(req, res) {
        try {
            const { idCaja } = req.params; // ID de la caja a obtener
            const encontrada = await getCajaById(idCaja);
            res.status(200).json(encontrada);
        } catch (err) {
            console.error("Error en getCajaByIdController:", err.message);
            res.status(err.message.includes('inválido') ? 400 : 500).json({
                message: "Error al obtener la caja.",
                error: err.message
            });
        }
    }

    //obtiene todas las cajas de la empresa
    export async function getCajaByIdEmpresaController(req, res) {
        try {
            const { idEmpresa } = req.params; // ID de la caja a obtener
            const filtros = req.query;
            console.log(idEmpresa)
            const encontrada = await getCajasByIdEmpresa(idEmpresa, filtros);
            res.status(200).json(encontrada);
        } catch (err) {
            console.error("Error en getCajaByIdController:", err.message);
            res.status(err.message.includes('inválido') ? 400 : 500).json({
                message: "Error al obtener la caja.",
                error: err.message
            });
        }
    }