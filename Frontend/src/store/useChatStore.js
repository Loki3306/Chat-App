import { create } from 'zustand';
import { axiosInstance } from '../lib/axios.js';
import { useAuthStore } from './useAuthStore.js';

export const useChatStore = create((set, get) => ({
    messages: [],
    users: [], // This is now your 'conversations' list of users
    selectedUser: null,
    selectedChat: null, // This seems redundant if selectedUser is always the target chat
    isUsersLoading: false,
    isMessagesLoading: false,
    isSendingMessage: false,
    onlineUsers: [],

    fetchUsers: async () => {
        set({ isUsersLoading: true });
        console.log("useChatStore: Starting fetchUsers...");
        try {
            const response = await axiosInstance.get('/users');
            console.log("useChatStore: API call to /users successful.");
            console.log("useChatStore: Response data for users:", response.data);

            // Enhance users with online status immediately after fetching
            const onlineUsersList = get().onlineUsers; // Get current online users from state
            const usersWithOnlineStatus = response.data.map(user => ({
                ...user,
                isOnline: onlineUsersList.includes(user._id)
            }));

            set({ users: usersWithOnlineStatus, isUsersLoading: false });

        } catch (error) {
            console.error('useChatStore: Error fetching users:', error);
            if (error.response) {
                console.error("useChatStore: Error response data:", error.response.data);
                console.error("useChatStore: Error response status:", error.response.status);
            } else if (error.request) {
                console.error("useChatStore: Error request:", error.request);
            } else {
                console.error("useChatStore: Error message:", error.message);
            }
            set({ isUsersLoading: false });
        }
    },

    getMessages: async (userId) => {
        set({ isMessagesLoading: true });
        try {
            const response = await axiosInstance.get(`/messages/${userId}`);
            set({ messages: response.data, isMessagesLoading: false });
        } catch (error) {
            console.error('Error fetching messages:', error);
            set({ isMessagesLoading: false });
        }
    },

    sendMessage: async (userId, text, file = null) => {
        set({ isSendingMessage: true });
        const { selectedUser, messages } = get(); // Get current state for optimistic update

        // OPTIONAL: Optimistic update BEFORE API call for faster UI feedback.
        // If you do this, you MUST handle errors by reverting the message,
        // and on success, you might want to replace the temporary message with the real one from the server.
        // For now, sticking to the existing pattern of updating AFTER success.

        try {
            let response;
            const formData = new FormData();
            formData.append('text', text);
            if (file) {
                formData.append('file', file);
            }

            // Using selectedUser for consistency, though userId is passed.
            // The backend endpoint likely expects the ID of the *recipient*.
            response = await axiosInstance.post(`/messages/send/${userId}`, formData, {
                headers: {
                    'Content-Type': file ? 'multipart/form-data' : 'application/json',
                },
            });

            // Update messages with the new message from the server response.
            // This is the "confirmed" message, so it's safer.
            set((state) => ({
                messages: [...state.messages, response.data],
                // Update lastMessage on selectedUser for display in sidebar, etc.
                selectedUser: state.selectedUser && state.selectedUser._id === userId
                    ? { ...state.selectedUser, lastMessage: response.data }
                    : state.selectedUser,
                isSendingMessage: false,
            }));

        } catch (error) {
            console.error('Error sending message:', error);
            // Consider showing a toast notification here
            set({ isSendingMessage: false });
        }
    },

    // --- NEW: Add deleteMessages action ---
    deleteMessages: async (receiverId) => {
        set({ isMessagesLoading: true }); // Indicate loading while deleting
        try {
            // No need to get token explicitly here if axiosInstance is configured with interceptors
            // that attach the token from useAuthStore automatically.
            // Assuming axiosInstance already handles Authorization headers.
            const response = await axiosInstance.delete(`/messages/${receiverId}`);

            if (response.status === 200) {
                // Clear messages for the currently selected chat
                set({ messages: [] });
                console.log('Chat history deleted successfully!');

                // Optionally, update the 'users' list to clear the lastMessage preview
                // for the conversation that was just deleted.
                set((state) => ({
                    users: state.users.map(user => {
                        if (user._id === receiverId) {
                            return { ...user, lastMessage: null }; // Or set to an empty object if lastMessage is always expected
                        }
                        return user;
                    }),
                    // If the selected user's chat was just deleted, might want to clear selectedUser too.
                    // Or keep it selected if user is expected to start a new convo.
                    // selectedUser: null, // Uncomment if you want to deselect after deleting
                }));
            }

        } catch (error) {
            console.error('Error deleting messages:', error);
            // Handle error, e.g., show a toast notification
        } finally {
            set({ isMessagesLoading: false });
        }
    },
    // --- END NEW ---

    setSelectedUser: (user) => {
        set({
            selectedUser: user,
            selectedChat: user // This is redundant if selectedUser is the only active chat, consider removing selectedChat
        });
    },

    addMessage: (newMessage) => {
        const { selectedUser, messages } = get();
        // Only add the message if it's for the currently selected chat
        // This prevents messages from other chats from appearing in the current view
        // It's also important to prevent duplicates if your `sendMessage`
        // performs an optimistic update *and* the server immediately sends a socket event back.
        // A common pattern is to include a `socketId` in optimistic updates and filter on `addMessage`
        // if the incoming message has the same socketId as the sender's current socket.
        // For now, checking `_id` should be sufficient if the backend returns the same _id for both.
        if (selectedUser && (newMessage.senderId === selectedUser._id || newMessage.receiverId === selectedUser._id)) {
            // Prevent adding the same message twice if sendMessage also updates `messages`
            const isDuplicate = messages.some(msg => msg._id === newMessage._id);
            if (!isDuplicate) {
                set((state) => ({ messages: [...state.messages, newMessage] }));

                // Update lastMessage in the `users` list when a new message arrives
                set((state) => ({
                    users: state.users.map(user => {
                        if (user._id === newMessage.senderId || user._id === newMessage.receiverId) {
                            // Assuming the sender or receiver of the new message is the one whose preview needs update
                            return { ...user, lastMessage: newMessage };
                        }
                        return user;
                    }),
                }));
            }
        }
    },

    setOnlineUsers: (onlineUsersList) => {
        set({ onlineUsers: onlineUsersList });
        // When online users change, update the `isOnline` status for all users in the `users` list
        set((state) => ({
            users: state.users.map(user => ({
                ...user,
                isOnline: onlineUsersList.includes(user._id)
            }))
        }));
    },
}));