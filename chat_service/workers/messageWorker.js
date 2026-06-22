import { Worker } from "bullmq";
import mongoose from "mongoose";
import { bullClient } from "../lib/redis.js";
import Message from "../model/message.model.js";

export const startMessageWorker = () => {
  const worker = new Worker(
    "message-write",
    async (job) => {
      const { _id, roomId, userId, username, message, timestamp } = job.data;

      await Message.create({
        _id: new mongoose.Types.ObjectId(_id),
        roomId,
        userId,
        username,
        message,
        timestamp: new Date(timestamp),
      });

      console.log(`[Worker] Message ${_id} written to DB`);
    },
    {
      connection: bullClient,
      concurrency: 10, // handle up to 10 DB writes in parallel
    }
  );

  worker.on("completed", (job) => {
    console.log(`[Worker] Job ${job.id} completed`);
  });

  worker.on("failed", (job, err) => {
    console.error(`[Worker] Job ${job?.id} failed:`, err.message);
  });

  worker.on("error", (err) => {
    console.error("[Worker] Worker error:", err.message);
  });

  console.log("[Worker] messageWorker started");
  return worker;
};
