import fs from "fs";
import path from "path";
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
        
        if(!title || !description ){
            fs.unlinkSync(file.path);
            return res.status(400).json({
                success: false,
                message: "Title and description are required"
            });
        }

        const stats = fs.statSync(file.path);
        const fileSize = stats.size;


        const video = await Video.create({
            title: title,
            videoFile: file.path,
            description: description,
            owner: req.user._id,
            organizationId: req.user.organizationId,
            status: "processing",
            fileSize: fileSize,
            mimeType: file.mimetype,
            processingProgress: 0
        });

        const io = req.app.get("io");

        let progress = 0;

        const interval = setInterval(async () => {
            progress += 20;
            
            await Video.findByIdAndUpdate(video._id, {
                processingProgress: progress
            });

            /* if (io) {
              io.emit("videoProgress", {
                videoId: video._id,
                progress,
                userId: req.user.organizationId
              });
            }  */
            if (io) {
                io.to(`user_${req.user._id}`).emit("videoProgress", {
                    videoId: video._id,
                    progress,
                });
            }


            if (progress >= 100){
                clearInterval(interval);

                const isFlagged = Math.random() < 0.2;
                const finalStatus = isFlagged ? "flagged" : "safe";
                const flagReason = isFlagged ? "Potentially sensitive content detected" : null;

                await Video.findByIdAndUpdate(video._id, {
                    status: finalStatus,
                    processingProgress: 100,
                    flagReason: flagReason
                });
                
                /* if (io) {
                  io.emit("videoCompleted", {
                    videoId: video._id,
                    status: finalStatus,
                    userId: req.user._id.toString(),
                    organizationId: req.user.organizationId
                  });
                }  */
                if (io) {
                    io.to(`user_${req.user._id}`).emit("videoCompleted", {
                        videoId: video._id,
                        status: finalStatus
                    });
                }
            }
        }, 1000)

        return res.status(201).json({
            success: true,
            message: "video uploaded & processing started",
            video: {
                id: video._id,
                title: video.title,
                status: video.status,
                organizationId: video.organizationId
            }
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
        const videos = await Video.find({ organizationId: req.user.organizationId }).populate("owner", "name email");

        return  res.status(200).json({
            success: true,
            count: videos.length,
            videos
        });
    }catch (error){
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch videos"
        });
    }
};

const getVideoById = async (req, res) => {
    try {
        const { id } = req.params;

        const video = await Video.findById(id).populate("owner" , "name email");

        if(!video) {
            return res.status(404).json({
                success: false,
                message: "Video not found"
            });
        }

        if(video.organizationId !== req.user.organizationId){
            return res.status(403).json({
                success: false,
                message: "Unauthorized access. Video belongs to different organization. "
            });
        }

        if(req.user.role === "viewer" && video.owner.toString() !== req.user._id.toString()){
            return res.status(403).json({
                success: false,
                message: "Access denied, Viewers can only access their own videos."
            });
        }

        return res.status(200).json({
            success: true,
            video,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
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
                success: false,
                message: "Video not found"
            });
        }

        if(video.organizationId !== req.user.organizationId){
            return res.status(403).json({
                success: false,
                message: "Unauthorized access. Video belongs to different organization. "
            });
        }
        
        const isOwner = video.owner.toString() === req.user._id.toString();
        const isAdmin = req.user.role === "admin";

        if(!isOwner && !isAdmin){
            return res.status(403).json({
                success: false,
                message: "Unauthorized access. only Video owner and admin can delete. "
            });
        }

        if(fs.existsSync(video.videoFile)){
            fs.unlinkSync(video.videoFile);
        }

        await Video.findByIdAndDelete(id);

        return res.status(200).json({
            success: true,
            message: "your Video is deleted"
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Delete failed"
        });
    }
};

const streamVideo = async (req, res) => {
    try {
        const { id } = req.params;

        const video = await Video.findById(id);

        if(!video) {
            return res.status(404).json({
                success: false,
                 message: "video not found"
            });
        }

        if(video.organizationId !== req.user.organizationId){
            return res.status(403).json({
                message: "Unauthorized access, video belongs to different organization"
            });
        }
        
        if(req.user.role === "viewer" && video.owner.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: "Access denied. Viewers can only stream their own videos."
            });
        }

        const videoPath = path.resolve(video.videoFile);
        
        if (!fs.existsSync(videoPath)) {
            return res.status(404).json({
                success: false,
                message: "File not found"
            });
        }

        const stat = fs.statSync(videoPath);
        const filesize = stat.size;

        const range = req.headers.range;

        if(!range){
            return res.status(400).json({
                message: "Range header require"
            });
        }

        const CHUNK_SIZE = 10 ** 6;
        const start = Number(range.replace(/\D/g, ""));
        const end = Math.min(start + CHUNK_SIZE, filesize - 1 );

        const contentLength = end - start + 1;

        const headers = {
            "Content-Range" : `bytes ${start}-${end}/${filesize}`,
            "Accept-Ranges" : "bytes",
            "Content-Length" : contentLength,
            "Content-Type" : "video/mp4"
        };

        res.writeHead(206, headers);

        const stream = fs.createReadStream(videoPath, { start, end });

        stream.pipe(res);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Streaming failed"
        });
    }
};

const getFilteredVideos = async (req, res) => {
    try {
        const { status, sortBy, search } = req.query;

        let filter = { organizationId: req.user.organizationId };

        if(status && ["safe", "flagged", "processing"].includes(status)) {
            filter.status = status;
        }

        if(search){
            filter.title = { $regex: search, $options: "i" };
        }

        let sortOption = {};

        if(sortBy === "newest"){
            sortOption = { createdAt: -1 };
        } else if (sortBy === "oldest") {
            sortOption = { createdAt: 1 };
        }else if (sortBy === "title"){
            sortOption = { title: 1 };
        } else {
            sortOption = { createdAt: -1 };
        }

        const videos = await Video.find(filter)
              .sort(sortOption)
              .populate("owner" , "name email");

        return res.status(200).json({
            success: true,
            count: videos.length,
            videos
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch filtered videos"
        });
    }
};

export { uploadVideo , getAllVideos, getVideoById, deleteVideo, streamVideo, getFilteredVideos}