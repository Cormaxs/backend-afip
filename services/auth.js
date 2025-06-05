import { registerUser, comparePassword } from '../utils/bcrypt.js';
//use repositories for call a the database

//verifica que existan los datos de usuario y contraseña
export async function loginUser_services(username, password) {
    if (username && password) return {username, password};
    return {username, password}
}

//hashea la contraseña 
export async function registerUser_services(password) {
    return await registerUser(password)
}