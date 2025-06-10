import { mkdir, stat } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export async function create_user_folder(id_user) {

    // Definir rutas (ajusta los niveles según necesites)
    const projectRoot = join(__dirname, `${process.env.CREATE_RAIZ}`); // Dos niveles arriba del archivo actual
    const raizUsersPath = join(projectRoot, 'raiz-users');
    const userFolderPath = join(raizUsersPath, id_user.toString());
    const userAfipPath = join(userFolderPath, 'afip');

    try {
        // Verificar/crear raiz-users
        try {
            await stat(raizUsersPath);
           // console.log('✓ Carpeta raiz-users ya existe');
        } catch (error) {
            if (error.code === 'ENOENT') {
                await mkdir(raizUsersPath);
              //  console.log('✓ Carpeta raiz-users creada');
            } else {
                throw error;
            }
        }

        // Crear carpeta del usuario
        await mkdir(userFolderPath);
        //console.log(`✓ Carpeta de usuario creada: ${userFolderPath}`);
        // Crear carpeta afip dentro de la carpeta del usuario
        await mkdir(userAfipPath);
        //console.log(`✓ Carpeta afip creada: ${userAfipPath}`);
        return userAfipPath;

    } catch (error) {
        console.error('✗ Error:', error.message);
        throw new Error(`No se pudo crear la estructura: ${error.message}`);
    }
}

