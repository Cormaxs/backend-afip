import { facturaEmitida } from "./facturas_services.js";

export async function facEmitidasControllers(datos, ubicacionGuardado) {
   try {
    //console.log("Fac emitida -> ",datos, ubicacionGuardado)
    const filledInvoice = fillInvoiceData(datos, ubicacionGuardado);
    // console.log("Datos de factura para guardar:", JSON.stringify(filledInvoice, null, 2)); // Para depuración
    
    const guardada = await facturaEmitida(filledInvoice);
    return guardada; //console.log("Guardada -> ",guardada);
  } catch (err) {
    console.error("Error al procesar la factura:", err);
  }
}

function fillInvoiceData(services, guardada) {
  // Mapeos y valores por defecto
  const UNIDAD_MEDIDA_MAP = {
    '94': 'UNIDAD', // Unidad (AFIP code for 'unit')
    '7': 'UNIDAD',  // Servicio (AFIP code for 'service')
    // Agrega más mapeos si los necesitas, por ejemplo:
    // '50': 'KILOGRAMO',
    // '01': 'METRO',
  };

  // Mapeo de la Condición IVA del receptor a códigos AFIP de tipo de documento y condición IVA
  // Asumo que 'services.receptor.condicionIVA' vendría como 'Responsable Inscripto', 'Consumidor Final', etc.
  // Y aquí mapeamos a los códigos que necesita el modelo de destino.
  const RECEPTOR_IVA_MAP = {
      'Responsable Inscripto': { condicionIVACodigo: 1, docTipo: 80 }, // CUIT (AFIP DocTipo for CUIT is 80)
      'Consumidor Final': { condicionIVACodigo: 5, docTipo: 99 },   // DNI/Consumidor Final (AFIP DocTipo for 'Consumidor Final' is 99)
      // Puedes agregar más si manejas otros tipos como 'Monotributista', 'Exento', etc.
  };

  // --- Transformación de ítems ---
  const itemsTransformed = services.items.map(item => {
    const precioUnitario = item.precioUnitario || 0;
    const cantidad = item.cantidad || 0;
    const descuentoMonto = item.descuento || 0;
    const alicuotaIVA = item.alicuotaIVA || 0;

    const importeNetoItem = (cantidad * precioUnitario) - descuentoMonto;
    const importeIVAItem = importeNetoItem * (alicuotaIVA / 100);
    const importeTotalItem = importeNetoItem + importeIVAItem;
    // Calcula el porcentaje de descuento; evita división por cero
    const descuentoPorcentaje = (cantidad * precioUnitario) > 0 ? (descuentoMonto / (cantidad * precioUnitario)) * 100 : 0;

    return {
      codigo: item.codigo || "",
      descripcion: item.descripcion || "",
      cantidad: cantidad,
      precioUnitario: precioUnitario,
      descuentoPorcentaje: descuentoPorcentaje,
      descuentoMonto: descuentoMonto,
      importeNetoItem: importeNetoItem,
      alicuotaIVA: alicuotaIVA,
      importeIVAItem: importeIVAItem,
      importeTotalItem: importeTotalItem,
      // Mapea el código de unidad de medida AFIP a una descripción, o usa 'OTRA' por defecto
      unidadMedida: UNIDAD_MEDIDA_MAP[item.unidadMedida] || "OTRA"
    };
  });

  // --- Cálculo de totales globales a partir de los ítems transformados ---
  const calculatedImporteNeto = itemsTransformed.reduce((sum, item) => sum + item.importeNetoItem, 0);
  const calculatedImporteIVA = itemsTransformed.reduce((sum, item) => sum + item.importeIVAItem, 0);
  const calculatedImporteTotal = itemsTransformed.reduce((sum, item) => sum + item.importeTotalItem, 0);

  // --- Datos del Receptor ---
  // Se usa la información del 'receptor' de los datos de 'services'.
  // Si el CUIT tiene guiones, se eliminan para 'docNro'. Si no hay CUIT, se asume "0".
  const receptorCuitCleaned = services.receptor.cuit ? services.receptor.cuit.replace(/-/g, '') : "0";
  const receptorConditionMap = RECEPTOR_IVA_MAP[services.receptor.condicionIVA] || { condicionIVACodigo: 5, docTipo: 99 }; // Default a Consumidor Final

  const receptorData = {
    razonSocial: services.receptor.razonSocial || "Consumidor Final",
    cuit: services.receptor.cuit || null,
    docTipo: receptorConditionMap.docTipo,
    docNro: receptorCuitCleaned,
    condicionIVA: services.receptor.condicionIVA || "Consumidor Final",
    condicionIVACodigo: receptorConditionMap.condicionIVACodigo,
    domicilio: services.receptor.domicilio || "Domicilio Desconocido",
    localidad: services.receptor.localidad || "Localidad Desconocida",
    provincia: services.receptor.provincia || "Provincia Desconocida",
    email: services.receptor.email || "sin_email@example.com" // Email es un campo faltante en tu origen, se rellena
  };

  // --- Transformación de fechas a ISO 8601 ---
  // `services.comprobante.fecha` viene en formato 'DD/MM/YYYY'
  const [day, month, year] = services.comprobante.fecha.split('/');
  // Se fija una hora de las 15:00:00 para la emisión para consistencia en formato ISO
  const fechaEmisionIso = new Date(`${year}-${month}-${day}T15:00:00.000Z`).toISOString();

  // `services.comprobante.fechaVtoCae` viene en formato 'YYYYMMDD'
  const fechaVtoCae = services.comprobante.fechaVtoCae;
  const yearVtoCae = fechaVtoCae.substring(0, 4);
  const monthVtoCae = fechaVtoCae.substring(4, 6);
  const dayVtoCae = fechaVtoCae.substring(6, 8);
  // Se fija la hora a fin de día para la fecha de vencimiento del CAE
  const fechaVtoCaeIso = new Date(`${yearVtoCae}-${monthVtoCae}-${dayVtoCae}T23:59:59.000Z`).toISOString();

  // --- Datos de Pago ---
  const metodoPago = services.pagos.formaPago || "Desconocido";
  const montoPagado = services.pagos.monto || 0;

  // **CORRECCIÓN AQUÍ**: Asegura que saldoPendiente nunca sea negativo
  // Si montoPagado es mayor que el total, saldoPendiente será 0.
  const saldoPendiente = Math.max(0, calculatedImporteTotal - montoPagado);

  // Determina el estado de pago basándose en el saldo pendiente
  const estadoPago = saldoPendiente <= 0 ? "Pagado" : "Pendiente";
  // Fecha de pago por defecto (puede ser la fecha actual del sistema o la fecha de emisión)
  const fechaPago = new Date().toISOString(); // Puedes ajustar esto si la fecha de pago es diferente

  const pagosArray = [{
    metodo: metodoPago,
    monto: montoPagado,
    fecha: fechaPago
  }];

  // --- Construcción del JSON final ---
  const finalJson = {
    // IDs de tu sistema (asumidos, ya que no están en 'services')
    empresa: "684b20ec17d809f55dd91864",
    vendedor: "684b210e17d809f55dd91868",
    puntoDeVenta: "684da1f02cca1783265e873f", // ID interno del punto de venta

    // Datos del comprobante tomados directamente de 'services' o derivados
    tipoComprobante: services.comprobante.tipo || "FACTURA", // Ej: "FACTURA A"
    codigoTipoComprobante: services.comprobante.codigoTipo || "000", // Ej: "001"
    // Extrae el número interno de "00001-00000042" -> 42
    numeroComprobanteInterno: parseInt(services.comprobante.numero.split('-')[1]) || 0,
    numeroComprobanteCompleto: services.comprobante.numero || "00000-000000000",
    fechaEmision: fechaEmisionIso,
    cae: services.comprobante.cae || "0",
    fechaVtoCae: fechaVtoCaeIso,
    // Deriva el estado AFIP de la leyenda
    estadoAFIP: services.comprobante.leyendaAFIP === "COMPROBANTE AUTORIZADO" ? "A" : "R",
    observacionesAFIP: services.comprobante.leyendaAFIP || "Sin observaciones de AFIP.",

    receptor: receptorData, // Objeto receptor ya transformado
    items: itemsTransformed, // Array de ítems ya transformado

    // Totales de la factura
    importeNeto: calculatedImporteNeto,
    importeIVA: calculatedImporteIVA,
    importeTributos: services.totales.importeOtrosTributos || 0, // Asumo 0 si no hay otros tributos explícitos
    importeExento: services.totales.importeExento || 0,
    importeNoGravado: services.totales.importeNetoNoGravado || 0,
    importeTotal: calculatedImporteTotal,

    // Información de pago
    metodoPago: metodoPago,
    montoPagado: montoPagado,
    saldoPendiente: saldoPendiente,
    pagos: pagosArray, // Array de pagos (puede ser un solo pago inicialmente)
    fechaPago: fechaPago,
    estadoPago: estadoPago,

    // Otras observaciones y datos AFIP
    observaciones: services.observaciones || "Sin observaciones.",
    leyendaAFIP: services.comprobante.leyendaAFIP || "Sin leyenda AFIP.",
    // Estos deben ser generados por tu integración AFIP después de la autorización
    qrDataString: "https://www.afip.gob.ar/fe/qr/qr-data?c=...", // Placeholder, se genera con el CAE
    qrCodeImageUrl: `https://tu-storage.com/qr/factura-${services.comprobante.numero.replace('-', '')}.png`, // Placeholder URL
    ubicacion: guardada || "lugar"
  };

  return finalJson;
}