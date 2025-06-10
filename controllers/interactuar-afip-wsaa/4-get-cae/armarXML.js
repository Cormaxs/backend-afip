import fs from 'fs/promises'; // Importa el módulo fs/promises
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import {sendXmlToAfip} from "./peticion.js"
import {convertXmlToJson} from "./convertir.js";

// Configuración
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);


//pasa los datos json a xml para enviarlo a afip y obtener el CAE
export async function createXML(req, res){
    const {id, Auth, FeCAEReq} = req.body; // Desestructuramos FeCAEReq completo
    const FeDetReq = FeCAEReq.FeDetReq; // Extraemos el array FeDetReq para facilitar el acceso

    // Obtengo el TA (Token de Acceso)
    const tokens = await TA(id);

    // Verifico si la fecha de vencimiento es válida
    const expirado = isBeforeOrAfterCurrentTime(tokens.expirationTime);

    // Si está expirado, entonces creo uno nuevo (o manejo el error)
    if(expirado) {
        // En un entorno de producción, aquí deberías invocar la lógica para renovar el token
        // y luego reintentar la operación. Por ahora, solo enviamos un mensaje de error.
        return res.status(401).send(`El token AFIP está expirado. Por favor, renuévelo.`);
    }

    // Los datos de Auth.Token y Auth.Sign se sobrescriben con los obtenidos del TA
    Auth.Token = tokens.token;
    Auth.Sign = tokens.sign;

    // Actualizar CbteDesde y CbteHasta con los valores que querés (ej. 7)
    // Esto se hace directamente en el objeto FeDetReq[0] que ya tenemos.
    // **Importante:** Tu JSON de entrada tiene CbteDesde: 100, CbteHasta: 100
    // y aquí lo estás sobrescribiendo a 7. Asegúrate que esto sea lo deseado.
    FeDetReq[0].CbteDesde = 11;
    FeDetReq[0].CbteHasta = 11;

    // --- Lógica para generar el XML usando un template literal ---

    // 1. Prepara las partes de Tributos e Iva para el template literal
    let tributosXml = '';
    if (FeDetReq[0].Tributos && FeDetReq[0].Tributos.length > 0) {
        // Mapea cada tributo a su representación XML
        tributosXml = `<ar:Tributos>` +
            FeDetReq[0].Tributos.map(tributo => `
                <ar:Tributo>
                    <ar:Id>${tributo.Id}</ar:Id>
                    <ar:Desc>${escapeXml(tributo.Desc)}</ar:Desc>
                    <ar:BaseImp>${tributo.BaseImp}</ar:BaseImp>
                    <ar:Alic>${tributo.Alic}</ar:Alic>
                    <ar:Importe>${tributo.Importe}</ar:Importe>
                </ar:Tributo>
            `).join('') + // Une todos los elementos <ar:Tributo> sin separador
            `</ar:Tributos>`;
    } else {
        tributosXml = `<ar:Tributos/>`; // Si no hay tributos, generar etiqueta vacía
    }

    let ivaXml = '';
    if (FeDetReq[0].Iva && FeDetReq[0].Iva.length > 0) {
        // Mapea cada elemento de IVA a su representación XML
        ivaXml = `<ar:Iva>` +
            FeDetReq[0].Iva.map(ivaItem => `
                <ar:AlicIva>
                    <ar:Id>${ivaItem.Id}</ar:Id>
                    <ar:BaseImp>${ivaItem.BaseImp}</ar:BaseImp>
                    <ar:Importe>${ivaItem.Importe}</ar:Importe>
                </ar:AlicIva>
            `).join('') + // Une todos los elementos <ar:AlicIva>
            `</ar:Iva>`;
    } else {
        // Dependiendo del servicio, a veces se puede omitir o enviar vacío
        // En AFIP, si no hay IVA, a veces se puede omitir la sección <Iva> o enviar <Iva/>
        // Para consistencia, lo dejamos vacío si no hay.
        ivaXml = `<ar:Iva/>`;
    }

    // Función auxiliar para escapar caracteres XML especiales
    function escapeXml(unsafe) {
        if (typeof unsafe !== 'string') return unsafe; // Manejar no-cadenas
        return unsafe.replace(/[<>&'"]/g, function (c) {
            switch (c) {
                case '<': return '&lt;';
                case '>': return '&gt;';
                case '&': return '&amp;';
                case "'": return '&apos;';
                case '"': return '&quot;';
            }
        });
    }

    const xmlOutput = `
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ar="http://ar.gov.afip.dif.FEV1/">
    <soapenv:Header/>
    <soapenv:Body>
        <ar:FECAESolicitar>
            <ar:Auth>
                <ar:Token>${escapeXml(Auth.Token)}</ar:Token>
                <ar:Sign>${escapeXml(Auth.Sign)}</ar:Sign>
                <ar:Cuit>${Auth.Cuit}</ar:Cuit>
            </ar:Auth>
            <ar:FeCAEReq>
                <ar:FeCabReq>
                    <ar:CantReg>${FeCAEReq.FeCabReq.CantReg}</ar:CantReg>
                    <ar:PtoVta>${FeCAEReq.FeCabReq.PtoVta}</ar:PtoVta>
                    <ar:CbteTipo>${FeCAEReq.FeCabReq.CbteTipo}</ar:CbteTipo>
                </ar:FeCabReq>
                <ar:FeDetReq>
                    <ar:FECAEDetRequest>
                        <ar:Concepto>${FeDetReq[0].Concepto}</ar:Concepto>
                        <ar:DocTipo>${FeDetReq[0].DocTipo}</ar:DocTipo>
                        <ar:DocNro>${FeDetReq[0].DocNro}</ar:DocNro>
                        <ar:CbteDesde>${FeDetReq[0].CbteDesde}</ar:CbteDesde>
                        <ar:CbteHasta>${FeDetReq[0].CbteHasta}</ar:CbteHasta>
                        <ar:CbteFch>${FeDetReq[0].CbteFch}</ar:CbteFch>
                        <ar:ImpTotal>${FeDetReq[0].ImpTotal}</ar:ImpTotal>
                        <ar:ImpTotConc>${FeDetReq[0].ImpTotConc}</ar:ImpTotConc>
                        <ar:ImpNeto>${FeDetReq[0].ImpNeto}</ar:ImpNeto>
                        <ar:ImpOpEx>${FeDetReq[0].ImpOpEx}</ar:ImpOpEx>
                        <ar:ImpTrib>${FeDetReq[0].ImpTrib}</ar:ImpTrib>
                        <ar:ImpIVA>${FeDetReq[0].ImpIVA}</ar:ImpIVA>
                        <ar:FchServDesde>${FeDetReq[0].FchServDesde || ''}</ar:FchServDesde>
                        <ar:FchServHasta>${FeDetReq[0].FchServHasta || ''}</ar:FchServHasta>
                        <ar:FchVtoPago>${FeDetReq[0].FchVtoPago || ''}</ar:FchVtoPago>
                        <ar:MonId>${FeDetReq[0].MonId}</ar:MonId>
                        <ar:MonCotiz>${FeDetReq[0].MonCotiz}</ar:MonCotiz>
                        <ar:CondicionIVAReceptorId>${FeDetReq[0].CondicionIVAReceptorId}</ar:CondicionIVAReceptorId>
                        ${tributosXml}
                        ${ivaXml}
                    </ar:FECAEDetRequest>
                </ar:FeDetReq>
            </ar:FeCAEReq>
        </ar:FECAESolicitar>
    </soapenv:Body>
</soapenv:Envelope>
    `;

    const cae = await sendXmlToAfip(xmlOutput); // Envía el XML a AFIP y obtiene la respuesta
  

    const convertidojson = await convertXmlToJson(cae); // Convierte la respuesta XML a JSON
    console.log(convertidojson.Envelope.Body.FECAESolicitarResponse.FECAESolicitarResult.FeDetResp.FECAEDetResponse); //selecciono manualmente
    res.status(200).send(convertidojson); // Envía el XML generado como respuesta al frontend
}


