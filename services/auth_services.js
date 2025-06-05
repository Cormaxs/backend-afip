import { registerUser, comparePassword } from '../utils/bcrypt.js';
import UserRepository from '../repositories/repo_auth.js';

//verifica que la password coincida
export async function loginUser_services(username, password) {
    const existe = await UserRepository.findByUsername(username);
    const passwordMatch = await comparePassword(password, existe.password);
    if (!existe) {
        console.error("Usuario o contraeña incorrectos");
        throw new Error("Usuario o contraseña incorrectos");
    }
   // console.log(existe, passwordMatch)
    return existe;
}

//hashea la contraseña, verifica si no hay username Repetido, email unico, etc
export async function registerUser_services(username, password) {
    try{
        password =  await registerUser(password);//hashea la contraseña
        const usuarioCreado = await UserRepository.create({username, password});
        if(usuarioCreado){
           // console.log("Usuario creado correctamente:", usuarioCreado);
            return usuarioCreado;
        }
        return null; // Si no se pudo crear el usuario, retorna null
    }catch(error){
       // console.error("Error al registrar el usuario:", error);
        throw new Error("Error al registrar el usuario");
    }
}



//creo una clase para verificar si el usuario ya existe, puedo usarla instancia de UserRepository
class AuthService {
    constructor() {
        this.UserRepository = UserRepository; // Asigna la instancia del repositorio
    }

    async UserExist(username) {
        const existe = await this.UserRepository.findByUsername(username);
        return existe ? true : false;
    }
}

export default new AuthService(); // Exporta una instancia de la clase AuthService