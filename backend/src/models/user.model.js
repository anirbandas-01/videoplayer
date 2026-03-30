import mongoose,{ Schema} from "mongoose";
import bcrypt from "bcryptjs";




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
        },
        role: {
            type: String,
            enum: ["viewer", "editor", "admin"],
            default: "viewer",
            required: true
        },
        organizationId: {
            type: String,
            required: true,
            index: true
        }
    }, {timestamps: true}
);

userSchema.methods.isPasswordCorrect = async function (password){
    return await bcrypt.compare(password, this.password);
};

export const User = mongoose.model("User", userSchema)