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

/**
 * DELETE /:roomId
 * Deletes all chat messages for a given room, notifies all participants that the room is closed,
 * and removes all sockets from the room.
 */
export const deleteRoomMessagesController = async (req, res) => {
  const { roomId } = req.params;

  if (!roomId) {
    return res.status(400).json({
      status: "error",
      message: "roomId is required",
    });
  }

  try {
    const io = req.app.get("io");
    if (io) {
      console.log(`[Chat] Broadcasting room_closed for room=${roomId}`);
      io.to(roomId).emit("room_closed", {
        roomId,
        message: "Watch party has been closed by the host",
      });
      io.in(roomId).socketsLeave(roomId);
    }

    const deleteResult = await Message.deleteMany({ roomId });
    console.log(`[Chat] Deleted ${deleteResult.deletedCount} messages for room=${roomId}`);

    return res.status(200).json({
      status: "success",
      message: "Room messages deleted and clients notified",
      deletedCount: deleteResult.deletedCount,
    });
  } catch (err) {
    console.error("[Chat] deleteRoomMessages error:", err.message);
    return res.status(500).json({
      status: "error",
      message: "Failed to delete room messages",
    });
  }
};
