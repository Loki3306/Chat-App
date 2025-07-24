import express from 'express';
import { protectRoute } from '../middleware/auth.protectRoute.js';
import { getUsersForSiderbar } from '../controllers/message.controller.js';
import { getMessages } from '../controllers/message.controller.js';
import { sendMessage } from '../controllers/message.controller.js';

const router = express.Router();

router.get("/users", protectRoute, getUsersForSiderbar);
router.get("/:id", protectRoute, getMessages);

router.post("/send", protectRoute, sendMessage);

export default router;
