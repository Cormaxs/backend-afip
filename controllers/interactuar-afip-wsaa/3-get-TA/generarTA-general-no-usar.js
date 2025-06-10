import { exec } from 'child_process';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import { dirname } from 'path';
import soap from 'soap';
import xml2js from 'xml2js';

// Configuración
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const config = {
    certificado: 'certificado.crt',
    clavePrivada: 'private_key.key',
    servicioId: 'wsfe',
    wsaaWsdl: 'https://wsaahomo.afip.gov.ar/ws/services/LoginCms?WSDL',
    credentialsFile: 'afip_credentials.json',
};

// Helpers
const executeShellCommand = async (command) => {
    return new Promise((resolve, reject) => {
        exec(command, (error, stdout, stderr) => {
            if (error) {
                const errorMessage = `Error ejecutando comando: "${command}"\nError: ${error.message}\nStderr: ${stderr}`;
                return reject(new Error(errorMessage));
            }
            if (stderr && stderr.trim()) {
                console.warn(`[WARN] Stderr del comando "${command}":\n${stderr.trim()}`);
            }
            resolve({ stdout, stderr });
        });
    });
};

const generateTimestampId = () => {
    const now = new Date();
    return {
        seqNr: now.toISOString().replace(/[-:.]/g, '').slice(0, 12), // YYYYMMDDHHmm
        uniqueId: `${now.getFullYear().toString().slice(2)}${(now.getMonth() + 1).toString().padStart(2, '0')}${now.getDate().toString().padStart(2, '0')}${now.getHours().toString().padStart(2, '0')}${now.getMinutes().toString().padStart(2, '0')}`,
        generationTime: new Date(now.getTime() - 10 * 60 * 1000).toISOString().slice(0, 19) + 'Z',
        expirationTime: new Date(now.getTime() + 10 * 60 * 1000).toISOString().slice(0, 19) + 'Z'
    };
};

// Process Steps
const validateCredentials = async () => {
    const certPath = path.join(__dirname, config.certificado);
    const keyPath = path.join(__dirname, config.clavePrivada);
    
    try {
        await fs.access(certPath);
        await fs.access(keyPath);
        console.log(`[DEBUG] Certificado encontrado en: ${certPath}`);
        console.log(`[DEBUG] Clave privada encontrada en: ${keyPath}`);
        return { certPath, keyPath };
    } catch (error) {
        throw new Error(`[ERROR FATAL] Archivo de credencial no encontrado o sin permisos: ${error.message}`);
    }
};

const generateLoginTicketRequest = async (seqNr, timestamps) => {
    const traXmlContent = `
        <loginTicketRequest>
            <header>
                <uniqueId>${timestamps.uniqueId}</uniqueId>
                <generationTime>${timestamps.generationTime}</generationTime>
                <expirationTime>${timestamps.expirationTime}</expirationTime>
            </header>
            <service>${config.servicioId}</service>
        </loginTicketRequest>
    `.trim().replace(/>\s+</g, '><');

    const outXml = `${seqNr}-LoginTicketRequest.xml`;
    await fs.writeFile(outXml, traXmlContent, { encoding: 'ascii' });
    console.log(`[SUCCESS] TRA XML generado en: ${outXml}`);
    return outXml;
};

const signRequest = async (seqNr, xmlFilePath, certPath, keyPath) => {
    const outCmsDer = `${seqNr}-LoginTicketRequest.xml.cms-DER`;
    const signCmsCommand = `openssl cms -sign -in "${xmlFilePath}" -signer "${certPath}" -inkey "${keyPath}" -nodetach -outform der -out "${outCmsDer}"`;
    await executeShellCommand(signCmsCommand);
    console.log(`[SUCCESS] CMS firmado y guardado en: ${outCmsDer}`);
    return outCmsDer;
};

const encodeToBase64 = async (seqNr, cmsFilePath) => {
    const outCmsB64 = `${seqNr}-LoginTicketRequest.xml.cms-DER-b64`;
    const base64EncodeCommand = `openssl base64 -in "${cmsFilePath}" -e -out "${outCmsB64}"`;
    await executeShellCommand(base64EncodeCommand);
    console.log(`[SUCCESS] CMS Base64 codificado y guardado en: ${outCmsB64}`);
    return outCmsB64;
};

