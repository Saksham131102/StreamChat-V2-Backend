import mongoose from "mongoose";

// ── Reusable sub-schemas ────────────────────────────────────────────────────

const mediaAssetSchema = new mongoose.Schema(
  {
    public_id: { type: String, default: "" },
    url: { type: String, default: "" },
  },
  { _id: false },
);

const streamAssetSchema = new mongoose.Schema(
  {
    public_id: { type: String, default: "" },
    hls_url: { type: String, default: "" },
    dash_url: { type: String, default: "" },
  },
  { _id: false },
);

const seasonSummarySchema = new mongoose.Schema(
  {
    season_no: { type: Number, required: true },
    episode_count: { type: Number, default: 0 },
    year: { type: Number },
  },
  { _id: false },
);

// ── Main Media schema ──────────────────────────────────────────────────────

const MediaSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      index: true,
    },
    type: {
      type: String,
      enum: ["movie", "web_series", "tv"],
      required: [true, "Media type is required"],
      index: true,
    },
    genres: [{ type: String, trim: true, required: [true, "Genres are required"] }],
    language: { type: String, trim: true, default: "en" },
    release_date: { type: Date, required: [true, "Release date is required"] },
    description: {
      type: String,
      trim: true,
      required: [true, "Description is required"],
    },

    // Discovery & ranking
    trending_score: { type: Number, default: 0, index: true },
    view_count: { type: Number, default: 0 },
    is_featured: { type: Boolean, default: false, index: true },

    // People
    cast: [{ type: String, trim: true, required: [true, "Cast is required"] }],
    director: { type: String, trim: true, required: [true, "Director is required"] },
    search_tags: [{ type: String, trim: true, required: [true, "Search tags are required"] }],

    // Movie-specific metadata
    meta: {
      duration_mins: { type: Number },
    },

    // All media assets
    media_assets: {
      poster: { type: mediaAssetSchema, default: () => ({}) },
      backdrop: { type: mediaAssetSchema, default: () => ({}) },
      trailer: { type: mediaAssetSchema, default: () => ({}) },
      stream: { type: streamAssetSchema }, // movies only
    },

    // Series / TV only
    // Movies will have undefined
    seasons_summary: {
      type: [seasonSummarySchema],
      default: undefined,
    },
    total_seasons: {
      type: Number,
      default: undefined,
    },
    total_episodes: {
      type: Number,
      default: undefined,
    },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// ── Text index for full-text search (future use) ───────────────────────────
MediaSchema.index({ title: "text", search_tags: "text" });

const Media = mongoose.model("Media", MediaSchema);

export default Media;
