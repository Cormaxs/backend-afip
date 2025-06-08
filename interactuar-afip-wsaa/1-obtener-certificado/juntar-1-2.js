import {generatePrivateKey} from './1_generate_private_key.js';
import {generateAfipCredentials} from './2_generate_solicitud_certificado.js';

const datos_necesarios = {
    "country": "AR",
    "state": "Buenos Aires",
    "locality": "Ciudad Autonoma de Buenos Aires",
    "organization": "Mi Empresa S.A.",
    "organizationalUnit": "Sistemas",
    "emailAddress": "contacto@miempresa.com.ar",
    "cuit": "20123456789"
  }


export async function generarTodo(){
    const clavePrivada = await generatePrivateKey();
    const credencialesAfip = await generateAfipCredentials(datos_necesarios);
console.log(clavePrivada);
console.log(credencialesAfip);
}

generarTodo()