import mongoose from 'mongoose';

const ProductSchema = new mongoose.Schema({
    // Información básica del producto
    marca: {
        type: String,
        required: [true, 'La marca es obligatoria.'],
        trim: true, // Elimina espacios en blanco al inicio y al final
        minlength: [2, 'La marca debe tener al menos 2 caracteres.']
    },
    categoria: {
        type: String,
        required: [true, 'La categoría es obligatoria.'],
        trim: true,
        minlength: [2, 'La categoría debe tener al menos 2 caracteres.']
    },
    producto: { // Nombre del producto
        type: String,
        required: [true, 'El nombre del producto es obligatorio.'],
        trim: true,
        minlength: [3, 'El nombre del producto debe tener al menos 3 caracteres.']
    },
    descripcion: {
        type: String,
        trim: true,
        maxlength: [500, 'La descripción no puede exceder los 500 caracteres.']
    },

    // Medidas y peso
    ancho_cm: {
        type: Number,
        min: [0, 'El ancho no puede ser negativo.'],
        default: 0
    },
    alto_cm: {
        type: Number,
        min: [0, 'El alto no puede ser negativo.'],
        default: 0
    },
    profundidad_cm: {
        type: Number,
        min: [0, 'La profundidad no puede ser negativa.'],
        default: 0
    },
    peso_kg: {
        type: Number,
        min: [0, 'El peso no puede ser negativo.'],
        default: 0
    },
    // Precios
    precio_de_ingreso: {
        type: Number,
        required: [true, 'El precio de ingreso es obligatorio.'],
        min: [0, 'El precio de ingreso no puede ser negativo.']
    },
    precio_standard_validation: { // Se asumió "StandardValidation" como parte del precio
        type: Number,
        min: [0, 'El precio de validación no puede ser negativo.']
    },
    alic_IVA: { // Alícuota de IVA
        type: Number,
        min: [0, 'La alícuota de IVA no puede ser negativa.'],
        max: [100, 'La alícuota de IVA no puede exceder el 100%.'],
        default: 21 // Un valor por defecto común para Argentina
    },
    markup_producto: { // Margen de ganancia
        type: Number,
        min: [0, 'El markup no puede ser negativo.'],
        default: 0
    },
    precio_venta_final: { // Precio final de venta
        type: Number,
        min: [0, 'El precio de venta final no puede ser negativo.'],
        default: 0 // Se puede calcular en el frontend o en un middleware
    },
    redondeo: {
        type: Number,
        default: 0
    },

    // Stock
    stock_disponible: {
        type: Number,
        required: [true, 'El stock disponible es obligatorio.'],
        min: [0, 'El stock no puede ser negativo.'],
        default: 0
    },
    // --- Nuevo campo para la referencia al usuario creador ---
    owner: {
        type: mongoose.Schema.Types.ObjectId, // Tipo de dato para IDs de MongoDB
        ref: 'Users-login', // Nombre del modelo al que hace referencia (de tu User.js)
        required: [true, 'El propietario del producto es obligatorio.'] // Asegura que cada producto tenga un owner
    }
}, { timestamps: true }); // `timestamps: true` añade campos `createdAt` y `updatedAt` automáticamente

const Product = mongoose.model('Product', ProductSchema);

export default Product;