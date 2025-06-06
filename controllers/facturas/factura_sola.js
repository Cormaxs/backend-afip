import {generateFacturaPdf} from '../create_resivo/create_pdf.js';
import {generateQrCodeBase64} from '../create_resivo/create_qr.js';
// le paso todo lo necesario para crear la factura, json, link de afip, etc
export async function create_Factura(req, res){
    const datos = req.body;
    // Genera el QR para Google.com
    // En un caso real, la URL del QR se construiría con los datos de la factura de AFIP.
    const qrBase64 = await generateQrCodeBase64('https://google.com/');
    const respuesta = await generateFacturaPdf(datos, qrBase64);
    console.log("respuesta", respuesta);
    res.send(respuesta);
}