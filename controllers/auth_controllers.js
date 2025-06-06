import {loginUser_services, registerUser_services} from '../services/auth_services.js';

//captura los datos del usuario y contraseña para iniciar sesión, los manda a services
export async function login(req, res) {
    const { username, password } = req.body;
     const access = await loginUser_services(username, password)
     if (access) {res.status(200).send({ username, password: access.password }); return;}
    res.status(401).send({ error: "Usuario o contraseña incorrectos" });
}

//captura los datos del usuario y contraseña para registrarse, los manda a services
export async function register(req, res) {
    let { username, password } = req.body; 
  const creado = await registerUser_services(username, password)
  if(creado) {res.status(201).send({ username, password: creado }); return;}
  res.status(400).send({ error: "Error al crear el usuario" });
}
