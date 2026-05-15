import Media from "../model/media.model.js";
import { 
  getTrendingCache,
  setTrendingCache,
  getFeaturedCache,
  setFeaturedCache 
} from "../cache/media.cache.js";

// ── POST /create-media ───────────────────────────────────────────────────────────
// export const createMedia = async (req, res) => {
//   try {
//     const media = new Media(req.body);
//     const saved = await media.save();
//     res.status(201).json({ message: "Media created successfully.", data: saved });
//   } catch (error) {
//     console.error("[createMedia]", error.message);
//     if (error.name === "ValidationError") {
//       return res.status(400).json({ message: error.message });
//     }
//     res.status(500).json({ message: "Failed to create media." });
//   }
// };

// ── GET /trending?type=movie&limit=20 ─────────────────────────────────────
export const getTrending = async (req, res) => {
  try {
    const { type, limit = 20 } = req.query;

    const filter = {};
    if (type) filter.type = type;

    const cachedData = await getTrendingCache(type, limit);
    if(cachedData){
      return res.status(200).json({ data: cachedData, fromCache: true });
    }

    const items = await Media.find(filter)
      .sort({ trending_score: -1 })
      .limit(Number(limit))
      .select("-__v");

    await setTrendingCache(type, limit, items);
    res.status(200).json({ data: items, fromCache: false });
  } catch (error) {
    console.error("[getTrending]", error.message);
    res.status(500).json({ message: "Failed to fetch trending media." });
  }
};

// ── GET /featured?limit=10 ────────────────────────────────────────────────
export const getFeatured = async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const cachedData = await getFeaturedCache(limit);
    if(cachedData){
      return res.status(200).json({ data: cachedData, fromCache: true });
    }

    const items = await Media.find({ is_featured: true })
      .sort({ trending_score: -1 })
      .limit(Number(limit))
      .select("-__v");

    await setFeaturedCache(limit, items);
    res.status(200).json({ data: items, fromCache: false });
  } catch (error) {
    console.error("[getFeatured]", error.message);
    res.status(500).json({ message: "Failed to fetch featured media." });
  }
};

// ── GET /media/:id ────────────────────────────────────────────────────────
export const getMediaById = async (req, res) => {
  try {
    const { id } = req.params;
    const item = await Media.findById(id).select("-__v");

    if (!item) {
      return res.status(404).json({ message: "Media not found." });
    }

    res.status(200).json({ data: item });
  } catch (error) {
    console.error("[getMediaById]", error.message);
    res.status(500).json({ message: "Failed to fetch media." });
  }
};

// ── GET /search?q=Batman&type=movie&limit=20 ──────────────────────────────
export const searchMedia = async (req, res) => {
  try {
    const { q, type, limit = 20 } = req.query;

    if (!q) {
      return res.status(400).json({ message: "Query parameter 'q' is required." });
    }

    const filter = { $text: { $search: q } };
    if (type) filter.type = type;

    const items = await Media.find(filter, { score: { $meta: "textScore" } })
      .sort({ score: { $meta: "textScore" } })
      .limit(Number(limit))
      .select("-__v");

    res.status(200).json({ data: items });
  } catch (error) {
    console.error("[searchMedia]", error.message);
    res.status(500).json({ message: "Failed to search media." });
  }
};


// ── Helper function to check for missing values ──────────────────────────────
// being used in createMedia controller
const isMissing = (val) => val === null || val === undefined;

// ── POST /create-media ───────────────────────────────────────────────────────────
export const createMedia = async (req, res) => {
  try {
    const {
      title,
      type,
      genres,
      language,
      release_date,
      description,
      trending_score,
      view_count,
      is_featured,
      cast,
      director,
      search_tags,
      meta,
      media_assets,
      seasons_summary,
      total_seasons,
      total_episodes
    } = req.body;

    if(!title ||
      !type ||
      !genres ||
      !language ||
      !release_date ||
      !description ||
      isMissing(trending_score) ||
      isMissing(view_count) ||
      typeof is_featured !== "boolean" ||
      !cast ||
      !director ||
      !search_tags ||
      !media_assets){
      return res.status(400).json({ message: "All fields are required." });
    }

    const media = new Media({
      title,
      type,
      genres,
      language,
      release_date,
      description,
      trending_score,
      view_count,
      is_featured,
      cast,
      director,
      search_tags,
      meta,
      media_assets,
      seasons_summary,
      total_seasons,
      total_episodes
    });

    const saved = await media.save();

    res.status(201).json({ message: "Media created successfully.", data: saved });
  } catch (error) {
    console.error("[createMedia] -> ", error.message);
    if (error.name === "ValidationError") {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: "Failed to create media." });
  }
};