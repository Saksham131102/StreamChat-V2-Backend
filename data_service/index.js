import express from "express";
import dotenv from "dotenv";
import dataRoute from "./routes/data.route.js";
import { connectDB, closeDBConnection } from "./config/db.js";
import { connectValkey, closeValkeyConnection } from "./config/valkey.js";
dotenv.config();

const app = express();
app.use(express.json());

app.use("/", dataRoute);

const PORT = process.env.PORT;

const start_server = async () => {
  try {
    await Promise.all([
      connectDB(),
      connectValkey(),
    ]);
    app.listen(PORT, () => {
      console.log("data_service: ", PORT);
    });
  } catch (error) {
    console.error('Failed to start data_service: ', error);
    process.exit(1);
  }
};

start_server();

const shutdown = async () => {
  try {
    console.log('Shutting down gracefully...');
    await Promise.all([
      closeDBConnection(),
      closeValkeyConnection(),
    ]);
    console.log('All connections closed.');
    process.exit(0);
  } catch (error) {
    console.error('Error while shutting down: ', error);
    process.exit(1);
  }
}

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
