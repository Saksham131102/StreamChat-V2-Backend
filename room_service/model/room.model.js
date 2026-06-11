import mongoose from "mongoose";

const roomSchema = new mongoose.Schema(
    {
        room_name: {
            type: String,
            required: [true, "Room name is required"],
            trim: true,
        },
        is_private: {
            type: Boolean,
            default: false,
        },
        host_id: {
            type: String,
            required: [true, "Host ID is required"]
        },
        participants: [
            {
                type: String,
            }
        ],
        media_id: {
            type: String,
        },
        // join_code: {
        //     type: String,
        //     // will be automatically generated in backend
        // },
        password: {
            type: String,
            // user will provide password if creating a private room
        }
    },
    {
        timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
        toJSON: { virtuals: true },
        toObject: { virtuals: true }
    }
)

const Room = mongoose.model("Room", roomSchema)

export default Room;