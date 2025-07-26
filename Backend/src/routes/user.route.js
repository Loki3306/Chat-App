// routes/user.route.js
import express from 'express';
import { getAllUsers } from '../controllers/user.controller.js'; // This path must be correct relative to this file

const router = express.Router();

// This defines the GET /users endpoint within this router
// When mounted under /api/users in index.js, it becomes /api/users
router.get("/", getAllUsers); // Changed to "/" because it will be mounted at "/api/users"

export default router;