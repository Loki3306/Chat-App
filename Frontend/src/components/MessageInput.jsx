import React, { useState, useRef, useEffect } from "react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import { X, Paperclip, Smile, Send } from 'lucide-react';

const MessageInput = ({ handleEmojiClick, setSetMessageInInput, showEmojiTab, themeStyles }) => {
    const [message, setMessage] = useState("");
    const { sendMessage, selectedUser } = useChatStore();

    const inputRef = useRef(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);
    const fileInputRef = useRef(null);

    useEffect(() => {
        if (setSetMessageInInput) {
            setSetMessageInInput(() => setMessage);
        }
    }, [setSetMessageInInput]);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
            if (file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onloadend = () => {
                    setImagePreview(reader.result);
                };
                reader.readAsDataURL(file);
            } else {
                setImagePreview(null);
            }
        } else {
            setImagePreview(null);
            setSelectedFile(null);
        }
    };

    const removeAttachment = () => {
        setImagePreview(null);
        setSelectedFile(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();

        if (!message.trim() && !selectedFile) {
            return;
        }

        await sendMessage(selectedUser._id, message, selectedFile);

        setMessage("");
        removeAttachment();
        inputRef.current.focus();
    };

    return (
        <div className="relative z-10">
            {/* Image Preview Above Input - Left Side */}
            {(imagePreview || selectedFile) && (
                <div className="px-4 pb-2">
                    <div className="inline-block relative">
                        <div className="w-20 h-20 rounded-xl overflow-hidden border-2 border-gray-600 bg-gray-700/70 shadow-lg backdrop-blur-sm">
                            {imagePreview ? (
                                <img 
                                    src={imagePreview} 
                                    alt="Preview" 
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="flex flex-col items-center justify-center w-full h-full text-gray-300 text-xs p-2">
                                    <Paperclip size={20} className="mb-1" />
                                    <span className="text-center leading-tight truncate w-full" title={selectedFile?.name}>
                                        {selectedFile?.name}
                                    </span>
                                </div>
                            )}
                        </div>
                        
                        {/* Cross button positioned outside the preview box */}
                        <button
                            onClick={removeAttachment}
                            className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1.5 transition-all duration-200 shadow-lg border-2 border-gray-800 hover:scale-110"
                            aria-label="Remove attachment"
                            title="Remove attachment"
                        >
                            <X size={14} strokeWidth={2.5} />
                        </button>
                    </div>
                </div>
            )}

            {/* Input Area */}
            <div className="p-4 border-t border-gray-700/50 bg-gray-800/60 rounded-b-lg flex items-center space-x-3 backdrop-blur-sm">
                {/* Attachment Button */}
                <button
                    type="button"
                    onClick={() => fileInputRef.current.click()}
                    className={`p-2 rounded-full transition-all duration-200 hover:scale-105`}
                    style={{ backgroundColor: themeStyles.buttonBg, color: themeStyles.buttonText }}
                    aria-label="Attach File"
                >
                    <Paperclip size={18} />
                </button>
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                />

                {/* Message Input Field */}
                <input
                    type="text"
                    ref={inputRef}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage(e)}
                    placeholder="Type a message..."
                    className={`flex-1 p-3 rounded-lg bg-gray-700/50 border border-gray-600 text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 transition-all duration-200`}
                    style={{borderColor: themeStyles.primaryColor, '--tw-ring-color': themeStyles.primaryColor}}
                />
                
                {/* Emoji Button */}
                <button
                    type="button"
                    onClick={handleEmojiClick}
                    className={`p-2 rounded-full transition-all duration-200 hover:scale-105`}
                    style={showEmojiTab
                        ? { backgroundColor: themeStyles.buttonHoverBg, color: themeStyles.buttonTextHover }
                        : { backgroundColor: themeStyles.buttonBg, color: themeStyles.buttonText }}
                    aria-label="Emoji"
                >
                    {showEmojiTab ? <X size={18} /> : <Smile size={18} />}
                </button>
                
                {/* Send Button */}
                <button
                    onClick={handleSendMessage}
                    className={`p-3 rounded-full text-gray-900 transition-all transform hover:scale-105 shadow-lg`}
                    style={{ backgroundColor: themeStyles.primaryColor }}
                    aria-label="Send message"
                >
                    <Send size={18} />
                </button>
            </div>
        </div>
    );
};

export default MessageInput;