# Orden de creación de colecciones

## Para evitar errores de dependencia se deben crear en este orden  

1) Empresa -> los datos requeridos son :

```bash
{
  "nombreEmpresa": "Comercializadora del Sur SRL",
  "razonSocial": "Comercializadora del Sur Sociedad de Responsabilidad Limitada",
  "cuit": "20-12345678-7",
  "iibb": "902-876543-2",
  "fechaInicioActividades": "2018-03-01T00:00:00.000Z",
  "condicionIVA": "Responsable Inscripto",
  "actividadAFIP": "475200",
  "metodoContabilidad": "Contado",
  "mesInicioFiscal": 1,
  "telefonoContacto": "+542615551122",
  "numeroWhatsapp": "+5492615551122",
  "emailContacto": "info@comercializadoradelsur.com.ar",
  "pais": "Argentina",
  "provincia": "Mendoza",
  "ciudad": "Ciudad de Mendoza",
  "codigoPostal": "M5500",
  "direccion": "Av. San Martín 1500",
  "zonaHoraria": "America/Argentina/Mendoza",
  "monedaDefault": "PES",
  "certificadoDigital": "contenido_o_ruta_del_certificado_base64",
  "clavePrivada": "contenido_o_ruta_de_la_clave_privada_base64",
  "fechaVencimientoCertificado": "2026-12-31T23:59:59.000Z",
  "ambienteAFIP": "HOMOLOGACION"
}
```  

2) Gerente / propietario ->  Referencia a empresa

```bash
{
  "username": "cuentaejemplo",
  "password": "SecurePassword123!",
  "email": "martina.garcia@innovatech.com",
  "empresa": "684b20ec17d809f55dd91864", 
  "rol": "admin_principal",
  "nombre": "Martina",
  "apellido": "García",
  "activo": true
}
```  

3) punto de venta -> Referencia a empresa

```bash
{
  "empresa": "684b20ec17d809f55dd91864",
  "numero": 1,
  "nombre": "Casa Central Buenos Aires",
  "activo": true,
  "ultimoCbteAutorizado": 1234,
  "fechaUltimoCbte": "2025-06-10T10:30:00.000Z",
  "direccion": "Avenida Corrientes 1234",
  "ciudad": "Ciudad Autónoma de Buenos Aires",
  "provincia": "Buenos Aires",
  "codigoPostal": "C1043AAW",
  "telefono": "+541148765432"
}
```  

4) Vendedores -> Referencia a empresa y puntos de venta

```bash
{
  "username": "carlos.gomez",
  "password": "SecurePassword123!",
  "email": "carlos.gomez@empresa.com",
  "empresa": "666a2b3c4d5e6f7a8b9c0d1e",
  "rol": "vendedor_activo",
  "puntosVentaAsignados": [
    "666b1a2c3d4e5f6a7b8c9d0f",
    "666c2d3e4f5a6b7c8d9e0f1a"
  ],
  "nombre": "Carlos",
  "apellido": "Gómez",
  "telefono": "+5491155551234",
  "dni": "30123456"
}
```  

5) Historial de facturas emitidas -> 

```bash
{
  "empresa": "684b20ec17d809f55dd91864",
  "vendedor": "684b210e17d809f55dd91868",
  "puntoDeVenta": "666b1a2c3d4e5f6a7b8c9d0f",
  "tipoComprobante": "FACTURA B",
  "codigoTipoComprobante": "006",
  "numeroComprobanteInterno": 45,
  "numeroComprobanteCompleto": "00002-00000045",
  "fechaEmision": "2025-06-12T15:00:00.000Z",
  "cae": "70002758123456",
  "fechaVtoCae": "2025-06-22T23:59:59.000Z",
  "estadoAFIP": "A",
  "observacionesAFIP": "Comprobante aprobado correctamente.",
  "receptor": {
    "razonSocial": "Consumidor Final",
    "cuit": null,
    "docTipo": 99,
    "docNro": "0",
    "condicionIVA": "Consumidor Final",
    "condicionIVACodigo": 5,
    "domicilio": "Calle Siempre Viva 742",
    "localidad": "Springfield",
    "provincia": "Buenos Aires",
    "email": "consumidor.final@example.com"
  },
  "items": [
    {
      "codigo": "SERV001",
      "descripcion": "Servicio de consultoría mensual",
      "cantidad": 1,
      "precioUnitario": 50000.00,
      "descuentoPorcentaje": 0,
      "descuentoMonto": 0,
      "importeNetoItem": 50000.00,
      "alicuotaIVA": 21,
      "importeIVAItem": 10500.00,
      "importeTotalItem": 60500.00,
      "unidadMedida": "UNIDAD"
    },
    {
      "codigo": "PROD005",
      "descripcion": "Licencia de software anual",
      "cantidad": 2,
      "precioUnitario": 15000.00,
      "descuentoPorcentaje": 10,
      "descuentoMonto": 3000.00,
      "importeNetoItem": 27000.00,
      "alicuotaIVA": 21,
      "importeIVAItem": 5670.00,
      "importeTotalItem": 32670.00,
      "unidadMedida": "UNIDAD"
    }
  ],
  "importeNeto": 77000.00,
  "importeIVA": 16170.00,
  "importeTributos": 0,
  "importeExento": 0,
  "importeNoGravado": 0,
  "importeTotal": 93170.00,
  "metodoPago": "Transferencia Bancaria",
  "montoPagado": 93170.00,
  "saldoPendiente": 0,
  "pagos": [
    {
      "metodo": "Transferencia Bancaria",
      "monto": 93170.00,
      "fecha": "2025-06-12T16:00:00.000Z"
    }
  ],
  "fechaPago": "2025-06-12T16:00:00.000Z",
  "estadoPago": "Pagado",
  "observaciones": "Servicios prestados según contrato X.",
  "leyendaAFIP": "Operación exenta de IIBB.",
  "qrDataString": "https://www.afip.gob.ar/fe/qr/qr-data?c=...",
  "qrCodeImageUrl": "https://tu-storage.com/qr/factura-b-00002-00000045.png"
}
```  

Todo se basa en referenciar a Empresa para saber bajo que entidad va a operar al momento de entrar a la cuenta, hacer las facturas, etc.  
