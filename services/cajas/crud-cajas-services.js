import CajaRepository from "../../repositories/repo_cajas.js";


export async function abrirCajaServices(datos){
    console.log("services -> ", datos)
    const abierta = await CajaRepository.abrirCaja(datos);
    console.log(abierta)
    return abierta;

}


export async function cerrarCajaServices(idcaja, datos){
    console.log("services -> ", datos)
    const cerrada = await CajaRepository.cerrarCaja(idcaja, datos);
    console.log(cerrada)
    return cerrada;

}



export async function agregarTransaccionCaja(cajaId, transaccionData) {
    try {
        return await CajaRepository.agregarTransaccion(cajaId, transaccionData);
    } catch (error) {
        console.error("Error en CajaService.agregarTransaccionCaja:", error.message);
        throw error;
    }
}



export async function getCajaById(cajaId) {
    try {
        return await CajaRepository.findById(cajaId);
    } catch (error) {
        console.error("Error en CajaService.getCajaById:", error.message);
        throw error;
    }
}


export async function getCajasByIdEmpresa(cajaId, filtros) {
    try {
        console.log(cajaId)
        return await CajaRepository.findByIdEmpresa(cajaId, filtros);
    } catch (error) {
        console.error("Error en CajaService.getCajaById:", error.message);
        throw error;
    }
}