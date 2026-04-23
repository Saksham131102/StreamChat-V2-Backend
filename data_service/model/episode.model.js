import mongoose from "mongoose";

// ── Reusable sub-schemas ────────────────────────────────────────────────────
// (mirrors the same helpers used in media.model.js)

const episodeThumbnailSchema = new mongoose.Schema(
  {
    public_id: { type: String, default: "" },
    url: { type: String, default: "" },
  },
  { _id: false },
);

const episodeStreamSchema = new mongoose.Schema(
  {
    public_id: { type: String, default: "" },
    hls_url: { type: String, default: "" },
    dash_url: { type: String, default: "" },
  },
  { _id: false },
);

// ── Main Episode schema ────────────────────────────────────────────────────

const EpisodeSchema = new mongoose.Schema(
  {
    // Reference to the parent media (web_series / tv)
    media_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Media",
      required: [true, "media_id is required"],
      index: true,
    },

    season_no: {
      type: Number,
      required: [true, "season_no is required"],
    },

    episode_no: {
      type: Number,
      required: [true, "episode_no is required"],
    },

    title: {
      type: String,
      required: [true, "Episode title is required"],
      trim: true,
    },

    description: {
      type: String,
      trim: true,
      default: "",
    },

    duration_mins: {
      type: Number,
    },

    air_date: {
      type: Date,
    },

    // All episode-level media assets
    media_assets: {
      thumbnail: { type: episodeThumbnailSchema, default: () => ({}) },
      stream: { type: episodeStreamSchema, default: () => ({}) },
    },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// ── Indexes ────────────────────────────────────────────────────────────────

// Guarantees uniqueness + fast episode lookups: "give me S2E4 of media X"
EpisodeSchema.index({ media_id: 1, season_no: 1, episode_no: 1 }, { unique: true });

// Fast fetch of all episodes for a given season
EpisodeSchema.index({ media_id: 1, season_no: 1 });

// ── Model ──────────────────────────────────────────────────────────────────

const Episode = mongoose.model("Episode", EpisodeSchema);

export default Episode;
