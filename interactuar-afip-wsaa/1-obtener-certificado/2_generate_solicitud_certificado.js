import { exec } from 'child_process';
import fs from 'fs/promises'; // Importa la versión de promesas de fs para uso asíncrono
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Redefine __filename y __dirname para el ámbito de módulos ES
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const keyFileName = 'private_key.key'; // Asegúrate de que esta clave exista
const csrFileName = 'certificate_request.csr';
const keyFilePath = path.join(__dirname, keyFileName);
const csrFilePath = path.join(__dirname, csrFileName);

// --- Función auxiliar para ejecutar comandos de shell de forma asíncrona ---
const executeShellCommand = async (command) => {
    return new Promise((resolve, reject) => {
        exec(command, (error, stdout, stderr) => {
            if (error) {
                const errorMessage = `Error ejecutando comando: ${command}\nError: ${error.message}\nStderr: ${stderr}`;
                return reject(new Error(errorMessage));
            }
            if (stderr) {
                console.warn(`[WARN] Stderr del comando "${command}":\n${stderr}`);
            }
            resolve({ stdout, stderr });
        });
    });
};

// --- Tu función generatePrivateKey (se asume que existe o la incluirás) ---
// Esta función es necesaria para que generateCsr funcione, ya que necesita la clave privada.
// Si no la tienes en el mismo archivo, deberás asegurarte de que generatePrivateKey.js
// se ejecute primero y genere el private_key.key antes de ejecutar este script.
export const generatePrivateKey = async () => {
    const command = `openssl genrsa -out "${keyFilePath}" 2048`;
    console.log(`[INFO] Generando clave privada en: ${keyFilePath}`);
    try {
        await executeShellCommand(command);
        console.log('[SUCCESS] Clave privada generada exitosamente.');
        return keyFilePath;
    } catch (error) {
        console.error('[ERROR] Falló la generación de la clave privada.');
        throw error;
    }
};

export async function generateCsr(datos) {
    // Verificar si la clave privada existe de forma asíncrona
    try {
        await fs.access(keyFilePath);
    } catch (error) {
        throw new Error(`La clave privada no se encontró en: ${keyFilePath}. Por favor, genérala primero.`);
    }

    // Información para el CSR
    const country = datos.country; // Argentina
    const state = datos.state; // Provincia
    const locality = datos.locality; // Localidad
    const organization = datos.organization; // Nombre de tu empresa
    const organizationalUnit = datos.organizationalUnit; // Unidad Organizacional (opcional)'Sistemas'
    const commonName = `CN=${organization}`; // Nombre común (puede ser el nombre de la empresa)
    const emailAddress = datos.emailAddress; // Email de contacto

    // **CRÍTICO para AFIP:** El CUIT debe ir en el SerialNumber
    const serialNumber = `CUIT ${datos.cuit}`;

    // Crea un archivo de configuración temporal para OpenSSL
    const configContent = `
[ req ]
default_bits = 2048
prompt = no
default_md = sha256
distinguished_name = dn_req

[ dn_req ]
countryName = ${country}
stateOrProvinceName = ${state}
localityName = ${locality}
organizationName = ${organization}
organizationalUnitName = ${organizationalUnit}
commonName = ${commonName}
emailAddress = ${emailAddress}
serialNumber = ${serialNumber}
`;
    const configFileName = 'openssl.cnf';
    const configFilePath = path.join(__dirname, configFileName);

    try {
        await fs.writeFile(configFilePath, configContent); // Escribe de forma asíncrona
        console.log(`Generando CSR en: ${csrFilePath}`);
        const command = `openssl req -new -key "${keyFilePath}" -out "${csrFilePath}" -config "${configFilePath}"`;
        await executeShellCommand(command); // Ejecuta el comando de forma asíncrona
        console.log('CSR generado exitosamente.');
        return csrFilePath;
    } catch (error) {
        console.error(`Error al generar el CSR: ${error.message}`);
        throw error;
    } finally {
        // Eliminar el archivo de configuración temporal de forma asíncrona
        try {
            await fs.unlink(configFilePath);
            console.log(`Archivo de configuración temporal eliminado: ${configFilePath}`);
        } catch (unlinkError) {
            console.warn(`[WARN] No se pudo eliminar el archivo de configuración temporal: ${unlinkError.message}`);
        }
    }
}

// Ejemplo de uso completo:
export async function generateAfipCredentials(datos) {
    try {
        // Asegúrate de que generatePrivateKey se haya ejecutado o que el archivo exista
        // Si no la tienes en el mismo script, puedes comentarla si ya sabes que la clave existe.
        const privateKeyPath = await generatePrivateKey();
        console.log(`Clave privada en: ${privateKeyPath}`);

        const csrPath = await generateCsr(datos);
        console.log(`CSR generado en: ${csrPath}`);

        const csrContent = await fs.readFile(csrPath, 'utf8'); // Lee el archivo de forma asíncrona

        console.log('\n--- Próximos pasos ---\n');
        console.log('1. Abra el archivo:', csrPath);
        console.log('2. Copie todo el contenido (incluyendo BEGIN y END).');
        console.log('3. Ingrese al portal de AFIP con su Clave Fiscal.');
        console.log('4. Vaya a "Administración de Certificados Digitales" (o "WSASS - Autogestión Certificados Homologación" para testing).');
        console.log('5. Solicite un nuevo certificado y pegue el contenido del CSR.');
        console.log('6. Descargue el certificado (.crt) que le provea AFIP.');
        console.log('7. Guarde ese archivo .crt junto a su private_key.key.');
        console.log('8. Recuerde delegar el servicio (WSFEV1 o WSMTXCA) a este certificado en "Administrador de Relaciones de Clave Fiscal".');

    } catch (err) {
        console.error('Error en el proceso de generación de credenciales:', err);
    }
}
