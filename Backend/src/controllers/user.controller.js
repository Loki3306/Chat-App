// controllers/user.controller.js
import User from '../models/user.model.js';
// Assuming you have an auth middleware, e.g., 'protectRoute'
// import { protectRoute } from '../middleware/protectRoute.js'; // Example import if you have it

export const getAllUsers = async (req, res) => {
    try {
        // Option 1: Fetch ALL users (for testing, or if you want to allow chatting with self)
        // const users = await User.find({}).select("-password");

        // Option 2: Fetch users EXCLUDING the currently logged-in user
        // IMPORTANT: For this option, you MUST ensure that the route is protected
        // by an authentication middleware (e.g., `protectRoute`) that populates `req.user`.
        if (!req.user) {
            // This case should ideally not be hit if middleware is correctly applied
            // If you hit this, it means your route is not protected or auth failed.
            return res.status(401).json({ message: "Unauthorized: User not authenticated." });
        }
        const loggedInUserId = req.user._id;
        const users = await User.find({ _id: { $ne: loggedInUserId } }).select("-password");

        res.status(200).json(users);

    } catch (error) {
        console.error("Error in getAllUsers controller:", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
};
