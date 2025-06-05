import Express from "express";
import env from "dotenv";
import cors from "cors";
import { router } from "./routes/auth.js";

env.config();
const app = Express();
app.use(cors());
app.use(Express.json());
const PORT = process.env.PORT || 3000;





app.use("/auth", router)


app.use("/", (req, res)=>{
    res.send("raiz general");
})

app.listen(PORT,()=>{
    console.log(`Server is running on port ${PORT} http://localhost:${PORT}`);
})