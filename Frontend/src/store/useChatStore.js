import {create} from 'zustand';
import {axiosInstance} from '../lib/axios.js';

export const useChatStore = create((set) => ({
    messages: [],
    users: [],
    selectedUser: null,
    isUsersLoading: false,
    isMessagesLoading: false,


    fetchUsers: async () => {
        set({isUsersLoading: true});
        try {
            const response = await axiosInstance.get('/users');
            set({users: response.data, isUsersLoading: false});
        } catch (error) {
            console.error('Error fetching users:', error);
            set({isUsersLoading: false});
        }
    },

    fetchMessages: async (userId) => {
        set({isMessagesLoading: true});
        try {
            const response = await axiosInstance.get(`/messages/${userId}`);
            set({messages: response.data, isMessagesLoading: false});
        } catch (error) {
            console.error('Error fetching messages:', error);
            set({isMessagesLoading: false});
        }
    },


    //optimise later
    setSelectedUser: (user) => {
        set({selectedUser: user});
    },




}));
