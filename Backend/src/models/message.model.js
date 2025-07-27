// backend/models/message.model.js (CORRECTED)

import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
    senderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    receiverId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    // --- CRITICAL ADDITION: conversationId ---
    conversationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Conversation", // This links to the Conversation model
        required: true,      // Every message must belong to a conversation
    },
    // --- END CRITICAL ADDITION ---
    text: {
        type: String,
        // Default to null if not present, especially if only a file is sent
        default: null,
    },
    image: { // For image-specific URL (if applicable, or can be null)
        type: String,
        default: null,
    },
    fileUrl: { // For general file URL (video, document, etc.)
        type: String,
        default: null,
    },
    fileName: { // To store the original name of the uploaded file
        type: String,
        default: null,
    },
    fileType: { // NEW (Optional but Recommended): To store the MIME type of the file
        type: String,
        default: null,
    }
},
    { timestamps: true } // timestamps will add createdAt and updatedAt automatically
);

const Message = mongoose.model("Message", messageSchema);

export default Message;