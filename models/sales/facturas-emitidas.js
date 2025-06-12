// models/FacturaEmitida.js
import mongoose from 'mongoose';

const facturaEmitidaSchema = new mongoose.Schema({
    // --- Referencias al Emisor (Empresa), Vendedor y Punto de Venta ---
    empresa: { // La empresa principal que emite la factura
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Empresa', // ¡CAMBIO CLAVE AQUÍ! Referencia al modelo 'Empresa'
        required: [true, 'La factura debe estar asociada a una empresa propietaria.']
    },
    vendedor: { // El vendedor que generó esta factura
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Vendedor',
        required: [true, 'La factura debe estar asociada a un vendedor.']
    },
    puntoDeVenta: { // El punto de venta desde donde se emitió esta factura
        type: mongoose.Schema.Types.ObjectId,
        ref: 'PuntoDeVenta',
        required: [true, 'La factura debe estar asociada a un punto de venta.']
    },

    // --- Datos de la Factura (similares a lo que AFIP procesa y lo que imprimes) ---
    tipoComprobante: { // Ej: 'FACTURA A', 'FACTURA B', 'NOTA DE CRÉDITO A'
        type: String,
        required: true,
        trim: true
    },
    codigoTipoComprobante: { // Código AFIP (ej. '001', '006')
        type: String,
        required: true,
        trim: true
    },
    numeroComprobanteInterno: { // Nuevo: El número correlativo del comprobante (ej. 23)
        type: Number,
        required: true,
        min: 1
    },
    numeroComprobanteCompleto: { // El número completo Ej: '00001-00000023' (Pvta-Número)
        type: String,
        required: true,
        unique: true, // Debe ser único en tu sistema (ya cubierto por el índice compuesto)
        trim: true
    },
    fechaEmision: { // Fecha de la factura (la que se envía a AFIP)
        type: Date,
        required: true
    },
    cae: { // Código de Autorización Electrónica (devuelto por AFIP)
        type: String,
        required: true,
        trim: true
    },
    fechaVtoCae: { // Fecha de vencimiento del CAE (devuelto por AFIP)
        type: Date,
        required: true
    },
    estadoAFIP: { // Resultado de la solicitud a AFIP (ej. 'A' (Aprobado), 'R' (Rechazado))
        type: String,
        enum: ['A', 'R', 'O', 'P'], // A: Aprobado, R: Rechazado, O: Observado, P: Pendiente
        required: true
    },
    observacionesAFIP: { // Mensajes de error/observación de AFIP si los hubiera
        type: String,
        trim: true
    },
    // --- Datos del Receptor (Cliente) ---
    receptor: {
        // Podrías referenciar a un modelo 'Cliente' si lo creas
        // cliente: { type: mongoose.Schema.Types.ObjectId, ref: 'Cliente' },
        razonSocial: { type: String, required: true, trim: true },
        cuit: { type: String, trim: true }, // Puede ser CUIT, DNI, CUIL, etc.
        docTipo: { type: Number, required: true }, // Código AFIP del tipo de documento (ej. 80 para CUIT)
        docNro: { type: String, required: true, trim: true }, // Número de documento del receptor
        condicionIVA: { type: String, required: true, trim: true }, // Ej: 'Responsable Inscripto', 'Consumidor Final'
        condicionIVACodigo: { type: Number, required: true }, // Código AFIP de la condición IVA del receptor
        domicilio: { type: String, trim: true },
        localidad: { type: String, trim: true },
        provincia: { type: String, trim: true },
        email: { type: String, trim: true, match: [/.+@.+\..+/, 'Por favor, introduce un correo electrónico válido.'] } // Correo del cliente
    },

    // --- Detalles de los Items/Productos/Servicios ---
    items: [
        {
            _id: false,
            // Si el producto está en tu inventario, podrías referenciarlo aquí:
            // productoId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
            codigo: { type: String, trim: true }, // Código del producto (ej. interno o de barra)
            descripcion: { type: String, required: true, trim: true },
            cantidad: { type: Number, required: true, min: 0.01 },
            precioUnitario: { type: Number, required: true, min: 0 }, // Precio sin IVA
            descuentoPorcentaje: { type: Number, default: 0, min: 0, max: 100 }, // Descuento por ítem en %
            descuentoMonto: { type: Number, default: 0, min: 0 }, // Descuento por ítem en monto
            importeNetoItem: { type: Number, required: true, min: 0 }, // Base imponible de este item
            alicuotaIVA: { type: Number, required: true, min: 0 },
            importeIVAItem: { type: Number, required: true, min: 0 }, // IVA de este item
            importeTotalItem: { type: Number, required: true, min: 0 }, // Neto + IVA de este item
            unidadMedida: { type: String, trim: true } // Código AFIP
        }
    ],

    // --- Totales de la Factura ---
    importeNeto: { type: Number, required: true, min: 0 },
    importeIVA: { type: Number, required: true, min: 0 },
    importeTributos: { type: Number, default: 0, min: 0 },
    importeExento: { type: Number, default: 0, min: 0 },
    importeNoGravado: { type: Number, default: 0, min: 0 },
    importeTotal: { type: Number, required: true, min: 0 },

    // --- Información de Pagos ---
    metodoPago: { // Renombrado de 'formaPago' para mayor claridad
        type: String,
        trim: true
        // Podrías usar un enum aquí si tienes métodos de pago fijos:
        // enum: ['Efectivo', 'Tarjeta de Crédito', 'Transferencia', 'Cheque', 'Mercado Pago']
    },
    montoPagado: { // Renombrado de 'montoPago'
        type: Number,
        min: 0
    },
    saldoPendiente: { // Nuevo: Si la factura no fue pagada en su totalidad
        type: Number,
        default: 0,
        min: 0
    },
    // Si permites múltiples formas de pago para una factura
    pagos: [{
        _id: false,
        metodo: { type: String },
        monto: { type: Number },
        fecha: { type: Date, default: Date.now }
    }],
    fechaPago: { // Nuevo: La fecha en que se registró el pago principal
        type: Date
    },
    estadoPago: { // Nuevo: Para rastrear el estado del pago (ej. Pendiente, Pagado, Parcialmente Pagado)
        type: String,
        enum: ['Pendiente', 'Pagado', 'Parcialmente Pagado', 'Anulado'],
        default: 'Pendiente'
    },

    // --- Otras Observaciones/Leyendas ---
    observaciones: {
        type: String,
        trim: true
    },
    leyendaAFIP: {
        type: String,
        trim: true
    },

    // --- Campos para el QR ---
    qrDataString: {
        type: String,
        trim: true
    },
    qrCodeImageUrl: { // Nuevo: Si guardas la URL de la imagen del QR
        type: String,
        trim: true
    }

}, {
    timestamps: true // `createdAt` para la fecha de creación del registro, `updatedAt` para la última modificación
});

// Índice compuesto para asegurar que el número de comprobante completo sea único para cada empresa y punto de venta
facturaEmitidaSchema.index({ numeroComprobanteCompleto: 1, owner: 1, puntoDeVenta: 1 }, { unique: true });

const FacturaEmitida = mongoose.model('FacturaEmitida', facturaEmitidaSchema);

export default FacturaEmitida;