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
        const host_id = req.headers['x-user-id'];

        if (!host_id) {
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

        const roomDoc = await Room.findById(roomId)
            .select('room_name is_private host_id media_id participants')
            .lean();

        if (!roomDoc) {
            return res.status(404).json({
                status: "fail",
                message: "Room not found",
            });
        }

        const room = { ...roomDoc };

        // need to make api call to auth_service to get participants full details
        /*
        [
          {
            id:
            username:
            profilePic:
          }
        ]
        */
        if (room.participants && room.participants.length > 0) {
            try {
                const participantsDetails = await axios.post('http://auth_service:3000/users/batch', {
                    userIds: room.participants
                });
                room.participants = participantsDetails.data.data;
            } catch (error) {
                console.error("Error fetching participants details:", error);
                // if any fail to fetch the details
                room.participants = [];
            }
        }

        return res.status(200).json({
            status: "success",
            message: "Room fetched successfully",
            data: {
                room,
                is_owner: room.host_id.toString() === host_id.toString()
            }
        })


    } catch (error) {
        console.error("Error in getRoomById controller --> ", error.message);
        return res.status(500).json({
            status: "error",
            message: "Internal server error",
        });
    }
}