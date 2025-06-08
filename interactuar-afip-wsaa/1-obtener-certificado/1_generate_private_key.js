import { exec } from 'child_process';
import fs from 'fs'; // Aunque aquí no se usa directamente, es buena práctica
import path from 'path';
import { fileURLToPath } from 'url'; // Importamos fileURLToPath
import { dirname } from 'path';     // Importamos dirname de path

// Obtenemos __dirname equivalente en ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const keyFileName = 'private_key.key';
const keyFilePath = path.join(__dirname, keyFileName);

export async function generatePrivateKey() {
    return new Promise((resolve, reject) => {
        const command = `openssl genrsa -out "${keyFilePath}" 2048`; // Genera una clave RSA de 2048 bits

        console.log(`Generando clave privada en: ${keyFilePath}`);
        exec(command, (error, stdout, stderr) => {
            if (error) {
                console.error(`Error al generar la clave privada: ${error.message}`);
                // También es buena práctica loguear stderr para depuración
                if (stderr) {
                    console.error(`Stderr del comando: ${stderr}`);
                }
                return reject(error);
            }
            if (stderr) {
                console.warn(`Stderr al generar clave privada: ${stderr}`); // warn si no es un error crítico
            }
            console.log('Clave privada generada exitosamente.');
            resolve(keyFilePath);
        });
    });
}
