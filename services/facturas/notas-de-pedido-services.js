// services/facturas/notas-de-pedido-services.js
import FacturaEmitidaRepository from "../../repositories/repo_facturas.js";

// Lógica para guardar la nota de pedido en la base de datos.
export async function notaDePedidoEmitida(datos) {
    return await FacturaEmitidaRepository.create(datos);
}

// Lógica para obtener el último número de comprobante para las notas de pedido.
export async function getNumNotaDePedido(empresa, punto) {
    return await FacturaEmitidaRepository.findLastNotaDePedidoInterno(empresa, punto);
}