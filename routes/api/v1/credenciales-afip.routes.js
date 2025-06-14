import { Router } from "express";
import {generate_key_csr} from "../../../controllers/interactuar-afip-wsaa/1-get-key-csr/get-key-csr.js";
import {saveCrt} from "../../../controllers/interactuar-afip-wsaa/2-save-crt/save_crt.js";
import {getLoginTicket} from "../../../services/afip/3/get-login-ticket.js";
//import {createXML} from "../../../controllers/interactuar-afip-wsaa/4-get-cae-no/armarXML.js";

const afip_Router = Router();

//generar clave  privada y solicitud del certificado, le brindo la solicitud del certificado, el usuario crea el certificado en afip
afip_Router.post("/key-csr",generate_key_csr);

//el usuario manda el cdigo del certificado para que cree certificado.crt en la misma carpeta de lo demas
afip_Router.post("/create-crt", saveCrt);

//consigue el token y sign, solo necesita el id para buscar lo requerido en la carpeta del usuario
afip_Router.post("/get-ta", getLoginTicket);


//manda los datos de la factura para obtener el CAE, si esta aprobado pasoa generar la factura
//afip_Router.post("/get-cae",createXML); -> se usa directamente desde crear factura
/**/
export default afip_Router;