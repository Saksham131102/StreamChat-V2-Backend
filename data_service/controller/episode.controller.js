import Episode from "../model/episode.model.js";
import Media from "../model/media.model.js";

// ── POST /episodes ────────────────────────────────────────────────────────
// export const createEpisode = async (req, res) => {
//   try {
//     const { media_id } = req.body;

//     // Verify the referenced media exists and is not a movie
//     const media = await Media.findById(media_id).select("type");
//     if (!media) {
//       return res.status(404).json({ message: "Referenced media not found." });
//     }
//     if (media.type === "movie") {
//       return res.status(400).json({
//         message: "Episodes cannot be linked to a movie. Use web_series or tv.",
//       });
//     }

//     const episode = new Episode(req.body);
//     const saved = await episode.save();
//     res.status(201).json({ message: "Episode created successfully.", data: saved });
//   } catch (error) {
//     console.error("[createEpisode]", error.message);
//     if (error.name === "ValidationError") {
//       return res.status(400).json({ message: error.message });
//     }
//     // Duplicate episode (media_id + season_no + episode_no conflict)
//     if (error.code === 11000) {
//       return res.status(409).json({
//         message: "Episode already exists for this season and episode number.",
//       });
//     }
//     res.status(500).json({ message: "Failed to create episode." });
//   }
// };


export const createEpisode = async(req, res) => {

  const {
      media_id,
      season_no,
      episode_no,
      title,
      description,
      duration_mins,
      air_date,
      media_assets,
      stream
    } = req.body;

  if(
    !media_id ||
    season_no == null ||
    episode_no == null ||
    !title ||
    !description ||
    duration_mins == null ||
    !air_date ||
    !media_assets ||
    !stream
  ){
    return res.status(400).json({ message: "All fields are required." });
  }

  const session = await mongoose.startSession();
  
  try {
    session.startTransaction();
    const media = await Media.findById(media_id).session(session);

    if(!media){
      throw {
        status: 404,
        message: "Media not found."
      };
    }

    if(media.type === "movie"){
      throw {
        status: 400,
        message: "Episodes cannot be linked to a movie."
      };
    }

    // Adding a safe validation if seasons_summary is null or undefined
    media.seasons_summary = media.seasons_summary || [];

    // What if same season_no and same episode_no exists for same media_id
    const existingEpisode = await Episode.findOne({
      media_id,
      season_no,
      episode_no
    }).session(session);

    if(existingEpisode){
      throw {
        status: 409,
        message: "Episode already exists for this season and episode number."
      };
    }

    // Finding episode count for a season
    const episodeCount = await Episode.countDocuments({
      media_id,
      season_no
    }).session(session);

    const existingSeason = media.seasons_summary.find(s => s.season_no === season_no);

    if(existingSeason){
      existingSeason.episode_count = episodeCount + 1;
    }else{
      media.seasons_summary.push({
        season_no,
        episode_count: 1
      });
    }

    // instead of updating total_seasons and total_episodes based on 
    // season_no and episode_no, we can update them based on the length of 
    // seasons_summary array and the maximum episode_count in the array

    media.total_seasons = media.seasons_summary.length;
    media.total_episodes = media.seasons_summary.reduce(
      (sum, season) => sum + season.episode_count,
      0
    );

    const episode = new Episode({
      media_id,
      season_no,
      episode_no,
      title,
      description,
      duration_mins,
      air_date,
      media_assets,
      stream
    });

    const saved = await episode.save({session});
    await media.save({session});
    await session.commitTransaction();
    res.status(201).json({ message: "Episode created successfully.", data: saved });

  } catch (error) {
    await session.abortTransaction();

    if (error.status) {
      return res.status(error.status).json({ message: error.message });
    }

    if (error.code === 11000) {
      return res.status(409).json({ message: "Episode already exists" });
    }
  
    console.error("[createEpisode] -> ", error.message);
    if (error.name === "ValidationError") {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: "Failed to create episode." });
  } finally {
    session.endSession();
  }
}