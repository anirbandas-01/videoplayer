import mongoose, { Schema } from "mongoose";

const videoSchema = new Schema({
    
    videoFile: {
        type: String,
        required: true,
    },
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ["processing", "safe", "flagged"],
        default: "processing",
    },
    owner: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    organizationId: {
        type: String,
        required: true,
        index: true
    },
    duration: {
        type: Number,
        default: 0
    },
    fileSize: {
        type: Number,
        default: 0
    },
    mimeType: {
        type: String,
        default: "video/mp4"
    },
    processingProgress: {
        type: Number,
        default: 0
    },
    flagReason: {
        type: String,
        default: null
    }
}, { timestamps: true });

videoSchema.index({ organizationId:1, status: 1});
videoSchema.index({ owner:1, organizationId:1});

export const Video = mongoose.model("Video", videoSchema)