const callWSAA = async (seqNr, cmsB64FilePath) => {
    const cmsBase64Content = (await fs.readFile(cmsB64FilePath, { encoding: 'utf8' })).trim();
    
    console.log(`[INFO] Llamando al método 'loginCms' del WSAA con el servicio ID: "${config.servicioId}"`);
    
    const client = await soap.createClientAsync(config.wsaaWsdl);
    client.wsdl.options.rejectUnauthorized = false;
    client.wsdl.options.strictSSL = false;
    
    const rawSoapResult = await client.loginCmsAsync({ in0: cmsBase64Content });
    
    if (!rawSoapResult || !Array.isArray(rawSoapResult) || typeof rawSoapResult[0]?.loginCmsReturn === 'undefined') {
        const errorDetails = rawSoapResult ? JSON.stringify(rawSoapResult) : 'Resultado SOAP vacío o inesperado.';
        throw new Error(`La llamada a 'loginCms' no devolvió la propiedad 'loginCmsReturn'. Resultado: ${errorDetails}`);
    }
    
    const wsaaResponseXml = rawSoapResult[0].loginCmsReturn;
    const responseFileName = `${seqNr}-loginTicketResponse.xml`;
    await fs.writeFile(responseFileName, wsaaResponseXml, { encoding: 'utf8' });
    
    console.log('\n--- Respuesta del WSAA ---');
    console.log(wsaaResponseXml);
    console.log('-------------------------');
    
    return wsaaResponseXml;
};

const parseResponse = async (xmlResponse) => {
    const parser = new xml2js.Parser();
    const parsedResult = await parser.parseStringPromise(xmlResponse);
    
    if (!parsedResult?.loginTicketResponse?.credentials?.[0]?.token?.[0] || 
        !parsedResult?.loginTicketResponse?.credentials?.[0]?.sign?.[0] ||
        !parsedResult?.loginTicketResponse?.header?.[0]?.expirationTime?.[0]) {
        throw new Error('La respuesta XML del WSAA no tiene la estructura esperada para un Login Ticket válido');
    }
    
    return {
        token: parsedResult.loginTicketResponse.credentials[0].token[0],
        sign: parsedResult.loginTicketResponse.credentials[0].sign[0],
        expirationTime: parsedResult.loginTicketResponse.header[0].expirationTime[0]
    };
};

const saveCredentials = async (credentials) => {
    const credentialsFilePath = path.join(__dirname, config.credentialsFile);
    await fs.writeFile(credentialsFilePath, JSON.stringify(credentials, null, 2), { encoding: 'utf8' });
    console.log(`[SUCCESS] Credenciales guardadas en: ${credentialsFilePath}`);
};

const cleanupFiles = async (seqNr) => {
    const filesToClean = [
        `${seqNr}-LoginTicketRequest.xml`,
        `${seqNr}-LoginTicketRequest.xml.cms-DER`,
        `${seqNr}-LoginTicketRequest.xml.cms-DER-b64`
    ];
    
    for (const file of filesToClean) {
        try {
            await fs.access(file);
            await fs.unlink(file);
            console.log(`[INFO] Eliminado: ${file}`);
        } catch (cleanError) {
            if (cleanError.code !== 'ENOENT') {
                console.warn(`[WARN] No se pudo eliminar ${file}: ${cleanError.message}`);
            }
        }
    }
};

// Main Function
export async function getLoginTicket() {
    console.log('[INFO] Iniciando proceso para obtener Login Ticket...');
    const timestamps = generateTimestampId();
    
    try {
        // 1. Validar credenciales
        const { certPath, keyPath } = await validateCredentials();
        
        // 2. Generar solicitud
        const xmlFilePath = await generateLoginTicketRequest(timestamps.seqNr, timestamps);
        
        // 3. Firmar solicitud
        const cmsFilePath = await signRequest(timestamps.seqNr, xmlFilePath, certPath, keyPath);
        
        // 4. Codificar a Base64
        const cmsB64FilePath = await encodeToBase64(timestamps.seqNr, cmsFilePath);
        
        // 5. Llamar al WSAA
        const xmlResponse = await callWSAA(timestamps.seqNr, cmsB64FilePath);
        
        // 6. Parsear respuesta
        const credentials = await parseResponse(xmlResponse);
        
        // 7. Guardar credenciales
        await saveCredentials(credentials);
        
        console.log('[SUCCESS] Login Ticket obtenido exitosamente:');
        console.log('    Token:', credentials.token);
        console.log('    Sign:', credentials.sign);
        console.log('    Expiración:', credentials.expirationTime);
        
        return credentials;
    } catch (error) {
        console.error('\n[ERROR] --- Falló el proceso de obtención de Login Ticket ---');
        console.error(error.stack || error.message);
        
        // Guardar error en archivo
        const errorFileName = `${timestamps.seqNr}-loginTicketResponse-ERROR.xml`;
        await fs.writeFile(errorFileName, error.stack || error.message, { encoding: 'utf8' });
        console.error(`[ERROR] Detalles del error guardados en: ${errorFileName}`);
        
        throw error;
    } finally {
        await cleanupFiles(timestamps.seqNr);
    }
}

// Ejecución directa si es el módulo principal
if (import.meta.url === pathToFileURL(process.argv[1]).href) {
    console.log('[INFO] Ejecutando como script principal...');
    getLoginTicket()
        .then(credentials => {
            console.log('\n--- PROCESO FINALIZADO EXITOSAMENTE ---');
            console.log('Credenciales obtenidas correctamente.');
        })
        .catch(err => {
            console.error('\n[FATAL] ERROR GRAVE: No se pudo completar el proceso.');
            process.exit(1);
        });
}