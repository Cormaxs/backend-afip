import { generatePrivateKey } from './1_generate_private_key.js';
import { generateAfipCredentials } from './2_generate_solicitud_certificado.js';

const datos_necesarios = {
    "country": "AR",
    "state": "Buenos Aires",
    "locality": "Ciudad Autonoma de Buenos Aires",
    "organization": "Mi Empresa S.A.",
    "organizationalUnit": "Sistemas",
    "emailAddress": "contacto@miempresa.com.ar",
    "cuit": "20123456789"
}

// pasar datos necesarios desde el frontend
export async function generarTodo(id, datos) { // Se cambió el orden de los parámetros para consistencia
    try {
      const idString = id.toString();
        const clavePrivada = await generatePrivateKey(idString);
        console.log('Ruta de la Clave Privada:', clavePrivada); // Registra la ruta devuelta por generatePrivateKey

        const credencialesAfip = await generateAfipCredentials(datos, idString);
        console.log('Proceso de Credenciales AFIP Completado. Ruta del CSR (si fue exitoso):', credencialesAfip);
    } catch (error) {
        console.error('Error en generarTodo:', error);
    }
}

// Ejemplo de uso:
generarTodo("68461df88d6bb3a5695042be", datos_necesarios);