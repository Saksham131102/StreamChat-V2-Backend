import { getValkeyClient } from "../config/valkey";

// 60 minutes + 5 minutes random
const MEDIA_TTL = 3600 + Math.floor(Math.random() * 300);

// ----------------------------------------------------------------------
// Cache for trending media
// ----------------------------------------------------------------------
export const getTrendingCache = async (type, limit) => {
  try {
    const client = getValkeyClient();
    const key = `trending:${type || "all"}:${limit}`;
    const cachedData = await client.get(key);

    if (cachedData) {
      console.log(`[Cache] Cache hit for ${type} trending media`);
      return JSON.parse(cachedData);
    }

    console.log(`[Cache] Cache miss for ${type} trending media`);
    return null;
  } catch (error) {
    console.error("Error getting trending cache:", error);
    return null;
  }
}

export const setTrendingCache = async (type, limit, data) => {
  try {
    const client = getValkeyClient();
    const key = `trending:${type || "all"}:${limit}`;
    await client.setEx(key, MEDIA_TTL, JSON.stringify(data));
    console.log(`[Cache] Cache set for ${type} trending media`);
  } catch (error) {
    console.error("Error setting trending cache:", error);
  }
}

// ----------------------------------------------------------------------
// Cache for featured media
// ----------------------------------------------------------------------
export const getFeaturedCache = async (limit) => {
  try {
    const client = getValkeyClient();
    const key = `featured:${limit}`;
    const cachedData = await client.get(key);

    if (cachedData) {
      console.log(`[Cache] Cache hit for featured media`);
      return JSON.parse(cachedData);
    }

    console.log(`[Cache] Cache miss for featured media`);
    return null;
  } catch (error) {
    console.error("Error getting featured cache:", error);
    return null;
  }
}

export const setFeaturedCache = async (limit, data) => {
  try {
    const client = getValkeyClient();
    const key = `featured:${limit}`;
    await client.setEx(key, MEDIA_TTL, JSON.stringify(data));
    console.log(`[Cache] Cache set for featured media`);
  } catch (error) {
    console.error("Error setting featured cache:", error);
  }
}
