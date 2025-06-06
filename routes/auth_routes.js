import {Router} from "express";
import {login, register} from "../controllers/auth_controllers.js";
import {validateRegistration, validateLogin} from "../middlewares/auth_middlewares.js";

export const auth_router = Router();

auth_router.get("/login", (req, res)=>{
    res.send("Login Page");
})
auth_router.post("/login", validateLogin, login);

auth_router.post("/register", validateRegistration, register);