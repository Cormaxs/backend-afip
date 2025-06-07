import mongoose from 'mongoose';


const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    password: { // Aquí guardaremos el hash de la contraseña
        type: String,
        required: true
    },
    email:{
        type: String,
        required:true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const User = mongoose.model('Users-login', userSchema);//Users-login es como se va a crear en la base de datos

export default User; // Usa export default para una importación más limpia