# TODO RELACIONADO CON LA CREACION DE FACTURAS

Todo acerca de como se ejecuta una facturacion para [afip-arca](https://www.afip.gob.ar/landing/default.asp) desde la Plataforma [FACTURITA](https://facturita.com)

Ver trayecto [Developers](./armar-factura-ruta.md)  

POST

Recibe un input por body con el cual genera un pdf para facturas unicas

```bash
/facturas/create/FacturaCompleta
```

Espera un JSOON con el formato: para hacer 1 sola petición mando a buscar el CAE y la aprobación de afip y despues creo la factura si es aprobada.  

```JSON
{
 "id": "6846f27304a3c37fe782bf5e",
  "afipRequestData": { 
    "Auth": {
      "Token": "",
      "Sign": "",
      "Cuit": "20437813702"
    },
    "FeCAEReq": {
      "FeCabReq": {
        "CantReg": 1,
        "PtoVta": 12,
        "CbteTipo": 1
      },
      "FeDetReq": [
        {
          "Concepto": 1,
          "DocTipo": 80,
          "DocNro": 20111111112,
          "CbteDesde": 5,
          "CbteHasta": 5,
          "CbteFch": "20250609",
          "ImpTotal": 184.05,
          "ImpTotConc": 0,
          "ImpNeto": 150.00,
          "ImpOpEx": 0,
          "ImpTrib": 7.80,
          "ImpIVA": 26.25,
          "FchServDesde": "",
          "FchServHasta": "",
          "FchVtoPago": "",
          "MonId": "PES",
          "MonCotiz": 1,
          "CondicionIVAReceptorId": 1,
          "Tributos": [
            {
              "Id": 99,
              "Desc": "Impuesto Municipal Matanza",
              "BaseImp": 150.00,
              "Alic": 5.20,
              "Importe": 7.80
            }
          ],
          "Iva": [
            {
              "Id": 5,
              "BaseImp": 100.00,
              "Importe": 21.00
            },
            {
              "Id": 4,
              "BaseImp": 50.00,
              "Importe": 5.25
            }
          ]
        }
      ]
    }
  },
  "facturaData": {
    "emisor": {
      "razonSocial": "FACTURITA S.A.",
      "cuit": "30-71234567-8",
      "domicilio": "Av. Principal 123",
      "localidad": "Ciudad Feliz",
      "provincia": "BUENOS AIRES",
      "iibb": "30712345678",
      "fechaInicioActividades": "15/01/2020",
      "condicionIVA": "Responsable Inscripto",
      "categoriaMonotributo": null,
      "actividadAFIP": "620100",
      "puntoVentaSucursal": "Casa Central",
      "telefono": "011-9876-5432"
    },
    "receptor": {
      "razonSocial": "CLIENTE DE EJEMPLO S.R.L.",
      "cuit": "30-65432109-1",
      "condicionIVA": "Responsable Inscripto",
      "domicilio": "Calle Falsa 456",
      "localidad": "Localidad Ficticia",
      "provincia": "CORDOBA"
    },
    "comprobante": {
      "tipo": "FACTURA A",
      "codigoTipo": "001",
      "numero": "00001-000000123",
      "fecha": "06/06/2025",
      "puntoVenta": "00001",
      "cae": "12345678901234",
      "fechaVtoCae": "16/06/2025",
      "letra": "A",
      "leyendaAFIP": "COMPROBANTE AUTORIZADO",
      "qrImage": null
    },
    "items": [
      {
        "codigo": "PROD001",
        "descripcion": "Licencia anual de software de gestión 'Facturita Pro'",
        "cantidad": 1,
        "precioUnitario": 50000.00,
        "descuento": 0.00,
        "alicuotaIVA": 21.00,
        "unidadMedida": "94"
      },
      {
        "codigo": "SERV004",
        "descripcion": "Capacitación inicial para uso de 'Facturita Pro'",
        "cantidad": 1,
        "precioUnitario": 10000.00,
        "descuento": 0.00,
        "alicuotaIVA": 21.00,
        "unidadMedida": "7"
      },
      {
        "codigo": "SERV005",
        "descripcion": "Soporte técnico premium (primer mes)",
        "cantidad": 1,
        "precioUnitario": 5000.00,
        "descuento": 0.00,
        "alicuotaIVA": 21.00,
        "unidadMedida": "7"
      }
    ],
    "pagos": {
      "formaPago": "Transferencia Bancaria",
      "monto": 84700.00
    },
    "totales": {
      "subtotal": 65000.00,
      "iva": 13650.00,
      "leyendaIVA": "IVA 21%",
      "total": 78650.00,
      "importeNetoNoGravado": 0.00,
      "importeExento": 0.00,
      "importeOtrosTributos": 0.00
    },
    "observaciones": "Servicios y licencias según contrato Nro. 2025-001. Agradecemos su preferencia por Facturita."
  }
}
```

## Aquí va toda la información de quien emite la factura

**razonSocial:** El nombre legal o razón social de tu empresa (ej. "FACTURITA S.A.").

**cuit:** Tu Clave Única de Identificación Tributaria (CUIT). Es un número que te identifica ante la AFIP (ej. "30-71234567-8").

**domicilio:** La dirección de tu negocio (ej. "Av. Principal 123").

**localidad:** La ciudad o localidad donde está ubicado tu negocio (ej. "Ciudad Feliz").

**provincia:** La provincia de tu negocio (ej. "BUENOS AIRES").

**iibb:** Tu número de Ingresos Brutos. A menudo es el mismo que el CUIT, pero puede variar (ej. "30712345678").

**fechaInicioActividades:** La fecha en que tu negocio comenzó sus actividades registradas (ej. "15/01/2020").

**condicionIVA:** Tu condición frente al IVA según AFIP (ej. "Responsable Inscripto", "Monotributista", "Exento").

**categoriaMonotributo:** Si eres Monotributista, aquí va tu categoría (ej. "H"). Si no lo eres, debería ser null.

**actividadAFIP:** El código de tu actividad principal registrado en AFIP (ej. '620100' para servicios de informática).

**puntoVentaSucursal:** El nombre de la sucursal o punto de venta que emite la factura (ej. "Casa Central").

**telefono:** Un número de contacto para tu negocio (ej. "011-9876-5432").

receptor (Datos del Cliente)

### Esta sección contiene la información de la persona o empresa que recibe la factura

**razonSocial:** El nombre legal o razón social del cliente (ej. "CLIENTE DE EJEMPLO S.R.L."). Si es Consumidor Final, usualmente se pone "CONSUMIDOR FINAL".

**cuit:** El CUIT del cliente. Si es Consumidor Final sin datos, suele ser "0".

**condicionIVA:** La condición frente al IVA de tu cliente (ej. "Responsable Inscripto", "Consumidor Final", "Exento").

**domicilio:** La dirección del cliente. Puede ser opcional para Consumidor Final.

**localidad:** La ciudad o localidad del cliente. Puede ser opcional.

**provincia:** La provincia del cliente. Puede ser opcional.

comprobante (Detalles de la Factura)

### Aquí se especifica toda la información particular de este comprobante

**tipo:** El tipo de comprobante (ej. "FACTURA A", "FACTURA B", "FACTURA C").

**codigoTipo:** El código numérico AFIP para el tipo de comprobante (ej. "001" para Factura A, "006" para Factura B, "011" para Factura C).

**numero:** El número completo de la factura, incluyendo el punto de venta y el número correlativo (ej. "00001-000000123").

**fecha:** La fecha de emisión de la factura en formato DD/MM/AAAA (ej. "06/06/2025").

**puntoVenta:** El número del punto de venta (los primeros dígitos del numero de factura, ej. "00001").

**cae:** El Código de Autorización Electrónica (CAE) que te otorga AFIP (14 dígitos, ej. "12345678901234").

**fechaVtoCae:** La fecha de vencimiento del CAE (generalmente 10 días desde su emisión, ej. "16/06/2025").

**letra:** La letra que identifica el tipo de factura (ej. "A", "B", "C").

**leyendaAFIP:** Una leyenda estándar que AFIP exige (ej. "COMPROBANTE AUTORIZADO").

**qrImage:** Este campo se mantendrá como null inicialmente. Tu sistema lo llenará con los datos Base64 de la imagen del código QR una vez que se genere.

items (Listado de Productos/Servicios)

### Es un arreglo (lista) de los productos o servicios facturados. Cada elemento en el arreglo es un objeto con los detalles de un item

**codigo:** Un código interno para el producto o servicio (ej. "PROD001", "SERV004").

**descripcion:** Una descripción clara del producto o servicio (ej. "Licencia anual de software de gestión 'Facturita Pro'").

**cantidad:** La cantidad de unidades de este item (ej. 1).

**precioUnitario:** El precio de una sola unidad antes de impuestos o descuentos (ej. 50000.00).

**descuento:** El monto de descuento aplicado a este item. Si no hay, es 0.00 (ej. 0.00).

**alicuotaIVA:** El porcentaje de IVA aplicado a este item (ej. 21.00, 10.50, 0.00). Para Factura C es siempre 0.00.

**unidadMedida:** El código AFIP que describe la unidad de medida (ej. "7" para "Unidad", "94" para "Servicio").

pagos (Información de Pago)

### Detalles sobre cómo se realizó o se realizará el pago de la factura

**formaPago:** La forma en que se pagó la factura (ej. "Efectivo", "Transferencia Bancaria", "Tarjeta de Crédito/Débito").

**monto:** El monto total del pago (ej. 84700.00).

totales (Resumen Monetario)

### Un resumen de los montos totales de la factura

**subtotal:** La suma de los precioUnitario \* cantidad de todos los items antes de aplicar IVA y descuentos globales (ej. 65000.00).

**iva:** El monto total de IVA calculado para todos los items (ej. 13650.00). Para Factura C es siempre 0.00.

**leyendaIVA:** Una leyenda que aclara el IVA (ej. "IVA 21%", "IVA No Gravado").

**total:** El monto final total de la factura, incluyendo subtotal + IVA - descuentos (ej. 78650.00).

**importeNetoNoGravado:** Monto de conceptos que no están gravados con IVA (usualmente 0.00 para la mayoría de las facturas estándar).

**importeExento:** Monto de conceptos exentos de IVA (usualmente 0.00).

**importeOtrosTributos:** Monto total de otros impuestos o tributos que no son IVA (usualmente 0.00).

observaciones (Notas Adicionales)

**observaciones:** Un campo opcional para agregar cualquier nota o aclaración relevante a la factura (ej. "Servicios y licencias según contrato Nro. 2025-001. Agradecemos su preferencia por Facturita.").

## Estructuración de como se crea el pdf

/controllers -> contiene todos los controladores.  
/controllers/facturas/ -> contiene diferentes archivos.js con los diferentes tipos de facturas, A, B, C, etc. Desde ahí solo se reciben los datos y pasan a los otros controladores que siguen a continuacion.  
/controllers/create_resivo/ -> contiene diferentes archivos.js.  
create_pdf.js -> recibe el JSON desde facturas con los datos listos para pasarlo al PDF, tambien recibe el qr en base64 para agregarlo al JSON y luego al PDF.  
create_qr.js -> recibe el link y lo convierte a qr.  
estructura_pdf.js -> contiene la estructura de la factura electronica estilizada, sanitiza algunos datos como el CUIT y pone todos los datos en donde deben ir.  
