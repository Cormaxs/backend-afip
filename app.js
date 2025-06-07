import Express from "express";
import env from "dotenv";
import cors from "cors";
import { auth_router } from "./routes/auth_routes.js";
import { facturas_Router } from "./routes/facturas-routes.js";
import { product_Router } from "./routes/product-routes.js";
import {admin_router} from "./routes/admin/admin_routes.js";
import {gerente_router} from "./routes/roles_users/gerente_routes.js";
import {vendedor_router} from "./routes/roles_users/vendedor_routes.js";
import connectDB from "./db/connect.js";


env.config();
const app = Express();
app.use(cors());
app.use(Express.json());
const PORT = process.env.PORT || 3000;
connectDB();




app.use("/auth", auth_router)
app.use("/facturas", facturas_Router);
app.use("/productos", product_Router);
app.use("/admin",admin_router);
app.use("/gerente", gerente_router);
app.use("/vendedor", vendedor_router);

app.use("/", (req, res)=>{
    res.send("raiz general"); 
})

app.listen(PORT,()=>{
    console.log(`Server is running on port ${PORT} http://localhost:${PORT}`);
})