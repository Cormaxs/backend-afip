import { exec } from 'child_process';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import { dirname } from 'path';
import soap from 'soap';
import xml2js from 'xml2js';
import env from 'dotenv';

env.config();
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const config = {
    certificado: 'certificado.crt',
    clavePrivada: 'private_key.key',
    servicioId: 'wsfe',
    wsaaWsdl: process.env.WSAAWSD1,
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
const validateCredentials = async (userDirPath) => {
    // Construct the full paths to the certificate and private key files
    const certPath = path.join(userDirPath, config.certificado);
    const keyPath = path.join(userDirPath, config.clavePrivada);
    
    try {
        // Check if the certificate and private key files exist and are accessible
        await fs.access(certPath);
        await fs.access(keyPath);
        console.log(`[DEBUG] Certificado encontrado en: ${certPath}`);
        console.log(`[DEBUG] Clave privada encontrada en: ${keyPath}`);
        return { certPath, keyPath };
    } catch (error) {
        throw new Error(`[ERROR FATAL] Archivo de credencial no encontrado o sin permisos en ${userDirPath}: ${error.message}`);
    }
};

const generateLoginTicketRequest = async (seqNr, timestamps, userDirPath) => {
    // XML content for the login ticket request
    const traXmlContent = `
        <loginTicketRequest>
            <header>
                <uniqueId>${timestamps.uniqueId}</uniqueId>
                <generationTime>${timestamps.generationTime}</generationTime>
                <expirationTime>${timestamps.expirationTime}</expirationTime>
            </header>
            <service>${config.servicioId}</service>
        </loginTicketRequest>
    `.trim().replace(/>\s+</g, '><'); // Remove whitespace between tags for cleaner XML

    // Construct the output XML file path within the user's directory
    const outXml = path.join(userDirPath, `${seqNr}-LoginTicketRequest.xml`);
    // Write the XML content to the file
    await fs.writeFile(outXml, traXmlContent, { encoding: 'ascii' });
    console.log(`[SUCCESS] TRA XML generado en: ${outXml}`);
    return outXml;
};

const signRequest = async (seqNr, xmlFilePath, certPath, keyPath, userDirPath) => {
    // Construct the output CMS-DER file path within the user's directory
    const outCmsDer = path.join(userDirPath, `${seqNr}-LoginTicketRequest.xml.cms-DER`);
    // OpenSSL command to sign the XML request
    const signCmsCommand = `openssl cms -sign -in "${xmlFilePath}" -signer "${certPath}" -inkey "${keyPath}" -nodetach -outform der -out "${outCmsDer}"`;
    // Execute the shell command
    await executeShellCommand(signCmsCommand);
    console.log(`[SUCCESS] CMS firmado y guardado en: ${outCmsDer}`);
    return outCmsDer;
};

const encodeToBase64 = async (seqNr, cmsFilePath, userDirPath) => {
    // Construct the output Base64 encoded file path within the user's directory
    const outCmsB64 = path.join(userDirPath, `${seqNr}-LoginTicketRequest.xml.cms-DER-b64`);
    // OpenSSL command to Base64 encode the CMS-DER file
    const base64EncodeCommand = `openssl base64 -in "${cmsFilePath}" -e -out "${outCmsB64}"`;
    // Execute the shell command
    await executeShellCommand(base64EncodeCommand);
    console.log(`[SUCCESS] CMS Base64 codificado y guardado en: ${outCmsB64}`);
    return outCmsB64;
};

const callWSAA = async (seqNr, cmsB64FilePath, userDirPath) => {
    // Read the Base64 encoded CMS content
    const cmsBase64Content = (await fs.readFile(cmsB64FilePath, { encoding: 'utf8' })).trim();
    
    console.log(`[INFO] Llamando al método 'loginCms' del WSAA con el servicio ID: "${config.servicioId}"`);
    
    // Create a SOAP client for the WSAA WSDL
    const client = await soap.createClientAsync(config.wsaaWsdl);
    // Disable SSL certificate validation (for development/testing with self-signed certs)
    client.wsdl.options.rejectUnauthorized = false;
    client.wsdl.options.strictSSL = false;
    
    // Call the 'loginCms' method with the Base64 content
    const rawSoapResult = await client.loginCmsAsync({ in0: cmsBase64Content });
    
    // Validate the SOAP response structure
    if (!rawSoapResult || !Array.isArray(rawSoapResult) || typeof rawSoapResult[0]?.loginCmsReturn === 'undefined') {
        const errorDetails = rawSoapResult ? JSON.stringify(rawSoapResult) : 'Resultado SOAP vacío o inesperado.';
        throw new Error(`La llamada a 'loginCms' no devolvió la propiedad 'loginCmsReturn'. Resultado: ${errorDetails}`);
    }
    
    const wsaaResponseXml = rawSoapResult[0].loginCmsReturn;
    // Construct the response XML file path within the user's directory
    const responseFileName = path.join(userDirPath, `${seqNr}-loginTicketResponse.xml`);
    // Write the WSAA response to a file
    await fs.writeFile(responseFileName, wsaaResponseXml, { encoding: 'utf8' });
    
    console.log('\n--- Respuesta del WSAA ---');
    console.log(wsaaResponseXml);
    console.log('-------------------------');
    
    return wsaaResponseXml;
};

const parseResponse = async (xmlResponse) => {
    // Create an XML parser
    const parser = new xml2js.Parser();
    // Parse the XML response
    const parsedResult = await parser.parseStringPromise(xmlResponse);
    
    // Validate the parsed XML structure for required fields
    if (!parsedResult?.loginTicketResponse?.credentials?.[0]?.token?.[0] || 
        !parsedResult?.loginTicketResponse?.credentials?.[0]?.sign?.[0] ||
        !parsedResult?.loginTicketResponse?.header?.[0]?.expirationTime?.[0]) {
        throw new Error('La respuesta XML del WSAA no tiene la estructura esperada para un Login Ticket válido');
    }
    
    // Extract token, sign, and expiration time from the parsed result
    return {
        token: parsedResult.loginTicketResponse.credentials[0].token[0],
        sign: parsedResult.loginTicketResponse.credentials[0].sign[0],
        expirationTime: parsedResult.loginTicketResponse.header[0].expirationTime[0]
    };
};

const saveCredentials = async (credentials, userDirPath) => {
    // Construct the credentials file path within the user's directory
    const credentialsFilePath = path.join(userDirPath, config.credentialsFile);
    // Write the credentials object as JSON to the file
    await fs.writeFile(credentialsFilePath, JSON.stringify(credentials, null, 2), { encoding: 'utf8' });
    console.log(`[SUCCESS] Credenciales guardadas en: ${credentialsFilePath}`);
};

const cleanupFiles = async (seqNr, userDirPath) => {
    // List of temporary files to clean up, constructed with the user's directory path
    const filesToClean = [
        path.join(userDirPath, `${seqNr}-LoginTicketRequest.xml`),
        path.join(userDirPath, `${seqNr}-LoginTicketRequest.xml.cms-DER`),
        path.join(userDirPath, `${seqNr}-LoginTicketRequest.xml.cms-DER-b64`)
    ];
    
    for (const file of filesToClean) {
        try {
            // Check if the file exists before attempting to delete
            await fs.access(file);
            await fs.unlink(file); // Delete the file
            console.log(`[INFO] Eliminado: ${file}`);
        } catch (cleanError) {
            // If the error is 'ENOENT' (file not found), it means it was already deleted or never created, so no warning needed
            if (cleanError.code !== 'ENOENT') {
                console.warn(`[WARN] No se pudo eliminar ${file}: ${cleanError.message}`);
            }
        }
    }
};

// Main Function
export async function getLoginTicket(req, res) {
    const {id} = req.body;
    console.log('[INFO] Iniciando proceso para obtener Login Ticket...');
    const timestamps = generateTimestampId();
    // Define the user-specific AFIP directory path
    const userAfipDirPath = path.join(__dirname, `${process.env.RAIZ_USERS}${id}/afip`);

    try {
        // Ensure the user-specific AFIP directory exists
        await fs.mkdir(userAfipDirPath, { recursive: true });
        console.log(`[DEBUG] Directorio de usuario AFIP verificado/creado en: ${userAfipDirPath}`);

        // 1. Validate credentials: now checks in userAfipDirPath
        const { certPath, keyPath } = await validateCredentials(userAfipDirPath);
        
        // 2. Generate request: creates XML in userAfipDirPath
        const xmlFilePath = await generateLoginTicketRequest(timestamps.seqNr, timestamps, userAfipDirPath);
        
        // 3. Sign request: creates CMS-DER in userAfipDirPath
        const cmsFilePath = await signRequest(timestamps.seqNr, xmlFilePath, certPath, keyPath, userAfipDirPath);
        
        // 4. Encode to Base64: creates Base64 file in userAfipDirPath
        const cmsB64FilePath = await encodeToBase64(timestamps.seqNr, cmsFilePath, userAfipDirPath);
        
        // 5. Call WSAA: saves response XML in userAfipDirPath
        const xmlResponse = await callWSAA(timestamps.seqNr, cmsB64FilePath, userAfipDirPath);
        
        // 6. Parse response
        const credentials = await parseResponse(xmlResponse);
        
        // 7. Save credentials: saves JSON in userAfipDirPath
        await saveCredentials(credentials, userAfipDirPath);
        
        console.log('[SUCCESS] Login Ticket obtenido exitosamente:');
        console.log('    Token:', credentials.token);
        console.log('    Sign:', credentials.sign);
        console.log('    Expiración:', credentials.expirationTime);
        
        res.status(200).send({message: credentials});
    } catch (error) {
        console.error('\n[ERROR] --- Falló el proceso de obtención de Login Ticket ---');
        console.error(error.stack || error.message);
        
        // Save error in a file within the user's directory
        const errorFileName = path.join(userAfipDirPath, `${timestamps.seqNr}-loginTicketResponse-ERROR.xml`);
        await fs.writeFile(errorFileName, error.stack || error.message, { encoding: 'utf8' });
        console.error(`[ERROR] Detalles del error guardados en: ${errorFileName}`);
        
        throw error;
    } finally {
        // Clean up temporary files from the user's directory
        await cleanupFiles(timestamps.seqNr, userAfipDirPath);
    }
}

// Direct execution if it's the main module
/*
if (import.meta.url === pathToFileURL(process.argv[1]).href) {
    console.log('[INFO] Ejecutando como script principal...');
    getLoginTicket("68461df88d6bb3a5695042be") // Example ID
        .then(credentials => {
            console.log('\n--- PROCESO FINALIZADO EXITOSAMENTE ---');
            console.log('Credenciales obtenidas correctamente.');
        })
        .catch(err => {
            console.error('\n[FATAL] ERROR GRAVE: No se pudo completar el proceso.');
            process.exit(1);
        });
}
*/