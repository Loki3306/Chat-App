// backend/models/conversation.model.js
import mongoose from 'mongoose';

const conversationSchema = new mongoose.Schema(
    {
        participants: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User", // Reference to your User model
                required: true,
            },
        ],
        messages: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Message", // Reference to your Message model
                default: [], // An array of message IDs belonging to this conversation
            },
        ],
        lastMessage: { // To show snippet in sidebar
            type: String,
            default: null,
        },
        lastMessageSender: { // To show who sent the last message
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null,
        },
    },
    { timestamps: true } // Adds createdAt and updatedAt timestamps
);

const Conversation = mongoose.model("Conversation", conversationSchema);

export default Conversation;