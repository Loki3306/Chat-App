// backend/lib/socket.js

import express from 'express';
import http from 'http';
import { Server } from 'socket.io';

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: ["http://localhost:5173"], // Your frontend URL
        methods: ["GET", "POST"],
        credentials: true,
    },
});

// MODIFIED: userSocketMap to store an array of socket IDs for each userId
// Example: { 'userId1': ['socketId1', 'socketId2'], 'userId2': ['socketId3'] }
const userSocketMap = {}; // userId -> [socketId1, socketId2, ...]

io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    const userId = socket.handshake.query.userId;
    console.log('Socket.IO Connection: userId received in query:', userId);
    console.log('Type of userId:', typeof userId);

    if (userId && userId !== "undefined" && userId.trim() !== "") {
        if (!userSocketMap[userId]) {
            userSocketMap[userId] = []; // Initialize array if user connects for the first time
        }
        userSocketMap[userId].push(socket.id); // Add the new socket ID to the user's array
        console.log(`Mapped user ${userId} to socket ${socket.id}. Total sockets for user: ${userSocketMap[userId].length}`);
    } else {
        console.warn(`Socket.IO Connection: Invalid userId '${userId}' (type: ${typeof userId}) received for socket ${socket.id}. User not mapped.`);
    }

    // Get the list of truly online users (those with at least one active socket)
    const onlineUsers = Object.keys(userSocketMap).filter(id => userSocketMap[id].length > 0);
    console.log("Current online users IDs (mapped from userSocketMap):", onlineUsers);

    // Emit 'getOnlineUsers' event to all connected clients
    io.emit("getOnlineUsers", onlineUsers); // Emit the filtered list

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
        
        let disconnectedUserId = null;
        // Find the user ID associated with this disconnected socket ID
        for (const userIdInMap in userSocketMap) {
            const index = userSocketMap[userIdInMap].indexOf(socket.id);
            if (index > -1) {
                // Remove the disconnected socket ID from the array
                userSocketMap[userIdInMap].splice(index, 1);
                disconnectedUserId = userIdInMap;
                break; // Found and removed, exit loop
            }
        }

        if (disconnectedUserId) {
            if (userSocketMap[disconnectedUserId].length === 0) {
                // If the user has no more active sockets, remove them from the map
                delete userSocketMap[disconnectedUserId];
                console.log(`User ${disconnectedUserId} is now fully offline.`);
            } else {
                console.log(`User ${disconnectedUserId} still has ${userSocketMap[disconnectedUserId].length} active sockets.`);
            }
        }

        // Emit updated online users list after handling disconnect
        const updatedOnlineUsers = Object.keys(userSocketMap).filter(id => userSocketMap[id].length > 0);
        console.log("Current online users IDs after disconnect (mapped from userSocketMap):", updatedOnlineUsers);
        io.emit("getOnlineUsers", updatedOnlineUsers);
    });
});

// Export app, server, io, and userSocketMap for use in other files
export { app, server, io, userSocketMap };