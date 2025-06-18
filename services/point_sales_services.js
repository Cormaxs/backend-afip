import PuntoDeVentaRepository from '../repositories/repo_point_sales.js';

export async function create_point_sales_services(data) {
    return await PuntoDeVentaRepository.addPuntoDeVenta(data);
}

export async function get_point_sales_services(id) {
    return await PuntoDeVentaRepository.findAll(id);
}