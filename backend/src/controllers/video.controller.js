import { Video } from "../models/video.model.js";

const uploadVideo = async (req, res) =>{
    try {
        const file = req.file;

        if(!file){
            return res.status(400).json({
                success: false,
                message: "No video file uploaded",
            });
        }
        const {title, description } = req.body;

        const video = await Video.create({
            title: title,
            videoFile: file.path,
            description: description,
            owner: req.user._id,
            status: "processing",
        });

        setTimeout(async () => {
            await Video.findByIdAndUpdate(video._id, {
                status: "safe",
            });
        }, 5000);

        return res.status(201).json({
            success: true,
            message: "video uploaded successfully",
            video
        });
        

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Upload failed"
        });
    }
};

const getAllVideos = async (req, res) => {
    try{
        const videos = await Video.find({ owner: req.user._id });

        return  res.status(200).json({
            success: true,
            videos
        });
    }catch (error){
        return res.status(500).json({
            message: "Failed to fetch videos"
        });
    }
};

const getVideoById = async (req, res) => {
    try {
        const { id } = req.params;

        const video = await Video.findById(id);

        if(!video) {
            return res.status(404).json({
                message: "Video not found"
            });
        }

        return res.status(404).json({
            success: true,
            video,
        });
    } catch (error) {
        return res.status(500).json({
            message: "problem on fetching video"
        });
    }
};


const deleteVideo = async (req, res) => {
    try {
        const { id } = req.params;

        const video = await Video.findById(id);

        if(!video){
            return res.status(404).json({
                message: "Video not found"
            });
        }

        if(video.owner.toString() !== req.user._id.toString()){
            return res.status(403).json({
                message: "Unauthorized"
            });
        }

        await Video.findByIdAndDelete(id);

        return res.status(200).json({
            success: true,
            message: "your Video is deleted"
        });
    } catch (error) {
        return res.status(500).json({
            message: "Delete failed"
        });
    }
};

export { uploadVideo , getAllVideos, getVideoById, deleteVideo}