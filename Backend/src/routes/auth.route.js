import express from 'express';
import { login, logout, signup } from '../controllers/auth.controller.js';
import { protectRoute } from '../middleware/auth.protectRoute.js';
import { updateProfile } from '../controllers/auth.controller.js';
import { checkAuth } from '../controllers/auth.controller.js';

const router = express.Router();

router.post("/signup", signup);

router.post("/logout", logout);
 
router.post("/login", login);

router.put("/update-profile", protectRoute , updateProfile);

router.get("/check", protectRoute, checkAuth);

export default router;