# Trayecto de como se va armando la factura en los archivos

## Endpoint a llamar

```bahs
/api/v1/facturas/create/FacturaCompleta
```  

Json requerido y datos extra  

```bash
{
 "id": "684b210e17d809f55dd91868", -> vendedor o gerente
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
          "CbteDesde": 37,
          "CbteHasta": 37,
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

Otros datos extra son los id de empresa y punto de venta para poder sacar el ultimo numeor de factura y sumarle 1;

**Llega**  

- /controllers/facturas/crear-factura/obtener-datos.js -> Obtiene el ultimo numero de comprobante y le suma 1, despues pasa a la funcion createXML de el siguiente archivo.  
- /controllers/interactuar-afip-wsaa/4-get-cae/armarXML.js -> pasa el JSON a XML usando (convertir.js), una ves convertido lo pasa a peticion.js y devuelve la respuesta a obtener-datos.js.  
- /controllers/facturas/crear-factura/obtener-datos.js -> teniendo la respuesta de afip, verifico si es A(aprobada) y paso a create_Factura de /controllers/facturas/crear-factura/factura_sola.js(genera el qr y el pdf) devuelve la ubicacion de donde guardo el pdf.  
- /controllers/facturas/crear-factura/obtener-datos.js -> ahora paso los datos de la factura ingresados,pero ya con el CAE y otros datos agregados al JSON, tambien paso la ubicacion de la factura devuelva por factura_sola.js.  
- /controllers/facturas/facturas-emitidas-controller.js -> Sanitiza los datos y los pasa a el esquema de la base de datos. Luego llama a servicios para que haga coneccion a la base de datos mediante respositories.  
