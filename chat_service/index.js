import express from "express";
import dotenv from "dotenv";
import chatRoute from "./routes/chat.route.js";

dotenv.config()
const app = express();
app.use(express.json());

app.use("/", chatRoute);

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log("chat_service: ", PORT);
});