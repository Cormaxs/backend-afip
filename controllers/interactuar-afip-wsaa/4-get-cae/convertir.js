import xml2js from 'xml2js';


export async function convertXmlToJson(xmlString) {
    const parser = new xml2js.Parser({
        explicitArray: false,
        ignoreAttrs: true,
        // *** ESTO ES CLAVE: Elimina los prefijos como "soap:" ***
        tagNameProcessors: [xml2js.processors.stripPrefix]
    });

    return new Promise((resolve, reject) => {
        parser.parseString(xmlString, (err, result) => {
            if (err) {
                return reject(new Error(`Error al parsear XML: ${err.message}`));
            }
            resolve(result);
        });
    });
}

// --- Ejemplo de uso ---
const xmlResponse = `
<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema">
    <soap:Header>
        <FEHeaderInfo xmlns="http://ar.gov.afip.dif.FEV1/">
            <ambiente>HomologacionExterno - efa</ambiente>
            <fecha>2025-06-09T20:19:32.22425-03:00</fecha>
            <id>6.1.0.0</id>
        </FEHeaderInfo>
    </soap:Header>
    <soap:Body>
        <FECAESolicitarResponse xmlns="http://ar.gov.afip.dif.FEV1/">
            <FECAESolicitarResult>
                <FeCabResp>
                    <Cuit>20437813702</Cuit>
                    <PtoVta>12</PtoVta>
                    <CbteTipo>1</CbteTipo>
                    <FchProceso>20250609201930</FchProceso>
                    <CantReg>1</CantReg>
                    <Resultado>A</Resultado>
                    <Reproceso>N</Reproceso>
                </FeCabResp>
                <FeDetResp>
                    <FECAEDetResponse>
                        <Concepto>1</Concepto>
                        <DocTipo>80</DocTipo>
                        <DocNro>20111111112</DocNro>
                        <CbteDesde>9</CbteDesde>
                        <CbteHasta>9</CbteHasta>
                        <CbteFch>20250609</CbteFch>
                        <Resultado>A</Resultado>
                        <Observaciones>
                            <Obs>
                                <Code>10217</Code>
                                <Msg>El credito fiscal discriminado en el presente comprobante solo podra ser computado a efectos del Procedimiento permanente de transicion al Regimen General.</Msg>
                            </Obs>
                        </Observaciones>
                        <CAE>75232250666891</CAE>
                        <CAEFchVto>20250619</CAEFchVto>
                    </FECAEDetResponse>
                </FeDetResp>
                <Events>
                    <Evt>
                        <Code>41</Code>
                        <Msg>IMPORTANTE: El dia 9 de junio de 2025 se actualizo la version del Web Service (WS) en el ambiente de Homologacion Externa en la cual se establece como obligatorio el campo Condicion Frente al IVA del receptor. Cabe destacar que la Resolucion General Nro 5616 indica que ese dato debe enviarse de manera obligatoria. Para mas informacion, consultar el manual en: https://www.arca.gob.ar/fe/ayuda/webservice.asp, https://www.arca.gob.ar/ws/documentacion/ws-factura-electronica.asp</Msg>
                    </Evt>
                </Events>
            </FECAESolicitarResult>
        </FECAESolicitarResponse>
    </soap:Body>
</soap:Envelope>`;

