import express from "express";
import dotenv from "dotenv";
import authRoute from "./routes/auth.routes.js";

dotenv.config();
const app = express();
app.use(express.json());

const PORT = process.env.PORT;

app.use("/", authRoute);

app.listen(PORT, () => {
  console.log("auth_service running: ", PORT);
})