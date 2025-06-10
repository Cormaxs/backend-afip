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

