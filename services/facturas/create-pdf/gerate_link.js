export async function GenerateURL(datos) {

  // Función auxiliar para limpiar y parsear números con posible formato de CUIT/Número de comprobante
  const cleanAndParseInt = (value) => {
      if (typeof value === 'string') {
          // Eliminar guiones, puntos y cualquier caracter no numérico
          const cleanedValue = value.replace(/[^0-9]/g, '');
          return parseInt(cleanedValue, 10); // Base 10 para asegurar parsing correcto
      }
      return parseInt(value, 10); // Si ya es número, intentar parsearlo directamente
  };

  // Preparar y formatear los datos para el QR
  const datosFacturaParaQR = {
      "ver": 1,
      // Formatear la fecha a "YYYY-MM-DD"
      // Si la fecha viene como "DD/MM/YYYY", la transforma.
      // Si ya viene "YYYY-MM-DD", no hay problema.
      "fecha": datos.comprobante.fecha ? datos.comprobante.fecha.split('/').reverse().join('-') : '',
      // CUIT del emisor sin guiones y como número
      "cuit": cleanAndParseInt(datos.emisor.cuit),
      // Punto de venta como número. Aseguramos que sea un número válido.
      // Si datos.comprobante.puntoVenta es "" o NaN, se usará 0.
      // Lo ideal es que 'puntoVenta' en los datos de entrada ya sea un número correcto (ej. 12).
      "ptoVta": cleanAndParseInt(datos.comprobante.puntoVenta) || 1,
      // Código de tipo de comprobante como número
      "tipoCmp": cleanAndParseInt(datos.comprobante.codigoTipo),
      // Número de comprobante como número (eliminar ceros iniciales, guiones, etc.)
      "nroCmp": cleanAndParseInt(datos.comprobante.numero),
      // Importe total del comprobante
      "importe": datos.totales.total,
      "moneda": "PES", // Asumiendo PES, ajustar si necesitas otras monedas
      "ctz": 1,        // Cotización 1 para PES
      // Tipo de documento del receptor: 80 para CUIT, 99 para Consumidor Final
      "tipoDocRec": datos.receptor.cuit ? 80 : 99,
      // Número de documento del receptor: si es CUIT, se limpia y parsea; si es Consumidor Final, se usa 0
      "nroDocRec": datos.receptor.cuit ? cleanAndParseInt(datos.receptor.cuit) : 0,
      // Tipo de código de autorización: siempre "A" para CAE
      "tipoCodAut": "A",
      // El CAE
      "codAut": datos.comprobante.cae
  };


  // Validaciones básicas antes de generar la URL (opcional pero recomendable)
  // Esto te ayuda a depurar si un dato crítico falta o es inválido antes de codificar.
  if (isNaN(datosFacturaParaQR.cuit) || datosFacturaParaQR.cuit <= 0) {
      console.error("Error: CUIT del emisor inválido o faltante.");
      return null;
  }
  if (isNaN(datosFacturaParaQR.ptoVta) || datosFacturaParaQR.ptoVta < 0) { // Punto de venta puede ser 0
      console.error("Error: Punto de venta inválido o faltante.");
      return null;
  }
  // ... puedes añadir más validaciones para otros campos críticos ...

  // 1. Convertir el objeto de datos a una cadena JSON
  const jsonString = JSON.stringify(datosFacturaParaQR);


  // 2. Codificar la cadena JSON a Base64 URL-safe
  // btoa() codifica a Base64 estándar. Luego, reemplazamos caracteres no URL-safe y padding
  const base64UrlSafe = btoa(jsonString)
      .replace(/\+/g, '-') // Reemplazar '+' por '-'
      .replace(/\//g, '_') // Reemplazar '/' por '_'
      .replace(/=+$/, ''); // Eliminar el relleno '=' al final

  // 3. Construir la URL final para el QR
  const urlParaQR = `https://www.afip.gob.ar/fe/qr/?p=${base64UrlSafe}`;



  return urlParaQR;
}