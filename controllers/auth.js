
import {loginUser_services, registerUser_services} from '../services/auth.js';

export async function login(req, res) {
    const { username, password } = req.body;
     const valores = await loginUser_services(username, password)
     res.send(valores)
}

export async function register(req, res) {
    let { username, password } = req.body; 
  const valores = await registerUser_services( password)
  res.send({ username, password: valores });
}
