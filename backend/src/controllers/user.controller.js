import { User } from "../models/user.model.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";


const registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        
        if( !name || !email || !password) {
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

        const hashedPassword = await bcrypt.hash(password, 12 );
           
        const user =await  User.create({
            name: name,
            email: email,
            password: hashedPassword
           });
           

           const token = jwt.sign(
            {id: user._id },
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
                email: user.email
            },
           });
    } catch (error) {
        console.error(500).json({
            success: false,
            message: "server error"
        });
    }
};

export  { registerUser };