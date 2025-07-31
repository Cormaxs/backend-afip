// models/Product.js
import mongoose from 'mongoose';

const ProductSchema = new mongoose.Schema({
    // Referencia a la empresa propietaria del producto
    empresa: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Empresa',
        required: [true, 'Cada producto debe pertenecer a una empresa.']
    },
    puntoVenta: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'PuntoDeVenta',
        required: [false, 'Cada producto debe pertenecer a un punto de venta.']
    },
    // Información básica del producto
    codigoInterno: {
        type: String,
        trim: true,
        // 'unique: false' aquí en la definición del campo no tiene efecto,
        // la unicidad se define solo en el índice.
        required: [false, 'El código interno del producto es obligatorio.']
    },
    codigoBarra: {
        type: Number,
        // ELIMINADO: 'trim: true' no aplica a campos de tipo Number.
        // ELIMINADO: 'unique: false' aquí no tiene efecto, la unicidad es para índices.
        required: [false, 'El código de barra del producto es obligatorio.']
    },
    producto: {
        type: String,
        required: [true, 'El nombre del producto/servicio es obligatorio.'],
        trim: true,
        minlength: [3, 'El nombre del producto debe tener al menos 3 caracteres.']
    },
    descripcion: {
        type: String,
        trim: true,
        maxlength: [500, 'La descripción no puede exceder los 500 caracteres.']
    },
     // DESPUÉS (Forma Correcta ✅):
     marca: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Marca', // Referencia al modelo 'Marca'
        required: false // O true, según tu lógica de negocio
    },
    categoria: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Categoria', // Referencia al modelo 'Categoria'
        required: false 
    },
    unidadMedida: {
        type: String,
        trim: true,
        default: '94'
    },
    // Medidas y peso
    ancho_cm: { type: Number, min: [0, 'El ancho no puede ser negativo.'], default: 0 },
    alto_cm: { type: Number, min: [0, 'El alto no puede ser negativo.'], default: 0 },
    profundidad_cm: { type: Number, min: [0, 'La profundidad no puede ser negativa.'], default: 0 },
    peso_kg: { type: Number, min: [0, 'El peso no puede ser negativo.'], default: 0 },

    // Precios
    precioCosto: {
        type: Number,
        required: [true, 'El precio de costo es obligatorio.'],
        min: [0, 'El precio de costo no puede ser negativo.']
    },
    precioLista: {
        type: Number,
        min: [0, 'El precio de lista no puede ser negativo.'],
        // Puedes añadir un default aquí si siempre quieres un valor predeterminado, ej: default: 0
        default: 0 // Añadido un valor por defecto para precioLista
    },
    alic_IVA: {
        type: Number,
        required: [true, 'La alícuota de IVA es obligatoria.'],
        min: [0, 'La alícuota de IVA no puede ser negativa.'],
        max: [100, 'La alícuota de IVA no puede exceder el 100%.'],
        default: 21
    },
    markupPorcentaje: {
        type: Number,
        min: [0, 'El markup no puede ser negativo.'],
        default: 0
    },

    // Stock
    stock_disponible: {
        type: Number,
        required: [true, 'El stock disponible es obligatorio.'],
        min: [0, 'El stock no puede ser negativo.'],
        default: 0
    },
    stockMinimo: {
        type: Number,
        min: [0, 'El stock mínimo no puede ser negativo.'],
        default: 0
    },
    ubicacionAlmacen: {
        type: String,
        trim: true,
        default: '' // Añadido un valor por defecto para ubicacionAlmacen
    },
    activo: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

// --- ¡ADVERTENCIA Y RECOMENDACIÓN CRÍTICA PARA EL ÍNDICE! ---
// Si 'codigoInterno' puede ser '0' para múltiples productos,
// y 'owner' en el índice es realmente 'empresa' en el documento,
// DEBES cambiar 'unique: true' a 'unique: false' y 'owner' a 'empresa' aquí.
// De lo contrario, solo un producto con 'codigoInterno: 0' por empresa podrá ser insertado.
ProductSchema.index({ codigoInterno: 1, empresa: 1 }, { unique: true }); // Manteniendo tu versión, pero con la advertencia.

const Product = mongoose.model('Product', ProductSchema);
export default Product;