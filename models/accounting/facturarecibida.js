// src/models/Compra.js
import mongoose from 'mongoose';

const compraSchema = new mongoose.Schema({
    owner: { // La empresa que realiza la compra
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Empresa',
        required: [true, 'La compra debe estar asociada a una empresa.']
    },
    proveedor: { // Referencia al proveedor
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Proveedor',
        required: [true, 'La compra debe estar asociada a un proveedor.']
    },
    fechaCompra: {
        type: Date,
        required: [true, 'La fecha de la compra es obligatoria.'],
        default: Date.now
    },
    tipoComprobante: { // Ej: 'Factura A', 'Factura B', 'Ticket', 'Recibo'
        type: String,
        required: [true, 'El tipo de comprobante de compra es obligatorio.'],
        trim: true
    },
    numeroComprobante: { // Número del comprobante del proveedor
        type: String,
        required: [true, 'El número de comprobante de compra es obligatorio.'],
        trim: true
    },
    items: [ // Productos o servicios comprados
        {
            _id: false,
            producto: { // Referencia al producto de tu inventario (si aplica)
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Product'
            },
            descripcion: { type: String, required: [true, 'La descripción del ítem es obligatoria.'], trim: true },
            cantidad: { type: Number, required: [true, 'La cantidad del ítem es obligatoria.'], min: [0.01, 'La cantidad debe ser mayor a 0.'] },
            precioUnitarioCosto: { type: Number, required: [true, 'El costo unitario es obligatorio.'], min: [0, 'El costo unitario no puede ser negativo.'] },
            alicuotaIVA: { type: Number, required: [true, 'La alícuota IVA del ítem es obligatoria.'], min: [0, 'La alícuota IVA del ítem no puede ser negativa.'] },
            importeIVAItem: { type: Number, required: [true, 'El importe IVA del ítem es obligatorio.'], min: [0, 'El importe IVA del ítem no puede ser negativo.'] },
            importeTotalItem: { type: Number, required: [true, 'El importe total del ítem es obligatorio.'], min: [0, 'El importe total del ítem no puede ser negativo.'] },
            unidadMedida: { type: String, trim: true }
        }
    ],
    importeNeto: { type: Number, required: [true, 'El importe neto es obligatorio.'], min: [0, 'El importe neto no puede ser negativo.'] },
    importeIVA: { type: Number, required: [true, 'El importe IVA es obligatorio.'], min: [0, 'El importe IVA no puede ser negativo.'] },
    importeTributos: { type: Number, default: 0, min: [0, 'El importe de tributos no puede ser negativo.'] },
    importeTotal: { type: Number, required: [true, 'El importe total es obligatorio.'], min: [0, 'El importe total no puede ser negativo.'] },
    estadoPago: { // Estado del pago de la compra (ej. 'Pendiente', 'Pagado', 'Parcialmente Pagado')
        type: String,
        enum: ['Pendiente', 'Pagado', 'Parcialmente Pagado', 'Anulado'],
        default: 'Pendiente'
    },
    fechaVencimientoPago: { // Fecha de vencimiento para el pago de la compra
        type: Date
    },
    observaciones: {
        type: String,
        trim: true
    },
    usuarioRegistro: { // Usuario que registró la compra
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'El usuario que registra la compra es obligatorio.']
    }
}, {
    timestamps: true
});

// Índice compuesto para asegurar que el número de comprobante sea único por proveedor y empresa
compraSchema.index({ numeroComprobante: 1, proveedor: 1, owner: 1 }, { unique: true });

const Compra = mongoose.model('Compra', compraSchema);
export default Compra;