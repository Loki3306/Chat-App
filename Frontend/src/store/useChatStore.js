import { create } from 'zustand';
import { axiosInstance } from '../lib/axios.js';

export const useChatStore = create((set, get) => ({
    messages: [],
    users: [],
    selectedUser: null,
    selectedChat: null,
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

            const onlineUsersList = get().onlineUsers;
            const usersWithOnlineStatus = response.data.map(user => ({
                ...user,
                isOnline: onlineUsersList.includes(user._id)
            }));

            set({ users: usersWithOnlineStatus, isUsersLoading: false });

        } catch (error) {
            console.error('useChatStore: Error fetching users:', error);
            // Dynamic import for useAuthStore
            import('./useAuthStore.js').then(module => {
                module.useAuthStore.getState().setToast({ message: "Failed to fetch users.", type: 'error' });
            });
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
            import('./useAuthStore.js').then(module => {
                module.useAuthStore.getState().setToast({ message: "Failed to fetch messages.", type: 'error' });
            });
            set({ isMessagesLoading: false });
        }
    },

    sendMessage: async (userId, text, file = null) => {
        set({ isSendingMessage: true });
        const { selectedUser } = get();

        try {
            const formData = new FormData();
            formData.append('text', text);
            if (file) {
                formData.append('file', file);
            }

            const response = await axiosInstance.post(`/messages/send/${userId}`, formData, {
                headers: {
                    'Content-Type': file ? 'multipart/form-data' : 'application/json',
                },
            });

            const sentMessage = response.data;

            set((state) => ({
                messages: [...state.messages, sentMessage],
                users: state.users.map(user => {
                    if (state.selectedUser && user._id === state.selectedUser._id) {
                        return { ...user, lastMessage: sentMessage.text || sentMessage.image || sentMessage.fileUrl, lastMessageSender: sentMessage.senderId };
                    }
                    return user;
                })
            }));

        } catch (error) {
            console.error('Error sending message:', error);
            import('./useAuthStore.js').then(module => {
                module.useAuthStore.getState().setToast({ message: "Failed to send message.", type: 'error' });
            });
        } finally {
            set({ isSendingMessage: false });
        }
    },

    setSelectedUser: (user) => {
        set({
            selectedUser: user,
            selectedChat: user
        });
    },

    deleteMessage: async (messageId) => {
        set({ isMessagesLoading: true });
        try {
            const response = await axiosInstance.delete(`/messages/single/${messageId}`);
            console.log(`[FRONTEND STORE] Message ${messageId} delete API response:`, response.data);

            set((state) => {
                const updatedMessages = state.messages.filter(msg => msg._id !== messageId);
                
                let newLastMessageContent = null;
                let newLastMessageSender = null;
                const conversationMessages = updatedMessages.filter(msg => msg.conversationId === state.selectedUser?.conversationId);
                if (conversationMessages.length > 0) {
                    const lastMsg = conversationMessages[conversationMessages.length - 1];
                    newLastMessageContent = lastMsg.text || lastMsg.image || lastMsg.fileUrl || "";
                    newLastMessageSender = lastMsg.senderId;
                }

                const updatedUsers = state.users.map(user => {
                    if (state.selectedUser && user._id === state.selectedUser._id) {
                        return { ...user, lastMessage: newLastMessageContent, lastMessageSender: newLastMessageSender };
                    }
                    return user;
                });

                return { messages: updatedMessages, users: updatedUsers };
            });
            import('./useAuthStore.js').then(module => {
                module.useAuthStore.getState().setToast({ message: "Message deleted!", type: 'success' });
            });

        } catch (error) {
            console.error('Error deleting message:', error);
            import('./useAuthStore.js').then(module => {
                module.useAuthStore.getState().setToast({ message: "Failed to delete message.", type: 'error' });
            });
            get().getMessages(get().selectedUser._id);
        } finally {
            set({ isMessagesLoading: false });
        }
    },

    editMessage: async (messageId, newText) => {
        set({ isMessagesLoading: true });
        try {
            const response = await axiosInstance.put(`/messages/single/${messageId}`, { text: newText });
            const updatedMessage = response.data;

            set((state) => {
                const updatedMessagesList = state.messages.map(msg =>
                    msg._id === messageId ? updatedMessage : msg
                );

                let newLastMessageContent = null;
                let newLastMessageSender = null;
                
                const currentConversationId = state.selectedUser?.conversationId; 

                if (state.selectedUser && currentConversationId) {
                    const messagesForCurrentConversation = updatedMessagesList.filter(msg => msg.conversationId === currentConversationId);
                    if (messagesForCurrentConversation.length > 0) {
                        const lastMsg = messagesForCurrentConversation[messagesForCurrentConversation.length - 1];
                        newLastMessageContent = lastMsg.text || lastMsg.image || lastMsg.fileUrl || "";
                        newLastMessageSender = lastMsg.senderId;
                    }
                }

                const updatedUsers = (state.users || []).map(user => {
                    if (state.selectedUser && user._id === state.selectedUser._id) {
                        return { ...user, lastMessage: newLastMessageContent, lastMessageSender: newLastMessageSender };
                    }
                    return user;
                });

                return { messages: updatedMessagesList, users: updatedUsers };
            });
            import('./useAuthStore.js').then(module => {
                module.useAuthStore.getState().setToast({ message: "Message edited!", type: 'success' });
            });

        } catch (error) {
            console.error('Error editing message:', error);
            import('./useAuthStore.js').then(module => {
                module.useAuthStore.getState().setToast({ message: "Failed to edit message.", type: 'error' });
            });
        } finally {
            set({ isMessagesLoading: false });
        }
    },

    // NEW: Action to add a new message (triggered by Socket.IO 'newMessage' event)
    addMessage: (newMessage) => {
        set((state) => {
            // Only add the message if it belongs to the currently selected chat
            if (state.selectedUser && 
                (newMessage.senderId === state.selectedUser._id || newMessage.receiverId === state.selectedUser._id)) {
                
                const updatedMessages = [...state.messages, newMessage];

                // Update lastMessage and lastMessageSender in the users array
                const updatedUsers = state.users.map(user => {
                    if (user._id === newMessage.senderId || user._id === newMessage.receiverId) {
                        return { 
                            ...user, 
                            lastMessage: newMessage.text || (newMessage.image ? "Image" : (newMessage.fileUrl ? `File: ${newMessage.fileName || 'file'}` : "")),
                            lastMessageSender: newMessage.senderId
                        };
                    }
                    return user;
                });

                return { messages: updatedMessages, users: updatedUsers };
            }
            return state; // No change if message not for current chat
        });
    },

    // Action to remove a message (triggered by Socket.IO 'messageDeleted' event)
    removeMessage: (deletedMessageId) => {
        set((state) => {
            const updatedMessages = state.messages.filter(msg => msg._id !== deletedMessageId);

            let newLastMessageContent = null;
            let newLastMessageSender = null;
            
            const currentConversationId = state.selectedUser?.conversationId; 
            
            if (state.selectedUser && currentConversationId) {
                 const messagesForCurrentConversation = updatedMessages.filter(msg => msg.conversationId === currentConversationId);
                 if (messagesForCurrentConversation.length > 0) {
                     const lastMsg = messagesForCurrentConversation[messagesForCurrentConversation.length - 1];
                     newLastMessageContent = lastMsg.text || lastMsg.image || lastMsg.fileUrl || "";
                     newLastMessageSender = lastMsg.senderId;
                 }
            }

            const updatedUsers = (state.users || []).map(user => {
                if (state.selectedUser && user._id === state.selectedUser._id) {
                    return { ...user, lastMessage: newLastMessageContent, lastMessageSender: newLastMessageSender };
                }
                return user;
            });

            return { messages: updatedMessages, users: updatedUsers };
        });
    },

    // Action to update a message (triggered by Socket.IO 'messageEdited' event)
    updateMessage: (updatedMessage) => {
        set((state) => {
            const updatedMessagesList = state.messages.map(msg =>
                msg._id === updatedMessage._id ? updatedMessage : msg
            );

            let newLastMessageContent = null;
            let newLastMessageSender = null;
            
            const currentConversationId = state.selectedUser?.conversationId; 

            if (state.selectedUser && currentConversationId) {
                const messagesForCurrentConversation = updatedMessagesList.filter(msg => msg.conversationId === currentConversationId);
                if (messagesForCurrentConversation.length > 0) {
                    const lastMsg = messagesForCurrentConversation[messagesForCurrentConversation.length - 1];
                    newLastMessageContent = lastMsg.text || lastMsg.image || lastMsg.fileUrl || "";
                    newLastMessageSender = lastMsg.senderId;
                }
            }

            const updatedUsers = (state.users || []).map(user => {
                if (state.selectedUser && user._id === state.selectedUser._id) {
                    return { ...user, lastMessage: newLastMessageContent, lastMessageSender: newLastMessageSender };
                }
                return user;
            });

            return { messages: updatedMessagesList, users: updatedUsers };
        });
    },

    setOnlineUsers: (onlineUsersList) => {
        set({ onlineUsers: onlineUsersList });
        set((state) => ({
            users: (state.users || []).map(user => ({
                ...user,
                isOnline: onlineUsersList.includes(user._id)
            }))
        }));
    },
}));