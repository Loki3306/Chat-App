import { create } from 'zustand';
import { axiosInstance } from '../lib/axios.js';
import { useAuthStore } from './useAuthStore.js'; // Import useAuthStore for authUser and toast messages

export const useChatStore = create((set, get) => ({
    messages: [],
    users: [],
    selectedUser: null,
    selectedChat: null, // This can probably be removed if not used, it mirrors selectedUser
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

            const currentSelectedUser = get().selectedUser;
            if (currentSelectedUser) {
                const updatedSelectedUser = usersWithOnlineStatus.find(u => u._id === currentSelectedUser._id);
                if (updatedSelectedUser) {
                    set({ selectedUser: updatedSelectedUser, selectedChat: updatedSelectedUser });
                } else {
                    useAuthStore.getState().setToast({ message: "Current conversation was deleted.", type: 'info' });
                    set({ selectedUser: null, selectedChat: null, messages: [] });
                }
            }

        } catch (error) {
            console.error('useChatStore: Error fetching users:', error);
            useAuthStore.getState().setToast({ message: "Failed to fetch users.", type: 'error' });
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
            useAuthStore.getState().setToast({ message: "Failed to fetch messages.", type: 'error' });
            set({ isMessagesLoading: false });
        }
    },

    sendMessage: async (userId, text, file = null) => {
        set({ isSendingMessage: true });
        // The selectedUser variable can be accessed using get().selectedUser if needed,
        // but for send, userId is passed directly.

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
                    if (user.conversationId === sentMessage.conversationId) {
                         return { 
                            ...user, 
                            lastMessage: sentMessage.text || (sentMessage.image ? "Image" : (sentMessage.fileUrl ? `File: ${sentMessage.fileName}` : "")),
                            lastMessageSender: sentMessage.senderId
                        };
                    }
                    return user;
                })
            }));

        } catch (error) {
            console.error('Error sending message:', error);
            useAuthStore.getState().setToast({ message: "Failed to send message.", type: 'error' });
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
                const currentConversationId = response.data.conversationId || state.messages.find(msg => msg._id === messageId)?.conversationId; 

                if (currentConversationId) {
                    const messagesForCurrentConversation = updatedMessages.filter(msg => msg.conversationId === currentConversationId);
                    if (messagesForCurrentConversation.length > 0) {
                        const lastMsg = messagesForCurrentConversation[messagesForCurrentConversation.length - 1];
                        newLastMessageContent = lastMsg.text || lastMsg.image || lastMsg.fileUrl || "";
                        newLastMessageSender = lastMsg.senderId;
                    } else {
                        newLastMessageContent = null;
                        newLastMessageSender = null;
                    }
                }

                const updatedUsers = state.users.map(user => {
                    if (user.conversationId === currentConversationId) {
                        return { ...user, lastMessage: newLastMessageContent, lastMessageSender: newLastMessageSender };
                    }
                    return user;
                });

                return { messages: updatedMessages, users: updatedUsers };
            });
            useAuthStore.getState().setToast({ message: "Message deleted!", type: 'success' });

        } catch (error) {
            console.error('Error deleting message:', error);
            useAuthStore.getState().setToast({ message: "Failed to delete message.", type: 'error' });
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
                    msg._id === updatedMessage._id ? updatedMessage : msg
                );

                let newLastMessageContent = null;
                let newLastMessageSender = null;
                
                const currentConversationId = updatedMessage.conversationId; 

                if (currentConversationId) {
                    const messagesForCurrentConversation = updatedMessagesList.filter(msg => msg.conversationId === currentConversationId);
                    if (messagesForCurrentConversation.length > 0) {
                        const lastMsg = messagesForCurrentConversation[messagesForCurrentConversation.length - 1];
                        newLastMessageContent = lastMsg.text || lastMsg.image || lastMsg.fileUrl || "";
                        newLastMessageSender = lastMsg.senderId;
                    }
                }

                const updatedUsers = (state.users || []).map(user => {
                    if (user.conversationId === currentConversationId) {
                        return { ...user, lastMessage: newLastMessageContent, lastMessageSender: newLastMessageSender };
                    }
                    return user;
                });

                return { messages: updatedMessagesList, users: updatedUsers };
            });
            useAuthStore.getState().setToast({ message: "Message edited!", type: 'success' });

        } catch (error) {
            console.error('Error editing message:', error);
            useAuthStore.getState().setToast({ message: "Failed to edit message.", type: 'error' });
        } finally {
            set({ isMessagesLoading: false });
        }
    },

    // Action to add a new message (triggered by Socket.IO 'newMessage' event)
    addMessage: (newMessage) => {
        set((state) => {
            const authUser = useAuthStore.getState().authUser; // Get current auth user
            // Prevent adding if message with same ID already exists OR if it's our own message
            if (state.messages.some(msg => msg._id === newMessage._id) || newMessage.senderId === authUser?._id) {
                console.log(`[Socket.IO] Ignoring duplicate or self-sent message: ${newMessage._id}`);
                return state; // Return current state, no change
            }

            // Only add the message if it belongs to the currently selected chat
            if (state.selectedUser && 
                (newMessage.senderId === state.selectedUser._id || newMessage.receiverId === state.selectedUser._id)) {
                
                const updatedMessages = [...state.messages, newMessage];

                const updatedUsers = state.users.map(user => {
                    if (user.conversationId === newMessage.conversationId) {
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
            return state;
        });
    },

    // Action to remove a message (triggered by Socket.IO 'messageDeleted' event)
    removeMessage: (deletedMessageId) => {
        set((state) => {
            const updatedMessages = state.messages.filter(msg => msg._id !== deletedMessageId);

            let newLastMessageContent = null;
            let newLastMessageSender = null;
            
            const deletedMessage = state.messages.find(msg => msg._id === deletedMessageId);
            const currentConversationId = deletedMessage?.conversationId; 
            
            if (currentConversationId) {
                 const messagesForCurrentConversation = updatedMessages.filter(msg => msg.conversationId === currentConversationId);
                 if (messagesForCurrentConversation.length > 0) {
                     const lastMsg = messagesForCurrentConversation[messagesForCurrentConversation.length - 1];
                     newLastMessageContent = lastMsg.text || lastMsg.image || lastMsg.fileUrl || "";
                     newLastMessageSender = lastMsg.senderId;
                 } else {
                     newLastMessageContent = null;
                     newLastMessageSender = null;
                 }
            }

            const updatedUsers = (state.users || []).map(user => {
                if (user.conversationId === currentConversationId) {
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
            const authUser = useAuthStore.getState().authUser; // Get current auth user
            // Prevent processing if it's our own message being echoed back
            if (updatedMessage.senderId === authUser?._id) {
                console.log(`[Socket.IO] Ignoring self-edited message echo: ${updatedMessage._id}`);
                return state; // Return current state, no change
            }

            const updatedMessagesList = state.messages.map(msg =>
                msg._id === updatedMessage._id ? updatedMessage : msg
            );

            let newLastMessageContent = null;
            let newLastMessageSender = null;
            
            const currentConversationId = updatedMessage.conversationId; 

            if (currentConversationId) {
                const messagesForCurrentConversation = updatedMessagesList.filter(msg => msg.conversationId === currentConversationId);
                if (messagesForCurrentConversation.length > 0) {
                    const lastMsg = messagesForCurrentConversation[messagesForCurrentConversation.length - 1];
                    newLastMessageContent = lastMsg.text || lastMsg.image || lastMsg.fileUrl || "";
                    newLastMessageSender = lastMsg.senderId;
                }
            }

            const updatedUsers = (state.users || []).map(user => {
                if (user.conversationId === currentConversationId) {
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

    deleteConversationForAll: async (conversationId) => {
        set({ isMessagesLoading: true });
        try {
            const response = await axiosInstance.delete(`/messages/conversation/${conversationId}`);
            console.log("[FRONTEND STORE] Delete conversation API response:", response.data);

            useAuthStore.getState().setToast({ message: response.data.message, type: 'success' });
            
            // The Socket.IO event 'conversationDeleted' from the backend will
            // trigger the removeConversation action to update the UI globally.

        } catch (error) {
            console.error('Error deleting conversation:', error);
            const errorMessage = error.response?.data?.message || "Failed to delete conversation.";
            useAuthStore.getState().setToast({ message: errorMessage, type: 'error' });
        } finally {
            set({ isMessagesLoading: false });
        }
    },

    removeConversation: (deletedConversationId) => {
        set((state) => {
            const updatedUsers = state.users.filter(user => user.conversationId !== deletedConversationId);

            if (state.selectedUser?.conversationId === deletedConversationId) {
                return {
                    users: updatedUsers,
                    messages: [],
                    selectedUser: null,
                    selectedChat: null
                };
            }
            return { users: updatedUsers };
        });
    },
}));