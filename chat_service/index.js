import { createServer } from "http";
import express from "express";
import dotenv from "dotenv";
import { Server } from "socket.io";
import { createAdapter } from "@socket.io/redis-adapter";

import chatRoute from "./routes/chat.route.js";
import { pubClient, subClient } from "./lib/redis.js";
import { connectMongoDB } from "./lib/mongodb.js";
import { startMessageWorker } from "./workers/messageWorker.js";
import { registerChatSocket } from "./socket/chatSocket.js";

dotenv.config();

const PORT = process.env.PORT || 3001;

const app = express();
app.use(express.json());
app.use("/", chatRoute);

const httpServer = createServer(app);

const io = new Server(httpServer, {
  // Path must align with the Nginx /chat/ location rewrite
  path: "/socket.io",
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

const bootstrap = async () => {
  try {
    // 1. Connect to MongoDB
    await connectMongoDB();

    // 2. Connect Redis pub/sub clients and attach Redis adapter for multi-instance fan-out
    await Promise.all([pubClient.connect(), subClient.connect()]);
    io.adapter(createAdapter(pubClient, subClient));
    console.log("Socket.IO Redis adapter attached");

    // 3. Start BullMQ worker for background DB writes
    startMessageWorker();

    // 4. Register Socket.IO event handlers
    registerChatSocket(io);

    // 5. Start HTTP server
    httpServer.listen(PORT, () => {
      console.log(`chat_service started: ${PORT}`);
    });
  } catch (error) {
    console.error("chat_service bootstrap failed:", error.message);
    process.exit(1);
  }
};

bootstrap();