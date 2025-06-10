import {Router} from "express";
import {login, register, deleteUser, update} from "../controllers/auth/auth_controllers.js";
import {validateRegistration, validateLogin} from "../middlewares/auth_middlewares.js";

export const auth_router = Router();

auth_router.post("/register", validateRegistration, register);

auth_router.post("/login", validateLogin, login);

auth_router.post("/update", update);

auth_router.delete("/delete", deleteUser);




 