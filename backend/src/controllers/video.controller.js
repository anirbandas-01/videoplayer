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

        const video = await Video.create({
            title: title,
            videoFile: file.path,
            description: description,
            owner: req.user._id,
            status: "processing",
        });

        const io = req.app.get("io");

        let progress = 0;

        const interval = setInterval(async () => {
            progress += 20;

            if (io) {
              io.emit("videoProgress", {
                videoId: video._id,
                progress,
              });
            } 

            if (progress >= 100){
                clearInterval(interval);

                await Video.findByIdAndUpdate(video._id, {
                    status: "safe"
                });
                
                if (io) {
                  io.emit("videoCompleted", {
                    videoId: video._id
                  });
                }  
            }
        }, 1000)

        return res.status(201).json({
            success: true,
            message: "video uploaded & processing started",
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

        if(video.owner.toString() !== req.user._id.toString()){
            return res.status(403).json({
                message: "Unauthorized"
            });
        }

        return res.status(200).json({
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

const streamVideo = async (req, res) => {
    try {
        const { id } = req.params;

        const video = await Video.findById(id);

        if(!video) {
            return res.status(404).json({
                 message: "video not found"
            });
        }

        if(video.owner.toString() !== req.user._id.toString()){
            return res.status(403).json({
                message: "Unauthorized"
            });
        }

        const videoPath = path.resolve(video.videoFile);
        
        if (!fs.existsSync(videoPath)) {
            return res.status(404).json({
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
            message: "Streaming failed"
        });
    }
};

export { uploadVideo , getAllVideos, getVideoById, deleteVideo, streamVideo}