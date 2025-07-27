// backend/routes/message.route.js

import express from 'express';
import { protectRoute } from '../middleware/auth.protectRoute.js';
import {
    getUsersForSiderbar,
    getMessages,
    sendMessage,
    // NEW: Import new controller functions for single message actions
    deleteSingleMessage, // Add this import
    editSingleMessage    // Add this import
} from '../controllers/message.controller.js'; // Ensure these are correctly exported from your controller
import multer from 'multer';

const router = express.Router();

// --- MULTER CONFIGURATION ---
const upload = multer({ storage: multer.memoryStorage() });
// --------------------------

router.get("/users", protectRoute, getUsersForSiderbar);
router.get("/:id", protectRoute, getMessages);

// Apply multer middleware for file uploads with sendMessage
router.post("/send/:id", protectRoute, upload.single('file'), sendMessage);

// --- NEW ROUTES FOR INDIVIDUAL MESSAGE ACTIONS ---
// Route to delete a single message by its ID
// The ':id' in the path here will be the _id of the message to be deleted
router.delete("/single/:id", protectRoute, deleteSingleMessage);

// Route to edit a single message by its ID
// The ':id' in the path here will be the _id of the message to be edited
router.put("/single/:id", protectRoute, editSingleMessage);
// --- END NEW ROUTES ---

export default router;