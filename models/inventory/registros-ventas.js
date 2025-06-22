// src/models/Venta.js
import mongoose from 'mongoose';

const ventaSchema = new mongoose.Schema({
    empresa: { // La empresa que realizó la venta (multitenant)
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Empresa',
        required: [true, 'La venta debe estar asociada a una empresa.']
    },
    puntoDeVenta: { // El punto de venta donde se realizó la venta
        type: mongoose.Schema.Types.ObjectId,
        ref: 'PuntoDeVenta',
        required: [true, 'La venta debe estar asociada a un punto de venta.']
    },
    cajaAsociada: { // La caja específica (abierta) donde se registró el cobro
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Caja',
        // Es requerido si la venta implica un cobro en efectivo o cualquier método gestionado por una caja física.
        // Podría ser opcional si manejas ventas solo online sin una caja física asociada.
        required: [true, 'Cada venta debe ser asociada a una caja abierta.'],
    },
    fechaVenta: {
        type: Date,
        required: [true, 'La fecha de la venta es obligatoria.'],
        default: Date.now
    },
    vendedor: { // El usuario o vendedor que realizó la venta
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Vendedor', // O 'User', dependiendo de tu modelo de usuarios/vendedores
        required: [true, 'La venta debe tener un vendedor asociado.']
    },
    cliente: { // Opcional: Si manejas un CRM o registro de clientes
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Cliente',
        required: false // La venta puede ser a un cliente anónimo
    },
    productos: [ // Array de los productos vendidos en esta transacción
        {
            _id: false, // No generar un _id para cada subdocumento
            producto: { // Referencia al producto del inventario
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Product',
                required: [true, 'Cada ítem de la venta debe referenciar un producto.']
            },
            nombreProducto: { // Para mantener el nombre original si el producto cambia
                type: String,
                required: true,
                trim: true
            },
            cantidad: {
                type: Number,
                required: [true, 'La cantidad del producto es obligatoria.'],
                min: [0.01, 'La cantidad debe ser mayor a 0.']
            },
            precioUnitario: { // Precio al que se vendió el producto en ese momento
                type: Number,
                required: [true, 'El precio unitario de venta es obligatorio.'],
                min: [0, 'El precio unitario no puede ser negativo.']
            },
            costoUnitario: { // Costo del producto en el momento de la venta (para cálculo de margen)
                type: Number,
                min: [0, 'El costo unitario no puede ser negativo.']
            },
            subtotal: { // cantidad * precioUnitario
                type: Number,
                min: [0, 'El subtotal no puede ser negativo.']
            },
            descuentoAplicado: { // Descuento específico sobre este ítem
                type: Number,
                default: 0,
                min: [0, 'El descuento no puede ser negativo.']
            }
        }
    ],
    totalSinImpuestos: {
        type: Number,
        required: [true, 'El total sin impuestos es obligatorio.'],
        min: [0, 'El total sin impuestos no puede ser negativo.']
    },
    impuestos: { // Desglose de impuestos aplicados (ej. IVA)
        type: Number,
        default: 0,
        min: [0, 'Los impuestos no pueden ser negativos.']
    },
    totalVenta: { // Suma de todos los productos - descuentos + impuestos
        type: Number,
        required: [true, 'El total de la venta es obligatorio.'],
        min: [0, 'El total de la venta no puede ser negativo.']
    },
    metodoPago: { // Ej: 'efectivo', 'tarjeta_credito', 'tarjeta_debito', 'transferencia', 'otro'
        type: String,
        required: [true, 'El método de pago es obligatorio.'],
        enum: ['efectivo', 'tarjeta_credito', 'tarjeta_debito', 'transferencia', 'otro'],
        trim: true
    },
    detallesPago: { // Para info adicional como # de tarjeta, banco, etc.
        type: Object, // Puede ser un objeto flexible para diferentes métodos de pago
        default: {}
    },
    estadoVenta: { // Ej: 'completa', 'pendiente_pago', 'cancelada', 'devuelta'
        type: String,
        enum: ['completa', 'pendiente_pago', 'cancelada', 'devuelta'],
        default: 'completa',
        required: [true, 'El estado de la venta es obligatorio.']
    },
    numeroTicket: { // Referencia al documento fiscal emitido (Ticket, Factura, etc.)
        type: String,
        trim: true,
        unique: true, // Asumiendo que el número de ticket es único por empresa
        required: [true, 'El número de ticket/factura es obligatorio.']
    },
    observaciones: {
        type: String,
        trim: true
    }
}, {
    timestamps: true // Para createdAt y updatedAt
});

// Middleware para calcular totales antes de guardar (opcional pero recomendado)
ventaSchema.pre('save', function(next) {
    let totalSinImpuestos = 0;
    this.productos.forEach(item => {
        item.subtotal = item.cantidad * item.precioUnitario;
        totalSinImpuestos += item.subtotal - item.descuentoAplicado;
    });
    this.totalSinImpuestos = totalSinImpuestos;
    this.totalVenta = this.totalSinImpuestos + this.impuestos; // Ajusta si tienes impuestos por ítem

    if (this.isModified('productos') || this.isNew) {
        // Asegurarse de que totalSinImpuestos y totalVenta estén calculados antes de la validación
        this.markModified('totalSinImpuestos');
        this.markModified('totalVenta');
    }
    next();
});

const Venta = mongoose.model('Venta', ventaSchema);
export default Venta;