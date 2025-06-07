import {loginUser_services, registerUser_services, updateUser_services, deleteUser_services} from '../services/auth_services.js';

//captura los datos del usuario y contraseña para iniciar sesión, los manda a services
export async function login(req, res) {
    const { username, password } = req.body;
     const access = await loginUser_services(username, password)
     if (access) {res.status(200).send({ username, password: access.password }); return;}
    res.status(401).send({ error: "Usuario o contraseña incorrectos" });
}

//captura los datos del usuario y contraseña para registrarse, los manda a services
export async function register(req, res) {
    let datos = req.body; 
    console.log("Datos a registrar:", datos);
  const creado = await registerUser_services(datos)
  if(creado) {res.status(201).send({ creado }); return;}
  res.status(400).send({ error: "Error al crear el usuario" });
}


export async function update(req, res) {
    const datos = req.body;
    const actualizados = await updateUser_services(datos);
    res.status(200).send({ message:`Usuario actualizado correctamente :`, actualizados });
}

export async function deleteUser(req, res) {
    const {id} = await req.body;
   const eliminado = await deleteUser_services(id);
    res.status(200).send({ message: `Usuario eliminado correctamente:`, eliminado });
} ;
