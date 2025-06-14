// facturaDefinition.js

// Función para formatear números a moneda argentina
export const formatCurrency = (amount) => {
    if (amount === undefined || amount === null) amount = 0;
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount).replace(/\u00A0/g, ' ');
  };
  
  // Función auxiliar para formatear CUIT
  function formatCuit(cuit) {
    if (!cuit || cuit === '0') return '0'; // Si es 0 o nulo, retorna '0'
    const cleanedCuit = String(cuit).replace(/[^0-9]/g, ''); // Limpia cualquier caracter no numérico
    if (cleanedCuit.length === 11) {
      return `${cleanedCuit.substring(0, 2)}-${cleanedCuit.substring(2, 10)}-${cleanedCuit.substring(10)}`;
    }
    return cuit; // Retorna el CUIT original si no tiene 11 dígitos
  }
  
  // Genera la estructura del PDF con diseño limpio y compatible AFIP
  export const createFacturaDocDefinition = (datos) => ({
    pageMargins: [40, 80, 40, 60], // Márgenes de la página [left, top, right, bottom]
    pageSize: 'A4',
    
    // Header simple
    header: {
      text: `${datos.comprobante.tipo} (Cód. ${datos.comprobante.codigoTipo})` || 'COMPROBANTE',
      alignment: 'center',
      fontSize: 10,
      color: '#555555',
      margin: [0, 20, 0, 0] // Espacio superior del header
    },
    
    // Footer con numeración
    footer: (currentPage, pageCount) => ({
      text: `Página ${currentPage} de ${pageCount}`,
      alignment: 'right',
      fontSize: 9,
      color: '#888888',
      margin: [0, 0, 40, 20] // Espacio inferior del footer
    }),
  
    content: [
      // --- Encabezado principal del comprobante (Tipo, Punto de Venta y Número) ---
      {
        columns: [
          // Columna Izquierda: Datos del Emisor
          {
            width: '55%',
            stack: [
              { 
                text: `Emisor : ${datos.emisor.razonSocial}`, 
                style: 'emisorNombre',
                margin: [0, 0, 0, 4] 
              },
              { 
                text: `Domicilio :${datos.emisor.domicilio}, ${datos.emisor.localidad} - ${datos.emisor.provincia}`, 
                style: 'emisorDato' 
              },
              { 
                text: `CUIT: ${formatCuit(datos.emisor.cuit)}`, 
                style: 'emisorDato' 
              },
              { 
                text: `Ingresos Brutos: ${datos.emisor.iibb}`, 
                style: 'emisorDato' 
              },
              { 
                text: `Inicio Actividades: ${datos.emisor.fechaInicioActividades}`, 
                style: 'emisorDato' 
              },
              { 
                text: `Condición IVA: ${datos.emisor.condicionIVA}`, 
                style: 'emisorDato' 
              },
              { 
                text: `Categoría Monotributo: ${datos.emisor.categoriaMonotributo}`, 
                style: 'emisorDato',
                margin: [0, 0, 0, 15] 
              },
               { 
                text: `Actividad Principal: ${datos.emisor.actividadAFIP}`, 
                style: 'emisorDato' 
              },
              { 
                text: `Telefono: ${datos.emisor.telefono}`, 
                style: 'emisorDato' 
              },
              {
                text: `Punto de Venta/Sucursal: ${datos.emisor.puntoVentaSucursal}`, // Añadido: Nombre de la sucursal del punto de venta
                style: 'emisorDato'
              },

            ]
          },
          // Columna Derecha: Recuadro de Comprobante (Tipo, PV, Nro, Fecha)
          {
            width: '45%',
            alignment: 'right', // Alinea el stack a la derecha de la columna
            stack: [
              // Contenedor principal del recuadro
              {
                canvas: [
                  { 
                    type: 'rect', 
                    x: 0, y: 0, // Posición relativa a la stack.
                    w: 200, h: 110, 
                    lineWidth: 1.5, 
                    lineColor: '#666666' 
                  }
                ],
                // Esta absolutePosition es relativa a la página.
                // Ajustamos la posición para que el recuadro comience más a la izquierda,
                // dentro de los límites de la página, y alineado con el layout general.
                absolutePosition: { x: 310, y: 55 } 
              },
              // Información del comprobante (dentro del recuadro grande)
              // NOTA: Eliminamos la "C" grande superpuesta. La "C" ahora debe ser parte de datos.comprobante.tipo
              { 
                text: datos.comprobante.tipo, // Asumimos que datos.comprobante.tipo ya incluye la letra (ej. "FACTURA C")
                style: 'comprobanteTipoGrande', // Usamos un nuevo estilo para el tipo con la letra
                alignment: 'center',
                absolutePosition: { x: 350, y: 60 }, // Posicionado en la parte superior del recuadro
                width: 200 // Ancho completo del recuadro para centrar
              },
              { 
                text: `Punto de Venta: ${datos.comprobante.puntoVenta} - Nro. ${datos.comprobante.numero.split('-')[1]}`, // Extrae solo el número si viene como PPPP-NNNNNNNN
                style: 'comprobanteNumero', 
                alignment: 'center',
                absolutePosition: { x: 350, y: 78 }, // Debajo del tipo
                width: 200 // Ancho completo del recuadro
              },
              { 
                text: `Fecha Emisión: ${datos.comprobante.fecha}`, 
                style: 'comprobanteFecha', 
                alignment: 'center',
                absolutePosition: { x: 310, y: 96 }, // Debajo del número
                width: 200 // Ancho completo del recuadro
              }
            ]
          }
        ],
        margin: [0, 0, 0, 20] // Espacio entre encabezado y datos del receptor
      },
      
      // --- Línea divisoria ---
      { 
        canvas: [{ 
          type: 'line', 
          x1: 0, y1: 0, 
          x2: 515, y2: 0, 
          lineWidth: 0.5, 
          lineColor: '#DDDDDD' 
        }], 
        margin: [0, 10, 0, 15] 
      },
      
      // --- Datos del Receptor (Cliente) ---
      {
        columns: [
          {
            width: '50%',
            stack: [
                { 
                    text: `Receptor : ${datos.receptor.nombre || "Nombre del cliente (opcional)"} `, 
                    style: 'emisorNombre',
                    margin: [0, 0, 0, 4] 
                  },
                { 
                text: [{ text: 'RAZÓN SOCIAL: ', bold: true }, datos.receptor.razonSocial], 
                style: 'clienteDato' 
              },
              { 
                text: [{ text: 'DOMICILIO: ', bold: true }, datos.receptor.domicilio || 'No especificado'], 
                style: 'clienteDato' 
              },
              {
                text: [{ text: 'LOCALIDAD: ', bold: true }, datos.receptor.localidad || 'No especificado'],
                style: 'clienteDato'
              },
              { 
                text: [{ text: 'CUIT/DNI: ', bold: true }, formatCuit(datos.receptor.cuit)], 
                style: 'clienteDato'
              },
              { 
                text: [{ text: 'CONDICIÓN IVA: ', bold: true }, datos.receptor.condicionIVA], 
                style: 'clienteDato'
              }
            ]
          }
        ],
        margin: [0, 0, 0, 20]
      },
      
      // --- Línea divisoria ---
      { 
        canvas: [{ 
          type: 'line', 
          x1: 0, y1: 0, 
          x2: 515, y2: 0, 
          lineWidth: 0.5, 
          lineColor: '#DDDDDD' 
        }], 
        margin: [0, 5, 0, 15] 
      },
      
      // --- Tabla de Ítems ---
      {
        style: 'itemsTable',
        table: {
          headerRows: 1,
          dontBreakRows: true,
          widths: ['12%', '38%', '8%', '12%', '10%', '10%', '10%'], // Anchos ajustados
          body: [
            [
              { text: 'CÓDIGO', style: 'tableHeader' },
              { text: 'DESCRIPCIÓN', style: 'tableHeader' },
              { text: 'CANT.', style: 'tableHeader' },
              { text: 'P. UNIT.', style: 'tableHeader' },
              { text: 'DESC. %', style: 'tableHeader' },
              { text: 'IVA %', style: 'tableHeader' },
              { text: 'IMPORTE', style: 'tableHeader' }
            ],
            ...datos.items.map(item => [
              { 
                text: item.codigo || '-', 
                style: 'itemCell', 
                alignment: 'center' 
              },
              { 
                text: item.descripcion, 
                style: 'itemCell' 
              },
              { 
                text: item.cantidad.toString(), 
                style: 'itemCell', 
                alignment: 'center' 
              },
              { 
                text: formatCurrency(item.precioUnitario), 
                style: 'itemCell', 
                alignment: 'right' 
              },
              { 
                text: `${(item.descuento || 0).toFixed(2)}%`, // Asume descuento en porcentaje
                style: 'itemCell', 
                alignment: 'right' 
              },
              { 
                text: item.alicuotaIVA !== undefined ? `${item.alicuotaIVA.toFixed(2)}` : '0.00', 
                style: 'itemCell', 
                alignment: 'right' 
              },
              { 
                text: formatCurrency(
                  item.cantidad * item.precioUnitario * (1 - (item.descuento || 0) / 100) // Calcula aplicando el porcentaje de descuento
                ), 
                style: 'itemCell', 
                alignment: 'right' 
              }
            ])
          ]
        },
        layout: {
          hLineWidth: (i) => (i === 0 || i === 1 || i === datos.items.length + 1) ? 0.8 : 0.3, // Líneas superior, bajo cabecera y final
          vLineWidth: () => 0.3,
          hLineColor: (i) => (i === 0 || i === 1 || i === datos.items.length + 1) ? '#666666' : '#EEEEEE',
          vLineColor: () => '#EEEEEE',
          paddingLeft: () => 4,
          paddingRight: () => 4,
          paddingTop: () => 4,
          paddingBottom: () => 4
        }
      },
      
      // --- Totales ---
      {
        columns: [
          // Columna izquierda: Forma de pago y Observaciones
          {
            width: '50%',
            stack: [
              { 
                text: 'FORMA DE PAGO:', 
                style: 'formaPagoLabel',
                margin: [0, 15, 0, 5] 
              },
              { 
                text: `${datos.pagos?.formaPago || 'No especificado'}: ${formatCurrency(datos.pagos?.monto || 0)}`, // Usar datos.pagos.monto
                style: 'formaPagoValor' 
              },
              {
                text: 'OBSERVACIONES:',
                style: 'formaPagoLabel',
                margin: [0, 15, 0, 5]
              },
              {
                text: datos.observaciones || 'Sin observaciones.',
                style: 'formaPagoValor'
              }
            ]
          },
          // Columna derecha: Resumen de Totales
          {
            width: '50%',
            stack: [
              {
                columns: [
                  { text: 'SUBTOTAL:', style: 'totalLabel', alignment: 'right' },
                  { text: formatCurrency(datos.totales.subtotal), style: 'totalValor', alignment: 'right' }
                ],
                margin: [0, 15, 0, 2]
              },
              {
                columns: [
                  { text: 'IVA:', style: 'totalLabel', alignment: 'right' },
                  { text: formatCurrency(datos.totales.iva), style: 'totalValor', alignment: 'right' }
                ],
                margin: [0, 0, 0, 2]
              },
              {
                columns: [
                  { text: 'TOTAL:', style: 'totalFinalLabel', alignment: 'right' },
                  { text: formatCurrency(datos.totales.total), style: 'totalFinalValor', alignment: 'right' }
                ],
                margin: [0, 5, 0, 0]
              },
              {
                text: datos.totales.leyendaIVA || '', // Leyenda de IVA (ej. "IVA No Gravado")
                style: 'afipLeyenda',
                alignment: 'right',
                margin: [0, 5, 0, 0]
              }
            ]
          }
        ],
        margin: [0, 20, 0, 30]
      },
      
      // --- Datos AFIP (QR y CAE) ---
      {
        columns: [
          // Columna QR
          datos.comprobante.qrImage ? {
            image: datos.comprobante.qrImage,
            width: 100,
            height: 100,
            margin: [0, 0, 20, 0]
          } : {
            text: 'QR AFIP [No disponible]', // Mensaje si el QR no está
            fontSize: 8,
            color: '#888888',
            margin: [0, 0, 20, 0]
          },
          // Columna datos CAE y Leyenda AFIP
          {
            width: '*',
            stack: [
              { 
                text: 'DATOS DE LA AFIP', 
                style: 'afipTitulo',
                margin: [10, 0, 0, 5] 
              },
              { 
                text: `CAE NRO: ${datos.comprobante.cae}`, 
                style: 'afipDato',
                margin: [10, 0, 0, 5] 
              },
              { 
                text: `FECHA VTO. CAE: ${datos.comprobante.fechaVtoCae}`, 
                style: 'afipDato',
                margin: [10, 0, 0, 5] 
              },
              { 
                text: datos.comprobante.leyendaAFIP, 
                style: 'afipLeyenda',
                margin: [10, 5, 0, 0] 
              }
            ]
          },
          // Columna para marca de la aplicación
          {
            width: 'auto',
            stack: [
              { text: 'Generado por:', fontSize: 7, alignment: 'right', color: '#666666' },
              { text: 'Facstock', fontSize: 9, bold: true, alignment: 'right', color: '#444444' }
            ],
            margin: [15, 0, 0, 0]
          }
        ].filter(Boolean), // Filtra elementos nulos (ej. si qrImage es nulo)
        margin: [0, 0, 0, 0]
      }
    ],
    
    // --- Estilos ---
    styles: {
      // Encabezado principal
      encabezadoPrincipal: {
        fontSize: 14,
        bold: true,
        color: '#333333',
        alignment: 'center'
      },
      
      // Comprobante (dentro del recuadro de arriba)
      comprobanteTipoGrande: { // Nuevo estilo para el tipo con la letra grande
          fontSize: 16, // Aumentado para que la letra sea más prominente
          bold: true,
          color: '#333333',
          margin: [0, 2, 0, 0] // Ajuste de margen
      },
      comprobanteNumero: {
          fontSize: 10,
          bold: true,
          color: '#333333',
          margin: [0, 2, 0, 0]
      },
      comprobanteFecha: {
          fontSize: 9,
          color: '#666666',
          margin: [0, 5, 0, 0]
      },
  
      // Datos emisor
      emisorNombre: {
        fontSize: 12,
        bold: true,
        color: '#222222'
      },
      emisorDato: {
        fontSize: 9,
        color: '#555555',
        margin: [0, 1, 0, 0]
      },
      
      // Datos cliente
      clienteDato: {
        fontSize: 9,
        color: '#555555',
        margin: [0, 2, 0, 0]
      },
      
      // Tabla de ítems
      itemsTable: {
        margin: [0, 10, 0, 15]
      },
      tableHeader: {
        bold: true,
        fontSize: 9,
        color: '#333333',
        fillColor: '#F8F8F8',
        alignment: 'center'
      },
      itemCell: {
        fontSize: 9,
        color: '#444444'
      },
      
      // Forma de pago y observaciones
      formaPagoLabel: {
        fontSize: 10,
        bold: true,
        color: '#333333'
      },
      formaPagoValor: {
        fontSize: 10,
        color: '#444444'
      },
      
      // Totales
      totalLabel: {
        fontSize: 10,
        color: '#555555',
        width: '60%' // Controla el ancho de la etiqueta
      },
      totalValor: {
        fontSize: 10,
        color: '#444444',
        width: '40%' // Controla el ancho del valor
      },
      totalFinalLabel: {
        fontSize: 11,
        bold: true,
        color: '#333333',
        width: '60%'
      },
      totalFinalValor: {
        fontSize: 11,
        bold: true,
        color: '#333333',
        width: '40%'
      },
      
      // Datos AFIP
      afipTitulo: {
        fontSize: 10,
        bold: true,
        color: '#333333',
        alignment: 'left'
      },
      afipDato: {
        fontSize: 9,
        color: '#555555'
      },
      afipLeyenda: {
        fontSize: 8,
        color: '#666666',
        italics: true
      }
    }
  });