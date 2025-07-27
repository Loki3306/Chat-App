// backend/controllers/message.controller.js

import User from "../models/user.model.js";
import Message from "../models/message.model.js";
import { v2 as cloudinary } from 'cloudinary';
// IMPORT io and userSocketMap from your new socket.js file
import { io, userSocketMap } from '../lib/socket.js'; // <--- IMPORTANT: Adjust path if needed

// CLOUDINARY CONFIGURATION (REQUIRED)
// Ensure your .env variables are loaded (dotenv.env() in index.js)
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const getUsersForSiderbar = async (req, res) => {
    try {
        const loggedInUserId = req.user._id;
        const filteredUsers = await User.find({ _id: { $ne: loggedInUserId } }).select("-password");
        res.status(200).json(filteredUsers);
    } catch (error) {
        console.error("Error fetching users for sidebar:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

export const getMessages = async (req, res) => {
    try {
        const { id: userToChatId } = req.params;
        const myId = req.user._id;

        const messages = await Message.find({
            $or: [
                { senderId: myId, receiverId: userToChatId },
                { senderId: userToChatId, receiverId: myId }
            ]
        }).sort({ createdAt: 1 });

        res.status(200).json(messages);

    } catch (error) {
        console.error("Error in getMessages controller: ", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

export const sendMessage = async (req, res) => {
    try {
        const { text } = req.body;
        const { id: receiverId } = req.params;
        const senderId = req.user._id;

        let imageUrl = null;
        let fileUrl = null;
        let fileName = null;

        if (req.file) {
            try {
                const uploadResult = await cloudinary.uploader.upload(`data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`, {
                    folder: 'chat_attachments',
                    resource_type: 'auto'
                });

                fileUrl = uploadResult.secure_url;
                fileName = req.file.originalname;

                if (req.file.mimetype.startsWith('image/')) {
                    imageUrl = uploadResult.secure_url;
                }
            } catch (uploadError) {
                console.error("Cloudinary upload error:", uploadError);
                fileUrl = null;
                imageUrl = null;
                fileName = null;
            }
        }

        const newMessage = new Message({
            senderId,
            receiverId,
            text: text || '',
            image: imageUrl,
            fileUrl: fileUrl,
            fileName: fileName,
        });

        await newMessage.save(); // Save the message to the database

        // --- Socket.IO Real-time Emission (NEW) ---
        const receiverSocketId = userSocketMap[receiverId]; // Get receiver's socket ID
        const senderSocketId = userSocketMap[senderId];     // Get sender's socket ID (for multi-device sync)

        // Emit message to the receiver if they are online
        if (receiverSocketId) {
            io.to(receiverSocketId).emit("newMessage", newMessage);
            console.log(`Emitted newMessage to receiver ${receiverId} (Socket ID: ${receiverSocketId})`);
        } else {
            console.log(`Receiver ${receiverId} is offline. Message saved to DB.`);
        }

        // Emit message back to the sender's other devices (if any)
        // Make sure not to send back to the same socket that initiated the request
        // req.socket.id is the ID of the socket that made the HTTP request (if using Express with Socket.IO)
        // However, req.socket.id is not directly available on Express req object in this context.
        // A common pattern is to just emit to all sockets associated with the senderId,
        // and the client-side will handle if it's a duplicate of what they just sent.
        // Or, more robustly, pass the sender's current socket ID from frontend to backend.
        // For simplicity, let's just emit to the sender's mapped socket if it exists.
        // Note: The `req.socket.id` in Express controller context is the underlying TCP socket ID,
        // not the Socket.IO client ID. We rely on `userSocketMap` for Socket.IO IDs.
        if (senderSocketId && String(senderSocketId) !== String(req.headers['x-socket-id'])) { // Assuming frontend sends its socket ID in a header
             io.to(senderSocketId).emit("newMessage", newMessage);
             console.log(`Emitted newMessage to sender's other device ${senderId} (Socket ID: ${senderSocketId})`);
        }


        res.status(201).json(newMessage); // Send the saved message back to the frontend (HTTP response)

    } catch (error) {
        console.error("Error in sendMessage controller:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};