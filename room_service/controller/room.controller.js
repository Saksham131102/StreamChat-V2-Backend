import Room from "../model/room.model.js";
import bcrypt from "bcrypt";
import axios from "axios";

export const createRoom = async (req, res) => {
    try {
        const {
            room_name,
            is_private,
            media_id,
            password,
        } = req.body;

        const host_id = req.headers['x-user-id'];

        if (!host_id) {
            return res.status(401).json({
                status: "fail",
                message: "Unauthorized",
            });
        }

        if (!room_name) {
            return res.status(400).json({
                status: "fail",
                message: "Room name is required",
            });
        }

        let hashedPassword = undefined;

        if (is_private) {
            if (!password || password.trim() === "") {
                return res.status(400).json({
                    status: "fail",
                    message: "Password is required for private rooms",
                });
            }
            const salt = await bcrypt.genSalt(10);
            hashedPassword = await bcrypt.hash(password, salt);
        }

        const room = new Room({
            room_name,
            is_private: is_private || false,
            host_id,
            media_id,
            password: hashedPassword,
            participants: [host_id],
            expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000),
        });

        const savedRoom = await room.save();

        if (!savedRoom) {
            return res.status(500).json({
                status: "error",
                message: "Failed to save the room",
            });
        }

        return res.status(201).json({
            status: "success",
            message: "Room created successfully",
            data: {
                roomId: savedRoom._id,
            }
        });

    } catch (error) {
        console.error("Error in createRoom controller --> ", error.message);
        return res.status(500).json({
            status: "error",
            message: "Internal server error",
        });
    }
}

export const getRoomById = async (req, res) => {
    try {
        const { roomId } = req.body;
        const userId = req.headers['x-user-id'];

        if (!userId) {
            return res.status(401).json({
                status: "fail",
                message: "Unauthorized",
            });
        }

        if (!roomId) {
            return res.status(400).json({
                status: "fail",
                message: "Room Id is required",
            });
        }

        const roomDoc = await Room.findById(roomId);

        if (!roomDoc) {
            return res.status(404).json({
                status: "fail",
                message: "Room not found",
            });
        }

        // 1. If it's a private room and the user is NOT a participant (and not the host)
        const isParticipant = roomDoc.participants.includes(userId);
        const isHost = roomDoc.host_id.toString() === userId.toString();

        if (roomDoc.is_private && !isParticipant && !isHost) {
            return res.status(403).json({
                status: "fail",
                message: "Password required",
                is_private: true
            });
        }

        // 2. If it's a public room and the user is not a participant, automatically join them
        if (!roomDoc.is_private && !isParticipant) {
            roomDoc.participants.push(userId);
            await roomDoc.save();
        }

        const room = roomDoc.toObject();

        // 3. Fetch participants full details
        if (room.participants && room.participants.length > 0) {
            try {
                const participantsDetails = await axios.post('http://auth_service:3000/users/batch', {
                    userIds: room.participants
                });
                room.participants = participantsDetails.data.data;
            } catch (error) {
                console.error("Error fetching participants details:", error);
                room.participants = [];
            }
        }

        return res.status(200).json({
            status: "success",
            message: "Room fetched successfully",
            data: {
                room,
                is_owner: isHost
            }
        });

    } catch (error) {
        console.error("Error in getRoomById controller --> ", error.message);
        return res.status(500).json({
            status: "error",
            message: "Internal server error",
        });
    }
}

export const joinRoom = async (req, res) => {
    try {
        const { roomId, password } = req.body;
        const userId = req.headers['x-user-id'];

        if (!userId) {
            return res.status(401).json({
                status: "fail",
                message: "Unauthorized",
            });
        }

        if (!roomId) {
            return res.status(400).json({
                status: "fail",
                message: "Room Id is required",
            });
        }

        const room = await Room.findById(roomId);

        if (!room) {
            return res.status(404).json({
                status: "fail",
                message: "Room not found",
            });
        }

        // Check if user is already participant/host
        const isParticipant = room.participants.includes(userId);
        const isHost = room.host_id.toString() === userId.toString();

        if (isParticipant || isHost) {
            return res.status(200).json({
                status: "success",
                message: "Already in the room",
            });
        }

        // Check password if private
        if (room.is_private) {
            if (!password) {
                return res.status(400).json({
                    status: "fail",
                    message: "Password is required for private rooms",
                });
            }

            const isMatch = await bcrypt.compare(password, room.password);
            if (!isMatch) {
                return res.status(401).json({
                    status: "fail",
                    message: "Incorrect password",
                });
            }
        }

        // Add user to participants list
        room.participants.push(userId);
        await room.save();

        return res.status(200).json({
            status: "success",
            message: "Successfully joined the room",
        });

    } catch (error) {
        console.error("Error in joinRoom controller --> ", error.message);
        return res.status(500).json({
            status: "error",
            message: "Internal server error",
        });
    }
}