import { User } from "../models/user.model.js";
import { Video } from "../models/video.model.js";


const getAllUsers = async (req, res) => {
    try {
        
        const users = await User.find({ 
            organizationId: req.user.organizationId 
        }).select("-password");

        return res.status(200).json({
            success: true,
            count: users.length,
            users
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch users"
        });
    }
};


const updateUserRole = async (req, res) => {
    try {
        const { userId } = req.params;
        const { role } = req.body;

        
        const validRoles = ["viewer", "editor", "admin"];
        if (!validRoles.includes(role)) {
            return res.status(400).json({
                success: false,
                message: "Invalid role. Must be viewer, editor, or admin"
            });
        }

        
        const user = await User.findById(userId).select("-password");

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        
        if (user.organizationId !== req.user.organizationId) {
            return res.status(403).json({
                success: false,
                message: "Cannot modify users from different organization"
            });
        }

        
        user.role = role;
        await user.save();

        return res.status(200).json({
            success: true,
            message: "User role updated successfully",
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Failed to update user role"
        });
    }
};


const deleteUser = async (req, res) => {
    try {
        const { userId } = req.params;

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        
        if (user.organizationId !== req.user.organizationId) {
            return res.status(403).json({
                success: false,
                message: "Cannot delete users from different organization"
            });
        }

        
        if (user._id.toString() === req.user._id.toString()) {
            return res.status(400).json({
                success: false,
                message: "Cannot delete your own account"
            });
        }

        
        await Video.deleteMany({ owner: userId });

        
        await User.findByIdAndDelete(userId);

        return res.status(200).json({
            success: true,
            message: "User and their videos deleted successfully"
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Failed to delete user"
        });
    }
};


const getAllOrganizationVideos = async (req, res) => {
    try {
        // Admin can see all videos in their organization
        const videos = await Video.find({ 
            organizationId: req.user.organizationId 
        }).populate("owner", "name email role");

        return res.status(200).json({
            success: true,
            count: videos.length,
            videos
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch videos"
        });
    }
};

const getSystemStats = async (req, res) => {
    try {
        const organizationId = req.user.organizationId;

        
        const totalUsers = await User.countDocuments({ organizationId });
        const adminCount = await User.countDocuments({ organizationId, role: "admin" });
        const editorCount = await User.countDocuments({ organizationId, role: "editor" });
        const viewerCount = await User.countDocuments({ organizationId, role: "viewer" });

        
        const totalVideos = await Video.countDocuments({ organizationId });
        const processingVideos = await Video.countDocuments({ organizationId, status: "processing" });
        const safeVideos = await Video.countDocuments({ organizationId, status: "safe" });
        const flaggedVideos = await Video.countDocuments({ organizationId, status: "flagged" });

        return res.status(200).json({
            success: true,
            stats: {
                users: {
                    total: totalUsers,
                    admin: adminCount,
                    editor: editorCount,
                    viewer: viewerCount
                },
                videos: {
                    total: totalVideos,
                    processing: processingVideos,
                    safe: safeVideos,
                    flagged: flaggedVideos
                }
            }
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch system statistics"
        });
    }
};

export {
    getAllUsers,
    updateUserRole,
    deleteUser,
    getAllOrganizationVideos,
    getSystemStats
};