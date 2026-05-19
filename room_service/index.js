import express from "express";
import dotenv from "dotenv";
import { closeDBConnection, connectDB } from "./config/db.js";
import RoomRoute from "./routes/room.route.js";

dotenv.config();

const app = express();

app.use(express.json());

const PORT = process.env.PORT;

const start_server = async () => {
  try {
    await Promise.all([
      connectDB()
    ]);

    app.use("/", RoomRoute);

    app.listen(PORT, () => {
      console.log("room_service started: ", PORT);
    })
  } catch (error) {
    console.error("Failed to start room_service ", error.message);
    process.exit(1);
  }
}

start_server();

const shutdown = async () => {
  try {
    console.log("Shutting down gracefully...");
    await Promise.all([
      closeDBConnection()
    ]);
    console.log("All connections closed.");
    process.exit(0);
  } catch (error) {
    console.error("Error while shutting down: ", error);
    process.exit(1);
  }
}

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);