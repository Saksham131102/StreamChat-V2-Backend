import Media from "../model/media.model.js";

// ── GET /trending?type=movie&limit=20 ─────────────────────────────────────
export const getTrending = async (req, res) => {
  try {
    const { type, limit = 20 } = req.query;

    const filter = {};
    if (type) filter.type = type;

    const items = await Media.find(filter)
      .sort({ trending_score: -1 })
      .limit(Number(limit))
      .select("-__v");

    res.status(200).json({ data: items });
  } catch (error) {
    console.error("[getTrending]", error.message);
    res.status(500).json({ message: "Failed to fetch trending media." });
  }
};

// ── GET /featured?limit=10 ────────────────────────────────────────────────
export const getFeatured = async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const items = await Media.find({ is_featured: true })
      .sort({ trending_score: -1 })
      .limit(Number(limit))
      .select("-__v");

    res.status(200).json({ data: items });
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
