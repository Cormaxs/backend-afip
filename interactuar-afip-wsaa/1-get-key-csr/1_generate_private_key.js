import { exec } from 'child_process';
import fs from 'fs'; // Necesitamos fs para crear directorios
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Obtenemos __dirname equivalente en ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// El nombre del archivo de la clave
const keyFileName = 'private_key.key';

export async function generatePrivateKey(id) {
    // Definimos la ruta base para el usuario y el subdirectorio 'afip'
    // Esta ruta incluye el 'id' para hacerla específica por usuario.
    const userAfipDirPath = path.join(__dirname, `../../raiz-users/${id}/afip`);
    
    // Ahora, la ruta completa donde se guardará la clave
    const keyFilePath = path.join(userAfipDirPath, keyFileName);

    return new Promise(async (resolve, reject) => {
        try {
            // Aseguramos que el directorio exista antes de intentar guardar la clave
            // recursive: true permite crear directorios anidados si no existen
            await fs.promises.mkdir(userAfipDirPath, { recursive: true }); 
        } catch (dirError) {
            console.error(`Error al crear el directorio ${userAfipDirPath}: ${dirError.message}`);
            return reject(dirError);
        }

        // El comando de OpenSSL para generar la clave, usando la nueva keyFilePath
        const command = `openssl genrsa -out "${keyFilePath}" 2048`;

        console.log(`Generando clave privada en: ${keyFilePath}`);
        exec(command, (error, stdout, stderr) => {
            if (error) {
                console.error(`Error al generar la clave privada: ${error.message}`);
                if (stderr) {
                    console.error(`Stderr del comando: ${stderr}`);
                }
                return reject(error);
            }
            if (stderr) {
                console.warn(`Stderr al generar clave privada: ${stderr}`);
            }
            console.log('Clave privada generada exitosamente.');
            resolve(keyFilePath); // Resolvemos con la ruta donde se guardó la clave
        });
    });
}

//generatePrivateKey("68461df88d6bb3a5695042be")