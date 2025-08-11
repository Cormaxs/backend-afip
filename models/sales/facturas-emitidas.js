// models/FacturaEmitida.js
import mongoose from 'mongoose';

const facturaEmitidaSchema = new mongoose.Schema({
    // --- Referencias al Emisor (Empresa), Vendedor y Punto de Venta ---
    empresa: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Empresa',
        required: [true, 'La factura debe estar asociada a una empresa propietaria.']
    },
    vendedor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Vendedor',
        required: [true, 'La factura debe estar asociada a un vendedor.']
    },
    puntoDeVenta: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'PuntoDeVenta',
        required: [true, 'La factura debe estar asociada a un punto de venta.']
    },

    // --- Datos de la Factura (similares a lo que AFIP procesa y lo que imprimes) ---
    tipoComprobante: { // Ej: 'FACTURA A', 'NOTA DE CRÉDITO A', 'NOTA DE PEDIDO'
        type: String,
        required: true,
        trim: true
    },
    codigoTipoComprobante: {
        type: String,
        trim: false // Ahora puede ser nulo para comprobantes no fiscales
    },
    numeroComprobanteInterno: {
        type: Number,
        required: true,
        min: 1
    },
    numeroComprobanteCompleto: {
        type: String,
        required: true,
        trim: true
    },
    fechaEmision: {
        type: Date,
        required: true
    },
    cae: {
        type: String,
        trim: true,
        required: false
    },
    fechaVtoCae: {
        type: Date,
        required: false
    },
    estadoAFIP: {
        type: String,
        enum: ['A', 'R', 'O', 'P', 'NO_APLICA'], // Nuevo estado para no fiscales
        default: 'NO_APLICA'
    },
    observacionesAFIP: {
        type: String,
        trim: true
    },
    // --- Datos del Receptor (Cliente) ---
    receptor: {
        razonSocial: { type: String, required: true, trim: true },
        cuit: { type: String, trim: true },
        docTipo: { type: Number, required: true },
        docNro: { type: String, required: true, trim: true },
        condicionIVA: { type: String, required: true, trim: true },
        condicionIVACodigo: { type: Number, required: true },
        domicilio: { type: String, trim: true },
        localidad: { type: String, trim: true },
        provincia: { type: String, trim: true },
        email: { type: String, trim: true, match: [/.+@.+\..+/, 'Por favor, introduce un correo electrónico válido.'] }
    },

    // --- Detalles de los Items/Productos/Servicios ---
    items: [
        {
            _id: false,
            codigo: { type: String, trim: true },
            descripcion: { type: String, required: true, trim: true },
            cantidad: { type: Number, required: true, min: 0.01 },
            precioUnitario: { type: Number, required: true, min: 0 },
            descuentoPorcentaje: { type: Number, default: 0, min: 0, max: 100 },
            descuentoMonto: { type: Number, default: 0, min: 0 },
            importeNetoItem: { type: Number, required: true, min: 0 },
            alicuotaIVA: { type: Number, required: true, min: 0 },
            importeIVAItem: { type: Number, required: true, min: 0 },
            importeTotalItem: { type: Number, required: true, min: 0 },
            unidadMedida: { type: String, trim: true }
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
    metodoPago: {
        type: String,
        trim: true
    },
    montoPagado: {
        type: Number,
        min: 0
    },
    saldoPendiente: {
        type: Number,
        default: 0,
        min: 0
    },
    pagos: [{
        _id: false,
        metodo: { type: String },
        monto: { type: Number },
        fecha: { type: Date, default: Date.now }
    }],
    fechaPago: {
        type: Date
    },
    estadoPago: {
        type: String,
        enum: ['Pendiente', 'Pagado', 'Parcialmente Pagado', 'Anulado', 'NO_APLICA'],
        default: 'NO_APLICA' // Default para no fiscales
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
    qrCodeImageUrl: {
        type: String,
        trim: true
    },
    ubicacion: {
        type: String
    }
}, {
    timestamps: true
});

// Índice compuesto para asegurar que el número de comprobante sea único para cada tipo, empresa y punto de venta
facturaEmitidaSchema.index({ 
    empresa: 1, 
    puntoDeVenta: 1, 
    numeroComprobanteInterno: 1,
    tipoComprobante: 1 
}, { unique: true });

const FacturaEmitida = mongoose.model('FacturaEmitida', facturaEmitidaSchema);

export default FacturaEmitida;