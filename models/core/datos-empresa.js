// models/Empresa.js
import mongoose from 'mongoose';

const empresaSchema = new mongoose.Schema({
    nombreEmpresa: {
        type: String,
        required: [true, 'El nombre de la empresa es obligatorio.'],
        trim: true
    },
    razonSocial: { // Nuevo: A menudo diferente del nombre de fantasía
        type: String,
        trim: true
    },
    cuit: {
        type: String,
        required: [true, 'El CUIT es obligatorio.'],
        unique: true, // CUIT debe ser único para cada empresa
        trim: true,
        match: /^\d{2}-\d{8}-\d{1}$/
    },
    iibb: { type: String, trim: true },
    fechaInicioActividades: { type: Date, required: [true, 'La fecha de inicio de actividades es obligatoria.'] },
    condicionIVA: {
        type: String,
        required: [true, 'La condición frente al IVA es obligatoria.'],
        enum: ['Responsable Inscripto', 'Monotributista', 'Exento', 'Consumidor Final', 'Responsable Monotributo', 'Sujeto Exento', 'No Responsable'],
        trim: true
    },
    actividadAFIP: { type: String, trim: true }, // Código CIIU
    metodoContabilidad: {
        type: String,
        enum: ['Contado', 'Devengado'],
        default: 'Contado'
    },
    mesInicioFiscal: { type: Number, min: 1, max: 12, default: 1 },
    telefonoContacto: { type: String, trim: true }, // Teléfono general de contacto
    numeroWhatsapp: { type: String, trim: true }, // Whatsapp específico
    emailContacto: { // Nuevo: Email general de la empresa
        type: String,
        trim: true,
        match: [/.+@.+\..+/, 'Por favor, introduce un correo electrónico de contacto válido.']
    },
    pais: { type: String, required: [true, 'El país es obligatorio.'], trim: true, default: 'Argentina' },
    provincia: { type: String, required: [true, 'La provincia es obligatoria.'], trim: true },
    ciudad: { type: String, required: [true, 'La ciudad es obligatoria.'], trim: true },
    codigoPostal: { type: String, required: [true, 'El código postal es obligatorio.'], trim: true },
    direccion: { type: String, required: [true, 'La dirección es obligatoria.'], trim: true }, // Dirección fiscal
    zonaHoraria: { type: String, required: [true, 'La zona horaria es obligatoria.'], default: 'America/Argentina/Catamarca' },
    monedaDefault: { type: String, required: [true, 'La moneda predeterminada es obligatoria.'], default: 'PES' },
    
    // Certificados AFIP (pueden ir aquí si son por empresa)
    certificadoDigital: { type: String, required: false }, // Ruta o referencia al archivo .crt
    clavePrivada: { type: String, required: false }, // Ruta o referencia al archivo .key
    // Podrías guardar la fecha de vencimiento del certificado
    fechaVencimientoCertificado: { type: Date }, 
    // Otros datos de AFIP (ej. ID de ambiente, clave WSFE)
    ambienteAFIP: { // Nuevo: 'PRODUCCION' o 'HOMOLOGACION'
        type: String,
        enum: ['PRODUCCION', 'HOMOLOGACION'],
        default: 'HOMOLOGACION' // Mejor empezar en homologación para pruebas
    }
}, {
    timestamps: true
});

const Empresa = mongoose.model('Empresa', empresaSchema);
export default Empresa;