import FacturaEmitidaRepository from "../../repositories/repo_facturas.js";

export async function facturaEmitida(datos){
    return await FacturaEmitidaRepository.create(datos);
}

export async function getNumComprobante(empresa, punto){
    return await FacturaEmitidaRepository.findLastComprobanteInterno(empresa, punto)
}


export async function getFacturas_services(options) {
 
    return await FacturaEmitidaRepository.findFacturas_repo(options);
}