import {generateToken}  from "../lib/utils.js";
import User from "../models/user.model.js";
import bcrypt from 'bcryptjs';
import cloudinary from '../lib/cloudinary.js';

export const signup= async (req, res) => {
   const {fullName, email, password} = req.body;
   
    try {
        if(!fullName || !email || !password){
            return res.status(400).json({message: "All fields are required"});
        }    

        if(password.length< 8){
            return res.status(400).json({message: "Password must be at least 8 characters long"});
        }     

        const user= await User.findOne({email});
        if(user){
            return res.status(400).json({message: "User already exists"});
        }

        const salt=await bcrypt.genSalt(10);
        const hashedPassword=await bcrypt.hash(password, salt);

        const newUser=new User({
            fullName: fullName,
            email: email,
            password: hashedPassword
        });

        if(newUser){
            generateToken(newUser._id, res);
            await newUser.save();

            res.status(201).json({
                message: "User created successfully",
                user: {
                    _id: newUser._id,
                    fullName: newUser.fullName,
                    email: newUser.email
                }
            });    
        }else{
            return res.status(400).json({message: "Invalid User Data"});
        }
        

    } catch (error) {
        console.error("Error in signup:", error);
        res.status(500).json({message: "Internal Server Error"});
    }
}

export const login=async (req, res) => {
    const {email,password} =req.body
    
    try {
        const user= await User.findOne({email});
        if(!user){
            return res.status(400).json({message: "Invalid Credientials"});
        }

        const isPasswordValid= await bcrypt.compare(password, user.password);
        if(!isPasswordValid){
            return res.status(400).json({message: "Invalid Credientials"});
        }
 
        generateToken(user._id, res);

        res.status(200).json({
            message: "Login successful",
            user: {
                _id: user._id,
                fullName: user.fullName,
                email: user.email,
                profilePicture: user.profilePicture
            }
        });

    } catch (error) {
        console.error("Error in login:", error);
        res.status(500).json({message: "Internal Server Error"});
    }
}

export const logout=(req, res) => {
    try {
        res.cookie( "jwt", "", {maxAge: 0} )
        res.status(200).json({message: "Logout successful"});
    } catch (error) {
        console.error("Error in logout:", error);
        res.status(500).json({message: "Internal Server Error"});
    }
}

export const updateProfile = async (req, res) => {
    try {
        const {profilePicture} = req.body;
        const userId = req.user._id;
        if (!profilePicture) {
            return res.status(400).json({ message: "Profile picture is required" });
        }

        const uploadResponse= await cloudinary.uploader.upload(profilePicture);
        const updateUser= await User.findByIdAndUpdate(
            userId,
            { profilePicture: uploadResponse.secure_url },
            { new: true }
        );

        res.status(200).json({
            message: "Profile updated successfully",
            user: {
                _id: updateUser._id,
                fullName: updateUser.fullName,
                email: updateUser.email,
                profilePicture: updateUser.profilePicture
            }
        });

    } catch (error) {
        console.error("Error in updateProfile:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

export const checkAuth = (req, res) => {
    try {
        res.status(200).json({ message: "User is authenticated", user: req.user });
    } catch (error) {
        console.error("Error in checkAuth:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
} 
