import mongoose from 'mongoose';

const MarcaSchema = new mongoose.Schema({
    nombre: {
        type: String,
        required: [true, 'El nombre de la marca es obligatorio.'],
        trim: true
    },
    empresa: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Empresa',
        required: true
    }
}, { timestamps: true });

// Índice para asegurar que una empresa no tenga dos marcas con el mismo nombre
MarcaSchema.index({ empresa: 1, nombre: 1 }, { unique: true });

const Marca = mongoose.model('Marca', MarcaSchema);
export default Marca;