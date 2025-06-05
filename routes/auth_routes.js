import {Router} from "express";
import {login, register} from "../controllers/auth_controllers.js";
import {validateRegistration, validateLogin} from "../middlewares/auth_middlewares.js";

export const router = Router();

router.get("/login", (req, res)=>{
    res.send("Login Page");
})
router.post("/login", validateLogin, login);

router.post("/register", validateRegistration, register);