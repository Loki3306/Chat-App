// backend/controllers/message.controller.js

import Conversation from "../models/conversation.model.js";
import Message from "../models/message.model.js";
import { io, userSocketMap } from '../lib/socket.js'; // Ensure io and userSocketMap are imported
import cloudinary from '../lib/cloudinary.js'; // Adjust path if your cloudinary.js is in ../utils/cloudinary.js or ../lib/cloudinary.js

// --- Existing Controller Functions ---

export const getUsersForSiderbar = async (req, res) => {
    try {
        const loggedInUserId = req.user._id;
        const allUsers = await Conversation.find({ participants: loggedInUserId })
            .populate({ path: 'participants', select: '-password' });

        const usersForSidebar = [];
        allUsers.forEach(conversation => {
            conversation.participants.forEach(participant => {
                if (participant._id.toString() !== loggedInUserId.toString()) {
                    usersForSidebar.push(participant);
                }
            });
        });

        const uniqueUsers = Array.from(new Map(usersForSidebar.map(user => [user._id.toString(), user])).values());
        const onlineUsers = Object.keys(userSocketMap);
        const usersWithOnlineStatus = uniqueUsers.map(user => ({
            ...user._doc,
            isOnline: onlineUsers.includes(user._id.toString())
        }));

        res.status(200).json(usersWithOnlineStatus);

    } catch (error) {
        console.error("Error in getUsersForSiderbar controller:", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const getMessages = async (req, res) => {
    try {
        const { id: userToChatId } = req.params;
        const senderId = req.user._id;

        const conversation = await Conversation.findOne({
            participants: { $all: [senderId, userToChatId] },
        }).populate("messages");

        if (!conversation) return res.status(200).json([]);

        const messages = conversation.messages;
        res.status(200).json(messages);

    } catch (error) {
        console.error("Error in getMessages controller:", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const sendMessage = async (req, res) => {
    try {
        const { id: receiverId } = req.params;
        const { text } = req.body;
        const senderId = req.user._id;
        const file = req.file;

        console.log(`[SEND MESSAGE] Attempting to send message from ${senderId} to ${receiverId}`);
        console.log(`[SEND MESSAGE] Text: "${text}", File: ${file ? file.originalname : 'None'}`);

        let imageUrl = null;
        let fileUrl = null;
        let fileName = null;
        let fileType = null;

        if (file) {
            const mimeType = file.mimetype;
            fileName = file.originalname;
            fileType = mimeType;

            const uploadOptions = {
                folder: "chat-files",
                resource_type: "auto",
            };
            if (mimeType.startsWith('image/')) {
                uploadOptions.folder = "chat-images";
            }

            const dataUri = `data:${mimeType};base64,${file.buffer.toString('base64')}`;
            const result = await cloudinary.uploader.upload(dataUri, uploadOptions);

            if (mimeType.startsWith('image/')) {
                imageUrl = result.secure_url;
                console.log(`Uploaded image: ${imageUrl}`);
            } else {
                fileUrl = result.secure_url;
                console.log(`Uploaded file: ${fileUrl}`);
            }
        }

        let conversation = await Conversation.findOne({
            participants: { $all: [senderId, receiverId] },
        });

        if (!conversation) {
            conversation = await Conversation.create({
                participants: [senderId, receiverId],
            });
            console.log(`[SEND MESSAGE] Created new conversation: ${conversation._id}`);
        }

        const newMessage = new Message({
            senderId,
            receiverId,
            conversationId: conversation._id,
            text: text,
            image: imageUrl,
            fileUrl: fileUrl,
            fileName: fileName,
            fileType: fileType,
        });

        if (newMessage) {
            conversation.messages.push(newMessage._id);
            conversation.lastMessage = newMessage.text || (newMessage.image ? "Image" : (newMessage.fileUrl ? `File: ${fileName}` : ""));
            conversation.lastMessageSender = newMessage.senderId;
        }

        await Promise.all([conversation.save(), newMessage.save()]);
        console.log(`[SEND MESSAGE] Message saved: ${newMessage._id}`);

        const receiverSocketIds = userSocketMap[receiverId];
        const senderSocketIds = userSocketMap[senderId];
        const originatingSocketId = req.headers['x-socket-id'];

        if (receiverSocketIds && receiverSocketIds.length > 0) {
            console.log(`[SEND MESSAGE] Emitting newMessage to receiver ${receiverId} sockets:`, receiverSocketIds);
            receiverSocketIds.forEach(socketId => {
                io.to(socketId).emit("newMessage", newMessage);
            });
        }
        if (senderSocketIds && senderSocketIds.length > 1) {
            console.log(`[SEND MESSAGE] Emitting newMessage to sender ${senderId} other sockets.`);
            senderSocketIds.filter(id => id !== originatingSocketId)
                           .forEach(socketId => {
                               io.to(socketId).emit("newMessage", newMessage);
                           });
        }

        res.status(201).json(newMessage);

    } catch (error) {
        console.error("Error in sendMessage controller:", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
};

// --- NEW: Controller for Deleting a Single Message (Replaces old deleteMessages) ---
export const deleteSingleMessage = async (req, res) => {
    try {
        const { id: messageId } = req.params; // The ID passed is the message's _id
        const userId = req.user._id; // Authenticated user's ID

        console.log(`[BACKEND DELETE SINGLE] Attempting to delete message ${messageId} by user ${userId}`);

        const message = await Message.findById(messageId);

        if (!message) {
            console.log(`[BACKEND DELETE SINGLE] Message ${messageId} not found.`);
            return res.status(404).json({ message: "Message not found." });
        }

        // Authorization: Only allow the sender of the message to delete it
        if (message.senderId.toString() !== userId.toString()) {
            console.warn(`[BACKEND DELETE SINGLE] User ${userId} tried to delete message ${messageId} which belongs to ${message.senderId}. Access denied.`);
            return res.status(403).json({ message: "You are not authorized to delete this message." });
        }

        // Find the conversation the message belongs to
        const conversation = await Conversation.findById(message.conversationId);
        if (!conversation) {
            console.warn(`[BACKEND DELETE SINGLE] Conversation for message ${messageId} not found, but proceeding with message deletion.`);
            // It's possible the conversation was already deleted by other means,
            // or there was a data inconsistency. Still delete the message.
        }

        // Delete the message from the Message collection
        await Message.deleteOne({ _id: messageId });
        console.log(`[BACKEND DELETE SINGLE] Successfully deleted message ${messageId} from DB.`);

        // Update the Conversation document: remove message ID from its array and update lastMessage
        if (conversation) {
            conversation.messages = conversation.messages.filter(msgId => msgId.toString() !== messageId.toString());

            // Recalculate and update lastMessage for the conversation if needed
            if (conversation.messages.length > 0) {
                // Fetch the new last message to update the conversation's lastMessage field
                const newLastMessageDoc = await Message.findById(conversation.messages[conversation.messages.length - 1]);
                if (newLastMessageDoc) {
                    conversation.lastMessage = newLastMessageDoc.text || (newLastMessageDoc.image ? "Image" : (newLastMessageDoc.fileUrl ? "File" : ""));
                    conversation.lastMessageSender = newLastMessageDoc.senderId;
                } else { // Fallback if last message found is somehow not fully populated (unlikely with .findById)
                    conversation.lastMessage = null;
                    conversation.lastMessageSender = null;
                }
            } else {
                // If no messages left in conversation, clear lastMessage fields
                conversation.lastMessage = null;
                conversation.lastMessageSender = null;
            }
            await conversation.save();
            console.log(`[BACKEND DELETE SINGLE] Updated conversation ${conversation._id}: message ${messageId} removed, lastMessage re-evaluated.`);
        }


        // Real-time update: Emit to all participants in the conversation that a message was deleted
        const participants = conversation ? conversation.participants : [message.senderId, message.receiverId]; // Fallback if conversation not found
        for (const participantId of participants) {
            const socketIds = userSocketMap[participantId.toString()];
            if (socketIds && socketIds.length > 0) {
                console.log(`[BACKEND DELETE SINGLE] Emitting 'messageDeleted' to participant ${participantId} sockets.`);
                socketIds.forEach(socketId => {
                    io.to(socketId).emit('messageDeleted', messageId); // Send only the ID of the deleted message
                });
            }
        }

        res.status(200).json({ message: "Message deleted successfully.", deletedMessageId: messageId });

    } catch (error) {
        console.error("Error in deleteSingleMessage controller:", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
};

// --- NEW: Controller for Editing a Single Message ---
export const editSingleMessage = async (req, res) => {
    try {
        const { id: messageId } = req.params; // The ID is the message's _id
        const { text: newText } = req.body;  // The new text for the message
        const userId = req.user._id;         // Authenticated user's ID

        console.log(`[BACKEND EDIT SINGLE] Attempting to edit message ${messageId} by user ${userId} with new text: "${newText}"`);

        // Validation: Ensure text is not empty unless there's an attachment
        const message = await Message.findById(messageId); // Fetch message first to check attachments
        if (!message) {
            console.log(`[BACKEND EDIT SINGLE] Message ${messageId} not found.`);
            return res.status(404).json({ message: "Message not found." });
        }

        if ((!newText || newText.trim() === "") && (!message.image && !message.fileUrl)) {
            return res.status(400).json({ message: "Message text cannot be empty if it has no attachments." });
        }
        
        // Authorization: Only allow the sender of the message to edit it
        if (message.senderId.toString() !== userId.toString()) {
            console.warn(`[BACKEND EDIT SINGLE] User ${userId} tried to edit message ${messageId} which belongs to ${message.senderId}. Access denied.`);
            return res.status(403).json({ message: "You are not authorized to edit this message." });
        }

        // Update the message text and set 'edited' flag
        message.text = newText.trim();
        message.edited = true; // Set edited flag to true (ensure this field exists in your Message model)
        await message.save();
        console.log(`[BACKEND EDIT SINGLE] Successfully edited message ${messageId}.`);

        // Update lastMessage in conversation if the edited message was the last one
        const conversation = await Conversation.findById(message.conversationId);
        if (conversation) { // Ensure conversation exists
             // Check if the edited message is the current last message in the conversation's 'messages' array
            if (conversation.messages.length > 0 && conversation.messages[conversation.messages.length - 1].toString() === messageId) {
                conversation.lastMessage = message.text; // Update lastMessage content with new text
                await conversation.save();
                console.log(`[BACKEND EDIT SINGLE] Updated lastMessage in conversation ${conversation._id}.`);
            }
        }


        // Real-time update: Emit the updated message document to all participants
        const participants = conversation ? conversation.participants : [message.senderId, message.receiverId];
        for (const participantId of participants) {
            const socketIds = userSocketMap[participantId.toString()];
            if (socketIds && socketIds.length > 0) {
                console.log(`[BACKEND EDIT SINGLE] Emitting 'messageEdited' to participant ${participantId} sockets.`);
                io.to(socketId).emit('messageEdited', message); // Emit the full updated message document
            }
        }

        res.status(200).json(message); // Send back the updated message document

    } catch (error) {
        console.error("Error in editSingleMessage controller:", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
};