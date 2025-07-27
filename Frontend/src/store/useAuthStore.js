// src/store/useAuthStore.js

import { create } from 'zustand';
import { axiosInstance } from '../lib/axios.js';
import { io } from 'socket.io-client';
import { useChatStore } from './useChatStore.js'; // Import useChatStore

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
    setToast: (newToast) => set({ toast: newToast }), // The action to set toast state

    checkAuth: async () => {
        try {
            const response = await axiosInstance.get('/auth/check');
            set({ authUser: response.data.user });
            if (response.data.user) {
                get().connectSocket(response.data.user._id);
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
            get().connectSocket(response.data._id);
        } catch (error) {
            console.error("Error signing up:", error);
            const errorMessage = error.response?.data?.message || "Signup failed.";
            get().setToast({ message: errorMessage, type: 'error' });
        } finally {
            set({ isSigningUp: false });
        }
    },

    login: async (data) => {
        set({ isLoggingIn: true });
        try {
            const response = await axiosInstance.post('/auth/login', data);
            set({ authUser: response.data.user });
            get().connectSocket(response.data.user._id);
            return true;
        } catch (error) {
            const errorMessage = error.response?.data?.message || "Login failed.";
            get().setToast({ message: errorMessage, type: 'error' });
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
            set({ authUser: null });
            get().setToast({ message: "Logged out successfully", type: 'success' });
            get().disConnectSocket();
        } catch (error) {
            console.error("Error logging out:", error);
            set({ authUser: null });
            get().setToast({ message: "Logout completed with potential server error.", type: 'success' });
        } finally {
            set({ isLoggingOut: false });
        }
    },

    updateProfile: async (data) => {
        set({ isUpdatingProfile: true });
        try {
            const response = await axiosInstance.put('/auth/update-profile', data);
            set({ authUser: response.data.user });
            get().setToast({ message: "Profile updated successfully", type: 'success' });
        } catch (error) {
            const errorMessage = error.response?.data?.message || "Failed to update profile.";
            get().setToast({ message: errorMessage, type: 'error' });
            console.error("Error updating profile:", error);
        } finally {
            set({ isUpdatingProfile: false });
        }
    },

    connectSocket: (userId) => {
        const currentSocket = get().socket;
        if (currentSocket && currentSocket.connected) {
            console.log("Socket already connected.");
            return;
        }
        if (!userId) {
            console.warn("Cannot connect socket: userId is missing.");
            return;
        }

        const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:5001";

        const newSocket = io(backendUrl, {
            query: { userId: userId },
            transports: ['websocket'],
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
        });

        newSocket.on('connect', () => {
            console.log('Frontend Socket Connected:', newSocket.id);
            set({ socket: newSocket });
            useChatStore.getState().fetchUsers(); // Refresh users on connect to update online statuses
        });

        newSocket.on('disconnect', () => {
            console.log('Frontend Socket Disconnected:', newSocket.id);
            set({ socket: null });
            // Clear online users and messages in chat store on disconnect
            useChatStore.getState().setOnlineUsers([]);
            useChatStore.getState().messages = [];
            useChatStore.getState().setSelectedUser(null);
        });

        newSocket.on('connect_error', (error) => {
            console.error("Frontend Socket Connection Error:", error);
            get().setToast({ message: `Socket connection error: ${error.message}`, type: 'error' });
        });

        newSocket.on('getOnlineUsers', (onlineUsers) => {
            console.log('Online users updated:', onlineUsers);
            useChatStore.getState().setOnlineUsers(onlineUsers);
        });

        newSocket.on('newMessage', (newMessage) => {
            console.log('New message received via socket:', newMessage);
            useChatStore.getState().addMessage(newMessage);
        });

        // --- MODIFIED: Replace old 'chatDeleted' listener with new individual message listeners ---
        newSocket.on('messageDeleted', (deletedMessageId) => {
            console.log('Message deleted via socket:', deletedMessageId);
            useChatStore.getState().removeMessage(deletedMessageId); // Call the new action in useChatStore
        });

        newSocket.on('messageEdited', (updatedMessage) => {
            console.log('Message edited via socket:', updatedMessage);
            useChatStore.getState().updateMessage(updatedMessage); // Call the new action in useChatStore
        });
        // --- END MODIFIED ---
    },

    disConnectSocket: () => {
        const currentSocket = get().socket;
        if (currentSocket && currentSocket.connected) {
            currentSocket.disconnect();
            console.log('Frontend Socket explicitly disconnected.');
            set({ socket: null });
            useChatStore.getState().setOnlineUsers([]);
            useChatStore.getState().messages = [];
            useChatStore.getState().setSelectedUser(null);
        }
    }
}));