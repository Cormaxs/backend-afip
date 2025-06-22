// src/models/Caja.js
import mongoose from 'mongoose';

const cajaSchema = new mongoose.Schema({
    empresa: { // La empresa a la que pertenece esta caja
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Empresa',
        required: [true, 'La caja debe estar asociada a una empresa.']
    },
    puntoDeVenta: { // El punto de venta asociado a esta caja
        type: mongoose.Schema.Types.ObjectId,
        ref: 'PuntoDeVenta',
        required: [true, 'La caja debe estar asociada a un punto de venta.']
    },
    vendedorAsignado: { // El vendedor que abrió y/o está a cargo de esta caja
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Vendedor',
        required: [true, 'Un vendedor debe ser asignado a la caja.']
    },
    fechaApertura: {
        type: Date,
        required: [true, 'La fecha de apertura de caja es obligatoria.'],
        default: Date.now
    },
    fechaCierre: {
        type: Date
    },
    montoInicial: { // Dinero con el que se abre la caja (fondo de caja)
        type: Number,
        required: [true, 'El monto inicial es obligatorio.'],
        min: [0, 'El monto inicial no puede ser negativo.'],
        default: 0
    },
    ingresos: { // Total de ingresos (ej. ventas en efectivo)
        type: Number,
        default: 0,
        min: [0, 'Los ingresos no pueden ser negativos.']
    },
    egresos: { // Total de egresos (ej. pagos a proveedores en efectivo, retiros)
        type: Number,
        default: 0,
        min: [0, 'Los egresos no pueden ser negativos.']
    },
    montoFinalEsperado: { // Monto calculado: montoInicial + ingresos - egresos
        type: Number,
        default: 0
    },
    montoFinalReal: { // Dinero contado al cierre de caja
        type: Number,
        min: [0, 'El monto final real no puede ser negativo.']
    },
    diferencia: { // montoFinalReal - montoFinalEsperado
        type: Number,
        default: 0
    },
    estado: { // 'Abierta', 'Cerrada'
        type: String,
        enum: ['Abierta', 'Cerrada'],
        default: 'Abierta',
        required: [true, 'El estado de la caja es obligatorio.']
    },
    observacionesCierre: {
        type: String,
        trim: true
    },
    transacciones: [ // Opcional: Para registrar cada transacción individual de efectivo
        {
            _id: false,
            tipo: { type: String, enum: ['ingreso', 'egreso'], required: true },
            monto: { type: Number, required: true, min: 0.01 },
            descripcion: { type: String, trim: true },
            fecha: { type: Date, default: Date.now },
            referencia: { type: mongoose.Schema.Types.ObjectId } // Podría referenciar a FacturaEmitida, Compra, etc.
        }
    ]
}, {
    timestamps: true
});

const Caja = mongoose.model('Caja', cajaSchema);
export default Caja;