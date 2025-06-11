// models/PuntoDeVenta.js
import mongoose from 'mongoose';

const puntoVentaSchema = new mongoose.Schema({
    // Referencia a la empresa propietaria de este punto de venta
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Empresa', // ¡CAMBIO CLAVE AQUÍ! Referencia al modelo 'Empresa'
        required: [true, 'El punto de venta debe pertenecer a una empresa.']
    },
    numero: { // El número oficial del punto de venta asignado por AFIP (ej. 1, 2, 10)
        type: Number,
        required: [true, 'El número de punto de venta es obligatorio.'],
        min: [1, 'El número de punto de venta debe ser al menos 1.']
    },
    nombre: { // Un nombre descriptivo para el punto de venta (ej. "Casa Central", "Sucursal Caballito")
        type: String,
        trim: true
    },
    activo: { // Indica si el punto de venta está activo para emitir
        type: Boolean,
        default: true
    },
    ultimoCbteAutorizado: { // El último número correlativo de comprobante autorizado por AFIP para este PV.
        type: Number,
        default: 0,
        min: [0, 'El último comprobante autorizado no puede ser negativo.']
    },
    fechaUltimoCbte: { // Fecha de la última autorización de comprobante para este PV
        type: Date
    },
    direccion: { // Nuevo: Dirección específica del punto de venta (puede ser diferente a la fiscal de la empresa)
        type: String,
        trim: true
    },
    ciudad: { type: String, trim: true },
    provincia: { type: String, trim: true },
    codigoPostal: { type: String, trim: true },
    telefono: { type: String, trim: true } // Nuevo: Teléfono del punto de venta
}, {
    timestamps: true
});

// Índice compuesto para asegurar que la combinación de 'numero' y 'owner' sea única
puntoVentaSchema.index({ numero: 1, owner: 1 }, { unique: true });

const PuntoVenta = mongoose.model('PuntoDeVenta', puntoVentaSchema);
export default PuntoVenta;