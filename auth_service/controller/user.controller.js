import prisma from "../lib/prisma.js";

export const getUserById = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({
                status: "fail",
                message: "User ID is required",
            })
        }

        const user = await prisma.user.findUnique({
            where: {
                id
            },
            select: {
                id: true,
                username: true,
                profilePic: true,
                isAdmin: true,
                lastLogin: true,
            }
        });

        if (!user) {
            return res.status(404).json({
                status: "fail",
                message: "User not found",
            })
        }

        return res.status(200).json({
            status: "success",
            data: user,
        })
    } catch (error) {
        console.error("Error in getUserById controller --> ", error.message);
        res.status(500).json({
            status: "error",
            message: "Internal server error",
        });
    }
}

export const getUserByIds = async (req, res) => {
    try {
        const { userIds } = req.body;

        if (!Array.isArray(userIds)) {
            return res.status(400).json({
                status: "fail",
                message: "userIds must be an array",
            });
        }

        if (!userIds || userIds.length === 0) {
            return res.status(400).json({
                status: "fail",
                message: "User Ids are required"
            });
        }

        const users = await prisma.user.findMany({
            where: {
                id: {
                    in: userIds,
                },
            },
            select: {
                id: true,
                username: true,
                profilePic: true,
            }
        });

        return res.status(200).json({
            status: "success",
            data: users,
        });
    } catch (error) {
        console.error("Error in getUserByIds controller --> ", error.message);
        res.status(500).json({
            status: "error",
            message: "Internal server error",
        });
    }
}