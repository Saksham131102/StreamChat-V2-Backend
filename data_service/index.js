import express from "express";
import dotenv from "dotenv";
import dataRoute from "./routes/data.route.js";
dotenv.config();

const app = express();
app.use(express.json());

app.use("/", dataRoute);

const PORT = process.env.PORT;

app.listen(PORT, () => {
  console.log("data_service: ", PORT);
});