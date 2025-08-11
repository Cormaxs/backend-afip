import {generateFacturaPdf} from './create-pdf/create_pdf.js';
import {generateQrCodeBase64} from './create-pdf/create_qr.js';
import {GenerateURL} from "./create-pdf/gerate_link.js";
// le paso todo lo necesario para crear la factura, json, link de afip, etc
export async function create_Factura(datos, id){

    const link = await GenerateURL(datos);
    const qrBase64 = await generateQrCodeBase64(link);
    const respuesta = await generateFacturaPdf(datos, id, qrBase64);

    return respuesta;//retorno la ubicacion de guardado
}