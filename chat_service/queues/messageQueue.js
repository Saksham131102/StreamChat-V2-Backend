import { Queue } from "bullmq";
import { bullClient } from "../lib/redis.js";

// Queue for async MongoDB writes
export const messageWriteQueue = new Queue("message-write", {
  connection: bullClient,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 1000,
    },
    removeOnComplete: 100, // keep last 100 completed jobs for inspection
    removeOnFail: 200,
  },
});

/**
 * Add a message job to the queue for async DB write.
 * @param {Object} payload - { _id, roomId, userId, username, message, timestamp }
 */
export const addMessageJob = async (payload) => {
  await messageWriteQueue.add("write-message", payload, {
    jobId: payload._id.toString(), // idempotency: same message never written twice
  });
};
