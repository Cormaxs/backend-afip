import {generateFacturaPdf} from './create-pdf/create_pdf.js';
import {generateQrCodeBase64} from './create-pdf/create_qr.js';
// le paso todo lo necesario para crear la factura, json, link de afip, etc
export async function create_Factura(datos, id){
    //console.log(datos, id)
    const qrBase64 = await generateQrCodeBase64('https://google.com/');
    const respuesta = await generateFacturaPdf(datos, id, qrBase64);
   // console.log("respuesta", respuesta);
    return respuesta;//retorno la ubicacion de guardado
}