// afipCaller.js
import axios from 'axios';

// URL del servicio de AFIP para FECAESolicitar (homologación)
const AFIP_FE_ENDPOINT = 'https://wswhomo.afip.gov.ar/wsfev1/service.asmx';
const AFIP_SOAP_ACTION = 'http://ar.gov.afip.dif.FEV1/FECAESolicitar';

export async function sendXmlToAfip(xmlPayload) {
    let config = {
        method: 'post',
        maxBodyLength: Infinity, // Permite un cuerpo de solicitud de tamaño ilimitado
        url: AFIP_FE_ENDPOINT,
        headers: {
            'SOAPAction': AFIP_SOAP_ACTION,
            'Content-Type': 'text/xml; charset=utf-8',
        },
        data: xmlPayload // Aquí es donde se envía el XML generado
    };

    try {
        //console.log("Enviando XML a AFIP...");
        // console.log("XML a enviar:\n", xmlPayload); // Útil para depurar el XML enviado

        const response = await axios.request(config);

        //console.log("Respuesta de AFIP (data):", response.data);

        // Opcional: Si la respuesta de AFIP es XML, podrías parsearla aquí
        // con xml2js para convertirla a JSON.
        // const parsedResponse = await new Promise((resolve, reject) => {
        //     xml2js.parseString(response.data, { explicitArray: false }, (err, result) => {
        //         if (err) reject(err);
        //         else resolve(result);
        //     });
        // });
        // console.log("Respuesta de AFIP (parseada):", JSON.stringify(parsedResponse, null, 2));

        return response.data; // Devuelve la respuesta cruda (XML) o parseada si la parseas
    } catch (error) {
        console.error("Error al enviar XML a AFIP:", error.message);
        if (error.response) {
            // El servidor respondió con un estado fuera del rango 2xx
            console.error("Detalles del error de respuesta de AFIP:");
            console.error("Status:", error.response.status);
            console.error("Headers:", error.response.headers);
            console.error("Data:", error.response.data); // Aquí estará el error XML de AFIP
            throw new Error(`AFIP Service Error: ${error.response.status} - ${error.response.data}`);
        } else if (error.request) {
            // La solicitud fue hecha pero no se recibió respuesta
            console.error("No se recibió respuesta de AFIP:", error.request);
            throw new Error("No se recibió respuesta del servicio AFIP.");
        } else {
            // Algo más causó el error
            console.error("Error en la configuración de la solicitud:", error.message);
            throw new Error(`Error en la solicitud: ${error.message}`);
        }
    }
}