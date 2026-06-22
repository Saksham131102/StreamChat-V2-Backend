import Redis from "ioredis";

const REDIS_HOST = process.env.REDIS_HOST || "valkey";
const REDIS_PORT = parseInt(process.env.REDIS_PORT || "6379", 10);

const redisOptions = {
  host: REDIS_HOST,
  port: REDIS_PORT,
  maxRetriesPerRequest: null, // required by BullMQ
  lazyConnect: true,
};

// Two separate clients required by @socket.io/redis-adapter (pub + sub)
export const pubClient = new Redis(redisOptions);
export const subClient = pubClient.duplicate();

// Dedicated client for BullMQ queue/worker
export const bullClient = new Redis(redisOptions);

pubClient.on("error", (err) => console.error("Redis pubClient error:", err));
subClient.on("error", (err) => console.error("Redis subClient error:", err));
bullClient.on("error", (err) => console.error("Redis bullClient error:", err));
