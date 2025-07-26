import React, { useEffect, useRef, useState } from 'react';
import { useChatStore } from '../store/useChatStore.js';
import { useAuthStore } from '../store/useAuthStore.js';
import { Send, Smile, Paperclip, MoreVertical, XCircle, Loader2, MessageSquare, Palette, X } from 'lucide-react';
import { emojiCategories } from '../components/emojiData.js'; // Import emoji data

const ChatContainer = () => {
    // Destructure states and actions from useChatStore based on your provided component
    const { messages, getMessages, isMessageLoading, selectedUser, setSelectedUser } = useChatStore();
    const { authUser } = useAuthStore(); // Get current authenticated user

    const [newMessage, setNewMessage] = useState('');
    const [showThemeTab, setShowThemeTab] = useState(false);
    const [showEmojiTab, setShowEmojiTab] = useState(false);
    const [currentTheme, setCurrentTheme] = useState('amber'); // Default theme

    const messagesEndRef = useRef(null);
    const attachmentInputRef = useRef(null);
    const chatContainerRef = useRef(null);

    // State to hold mouse coordinates for the interactive background
    const [mousePosition, setMousePosition] = useState({ x: '50%', y: '50%' });
    const animationFrameRef = useRef(0);

    // Theme configurations
    const themes = {
        amber: {
            name: 'Midnight Amber',
            primary: '#FFBF00', // Bright amber
            accent: '#333333', // Dark grey for a strong, muted accent
            secondary: '#1A0033' // Very dark, almost black purple for secondary
        },
        blue: {
            name: 'Ocean Blue',
            primary: 'blue',
            accent: 'rgba(59, 130, 246, 0.05)',
            secondary: 'rgba(147, 51, 234, 0.03)'
        },
        emerald: {
            name: 'Forest Green',
            primary: 'emerald',
            accent: 'rgba(16, 185, 129, 0.05)',
            secondary: 'rgba(59, 130, 246, 0.03)'
        },
        purple: {
            name: 'Royal Purple',
            primary: 'violet',
            accent: 'rgba(139, 92, 246, 0.05)',
            secondary: 'rgba(236, 72, 153, 0.03)'
        },
        rose: {
            name: 'Rose Pink',
            primary: 'rose',
            accent: 'rgba(244, 63, 94, 0.05)',
            secondary: 'rgba(139, 92, 246, 0.03)'
        }
    };

    // Default avatar
    const defaultUserAvatar = `data:image/svg+xml;base64,${btoa(`
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 5C13.66 5 15 6.34 15 8C15 9.66 13.66 11 12 11C10.34 11 9 9.66 9 8C9 6.34 10.34 5 12 5ZM12 19.2C9.5 19.2 7.29 17.92 6 15.96C6.03 14.07 10 12.9 12 12.9C13.99 12.9 17.97 14.07 18 15.96C16.71 17.92 14.5 19.2 12 19.2Z" fill="#9CA3AF"/>
        </svg>
    `)}`;

    // Get theme-specific classes
    const getThemeClasses = () => {
        const theme = themes[currentTheme];
        return {
            primary: `${theme.primary.includes('#') ? '' : theme.primary}-300`,
            primaryHover: `${theme.primary.includes('#') ? '' : theme.primary}-400`,
            primaryBg: `${theme.primary.includes('#') ? '' : theme.primary}-600/50`,
            text: `${theme.primary.includes('#') ? '' : theme.primary}-200`,
            button: `${theme.primary.includes('#') ? '' : theme.primary}-500/20`,
            buttonHover: `${theme.primary.includes('#') ? '' : theme.primary}-400/30`,
            buttonText: `${theme.primary.includes('#') ? '' : theme.primary}-300`,
            buttonTextHover: `${theme.primary.includes('#') ? '' : theme.primary}-200`
        };
    };

    const themeClasses = getThemeClasses();

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

    // Mouse movement effect for dynamic background
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

    const handleSendMessage = (e) => {
        if (e.type === 'keydown' && e.key !== 'Enter') return;
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

    const handleThemeSettings = () => {
        setShowThemeTab(!showThemeTab);
        setShowEmojiTab(false); // Close emoji tab if theme tab opens
    };

    const handleEmojiClick = () => {
        setShowEmojiTab(!showEmojiTab);
        setShowThemeTab(false); // Close theme tab if emoji tab opens
    };

    const handleThemeChange = (themeName) => {
        setCurrentTheme(themeName);
        setShowThemeTab(false);
    };

    const insertEmoji = (emoji) => {
        setNewMessage(prev => prev + emoji);
        // Optionally close the emoji tab after selection, uncomment if desired:
        // setShowEmojiTab(false);
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

    const handleQuitChat = () => {
        setSelectedUser(null);
    };

    if (!selectedUser) {
        return null;
    }

    return (
        <div
            ref={chatContainerRef}
            className="chat-container-main flex flex-col h-full border-l border-gray-700/50 rounded-lg shadow-lg relative overflow-hidden"
            style={{
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
                                <div className={`w-5 h-5 rounded-full ${theme.primary.startsWith('#') ? '' : `bg-${theme.primary}-400`}`}
                                    style={theme.primary.startsWith('#') ? { backgroundColor: theme.primary } : {}}
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
                <div className="absolute bottom-20 right-4 z-50 bg-gray-900/95 backdrop-blur-sm border border-gray-600/30 rounded-xl p-5 shadow-2xl w-96 max-h-[420px] overflow-y-auto">
                    <div className="flex items-center justify-between mb-5">
                        <h3 className="text-lg font-semibold text-amber-300">Choose Emoji</h3>
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
                                            onClick={() => insertEmoji(emoji)}
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
                        <span className={`font-semibold text-${themeClasses.text} text-lg`}>{selectedUser.fullName || 'Unknown User'}</span>
                        <span className={`text-sm ${selectedUser.isOnline ? 'text-green-400' : 'text-gray-500'}`}>
                            {selectedUser.isOnline ? 'Online' : 'Offline'}
                        </span>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={handleThemeSettings}
                        className={`p-2 rounded-full transition-all duration-200 ${showThemeTab
                            ? `bg-${themeClasses.buttonHover} text-${themeClasses.buttonTextHover}`
                            : `bg-${themeClasses.button} text-${themeClasses.buttonText} hover:bg-${themeClasses.buttonHover} hover:text-${themeClasses.buttonTextHover}`
                            }`}
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

            {/* Message Area */}
            <div className="relative z-10 flex-1 p-4 overflow-y-auto space-y-4 custom-scrollbar">
                {isMessageLoading ? (
                    <div className="flex justify-center items-center h-full">
                        <Loader2 className={`animate-spin size-8 ${themeClasses.primary.startsWith('#') ? 'text-amber-300' : `text-${themeClasses.primary}`}`} />
                        <p className="ml-3 text-gray-400">Loading messages...</p>
                    </div>
                ) : messages.length > 0 ? (
                    messages.map((message) => (
                        <div
                            key={message._id}
                            className={`flex ${message.senderId === authUser._id ? 'justify-end' : 'justify-start'}`}
                        >
                            <div className={`flex items-end max-w-[70%] p-3 rounded-xl shadow-md ${message.senderId === authUser._id
                                ? `bg-${themeClasses.primaryBg} text-white rounded-br-none`
                                : 'bg-gray-700/50 text-gray-200 rounded-bl-none'
                                }`}
                                style={message.senderId === authUser._id && themeClasses.primaryBg.startsWith('#') ? { backgroundColor: themes[currentTheme].primary + '50' } : {}}
                            >
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
                <div ref={messagesEndRef} />
            </div>

            {/* Message Input Area */}
            <div
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage(e)}
                className="relative z-10 p-4 border-t border-gray-700/50 bg-gray-800/60 rounded-b-lg flex items-center space-x-3 backdrop-blur-sm"
            >
                <button
                    type="button"
                    onClick={handleAttachmentClick}
                    className={`p-2 rounded-full bg-${themeClasses.button} text-${themeClasses.buttonText} hover:bg-${themeClasses.buttonHover} hover:text-${themeClasses.buttonTextHover} transition-all duration-200`}
                    style={themeClasses.button.startsWith('#') ? { backgroundColor: themes[currentTheme].primary + '20', color: themes[currentTheme].primary + '30' } : {}}
                >
                    <Paperclip size={18} />
                </button>
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
                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage(e)}
                    placeholder="Type a message..."
                    className={`flex-1 p-3 rounded-lg bg-gray-700/50 border border-gray-600 text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-1 ${themeClasses.primary.startsWith('#') ? 'focus:ring-amber-500' : `focus:ring-${themeClasses.primary}`} transition-all`}
                />
                <button
                    type="button"
                    onClick={handleEmojiClick}
                    className={`p-2 rounded-full transition-all duration-200 ${showEmojiTab
                        ? `bg-${themeClasses.buttonHover} text-${themeClasses.buttonTextHover}`
                        : `bg-${themeClasses.button} text-${themeClasses.buttonText} hover:bg-${themeClasses.buttonHover} hover:text-${themeClasses.buttonTextHover}`
                        }`}
                    style={showEmojiTab ? (themeClasses.buttonHover.startsWith('#') ? { backgroundColor: themes[currentTheme].primary + '30', color: themes[currentTheme].primary + '20' } : {}) : (themeClasses.button.startsWith('#') ? { backgroundColor: themes[currentTheme].primary + '20', color: themes[currentTheme].primary + '30' } : {})}
                >
                    {showEmojiTab ? <X size={18} /> : <Smile size={18} />} {/* Conditional rendering for the icon */}
                </button>
                <button
                    onClick={handleSendMessage}
                    className={`p-3 rounded-full ${themeClasses.primary.startsWith('#') ? '' : `bg-${themeClasses.primary}`} text-gray-900 hover:${themeClasses.primaryHover.startsWith('#') ? '' : `bg-${themeClasses.primaryHover}`} transition-all transform hover:scale-105 shadow-lg`}
                    style={themeClasses.primary.startsWith('#') ? { backgroundColor: themes[currentTheme].primary } : {}}
                >
                    <Send size={18} />
                </button>
            </div>
        </div>
    );
};

export default ChatContainer;