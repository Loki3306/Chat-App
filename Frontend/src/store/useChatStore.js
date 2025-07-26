import {create} from 'zustand';
import {axiosInstance} from '../lib/axios.js';

export const useChatStore = create((set,get) => ({
    messages: [],
    users: [],
    selectedUser: null,
    selectedChat: null, // Ensure selectedChat is part of your state
    isUsersLoading: false,
    isMessagesLoading: false,

    fetchUsers: async () => {
        set({isUsersLoading: true});
        console.log("useChatStore: Starting fetchUsers...");
        try {
            const response = await axiosInstance.get('/users');
            console.log("useChatStore: API call to /users successful.");
            console.log("useChatStore: Response data for users:", response.data);
            
            set({users: response.data, isUsersLoading: false});

        } catch (error) {
            console.error('useChatStore: Error fetching users:', error);
            if (error.response) {
                console.error("useChatStore: Error response data:", error.response.data);
                console.error("useChatStore: Error response status:", error.response.status);
                console.error("useChatStore: Error response headers:", error.response.headers);
            } else if (error.request) {
                console.error("useChatStore: Error request:", error.request);
            } else {
                console.error("useChatStore: Error message:", error.message);
            }
            set({isUsersLoading: false});
        }
    },

    getMessages: async (userId) => {
        set({isMessagesLoading: true});
        try {
            const response = await axiosInstance.get(`/messages/${userId}`);
            set({messages: response.data, isMessagesLoading: false});
        } catch (error) {
            console.error('Error fetching messages:', error);
            set({isMessagesLoading: false});
        }
    },

    sendMessage: async (userId, message) => {
        const {selectedUser, messages} = get();
        try {
            const response = await axiosInstance.post(`/messages/send/${userId}`, {message});
            set({
                messages: [...messages, response.data],
                selectedUser: {...selectedUser, lastMessage: response.data}, // Update lastMessage for selectedUser
            });

        } catch (error) {
            
        }

    },

    

    // MODIFIED: setSelectedUser to also set selectedChat
    setSelectedUser: (user) => {
        set({
            selectedUser: user,
            selectedChat: user // Set selectedChat to the selected user object
        });
    },
}));
