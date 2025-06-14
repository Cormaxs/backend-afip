import FacturaEmitidaRepository from "../repositories/repo_facturas.js";

export async function facturaEmitida(datos){
   // console.log("services",datos.puntoDeVenta, datos.empresa, datos.numeroComprobanteInterno)
    return await FacturaEmitidaRepository.create(datos);
}

export async function getNumComprobante(empresa, punto){
    return await FacturaEmitidaRepository.findLastComprobanteInterno(empresa, punto)
}