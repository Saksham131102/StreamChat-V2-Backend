import mongoose from "mongoose";
import { addMessageJob } from "../queues/messageQueue.js";

/**
 * Register all Socket.IO event handlers.
 * @param {import("socket.io").Server} io
 */
export const registerChatSocket = (io) => {
  io.on("connection", (socket) => {
    const userId = socket.handshake.auth?.userId;
    const username = socket.handshake.auth?.username;

    console.log(`[Socket] Connected: socketId=${socket.id}, userId=${userId}`);

    // ── join_room ──────────────────────────────────────────────────────────────
    socket.on("join_room", ({ roomId }) => {
      if (!roomId) return;
      socket.join(roomId);
      console.log(`[Socket] userId=${userId} joined room=${roomId}`);
      // Notify other participants in the room
      socket.to(roomId).emit("user_joined", { userId, username });
    });

    // ── send_message ───────────────────────────────────────────────────────────
    socket.on("send_message", async ({ roomId, message }) => {
      if (!roomId || !message?.trim()) return;
      if (!userId || !username) {
        socket.emit("error", { message: "Unauthorized" });
        return;
      }

      // Generate a Mongoose ObjectId — stays consistent between broadcast and DB write
      const _id = new mongoose.Types.ObjectId();
      const timestamp = new Date().toISOString();

      const messageObj = {
        _id: _id.toString(),
        roomId,
        userId,
        username,
        message: message.trim(),
        timestamp,
      };

      // 1. Enqueue for async DB write (non-blocking)
      try {
        await addMessageJob(messageObj);
      } catch (err) {
        console.error("[Socket] Failed to enqueue message:", err.message);
        // Don't block broadcast even if queue fails
      }

      // 2. Instantly broadcast to everyone in the room (including sender)
      io.to(roomId).emit("new_message", messageObj);
    });

    // ── leave_room ─────────────────────────────────────────────────────────────
    socket.on("leave_room", ({ roomId }) => {
      if (!roomId) return;
      socket.leave(roomId);
      console.log(`[Socket] userId=${userId} left room=${roomId}`);
      // Notify other participants in the room
      socket.to(roomId).emit("user_left", { userId });
    });

    // ── disconnecting ──────────────────────────────────────────────────────────
    socket.on("disconnecting", () => {
      // Notify rooms that the user is disconnecting
      for (const roomId of socket.rooms) {
        if (roomId !== socket.id) {
          socket.to(roomId).emit("user_left", { userId });
        }
      }
    });

    // ── disconnect ─────────────────────────────────────────────────────────────
    socket.on("disconnect", (reason) => {
      console.log(`[Socket] Disconnected: socketId=${socket.id}, reason=${reason}`);
    });
  });
};
