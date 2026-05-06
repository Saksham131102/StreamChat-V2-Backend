import "dotenv/config";
import express from "express";
import authRoute from "./routes/auth.routes.js";
import connectDB from "./config/db.js";

const app = express();
app.use(express.json());

const PORT = process.env.PORT;

// Connecting to DB before starting server
const startServer = async () => {
  await connectDB();

  app.use("/", authRoute);

  app.listen(PORT, () => {
    console.log(`auth_service running on port: ${PORT}`);
  });
};

startServer();
