// frontend/src/components/ChatContainer.jsx

import React, { useEffect, useRef, useState } from 'react';
import { useChatStore } from '../store/useChatStore.js';
import { useAuthStore } from '../store/useAuthStore.js';
import MessageInput from './MessageInput';
import ChatMessage from './ChatMessage.jsx';
import {
    MoreVertical,
    XCircle,
    Loader2,
    MessageSquare,
    Palette,
    X,
    Trash2,
} from 'lucide-react';
import { emojiCategories } from '../components/emojiData.js';
import { themes } from '../utils/themes.js';
const ChatContainer = () => {
    const { messages, getMessages, isMessageLoading, selectedUser, setSelectedUser, deleteConversationForAll } = useChatStore();
    const { authUser, setToast, clearToast } = useAuthStore();

    const [showThemeTab, setShowThemeTab] = useState(false);
    const [showEmojiTab, setShowEmojiTab] = useState(false);
    const [currentTheme, setCurrentTheme] = useState('amber');
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    const messagesEndRef = useRef(null);
    const chatContainerRef = useRef(null);
    const messagesContainerRef = useRef(null);

    const [mousePosition, setMousePosition] = useState({ x: '50%', y: '50%' });
    const animationFrameRef = useRef(0);

    const [setMessageInInput, setSetMessageInInput] = useState(null);

    const [fullScreenImageUrl, setFullScreenImageUrl] = useState(null);

    const themes = {
        amber: {
            name: 'Midnight Amber',
            primary: '#FFBF00',
            accent: 'rgba(51, 51, 51, 0.15)', // Increased opacity
            secondary: 'rgba(26, 0, 51, 0.1)', // Increased opacity
            textColor: '#FCD34D',
            buttonBg: 'rgba(255, 191, 0, 0.2)',
            buttonHoverBg: 'rgba(255, 191, 0, 0.3)',
            buttonText: '#FCD34D',
            buttonTextHover: '#FDE68A'
        },
        blue: {
            name: 'Ocean Blue',
            primary: 'blue',
            accent: 'rgba(59, 130, 246, 0.15)', // Increased opacity
            secondary: 'rgba(147, 51, 234, 0.1)', // Increased opacity
            textColor: 'rgb(147, 197, 253)',
            buttonBg: 'rgba(59, 130, 246, 0.2)',
            buttonHoverBg: 'rgba(59, 130, 246, 0.3)',
            buttonText: 'rgb(147, 197, 253)',
            buttonTextHover: 'rgb(191, 219, 254)'
        },
        emerald: {
            name: 'Forest Green',
            primary: 'emerald',
            accent: 'rgba(16, 185, 129, 0.15)', // Increased opacity
            secondary: 'rgba(59, 130, 246, 0.1)', // Increased opacity
            textColor: 'rgb(110, 231, 183)',
            buttonBg: 'rgba(16, 185, 129, 0.2)',
            buttonHoverBg: 'rgba(16, 185, 129, 0.3)',
            buttonText: 'rgb(110, 231, 183)',
            buttonTextHover: 'rgb(167, 243, 208)'
        },
        purple: {
            name: 'Royal Purple',
            primary: 'violet',
            accent: 'rgba(139, 92, 246, 0.15)', // Increased opacity
            secondary: 'rgba(236, 72, 153, 0.1)', // Increased opacity
            textColor: 'rgb(221, 214, 254)',
            buttonBg: 'rgba(139, 92, 246, 0.2)',
            buttonHoverBg: 'rgba(139, 92, 246, 0.3)',
            buttonText: 'rgb(221, 214, 254)',
            buttonTextHover: 'rgb(237, 233, 254)'
        },
        rose: {
            name: 'Rose Pink',
            primary: 'rose',
            accent: 'rgba(244, 63, 94, 0.15)', // Increased opacity
            secondary: 'rgba(139, 92, 246, 0.1)', // Increased opacity
            textColor: 'rgb(254, 205, 211)',
            buttonBg: 'rgba(244, 63, 94, 0.2)',
            buttonHoverBg: 'rgba(244, 63, 94, 0.3)',
            buttonText: 'rgb(254, 205, 211)',
            buttonTextHover: 'rgb(255, 228, 230)'
        }
    };

    // MODIFIED: Changed fill color to a darker shade for better visibility
    const defaultUserAvatar = `data:image/svg+xml;base64,${btoa(`
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 5C13.66 5 15 6.34 15 8C15 9.66 13.66 11 12 11C10.34 11 9 9.66 9 8C9 6.34 10.34 5 12 5ZM12 19.2C9.5 19.2 7.29 17.92 6 15.96C6.03 14.07 10 12.9 12 12.9C13.99 12.9 17.97 14.07 18 15.96C16.71 17.92 14.5 19.2 12 19.2Z" fill="#1F2937"/> </svg>
    `)}`;

    const getThemeStyles = () => {
        const theme = themes[currentTheme];
        const getPrimaryColor = (color) => color.startsWith('#') || color.startsWith('rgba') || color.startsWith('rgb') ? color : `${color}-500`;
        const getTextColor = (color) => color.startsWith('#') || color.startsWith('rgba') || color.startsWith('rgb') ? color : `${color}-200`;

        return {
            primaryColor: getPrimaryColor(theme.primary),
            messageBubbleBg: theme.primary.startsWith('#') || theme.primary.startsWith('rgba') || theme.primary.startsWith('rgb') ? `${theme.primary}50` : `bg-${theme.primary}-600/50`,
            textColor: theme.textColor,
            buttonBg: theme.buttonBg,
            buttonHoverBg: theme.buttonHoverBg,
            buttonText: theme.buttonText,
            buttonTextHover: theme.buttonTextHover,
            themeColorCircle: theme.primary.startsWith('#') || theme.primary.startsWith('rgba') || theme.primary.startsWith('rgb') ? theme.primary : `${theme.primary}-400`
        };
    };

    const themeStyles = getThemeStyles();

    useEffect(() => {
        if (selectedUser) {
            console.log("ChatContainer: Fetching messages for selected user:", selectedUser.fullName || selectedUser._id);
            getMessages(selectedUser._id);
        }
    }, [selectedUser, getMessages]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, isMessageLoading]);

    useEffect(() => {
        const handleMouseMove = (e) => {
            cancelAnimationFrame(animationFrameRef.current);
            animationFrameRef.current = requestAnimationFrame(() => {
                const rect = chatContainerRef.current.getBoundingClientRect();
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
    }, []);

    const handleThemeSettings = () => {
        setShowThemeTab(!showThemeTab);
        setShowEmojiTab(false);
    };

    const handleEmojiClick = () => {
        setShowEmojiTab(!showEmojiTab);
        setShowThemeTab(false);
    };

    const handleThemeChange = (themeName) => {
        setCurrentTheme(themeName);
        setShowThemeTab(false);
    };

    const handleInsertEmojiIntoInput = (emoji) => {
        if (setMessageInInput) {
            setMessageInInput(prevMessage => prevMessage + emoji);
        }
    };

    const handleQuitChat = () => {
        setSelectedUser(null);
    };

    const openFullScreenImage = (imageUrl) => {
        setFullScreenImageUrl(imageUrl);
    };

    const closeFullScreenImage = () => {
        setFullScreenImageUrl(null);
    };

    // Handle deleting conversation for both users
    const handleDeleteConversation = () => {
        setShowDeleteConfirm(true); // Show confirmation modal
    };

    const confirmDeleteConversation = async () => {
        setShowDeleteConfirm(false); // Hide confirmation modal
        if (selectedUser?.conversationId) {
            await deleteConversationForAll(selectedUser.conversationId);
        } else {
            setToast({ message: "No conversation selected to delete.", type: 'error' });
        }
    };

    if (!selectedUser) {
        return null;
    }

    return (
        <div
            ref={chatContainerRef}
            className="w-full min-h-[calc(80vh-64px)] bg-gray-800/40 border-l border-gray-700/50 rounded-lg shadow-lg text-gray-300 relative"
            style={{
                height: 'calc(100vh - 64px)',
                maxHeight: 'calc(100vh - 64px)',
                display: 'flex',
                flexDirection: 'column',
                backgroundColor: '#0f172a',
                backgroundImage: `
                    radial-gradient(600px at ${mousePosition.x} ${mousePosition.y}, ${themes[currentTheme].accent}, transparent 70%),
                    radial-gradient(300px at ${mousePosition.x} ${mousePosition.y}, ${themes[currentTheme].secondary}, transparent 80%)
                `,
                backgroundSize: 'cover',
                backgroundPosition: 'center center',
                backgroundRepeat: 'no-repeat',
                transition: 'background-image 0.05s ease-out',
            }}
        >
            {/* Full Screen Image Modal */}
            {fullScreenImageUrl && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80 backdrop-blur-sm"
                    onClick={closeFullScreenImage}
                >
                    <button
                        onClick={closeFullScreenImage}
                        className="absolute top-4 right-4 text-white text-3xl z-50 p-2 rounded-full bg-gray-800/50 hover:bg-gray-700/70 transition-colors"
                        aria-label="Close image"
                    >
                        <X size={24} />
                    </button>
                    <img
                        src={fullScreenImageUrl}
                        alt="Full Screen Preview"
                        className="max-w-[90%] max-h-[90%] object-contain"
                        onClick={(e) => e.stopPropagation()}
                    />
                </div>
            )}

            {/* Theme Tab */}
            {showThemeTab && (
                <div className="absolute top-16 right-4 z-50 bg-gray-900/95 backdrop-blur-sm border border-gray-600/30 rounded-xl p-5 shadow-2xl min-w-72">
                    <div className="flex items-center justify-between mb-5">
                        <h3 className="text-lg font-semibold text-white flex items-center gap-3">
                            <Palette size={20} className="text-gray-300" />
                            Choose Theme
                        </h3>
                        <button
                            onClick={() => setShowThemeTab(false)}
                            className="text-gray-700 hover:text-white transition-colors p-1 rounded-md hover:bg-gray-700/50"
                        >
                            <X size={20} />
                        </button>
                    </div>
                    <div className="space-y-3">
                        {Object.entries(themes).map(([key, theme]) => (
                            <button
                                key={key}
                                onClick={() => handleThemeChange(key)}
                                className={`w-full text-left p-4 rounded-xl transition-all flex items-center gap-4 border ${currentTheme === key
                                    ? `bg-gray-800/80 border-gray-500/50 shadow-lg`
                                    : 'bg-gray-800/40 hover:bg-gray-700/60 border-gray-700/30 hover:border-gray-600/50'
                                    }`}
                            >
                                <div className={`w-5 h-5 rounded-full`}
                                    style={{ backgroundColor: (themes[key].primary.startsWith('#') || themes[key].primary.startsWith('rgba') || themes[key].primary.startsWith('rgb')) ? themes[key].primary : themes[key].primary + '-400' }}
                                ></div>
                                <span className={`text-base font-medium ${currentTheme === key ? 'text-white' : 'text-gray-200'}`}>
                                    {theme.name}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Emoji Tab */}
            {showEmojiTab && (
                <div className="absolute bottom-20 right-4 z-50 bg-gray-900/95 backdrop-blur-sm border border-gray-600/30 rounded-xl p-5 shadow-2xl w-96 max-h-[420px] overflow-y-auto custom-scrollbar">
                    <div className="flex items-center justify-between mb-5">
                        <h3 className="text-lg font-semibold" style={{ color: themeStyles.buttonText }}>Choose Emoji</h3>
                        <button
                            onClick={() => setShowEmojiTab(false)}
                            className="text-gray-700 hover:text-white transition-colors p-1 rounded-md hover:bg-gray-700/50"
                        >
                            <X size={20} />
                        </button>
                    </div>
                    <div className="space-y-6">
                        {Object.entries(emojiCategories).map(([category, emojis]) => (
                            <div key={category}>
                                <h4 className="text-sm font-semibold text-gray-300 mb-3 capitalize tracking-wide">{category.replace(/([A-Z])/g, ' $1').trim()}</h4>
                                <div className="grid grid-cols-8 gap-1">
                                    {emojis.map((emoji, index) => (
                                        <button
                                            key={index}
                                            onClick={() => handleInsertEmojiIntoInput(emoji)}
                                            className="p-2 rounded-lg hover:bg-gradient-to-br hover:from-gray-700/30 hover:to-gray-600/40 transition-all duration-200 text-xl hover:scale-110 active:scale-95"
                                            style={{
                                                background: 'linear-gradient(135deg, rgba(75, 85, 99, 0.1), rgba(55, 65, 81, 0.2))'
                                            }}
                                        >
                                            {emoji}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 backdrop-blur-sm">
                    <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 shadow-xl text-center max-w-sm mx-auto">
                        <h3 className="text-lg font-semibold text-white mb-4">Delete Conversation?</h3>
                        <p className="text-gray-300 mb-6">This action will permanently delete this conversation and all its messages for both users. This cannot be undone.</p>
                        <div className="flex justify-center gap-4">
                            <button
                                onClick={() => setShowDeleteConfirm(false)}
                                className="px-5 py-2 rounded-md text-gray-300 bg-gray-700 hover:bg-gray-600 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmDeleteConversation}
                                className="px-5 py-2 rounded-md text-white bg-red-600 hover:bg-red-700 transition-colors"
                            >
                                Delete for Both
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Chat Header - Fixed Height */}
            <div className="flex items-center justify-between p-4 border-b border-gray-700/50 bg-gray-800/60 rounded-t-lg backdrop-blur-sm flex-shrink-0">
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
                        <span className="font-semibold text-lg" style={{ color: themeStyles.textColor }}>{selectedUser.fullName || 'Unknown User'}</span>
                        <span className={`text-sm ${selectedUser.isOnline ? 'text-green-400' : 'text-gray-500'}`}>
                            {selectedUser.isOnline ? 'Online' : 'Offline'}
                        </span>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {/* Delete Conversation Button */}
                    <button
                        onClick={handleDeleteConversation}
                        className="p-2 rounded-full bg-red-500/20 text-red-400 hover:bg-red-500/30 hover:text-red-300 transition-all duration-200"
                        aria-label="Delete Conversation"
                        title="Delete Conversation"
                    >
                        <Trash2 size={18} />
                    </button>

                    <button
                        onClick={handleThemeSettings}
                        className="p-2 rounded-full transition-all duration-200"
                        style={showThemeTab
                            ? { backgroundColor: themeStyles.buttonHoverBg, color: themeStyles.buttonTextHover }
                            : { backgroundColor: themeStyles.buttonBg, color: themeStyles.buttonText }}
                        aria-label="Theme Settings"
                    >
                        <MoreVertical size={18} />
                    </button>
                    <button
                        onClick={handleQuitChat}
                        className="p-2 rounded-full bg-red-500/20 text-red-400 hover:bg-red-500/30 hover:text-red-300 transition-all duration-200"
                        aria-label="Quit Chat"
                    >
                        <XCircle size={18} />
                    </button>
                </div>
            </div>

            {/* Message Area - Flexible height with scroll */}
            <div
                ref={messagesContainerRef}
                className="flex-1 p-4 space-y-4 overflow-y-auto min-h-0"
                style={{
                    scrollbarWidth: 'thin',
                    scrollbarColor: '#4B5563 #1F2937'
                }}
            >
                {isMessageLoading ? (
                    <div className="flex justify-center items-center h-full">
                        <Loader2 className="animate-spin size-8" style={{ color: themeStyles.primaryColor }} />
                        <p className="ml-3 text-gray-400">Loading messages...</p>
                    </div>
                ) : messages.length > 0 ? (
                    messages.map((message) => {
                        const isMyMessage = message.senderId === authUser._id;
                        return (
                            <ChatMessage
                                key={message._id}
                                message={message}
                                isMyMessage={isMyMessage}
                                senderProfilePicture={isMyMessage ? authUser.profilePicture || defaultUserAvatar : selectedUser.profilePicture || defaultUserAvatar}
                                defaultUserAvatar={defaultUserAvatar}
                                themeStyles={themeStyles}
                                openFullScreenImage={openFullScreenImage}
                                messagesContainerRef={messagesContainerRef}
                            />
                        );
                    })
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-gray-500 text-center">
                        <MessageSquare size={48} className="mb-4" />
                        <p className="text-lg">Say hello to {selectedUser.fullName}!</p>
                        <p className="text-sm">Your conversation starts here.</p>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Message Input Area - Fixed at bottom */}
            <div className="flex-shrink-0 p-4 border-t border-gray-700/50 bg-gray-800/60 rounded-b-lg backdrop-blur-sm">
                <MessageInput
                    handleEmojiClick={handleEmojiClick}
                    setSetMessageInInput={setSetMessageInInput}
                    showEmojiTab={showEmojiTab}
                    themeStyles={themeStyles}
                />
            </div>
        </div>
    );
};

export default ChatContainer;