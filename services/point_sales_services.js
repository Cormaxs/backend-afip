import PuntoDeVentaRepository from '../repositories/repo_point_sales.js';

export async function create_point_sales_services(data) {
    return await PuntoDeVentaRepository.addPuntoDeVenta(data);
}