// models/User.js
import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, 'El nombre de usuario es obligatorio.'],
        unique: true,
        trim: true,
        lowercase: true,
        minlength: [4, 'El nombre de usuario debe tener al menos 4 caracteres.']
    },
    password: { // Aquí se almacenará el hash de la contraseña
        type: String,
        required: [true, 'La contraseña es obligatoria.']
        // Considera agregar minlength para seguridad: minlength: [6, 'La contraseña debe tener al menos 6 caracteres.']
    },
    email: {
        type: String,
        required: [true, 'El correo electrónico es obligatorio.'],
        unique: true, // Email debe ser único entre todos los usuarios de login
        trim: true,
        lowercase: true,
        match: [/.+@.+\..+/, 'Por favor, introduce un correo electrónico válido.']
    },
    // Referencia a la empresa a la que pertenece este usuario
    empresa: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Empresa', // Referencia al modelo Empresa
        required: [true, 'Cada usuario debe pertenecer a una empresa.']
    },
    rol: { // Rol del usuario dentro de la empresa
        type: String,
        // Roles más específicos para la administración de la empresa
        enum: ['admin_principal', 'admin','gestor_contable', 'empleado_administrativo', 'solo_visualizacion'],
        default: 'empleado_administrativo',
        required: [true, 'El rol del usuario es obligatorio.']
    },
    nombre: {
        type: String,
        trim: true
        // required: true, // ¿Debería ser obligatorio el nombre de la persona que se loguea?
    },
    apellido: {
        type: String,
        trim: true
        // required: true, // ¿Debería ser obligatorio el apellido de la persona que se loguea?
    },
    activo: { // Si la cuenta de este usuario está activa
        type: Boolean,
        default: true
    }
}, {
    timestamps: true // `createdAt` y `updatedAt`
});

const User = mongoose.model('Users-logins', userSchema);
export default User;