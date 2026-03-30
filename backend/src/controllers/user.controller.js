import { User } from "../models/user.model.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";


const registerUser = async (req, res) => {
    try {
        const { name, email, password, organizationId, role } = req.body;

        
        if( !name || !email || !password || !organizationId) {
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            });
        }

        const exitingUser = await User.findOne({ email });
        if(exitingUser) {
            return res.status(400).json({
                success: false,
                message: "User already exits"
            });
        }
        
        const validRoles = ["viewer", "editor", "admin"];
        if (role && !validRoles.includes(role)) {
            return res.status(400).json({
                success: false,
                message: "Invalid role. Must be viewer, editor or admin"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 12 );
           
        const user =await  User.create({
            name: name,
            email: email,
            password: hashedPassword,
            organizationId: organizationId,
            role: role || "viewer"
           });
           

           const token = jwt.sign(
            { 
                id: user._id,
                role: user.role,
                organizationId: user.organizationId
            },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
           );
           
           res.status(200).json({
            success: true,
            message: "user registered successfully",
            token,
            user:{
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                organizationId: user.organizationId
             },
           });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "server error"
        });
    }
};


const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        if(!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password required",
            });
        }

        const user = await User.findOne({ email });

        if(!user){
            return res.status(401).json({
                success: false,
                message: "user not found",
            });
        }

        const isMatch = await user.isPasswordCorrect(password);

        if(!isMatch) {
            return res.status(401).json({
                success: false,
                message: "Invalid credentials"
            });
        }

        const token = jwt.sign(
            { 
                id:user._id,
                role: user.role,
                organizationId: user.organizationId
            },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        return res.status(200).json({
            success: true,
            message: "Login successfully",
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                organizationId: user.organizationId
            },
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Server error",
        });
    }
};

const getCurrentUser = async (req, res) => {
    try {
        return res.status(200).json({
            success: true,
            user: {
                id: req.user._id,
                name: req.user.name,
                email: req.user.email,
                role: req.user.role,
                organizationId: req.user.organizationId
            }
        });
    } catch (error) {
         return res.status(500).json({
            success: false,
            message: "server error"
         });   
    }
};

export  { registerUser, loginUser, getCurrentUser };