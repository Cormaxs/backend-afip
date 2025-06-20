// models/Product.js
import mongoose from 'mongoose';

const ProductSchema = new mongoose.Schema({
    // Referencia a la empresa propietaria del producto
    empresa: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Empresa', // ¡CAMBIO CLAVE AQUÍ! Referencia al modelo 'Empresa'
        required: [true, 'Cada producto debe pertenecer a una empresa.']
    },
    puntoVenta: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'PuntoDeVenta', // ¡CAMBIO CLAVE AQUÍ! Referencia al modelo 'Empresa'
        required: [true, 'Cada producto debe pertenecer a un punto de venta.']
    },
    // Información básica del producto
    codigoInterno: { // Nuevo campo: Un SKU o código interno para el producto (único por empresa)
        type: String,
        trim: true,
        unique: false, // La unicidad será compuesta con 'owner'
        required: [true, 'El código interno del producto es obligatorio.']
    },
    codigoBarra: { // Nuevo campo: Un SKU o código interno para el producto (único por empresa)
        type: Number,
        trim: true,
        unique: false, // La unicidad será compuesta con 'owner'
        required: [false, 'El código interno del producto es obligatorio.']
    },
    producto: { // Nombre del producto/servicio
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
    marca: {
        type: String,
        // required: [true, 'La marca es obligatoria.'], // ¿Es siempre obligatoria la marca para todos los productos/servicios?
        trim: true,
        minlength: [2, 'La marca debe tener al menos 2 caracteres.']
    },
    categoria: {
        type: String,
        required: [true, 'La categoría es obligatoria.'],
        trim: true,
        minlength: [2, 'La categoría debe tener al menos 2 caracteres.']
    },
    unidadMedida: { // Sugerencia: Unidad de medida para AFIP (ej. '94' para unidad, '7' para kg)
        type: String,
        trim: true,
        default: '94' // Valor por defecto común
    },
    // Medidas y peso (más relevantes para productos físicos)
    ancho_cm: { type: Number, min: [0, 'El ancho no puede ser negativo.'], default: 0 },
    alto_cm: { type: Number, min: [0, 'El alto no puede ser negativo.'], default: 0 },
    profundidad_cm: { type: Number, min: [0, 'La profundidad no puede ser negativa.'], default: 0 },
    peso_kg: { type: Number, min: [0, 'El peso no puede ser negativo.'], default: 0 },

    // Precios
    precioCosto: { // Renombrado de 'precio_de_ingreso' para mayor claridad
        type: Number,
        required: [true, 'El precio de costo es obligatorio.'],
        min: [0, 'El precio de costo no puede ser negativo.']
    },
    // 'precio_standard_validation' es un nombre poco claro. ¿Es un precio de lista base?
    precioLista: { // Sugerencia de renombramiento, si es un precio base para cálculo
        type: Number,
        min: [0, 'El precio de lista no puede ser negativo.']
    },
    alic_IVA: { // Alícuota de IVA
        type: Number,
        required: [true, 'La alícuota de IVA es obligatoria.'], // Debería ser obligatoria para cálculos fiscales
        min: [0, 'La alícuota de IVA no puede ser negativa.'],
        max: [100, 'La alícuota de IVA no puede exceder el 100%.'],
        default: 21
    },
    markupPorcentaje: { // Renombrado de 'markup_producto' para mayor claridad y tipo de valor
        type: Number,
        min: [0, 'El markup no puede ser negativo.'],
        default: 0
    },
    // 'precio_venta_final' y 'redondeo' se pueden calcular en la aplicación
    // No siempre es necesario guardarlos si derivan de otros campos.
    // Solo si necesitas guardar un precio fijo para ofertas, por ejemplo.
    // precioVentaFinal: { type: Number, min: [0, 'El precio de venta final no puede ser negativo.'], default: 0 },
    // redondeo: { type: Number, default: 0 },

    // Stock
    stock_disponible: {
        type: Number,
        required: [true, 'El stock disponible es obligatorio.'],
        min: [0, 'El stock no puede ser negativo.'],
        default: 0
    },
    stockMinimo: { // Nuevo campo: Umbral para alertar bajo stock
        type: Number,
        min: [0, 'El stock mínimo no puede ser negativo.'],
        default: 0
    },
    ubicacionAlmacen: { // Nuevo campo: Dónde se guarda el producto
        type: String,
        trim: true
    },
    activo: { // Nuevo campo: Para habilitar/deshabilitar un producto
        type: Boolean,
        default: true
    }
}, { timestamps: true });

// Índice compuesto para asegurar que el código interno del producto sea único por empresa
ProductSchema.index({ codigoInterno: 1, owner: 1 }, { unique: true });
// También podrías considerar un índice compuesto para 'producto' y 'owner' si el nombre del producto debe ser único por empresa
// ProductSchema.index({ producto: 1, owner: 1 }, { unique: true });

const Product = mongoose.model('Product', ProductSchema);
export default Product;