//obtiene el token de acceso, sign y fecha de vencimiento del usuario mediante id
export async function TA(id){
    const userAfipDirPath = path.join(__dirname, `${process.env.RAIZ_USERS}${id}/afip`);

    // Ruta completa al archivo afip_credentials.json
    const credentialsFilePath = path.join(userAfipDirPath, 'afip_credentials.json');

    try {
        const fileContent = await fs.readFile(credentialsFilePath, { encoding: 'utf8' });
        const credentials = JSON.parse(fileContent);
        return { token: credentials.token, sign: credentials.sign, expirationTime: credentials.expirationTime };
    } catch (error) {
        console.error('Error al leer o parsear las credenciales AFIP:', error);
        throw new Error('No se pudieron obtener las credenciales AFIP.'); // Propaga el error
    }
}

//verifica si esta expirado
function isBeforeOrAfterCurrentTime(dateTimeString) {
    const now = new Date(); // Current time is Monday, June 9, 2025 at 5:12:15 PM -03.
    const targetDate = new Date(dateTimeString);

    if (targetDate.getTime() < now.getTime()) {
      return true; // La fecha objetivo es ANTES de la hora actual (expirado)
    } else if (targetDate.getTime() > now.getTime()) {
      return false; // La fecha objetivo es DESPUÉS de la hora actual (válido)
    } else {
      return 0; // Son exactamente iguales (muy improbable)
    }
}



