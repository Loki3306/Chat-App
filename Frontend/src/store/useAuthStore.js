// src/store/useAuthStore.js

import { create } from 'zustand';
import { axiosInstance } from '../lib/axios.js';
import { io } from 'socket.io-client'; // Correct import for socket.io-client
import { useChatStore } from './useChatStore.js'; // Import useChatStore to update online users/messages

export const useAuthStore = create((set, get) => ({
    authUser: null,
    isLogingIn: false,
    isLoggingOut: false,
    isSigningUp: false,
    isUpdatingProfile: false,
    isCheckingAuth: true,
    socket: null, // Store the socket instance
    toast: { message: null, type: null },
    clearToast: () => set({ toast: { message: null, type: null } }),
    // NEW: Add a setToast action for external components to trigger toasts
    setToast: (newToast) => set({ toast: newToast }), // newToast should be { message: string, type: 'success' | 'error' | 'info' }

    checkAuth: async () => {
        try {
            const response = await axiosInstance.get('/auth/check');
            set({ authUser: response.data.user });
            // Connect socket only if authUser is valid
            if (response.data.user) {
                get().connectSocket(response.data.user._id); // Pass userId to connectSocket
            }
        } catch (error) {
            console.error("Error checking authentication:", error);
            set({ authUser: null });
        } finally {
            set({ isCheckingAuth: false });
        }
    },

    signup: async (data) => {
        set({ isSigningUp: true });
        try {
            const response = await axiosInstance.post('/auth/signup', data);
            set({ authUser: response.data });
            get().connectSocket(response.data._id); // Pass userId to connectSocket
        } catch (error) {
            console.error("Error signing up:", error);
            const errorMessage = error.response?.data?.message || "Signup failed.";
            get().setToast({ message: errorMessage, type: 'error' }); // Use setToast here
        } finally {
            set({ isSigningUp: false });
        }
    },

    login: async (data) => {
        set({ isLoggingIn: true });
        try {
            const response = await axiosInstance.post('/auth/login', data);
            set({ authUser: response.data.user }); // Make sure to set the user object
            get().connectSocket(response.data.user._id); // Connect to the socket after login
            return true;
        } catch (error) {
            const errorMessage = error.response?.data?.message || "Login failed.";
            get().setToast({ message: errorMessage, type: 'error' }); // Use setToast here
            console.error("Error logging in:", error);
            return false;
        } finally {
            set({ isLoggingIn: false });
        }
    },

    logout: async () => {
        set({ isLoggingOut: true });
        try {
            await axiosInstance.post('/auth/logout');
            set({ authUser: null }); // Clear authUser first
            get().setToast({ message: "Logged out successfully", type: 'success' }); // Use setToast
            get().disConnectSocket(); // Corrected call
        } catch (error) {
            console.error("Error logging out:", error);
            // Even if the server fails, log the user out on the client
            set({ authUser: null }); // Clear authUser even on error for client-side logout
            get().setToast({ message: "Logout completed with potential server error.", type: 'success' }); // Use setToast
        } finally {
            set({ isLoggingOut: false });
        }
    },

    updateProfile: async (data) => {
        set({ isUpdatingProfile: true });
        try {
            const response = await axiosInstance.put('/auth/update-profile', data);
            set({ authUser: response.data.user });
            get().setToast({ message: "Profile updated successfully", type: 'success' }); // Use setToast
        } catch (error) {
            const errorMessage = error.response?.data?.message || "Failed to update profile.";
            get().setToast({ message: errorMessage, type: 'error' }); // Use setToast
            console.error("Error updating profile:", error);
        } finally {
            set({ isUpdatingProfile: false });
        }
    },

    // MODIFIED: connectSocket to take userId and manage socket instance
    connectSocket: (userId) => {
        const currentSocket = get().socket;
        // Prevent reconnecting if already connected or if userId is missing
        if (currentSocket && currentSocket.connected) {
            console.log("Socket already connected.");
            return;
        }
        if (!userId) {
            console.warn("Cannot connect socket: userId is missing.");
            return;
        }

        const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:5001"; // Use environment variable for flexibility

        const newSocket = io(backendUrl, { // <-- IMPORTANT: Use your backend's URL/port here
            query: { userId: userId }, // Pass userId to the backend for identification
            transports: ['websocket'], // Force websocket for consistency
            reconnectionAttempts: 5, // Optional: number of reconnection attempts
            reconnectionDelay: 1000, // Optional: delay between attempts
        });

        newSocket.on('connect', () => {
            console.log('Frontend Socket Connected:', newSocket.id);
            set({ socket: newSocket }); // Store the connected socket instance
            // Manually trigger fetchUsers to ensure online statuses are correct
            // as this socket is now active.
            useChatStore.getState().fetchUsers();
        });

        newSocket.on('disconnect', () => {
            console.log('Frontend Socket Disconnected:', newSocket.id);
            set({ socket: null }); // Clear socket instance on disconnect
            // Update online users list to reflect disconnect
            useChatStore.getState().setOnlineUsers([]); // Or filter out disconnected user's ID
        });

        newSocket.on('connect_error', (error) => {
            console.error("Frontend Socket Connection Error:", error);
            get().setToast({ message: `Socket connection error: ${error.message}`, type: 'error' });
        });

        // Listen for online users update (for UI, e.g., in useChatStore)
        newSocket.on('getOnlineUsers', (onlineUsers) => {
            console.log('Online users updated:', onlineUsers);
            // Update online users in useChatStore
            useChatStore.getState().setOnlineUsers(onlineUsers);
        });

        // Listen for new messages (crucial for real-time chat)
        newSocket.on('newMessage', (newMessage) => {
            console.log('New message received via socket:', newMessage);
            // Update messages in useChatStore
            useChatStore.getState().addMessage(newMessage);
        });

        // NEW: Listen for chat deletion from the other side
        newSocket.on('chatDeleted', (deletedByUserId) => {
            const { selectedUser } = useChatStore.getState();
            if (selectedUser && selectedUser._id === deletedByUserId) {
                useChatStore.getState().messages = []; // Clear messages directly for immediate effect
                get().setToast({ message: `${selectedUser.fullName || 'User'} cleared the chat!`, type: 'info' });
            }
        });
    },

    // MODIFIED: disConnectSocket to properly disconnect
    disConnectSocket: () => {
        const currentSocket = get().socket;
        if (currentSocket && currentSocket.connected) {
            currentSocket.disconnect(); // Explicitly disconnect the socket
            console.log('Frontend Socket explicitly disconnected.');
            set({ socket: null }); // Clear socket instance
            // Clear online users and messages in chat store on logout
            useChatStore.getState().setOnlineUsers([]);
            useChatStore.getState().messages = []; // Clear messages when user logs out
            useChatStore.getState().setSelectedUser(null); // Clear selected user
        }
    }
}));