import { exec } from 'child_process';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Redefine __filename y __dirname para módulos ES
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Función auxiliar para ejecutar comandos de shell
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

export async function generateCsr(datos, id) {
    const userAfipDirPath = path.join(__dirname, `${process.env.RAIZ_USERS}${id}/afip`);
    const keyFileName = 'private_key.key'; // Asegúrate de que esta clave exista
    const keyFilePath = path.join(userAfipDirPath, keyFileName);
    const csrFileName = 'certificate_request.csr';
    const csrFilePath = path.join(userAfipDirPath, csrFileName);

    try {
        await fs.access(keyFilePath);
    } catch (error) {
        throw new Error(`La clave privada no se encontró en: ${keyFilePath}. Por favor, genérala primero.`);
    }

    const { country, state, locality, organization, organizationalUnit, emailAddress, cuit } = datos;

    // CRÍTICO para AFIP: El CUIT debe ir en el SerialNumber
    const serialNumber = `CUIT ${cuit}`;

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
commonName = CN=${organization}
emailAddress = ${emailAddress}
serialNumber = ${serialNumber}
`;
    const configFileName = `openssl_config_${id}.cnf`; // Nombre de archivo de configuración único por ID
    const configFilePath = path.join(userAfipDirPath, configFileName);

    try {
        await fs.writeFile(configFilePath, configContent);
        console.log(`Generando CSR en: ${csrFilePath}`);
        const command = `openssl req -new -key "${keyFilePath}" -out "${csrFilePath}" -config "${configFilePath}"`;
        await executeShellCommand(command);
        console.log('CSR generado exitosamente.');
        return csrFilePath;
    } catch (error) {
        console.error(`Error al generar el CSR: ${error.message}`);
        throw error;
    } finally {
        // Eliminar el archivo de configuración temporal
        try {
            await fs.unlink(configFilePath);
            console.log(`Archivo de configuración temporal eliminado: ${configFilePath}`);
        } catch (unlinkError) {
            console.warn(`[WARN] No se pudo eliminar el archivo de configuración temporal: ${unlinkError.message}`);
        }
    }
}

export async function generateAfipCredentials(datos, id) {
    try {
        const csrPath = await generateCsr(datos, id);
        console.log(`CSR generado en: ${csrPath}`);

        const csrContent = await fs.readFile(csrPath, 'utf8');

        console.log('\n--- Próximos pasos ---\n');
        console.log('1. Abra el archivo:', csrPath);
        console.log('2. Copie todo el contenido (incluyendo BEGIN y END).');
        console.log('3. Ingrese al portal de AFIP con su Clave Fiscal.');
        console.log('4. Vaya a "Administración de Certificados Digitales" (o "WSASS - Autogestión Certificados Homologación" para testing).');
        console.log('5. Solicite un nuevo certificado y pegue el contenido del CSR.');
        console.log('6. Descargue el certificado (.crt) que le provea AFIP.');
        console.log('7. Guarde ese archivo .crt junto a su private_key.key.');
        console.log('8. Recuerde delegar el servicio (WSFEV1 o WSMTXCA) a este certificado en "Administrador de Relaciones de Clave Fiscal".');
        return csrContent;
    } catch (err) {
        console.error('Error en el proceso de generación de credenciales:', err);
        throw err; // Re-lanza el error para que la función que llama pueda manejarlo
    }
}