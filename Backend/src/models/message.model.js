// backend/models/message.model.js

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
    text: {
        type: String,
    },
    image: { // For image-specific URL (if applicable, or can be null)
        type: String,
    },
    fileUrl: { // NEW: For general file URL (video, document, etc.)
        type: String,
    },
    fileName: { // NEW: To store the original name of the uploaded file
        type: String,
    }
},
    { timestamps: true } // timestamps will add createdAt and updatedAt automatically
);

const Message = mongoose.model("Message", messageSchema);

export default Message;