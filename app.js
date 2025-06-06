import Express from "express";
import env from "dotenv";
import cors from "cors";
import { auth_router } from "./routes/auth_routes.js";
import { facturas_Router } from "./routes/facturas-routes.js";
import { product_Router } from "./routes/product-routes.js";
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

app.use("/", (req, res)=>{
    res.send("raiz general");
})

app.listen(PORT,()=>{
    console.log(`Server is running on port ${PORT} http://localhost:${PORT}`);
})