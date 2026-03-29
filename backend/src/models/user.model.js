import mongoose,{mongo, Schema} from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";


dotenv.config({path: "./.env" });

const userSchema = new Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
            index: true
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true
        },
        password: {
            type: String,
            required: true,
        }
    }, {timestamps: true}
);

userSchema.methods.isPasswordCorrect = async function (password){
    return await bcrypt.compare(password, this.password);
};

export const User = mongoose.model("User", userSchema)