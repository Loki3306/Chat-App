import React, { useEffect, useRef, useState } from 'react';
import { useChatStore } from '../store/useChatStore.js'; // Ensure this path is correct
import { useAuthStore } from '../store/useAuthStore.js'; // Ensure this path is correct
import { Send, Smile, Paperclip, MoreVertical, XCircle, Loader2, MessageSquare } from 'lucide-react';

const ChatContainer = () => {
    // Destructure states and actions from useChatStore based on your provided component
    const { messages, getMessages, isMessageLoading, selectedUser, setSelectedUser } = useChatStore();
    const { authUser } = useAuthStore(); // Get current authenticated user

    const [newMessage, setNewMessage] = useState('');
    const messagesEndRef = useRef(null); // Ref for auto-scrolling to the latest message
    const attachmentInputRef = useRef(null); // Ref for hidden file input
    const chatContainerRef = useRef(null); // Ref for the main chat container div

    // State to hold mouse coordinates for the interactive background
    const [mousePosition, setMousePosition] = useState({ x: '50%', y: '50%' });
    const animationFrameRef = useRef(0); // To optimize mousemove event

    // Default avatar for users (reused from Sidebar)
    const defaultUserAvatar = `data:image/svg+xml;base64,${btoa(`
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 5C13.66 5 15 6.34 15 8C15 9.66 13.66 11 12 11C10.34 11 9 9.66 9 8C9 6.34 10.34 5 12 5ZM12 19.2C9.5 19.2 7.29 17.92 6 15.96C6.03 14.07 10 12.9 12 12.9C13.99 12.9 17.97 14.07 18 15.96C16.71 17.92 14.5 19.2 12 19.2Z" fill="#9CA3AF"/>
        </svg>
    `)}`;

    // Fetch messages when selectedUser changes, using getMessages
    useEffect(() => {
        if (selectedUser) {
            console.log("ChatContainer: Fetching messages for selected user:", selectedUser.fullName || selectedUser._id);
            getMessages(selectedUser._id);
        }
    }, [selectedUser, getMessages]);

    // Scroll to the bottom of messages whenever messages change or component mounts
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, isMessageLoading]);

    // Effect hook to track mouse movement and update state efficiently for dynamic background
    useEffect(() => {
        const handleMouseMove = (e) => {
            cancelAnimationFrame(animationFrameRef.current);
            animationFrameRef.current = requestAnimationFrame(() => {
                // Get position relative to the chat container itself
                const rect = chatContainerRef.current.getBoundingClientRect(); // Use ref directly
                setMousePosition({
                    x: `${e.clientX - rect.left}px`,
                    y: `${e.clientY - rect.top}px`
                });
            });
        };

        const currentChatContainer = chatContainerRef.current;
        if (currentChatContainer) {
            currentChatContainer.addEventListener('mousemove', handleMouseMove);
        }

        return () => {
            if (currentChatContainer) {
                currentChatContainer.removeEventListener('mousemove', handleMouseMove);
            }
            cancelAnimationFrame(animationFrameRef.current);
        };
    }, []); // Empty dependency array to run once on mount


    const handleSendMessage = (e) => {
        e.preventDefault();
        if (newMessage.trim() === '') return;

        console.log("Sending message:", newMessage, "to user:", selectedUser.fullName);
        const tempMessage = {
            _id: Date.now(),
            senderId: authUser._id,
            receiverId: selectedUser._id,
            text: newMessage.trim(),
            createdAt: new Date().toISOString(),
        };

        useChatStore.getState().set({ messages: [...messages, tempMessage] });

        setNewMessage('');
    };

    const handleChatSettings = () => {
        alert("Chat settings options would appear here!");
    };

    const handleAttachmentClick = () => {
        attachmentInputRef.current.click();
    };

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            console.log("Selected attachment:", file.name, file.type, file.size);
            alert(`Attachment selected: ${file.name}. (Upload logic to be implemented)`);
        }
    };

    const handleEmojiClick = () => {
        alert("Emoji picker would open here!");
    };

    const handleQuitChat = () => {
        setSelectedUser(null);
    };


    if (!selectedUser) {
        return null;
    }

    return (
        <div
            ref={chatContainerRef} // Attach the ref to the main div
            className="chat-container-main flex flex-col h-full border-l border-gray-700/50 rounded-lg shadow-lg relative overflow-hidden"
            style={{
                backgroundColor: '#0f172a', // Base dark color for this div
                backgroundImage: `
                    radial-gradient(600px at ${mousePosition.x} ${mousePosition.y}, rgba(252, 211, 77, 0.05), transparent 70%),
                    radial-gradient(300px at ${mousePosition.x} ${mousePosition.y}, rgba(139, 92, 246, 0.03), transparent 80%)
                `,
                backgroundSize: 'cover',
                backgroundPosition: 'center center',
                backgroundRepeat: 'no-repeat',
                transition: 'background-image 0.05s ease-out',
            }}
        >
            {/* Chat Header */}
            <div className="relative z-10 flex items-center justify-between p-4 border-b border-gray-700/50 bg-gray-800/60 rounded-t-lg backdrop-blur-sm">
                <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 rounded-full overflow-hidden flex-shrink-0 ${selectedUser.isOnline ? 'border-2 border-green-500' : 'border-2 border-gray-600'}`}>
                        <img
                            src={selectedUser.profilePicture || defaultUserAvatar}
                            alt={selectedUser.fullName ? selectedUser.fullName.charAt(0) : 'U'}
                            className="w-full h-full object-cover rounded-full"
                            onError={(e) => { e.target.onerror = null; e.target.src = defaultUserAvatar; }}
                        />
                    </div>
                    <div className="flex flex-col">
                        <span className="font-semibold text-amber-200 text-lg">{selectedUser.fullName || 'Unknown User'}</span>
                        <span className={`text-sm ${selectedUser.isOnline ? 'text-green-400' : 'text-gray-500'}`}>
                            {selectedUser.isOnline ? 'Online' : 'Offline'}
                        </span>
                    </div>
                </div>
                {/* Buttons on the right side of the header */}
                <div className="flex items-center gap-2">
                    <button
                        onClick={handleChatSettings}
                        className="p-2 rounded-full text-gray-400 hover:bg-gray-700/50 hover:text-amber-300 transition-colors"
                    >
                        <MoreVertical size={20} />
                    </button>
                    <button
                        onClick={handleQuitChat}
                        className="p-2 rounded-full text-gray-400 hover:bg-red-900/50 hover:text-red-400 transition-colors"
                        aria-label="Quit Chat"
                    >
                        <XCircle size={20} />
                    </button>
                </div>
            </div>

            {/* Message Area */}
            <div className="relative z-10 flex-1 p-4 overflow-y-auto space-y-4 custom-scrollbar">
                {isMessageLoading ? (
                    <div className="flex justify-center items-center h-full">
                        <Loader2 className="animate-spin size-8 text-amber-400" />
                        <p className="ml-3 text-gray-400">Loading messages...</p>
                    </div>
                ) : messages.length > 0 ? (
                    messages.map((message) => (
                        <div
                            key={message._id}
                            className={`flex ${message.senderId === authUser._id ? 'justify-end' : 'justify-start'}`}
                        >
                            <div className={`flex items-end max-w-[70%] p-3 rounded-xl shadow-md ${
                                message.senderId === authUser._id
                                    ? 'bg-amber-600/50 text-white rounded-br-none'
                                    : 'bg-gray-700/50 text-gray-200 rounded-bl-none'
                            }`}>
                                <p className="text-sm">{message.text}</p>
                                <span className="text-xs ml-2 opacity-70">
                                    {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-gray-500 text-center">
                        <MessageSquare size={48} className="mb-4" />
                        <p className="text-lg">Say hello to {selectedUser.fullName}!</p>
                        <p className="text-sm">Your conversation starts here.</p>
                    </div>
                )}
                <div ref={messagesEndRef} /> {/* Element to scroll into view */}
            </div>

            {/* Message Input Area */}
            <form onSubmit={handleSendMessage} className="relative z-10 p-4 border-t border-gray-700/50 bg-gray-800/60 rounded-b-lg flex items-center space-x-3 backdrop-blur-sm">
                <button
                    type="button"
                    onClick={handleAttachmentClick}
                    className="p-2 rounded-full text-gray-400 hover:bg-gray-700/50 hover:text-amber-300 transition-colors"
                >
                    <Paperclip size={20} />
                </button>
                {/* Hidden file input for attachments */}
                <input
                    type="file"
                    ref={attachmentInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                />

                <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 p-3 rounded-lg bg-gray-700/50 border border-gray-600 text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-amber-400 transition-all"
                />
                <button
                    type="button"
                    onClick={handleEmojiClick}
                    className="p-2 rounded-full text-gray-400 hover:bg-gray-700/50 hover:text-amber-300 transition-colors"
                >
                    <Smile size={20} />
                </button>
                <button type="submit" className="p-3 rounded-full bg-amber-300 text-gray-900 hover:bg-amber-400 transition-all transform hover:scale-105">
                    <Send size={20} />
                </button>
            </form>
        </div>
    );
};

export default ChatContainer;
