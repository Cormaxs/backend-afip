import VendedorRepository from '../repositories/repo_vendedor.js';


//vendedor
export async function createVendedor_services(datos) {
    return await VendedorRepository.create(datos);
}
