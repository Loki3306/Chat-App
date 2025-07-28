// backend/controllers/message.controller.js



import Conversation from "../models/conversation.model.js";

import Message from "../models/message.model.js";

import { io, userSocketMap } from '../lib/socket.js';

import cloudinary from '../lib/cloudinary.js';



// Helper function to find the latest message in a conversation and format its content

async function getLatestMessageDetails(conversationId) {

    const latestMessage = await Message.findOne({ conversationId: conversationId })

                                        .sort({ createdAt: -1 }) // Sort by latest message first

                                        .lean(); // Get a plain JavaScript object



    if (latestMessage) {

        let lastMessageContent = latestMessage.text;

        if (!lastMessageContent) {

            if (latestMessage.image) {

                lastMessageContent = "Image";

            } else if (latestMessage.fileUrl) {

                lastMessageContent = `File: ${latestMessage.fileName || 'file'}`;

            }

        }

        return {

            content: lastMessageContent,

            senderId: latestMessage.senderId

        };

    }

    return { content: null, senderId: null };

}



export const getUsersForSiderbar = async (req, res) => {

    try {

        const loggedInUserId = req.user._id;

        // Populate 'lastMessage' field to get access to message content and senderId directly

        const allConversations = await Conversation.find({ participants: loggedInUserId })

            .populate({ path: 'participants', select: '-password' })

            .populate({ path: 'lastMessage', model: 'Message' }); // Populate lastMessage with the actual message document



        const usersForSidebar = [];

        for (const conversation of allConversations) {

            for (const participant of conversation.participants) {

                if (participant._id.toString() !== loggedInUserId.toString()) {

                    // Get formatted last message content and sender for display

                    const lastMessageText = conversation.lastMessage

                        ? conversation.lastMessage.text ||

                          (conversation.lastMessage.image ? "Image" : (conversation.lastMessage.fileUrl ? `File: ${conversation.lastMessage.fileName}` : ""))

                        : null;

                    const lastMessageSender = conversation.lastMessage ? conversation.lastMessage.senderId : null;



                    usersForSidebar.push({

                        ...participant._doc,

                        conversationId: conversation._id, // Add conversation ID to the user object

                        lastMessage: lastMessageText,

                        lastMessageSender: lastMessageSender

                    });

                }

            }

        }



        const uniqueUsers = Array.from(new Map(usersForSidebar.map(user => [user._id.toString(), user])).values());

        const onlineUsers = Object.keys(userSocketMap);

        const usersWithOnlineStatus = uniqueUsers.map(user => ({

            ...user,

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

            // Store string summary and sender for lastMessage in conversation model

            conversation.lastMessage = newMessage.text || (newMessage.image ? "Image" : (newMessage.fileUrl ? `File: ${fileName}` : ""));

            conversation.lastMessageSender = newMessage.senderId;

        }



        await Promise.all([conversation.save(), newMessage.save()]);

        console.log(`[SEND MESSAGE] Message saved: ${newMessage._id}`);



        const receiverSocketIds = userSocketMap[receiverId];

        const senderSocketIds = userSocketMap[senderId];

        const originatingSocketId = req.headers['x-socket-id']; // Assuming you pass this header from frontend



        // Emit to receiver's sockets

        if (receiverSocketIds && receiverSocketIds.length > 0) {

            console.log(`[SEND MESSAGE] Emitting newMessage to receiver ${receiverId} sockets:`, receiverSocketIds);

            receiverSocketIds.forEach(socketId => {

                io.to(socketId).emit("newMessage", newMessage);

            });

        }

        // Emit to other sender's sockets (if logged in on multiple devices)

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



// --- Controller for Deleting a Single Message ---

export const deleteSingleMessage = async (req, res) => {

    try {

        const { id: messageId } = req.params;

        const userId = req.user._id;



        console.log(`[BACKEND DELETE SINGLE] Attempting to delete message ${messageId} by user ${userId}`);



        const message = await Message.findById(messageId);



        if (!message) {

            console.log(`[BACKEND DELETE SINGLE] Message ${messageId} not found.`);

            return res.status(404).json({ message: "Message not found." });

        }



        if (message.senderId.toString() !== userId.toString()) {

            console.warn(`[BACKEND DELETE SINGLE] User ${userId} tried to delete message ${messageId} which belongs to ${message.senderId}. Access denied.`);

            return res.status(403).json({ message: "You are not authorized to delete this message." });

        }



        const conversation = await Conversation.findById(message.conversationId);

        if (!conversation) {

            console.warn(`[BACKEND DELETE SINGLE] Conversation for message ${messageId} not found, but proceeding with message deletion.`);

        }



        await Message.deleteOne({ _id: messageId });

        console.log(`[BACKEND DELETE SINGLE] Successfully deleted message ${messageId} from DB.`);



        if (conversation) {

            // Remove the message ID from the conversation's messages array

            conversation.messages = conversation.messages.filter(msgId => msgId.toString() !== messageId.toString());



            // Re-evaluate lastMessage and lastMessageSender for the conversation

            const { content: newLastMessageContent, senderId: newLastMessageSender } = await getLatestMessageDetails(conversation._id);



            conversation.lastMessage = newLastMessageContent;

            conversation.lastMessageSender = newLastMessageSender;

           

            await conversation.save();

            console.log(`[BACKEND DELETE SINGLE] Updated conversation ${conversation._id}: message ${messageId} removed, lastMessage re-evaluated.`);

        }



        const participants = conversation ? conversation.participants : [message.senderId, message.receiverId];

        for (const participantId of participants) {

            const socketsOfParticipant = userSocketMap[participantId.toString()]; // Get all socket IDs for this participant

            if (socketsOfParticipant && socketsOfParticipant.length > 0) {

                console.log(`[BACKEND DELETE SINGLE] Emitting 'messageDeleted' to participant ${participantId} sockets.`);

                socketsOfParticipant.forEach(socketId => { // Iterate over each socket ID

                    io.to(socketId).emit('messageDeleted', messageId); // Send only the ID of the deleted message

                });

            }

        }



        res.status(200).json({ message: "Message deleted successfully.", deletedMessageId: messageId, conversationId: message.conversationId });



    } catch (error) {

        console.error("Error in deleteSingleMessage controller:", error.message);

        res.status(500).json({ error: "Internal server error" });

    }

};



// --- Controller for Editing a Single Message ---

export const editSingleMessage = async (req, res) => {

    try {

        const { id: messageId } = req.params;

        const { text: newText } = req.body;

        const userId = req.user._id;



        console.log(`[BACKEND EDIT SINGLE] Attempting to edit message ${messageId} by user ${userId} with new text: "${newText}"`);



        const message = await Message.findById(messageId);

        if (!message) {

            console.log(`[BACKEND EDIT SINGLE] Message ${messageId} not found.`);

            return res.status(404).json({ message: "Message not found." });

        }



        if ((!newText || newText.trim() === "") && (!message.image && !message.fileUrl)) {

            return res.status(400).json({ message: "Message text cannot be empty if it has no attachments." });

        }

       

        if (message.senderId.toString() !== userId.toString()) {

            console.warn(`[BACKEND EDIT SINGLE] User ${userId} tried to edit message ${messageId} which belongs to ${message.senderId}. Access denied.`);

            return res.status(403).json({ message: "You are not authorized to edit this message." });

        }



        // Update the message text and set 'edited' flag

        message.text = newText.trim();

        message.edited = true; // Ensure 'edited' field exists in your Message model

        await message.save();

        console.log(`[BACKEND EDIT SINGLE] Successfully edited message ${messageId}.`);



        // Find the conversation the message belongs to

        const conversation = await Conversation.findById(message.conversationId);

        if (conversation) {

            // Re-evaluate the last message content and sender for the conversation

            const { content: newLastMessageContent, senderId: newLastMessageSender } = await getLatestMessageDetails(conversation._id);



            conversation.lastMessage = newLastMessageContent;

            conversation.lastMessageSender = newLastMessageSender;

           

            await conversation.save();

            console.log(`[BACKEND EDIT SINGLE] Updated conversation ${conversation._id}: lastMessage re-evaluated. New last message: "${newLastMessageContent}"`);

        }



        // Real-time update: Emit the updated message document to all participants

        const participants = conversation ? conversation.participants : [message.senderId, message.receiverId];

        for (const participantId of participants) {

            const socketsOfParticipant = userSocketMap[participantId.toString()]; // Get all socket IDs for this participant

            if (socketsOfParticipant && socketsOfParticipant.length > 0) {

                console.log(`[BACKEND EDIT SINGLE] Emitting 'messageEdited' to participant ${participantId} sockets.`);

                socketsOfParticipant.forEach(socketId => { // Iterate over each socket ID

                    io.to(socketId).emit('messageEdited', message); // Emit the full updated message document to each socket

                });

            }

        }



        res.status(200).json(message); // Send back the updated message document, now with a 200 OK status



    } catch (error) {

        console.error("Error in editSingleMessage controller:", error.message);

        res.status(500).json({ error: "Internal server error" });

    }

};