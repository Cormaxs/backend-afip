import Express from "express";
import env from "dotenv";
import cors from "cors";
import connectDB from "./db/connect.js";
import routerV1 from "./routes/api/index.js";

env.config();
const app = Express();
app.use(cors());
app.use(Express.json());
const PORT = process.env.PORT || 3000;
connectDB();

app.use("/api/v1", routerV1);
app.use("/", (req, res)=>{
    res.send("raiz general"); 
})

app.listen(PORT,()=>{
    console.log(`Server is running on port ${PORT} http://localhost:${PORT}`);
})