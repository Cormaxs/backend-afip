// src/models/Proveedor.js
import mongoose from 'mongoose';

const proveedorSchema = new mongoose.Schema({
    owner: { // Referencia a la empresa a la que pertenece este proveedor
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Empresa',
        required: [true, 'El proveedor debe pertenecer a una empresa.']
    },
    razonSocial: {
        type: String,
        required: [true, 'La razón social del proveedor es obligatoria.'],
        trim: true
    },
    nombreContacto: {
        type: String,
        trim: true
    },
    cuit: {
        type: String,
        trim: true,
        unique: true, // El CUIT de un proveedor debería ser único globalmente
        sparse: true // Permite que haya documentos sin CUIT sin romper la unicidad
    },
    condicionIVA: {
        type: String,
        required: [true, 'La condición IVA del proveedor es obligatoria.'],
        enum: [
            'Responsable Inscripto',
            'Monotributista',
            'Exento',
            'Consumidor Final',
            'Responsable Monotributo',
            'Sujeto Exento',
            'No Responsable'
        ],
        trim: true
    },
    domicilio: {
        type: String,
        trim: true
    },
    localidad: {
        type: String,
        trim: true
    },
    provincia: {
        type: String,
        trim: true
    },
    codigoPostal: {
        type: String,
        trim: true
    },
    telefono: {
        type: String,
        trim: true
    },
    email: {
        type: String,
        trim: true,
        lowercase: true,
        match: [/.+@.+\..+/, 'Por favor, introduce un correo electrónico válido.'],
        sparse: true
    },
    observaciones: {
        type: String,
        trim: true
    },
    activo: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

proveedorSchema.index({ cuit: 1 }, { unique: true, sparse: true }); // Índice para unicidad del CUIT

const Proveedor = mongoose.model('Proveedor', proveedorSchema);
export default Proveedor;