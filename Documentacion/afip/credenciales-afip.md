# Pedir credenciales AFIP-ARCA

1) **Primero debemos generar la clave privada**  
2) **Despues debemos generar La solicitud del certificado**  
3) **Luego debemos solicitar y autorizar el certificado [Aquí](./get-crt-autorize.md)**

## interactuar programáticamente con los Web Services de AFIP para emitir facturas  

1) Obtener un Ticket de Acceso (TA) del WSAA (Web Service de Autenticación y Autorización): Este TA es una credencial temporal (Token y Sign) que AFIP te da para autorizar tus llamadas a otros servicios.  

2) Utilizar el TA para llamar al WSFEV1 (Web Service de Factura Electrónica): Con el TA, podrás solicitar el CAE (Código de Autorización Electrónica) para tus facturas.

3) Una ves que obtenemos el token y sign podemos pedir el CAE, debemos enviar un archivo xml con los datos necesarios segun sea factura A,B,C, etc. Nos devolvera:  
A -> aprobado  
R -> reprobado  
P -> procesando.  
De ahi debemos sacar el CAE y CAEFchVto para poner en la factura.pdf que le damos al cliente.  

## ¿Dónde se guardan los archivos?

Los archivos de cada usuario se guardan de forma individual en la carpeta.  
**/raiz-users/:id.**  
dentro hay 2 carpetas mas.  
**/afip** -> contiene certificado.crt, private_key.key, afip_credentials.json, 20250609T005-loginTicketResponse.xml.  
**/facturas-pdf** -> todas las facturas emitidas por el usuario.  

**¿porqué hacerlo así?**  
La separacion de cada usuario es por motivos de eficiencia y seguridad.  
