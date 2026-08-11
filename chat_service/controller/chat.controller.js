import Message from "../model/message.model.js";

/**
 * GET /:roomId
 * Returns all chat messages for a given room, sorted oldest-first.
 * Query param: ?limit=100 (default 100, max 500)
 */
export const fetchAllMessagesController = async (req, res) => {
  const { roomId } = req.params;

  if (!roomId) {
    return res.status(400).json({
      status: "error",
      message: "roomId is required",
    });
  }

  const limit = Math.min(parseInt(req.query.limit) || 100, 500);

  try {
    const messages = await Message.find({ roomId })
      .sort({ timestamp: 1 })   // oldest → newest
      .limit(limit)
      .lean();

    return res.status(200).json({
      status: "success",
      data: { messages },
    });
  } catch (err) {
    console.error("[Chat] fetchAllMessages error:", err.message);
    return res.status(500).json({
      status: "error",
      message: "Failed to fetch messages",
    });
  }
};
