# Pedir credenciales AFIP-ARCA de forma automatizada  

**Primero debemos generar la clave privada**  
**Despues debemos generar La solicitud del certificado**  
Las peticiones se hacen de forma automatica, solo deberemos hacer un par de cosad manuales para dejar todo listo.

## Pasos para obtener certificados y dar autorización  

**Nos dirigimos a [AFIP](https://www.afip.gob.ar/landing/default.asp), ingresamos a nuestra cuenta**
![Img Alt](./images/1.png)

**Nos saldra una pagina asi, buscamos WSA(testing), entramos**  
![Img Alt](./images/2.png)

**Vamos a la parte de nuevo certificado ubicado a la izquierda**  
![Img Alt](./images/3.png)  
pegamos el contenido del certificado y le damos a Crear DN y obtener certificado.  
Copiamos todo el resiltado, desde -----BEGIN CERTIFICATE----- hasta -----END CERTIFICATE----- (incluidos).  
Luego en nuestra computadora creamos un archivo certificado-afip.crt y pegamos el contenido dentro (pueden usar bloc de notas para hacerlo).  

**Autorizar el servicio**  
Teniendo el certificado-afip.crt tenemos que autorizar a nuestra aplicación para poder facturar, vamos a la opcion Crear autorizacion a servicio:
![Img Alt](./images/4.png)  
solo debemos seleccionar el servicio que queremos autorizar, en este caso la facturación electronica y le damos autorizar.  

## interactuar programáticamente con los Web Services de AFIP para emitir facturas  

1) Obtener un Ticket de Acceso (TA) del WSAA (Web Service de Autenticación y Autorización): Este TA es una credencial temporal (Token y Sign) que AFIP te da para autorizar tus llamadas a otros servicios.  

2) Utilizar el TA para llamar al WSFEV1 (Web Service de Factura Electrónica): Con el TA, podrás solicitar el CAE (Código de Autorización Electrónica) para tus facturas.

3) Una ves que obtenemos el token y sign podemos pedir el CAE, debemos enviar un archivo xml con los datos necesarios segun sea factura A,B,C, etc. Nos devolvera A -> aprobado R -> reprobado N -> procesando. De ahi debemos sacar el CAE y CAEFchVto para poner en la factura.pdf que le damos al cliente.  
