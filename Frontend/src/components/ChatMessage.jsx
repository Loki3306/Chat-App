// frontend/src/components/ChatMessage.jsx

import React, { useState, useRef, useEffect, forwardRef } from 'react'; // Import forwardRef
import { useChatStore } from '../store/useChatStore.js';
import { useAuthStore } from '../store/useAuthStore.js';
import { MoreHorizontal, Trash2, Edit, FileText, Image as ImageIcon } from 'lucide-react';

// Use forwardRef to receive the messagesContainerRef properly
const ChatMessage = forwardRef(({ message, isMyMessage, senderProfilePicture, defaultUserAvatar, themeStyles, openFullScreenImage, messagesContainerRef }, ref) => { // Added `ref` here
    const { deleteMessage, editMessage } = useChatStore();
    const { setToast } = useAuthStore();

    const [showOptions, setShowOptions] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editedText, setEditedText] = useState(message.text || '');
    const optionsRef = useRef(null); // Ref for the dropdown menu container
    const messageBubbleRef = useRef(null); // Ref for the entire message bubble div
    const [dropdownDirection, setDropdownDirection] = useState('up'); // 'up' (bottom-full) or 'down' (top-full)

    const hasText = message.text && message.text.trim().length > 0;
    const hasImage = message.image && message.image.trim().length > 0;
    const hasFile = message.fileUrl && message.fileUrl.trim().length > 0;

    // Effect to close the options menu when clicking anywhere outside it
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (optionsRef.current && !optionsRef.current.contains(event.target)) {
                setShowOptions(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    // Effect to calculate dropdown direction based on message bubble position
    useEffect(() => {
        // Ensure both refs are available before proceeding
        if (!messageBubbleRef.current || !messagesContainerRef.current || !showOptions) return;

        const messageRect = messageBubbleRef.current.getBoundingClientRect();
        const containerRect = messagesContainerRef.current.getBoundingClientRect();

        const dropdownApproxHeight = 80;
        const spaceAbove = messageRect.top - containerRect.top;
        const spaceBelow = containerRect.bottom - messageRect.bottom;

        if (spaceBelow > spaceAbove || spaceAbove < dropdownApproxHeight) {
            setDropdownDirection('down');
        } else {
            setDropdownDirection('up');
        }
    }, [showOptions, messagesContainerRef, message.text, message.image, message.fileUrl]);


    const handleMessageDelete = async () => {
        setShowOptions(false);
        try {
            await deleteMessage(message._id);
        } catch (error) {
            console.error("Error initiating message delete:", error);
        }
    };

    const handleMessageEdit = () => {
        setShowOptions(false);
        setIsEditing(true);
    };

    const handleSaveEdit = async () => {
        if (editedText.trim() === (message.text || '').trim()) {
            setIsEditing(false);
            return;
        }
        if (editedText.trim() === "" && !message.image && !message.fileUrl) {
            setToast({ message: "Message text cannot be empty if it has no attachments.", type: 'error' });
            return;
        }
        try {
            await editMessage(message._id, editedText.trim());
            setIsEditing(false);
        } catch (error) {
            console.error("Failed to edit message:", error);
        }
    };

    const handleCancelEdit = () => {
        setIsEditing(false);
        setEditedText(message.text || '');
    };

    const showMessageOptions = isMyMessage;

    return (
        <div
            className={`flex items-end gap-2 ${isMyMessage ? 'justify-end' : 'justify-start'}`}
            ref={messageBubbleRef} // Attach ref to the message bubble container
        >
            {/* Sender's Avatar (for messages not sent by me) */}
            {!isMyMessage && (
                <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
                    <img
                        src={senderProfilePicture}
                        alt="Sender Avatar"
                        className="w-full h-full object-cover"
                        onError={(e) => { e.target.onerror = null; e.target.src = defaultUserAvatar; }}
                    />
                </div>
            )}
            
            {/* Message Bubble Content */}
            <div
                className={`flex flex-col gap-1 max-w-[70%] p-2 rounded-xl shadow-md ${
                    isMyMessage
                        ? 'text-white rounded-br-none'
                        : 'bg-gray-700/50 text-gray-200 rounded-bl-none'
                }`}
                style={
                    isMyMessage
                        ? { backgroundColor: themeStyles.messageBubbleBg }
                        : { backgroundColor: 'rgba(75, 85, 99, 0.5)' }
                }
            >
                {/* Image Attachment Display */}
                {hasImage && (
                    <div className="relative w-52 h-40 rounded-lg overflow-hidden cursor-pointer shadow-sm">
                        <img
                            src={message.image}
                            alt="Message Attachment"
                            className="w-full h-full object-cover rounded-lg transform transition-transform duration-200 hover:scale-105"
                            onClick={() => openFullScreenImage(message.image)}
                        />
                    </div>
                )}
                {/* General File Attachment Display */}
                {hasFile && !hasImage && (
                    <a
                        href={message.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 p-2 bg-gray-600/50 rounded-md text-blue-300 hover:underline hover:bg-gray-600/70 transition-colors w-full"
                    >
                        {message.fileType?.startsWith('image/') ? <ImageIcon size={16} /> : <FileText size={16} />}
                        <span className="truncate flex-1">{message.fileName || 'Attached File'}</span>
                    </a>
                )}
                
                {/* Message Text (Editable if in edit mode, otherwise static) */}
                {isEditing ? (
                    <div className="flex flex-col w-full">
                        <textarea
                            value={editedText}
                            onChange={(e) => setEditedText(e.target.value)}
                            className="w-full p-2 rounded-lg bg-gray-700 text-gray-200 border border-gray-600 focus:outline-none focus:ring-1 focus:ring-blue-500"
                            rows="2"
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSaveEdit();
                                }
                            }}
                        />
                        <div className="flex justify-end gap-2 mt-2">
                            <button
                                onClick={handleCancelEdit}
                                className="px-3 py-1 rounded-md text-gray-300 bg-gray-600 hover:bg-gray-700 transition-colors text-sm"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSaveEdit}
                                className="px-3 py-1 rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors text-sm"
                            >
                                Save
                            </button>
                        </div>
                    </div>
                ) : (
                    hasText && (
                        <p className="text-sm px-1 pt-1 break-words">{message.text}</p>
                    )
                )}
                
                {/* Message Timestamp and Options Button Container */}
                <div className="flex items-center justify-end text-xs mt-1 w-full relative">
                    <span
                        className={`text-gray-400`}
                    >
                        {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        {message.edited && <span className="ml-1 text-gray-400">(edited)</span>}
                    </span>
                    
                    {/* Message Options Dropdown (only for my messages) */}
                    {showMessageOptions && !isEditing && (
                        <div className="relative" ref={optionsRef}>
                            <button
                                onClick={() => setShowOptions(!showOptions)}
                                className="ml-2 p-1.5 rounded-full text-gray-300 bg-gray-800/60 hover:bg-gray-700/80 hover:text-white transition-all duration-200 focus:outline-none focus:ring-1 focus:ring-gray-500"
                                aria-label="Message options"
                            >
                                <MoreHorizontal size={16} />
                            </button>
                            {showOptions && (
                                <div className={`absolute right-0 w-36 bg-gray-800 border border-gray-700 rounded-lg shadow-xl overflow-hidden z-20
                                    ${dropdownDirection === 'up' ? 'bottom-full mb-2.5' : 'top-full mt-2.5'}`}
                                >
                                    <button
                                        onClick={handleMessageEdit}
                                        className="flex items-center gap-3 w-full px-4 py-2.5 text-sm font-medium text-gray-200 hover:bg-gray-700 hover:text-white transition-colors"
                                    >
                                        <Edit size={16} /> Edit
                                    </button>
                                    <button
                                        onClick={handleMessageDelete}
                                        className="flex items-center gap-3 w-full px-4 py-2.5 text-sm font-medium text-red-400 hover:bg-red-600 hover:text-white transition-colors"
                                    >
                                        <Trash2 size={16} /> Delete
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
            {/* Receiver's Avatar (for messages sent by me) */}
            {isMyMessage && (
                <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
                    <img
                        src={senderProfilePicture}
                        alt="Sender Avatar"
                        className="w-full h-full object-cover"
                        onError={(e) => { e.target.onerror = null; e.target.src = defaultUserAvatar; }}
                    />
                </div>
            )}
        </div>
    );
}); // Wrapped with forwardRef

export default ChatMessage;