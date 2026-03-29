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
        enum: ["processing", "safe", "flag"],
        default: "processing",
    },
    owner: {
        type: Schema.Types.ObjectId,
        ref: "User",
    },
}, { timestamps: true });

export const Video = mongoose.model("Video", videoSchema)