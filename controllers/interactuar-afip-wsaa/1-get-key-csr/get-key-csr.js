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
export async function generate_key_csr(req, res) {
    // Validar que id y datos existan en el cuerpo de la solicitud
    if (!req.body.id || !req.body.datos) {
        return res.status(400).send({ message: 'Missing required parameters: "id" and/or "datos".' });
    }

    const { id, datos } = req.body;
    const idString = id.toString(); // Ensure id is treated as a string

    try {
        // Generar la clave privada
        const clavePrivadaPath = await generatePrivateKey(idString);
        console.log('Ruta de la Clave Privada:', clavePrivadaPath);

        // Generar las credenciales AFIP (esto debería incluir la generación del CSR)
        const credencialesAfipResult = await generateAfipCredentials(datos, idString);
        console.log('Proceso de Credenciales AFIP Completado. Resultado:', credencialesAfipResult);
        
        // Si todo es exitoso, enviar una respuesta 200 OK
        res.status(200).send({
            message: 'Key y csr generados exitosamente.',
            privateKeyPath: `KEY guardada en : ${clavePrivadaPath}`,
            afipCredentialsResult: `copiar csr: ${credencialesAfipResult}` // Puedes enviar más detalles si son útiles para el frontend
        });

    } catch (error) {
        console.error('Error in generate_key_csr:', error); // Log the detailed error for debugging

        // Determinar el tipo de error y enviar una respuesta adecuada
        if (error.message.includes('clave privada')) {
            // Ejemplo de manejo específico si sabemos que generatePrivateKey puede fallar de cierta manera
            res.status(500).send({ message: 'Failed to generate private key. Please try again.', error: error.message });
        } else if (error.message.includes('credenciales AFIP')) {
            // Ejemplo de manejo específico para generateAfipCredentials
            res.status(500).send({ message: 'Failed to generate AFIP credentials or CSR. Please check the provided data.', error: error.message });
        } else {
            // Manejo de errores genérico
            res.status(500).send({ message: 'An unexpected error occurred during the key and CSR generation process.', error: error.message });
        }
    }
}
// Ejemplo de uso:
//generarTodo("68461df88d6bb3a5695042be", datos_necesarios);