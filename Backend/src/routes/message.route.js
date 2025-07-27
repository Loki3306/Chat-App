// backend/routes/message.route.js

import express from 'express';
import { protectRoute } from '../middleware/auth.protectRoute.js';
import { getUsersForSiderbar } from '../controllers/message.controller.js';
import { getMessages } from '../controllers/message.controller.js';
import { sendMessage } from '../controllers/message.controller.js';
import multer from 'multer'; // <--- YOU NEED TO IMPORT MULTER HERE!

const router = express.Router();

// --- MULTER CONFIGURATION ---
// This tells multer where to temporarily store the file.
// memoryStorage is good for direct streaming to cloud services like Cloudinary.
const upload = multer({ storage: multer.memoryStorage() }); // <--- YOU NEED TO DEFINE 'upload' HERE!
// --------------------------

router.get("/users", protectRoute, getUsersForSiderbar);
router.get("/:id", protectRoute, getMessages);

// Apply multer middleware 'upload.single('file')' before the sendMessage controller.
// The string 'file' here must match the name you use in your frontend's FormData.append('file', yourActualFile).
router.post("/send/:id", protectRoute, upload.single('file'), sendMessage); // <--- APPLY MULTER MIDDLEWARE HERE!

export default router;