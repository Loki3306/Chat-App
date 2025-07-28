// frontend/src/pages/SettingsPage.jsx (or wherever you place it)

import React, { useState, useEffect } from 'react';
import {
    ChevronLeft,
    User,
    Palette,
    Bell,
    Lock,
    Globe,
    CreditCard,
    Info,
    LogOut,
    CheckCircle,
    XCircle,
    Moon, // Not used but kept for potential future Dark Mode toggle
    Sun,  // Not used but kept for potential future Light Mode toggle
    Volume2,
    VolumeX,
    MessageSquare,
    Link,
    Trash2,
    Download,
    Eye,      // Not used, but common for password visibility
    EyeOff,   // Not used, but common for password visibility
    Edit,
    Key,
    Save,
    Upload,
    ArrowUpFromLine, // Not used, but good for upload actions
    Shield,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore.js';
// Removed: import { useChatStore } from '../store/useChatStore.js'; // No longer needed for 'themes'
import { themes } from '../utils/themes.js'; // Corrected import: 'themes' is now a direct import from a shared file

const SettingsPage = () => {
    const navigate = useNavigate();
    const { authUser, updateAuthUser, logout, setToast, clearToast } = useAuthStore();

    // State for various settings
    const [activeSection, setActiveSection] = useState('general'); // To navigate between sections
    // Ensure selectedTheme has a default value that exists in the imported 'themes' object
    const [selectedTheme, setSelectedTheme] = useState(authUser?.settings?.theme || 'amber');
    const [notificationsEnabled, setNotificationsEnabled] = useState(authUser?.settings?.notificationsEnabled ?? true);
    const [soundNotificationsEnabled, setSoundNotificationsEnabled] = useState(authUser?.settings?.soundNotificationsEnabled ?? true);
    const [messagePreviewsEnabled, setMessagePreviewsEnabled] = useState(authUser?.settings?.messagePreviewsEnabled ?? true);
    const [language, setLanguage] = useState(authUser?.settings?.language || 'en'); // Example for future use
    const [newUsername, setNewUsername] = useState(authUser?.fullName || '');
    const [newProfilePicture, setNewProfilePicture] = useState(null); // For file upload preview
    const [privacyProfileVisibility, setPrivacyProfileVisibility] = useState(authUser?.settings?.privacyProfileVisibility || 'everyone');
    const [showPasswordChange, setShowPasswordChange] = useState(false);
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');
    const [twoFactorAuthEnabled, setTwoFactorAuthEnabled] = useState(authUser?.settings?.twoFactorAuthEnabled ?? false);
    const [showDeleteAccountConfirm, setShowDeleteAccountConfirm] = useState(false);

    // Default avatar for consistency (kept as is)
    const defaultUserAvatar = `data:image/svg+xml;base64,${btoa(`
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 5C13.66 5 15 6.34 15 8C15 9.66 13.66 11 12 11C10.34 11 9 9.66 9 8C9 6.34 10.34 5 12 5ZM12 19.2C9.5 19.2 7.29 17.92 6 15.96C6.03 14.07 10 12.9 12 12.9C13.99 12.9 17.97 14.07 18 15.96C16.71 17.92 14.5 19.2 12 19.2Z" fill="#1F2937"/> </svg>
    `)}`;

    // Re-use theme styles logic. 'themes' is now available directly from import.
    const getThemeStyles = (themeName) => {
        // Defensive check: Ensure the theme exists before trying to access its properties
        const theme = themes[themeName];
        if (!theme) {
            console.warn(`Theme "${themeName}" not found. Falling back to 'amber'.`);
            // Recursively call with a safe default if the requested theme isn't found
            return getThemeStyles('amber');
        }

        const getPrimaryColor = (color) => color.startsWith('#') || color.startsWith('rgba') || color.startsWith('rgb') ? color : `${color}-500`;
        return {
            primaryColor: getPrimaryColor(theme.primary),
            textColor: theme.textColor,
            buttonBg: theme.buttonBg,
            buttonHoverBg: theme.buttonHoverBg,
            buttonText: theme.buttonText,
            buttonTextHover: theme.buttonTextHover,
            themeColorCircle: theme.primary.startsWith('#') || theme.primary.startsWith('rgba') || theme.primary.startsWith('rgb') ? theme.primary : `${theme.primary}-400`
        };
    };

    const themeStyles = getThemeStyles(selectedTheme);

    // Save settings (placeholder for API call)
    const handleSaveSettings = async (settingType) => {
        clearToast();
        // In a real application, you'd send this data to your backend
        console.log(`Saving ${settingType} settings...`);
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 800));

            // Update authUser in store (optimistic update)
            const updatedSettings = { ...authUser.settings };
            let successMessage = `Settings saved!`;

            if (settingType === 'appearance') {
                updatedSettings.theme = selectedTheme;
                successMessage = "Theme updated!";
            } else if (settingType === 'notifications') {
                updatedSettings.notificationsEnabled = notificationsEnabled;
                updatedSettings.soundNotificationsEnabled = soundNotificationsEnabled;
                updatedSettings.messagePreviewsEnabled = messagePreviewsEnabled;
                successMessage = "Notification settings updated!";
            } else if (settingType === 'profile') {
                // If the username actually changed, update it.
                if (authUser.fullName !== newUsername) {
                    updatedSettings.fullName = newUsername; // Update full name
                }
                // In a real app, 'newProfilePicture' would be a URL after upload, not base64 directly
                // For this example, we're just updating the local store's picture for display.
                if (newProfilePicture) {
                    // This is for display; actual upload logic would be in handleProfilePictureUpload
                    // and then you'd update authUser.profilePicture with the *returned URL* from the server.
                    // For now, we'll assume the local state is what we update.
                }

                successMessage = "Profile updated!";
            } else if (settingType === 'privacy') {
                updatedSettings.privacyProfileVisibility = privacyProfileVisibility;
                successMessage = "Privacy settings updated!"; // Corrected variable name from updatedMessage
            } else if (settingType === 'security') {
                updatedSettings.twoFactorAuthEnabled = twoFactorAuthEnabled;
                successMessage = "Security settings updated!";
            }

            // Update the authUser in your global state (e.g., useAuthStore)
            // Ensure you're passing an object that matches your authUser structure
            updateAuthUser({
                ...authUser,
                fullName: newUsername, // Always update fullName if it's part of authUser direct properties
                profilePicture: newProfilePicture || authUser?.profilePicture, // Use new picture if uploaded
                settings: updatedSettings
            });
            setToast({ message: successMessage, type: 'success' });
        } catch (error) {
            console.error("Failed to save settings:", error);
            setToast({ message: "Failed to save settings.", type: 'error' });
        }
    };

    const handleChangePassword = async () => {
        clearToast();
        if (newPassword !== confirmNewPassword) {
            setToast({ message: "New passwords do not match.", type: 'error' });
            return;
        }
        if (newPassword.length < 6) { // Basic validation
            setToast({ message: "Password must be at least 6 characters long.", type: 'error' });
            return;
        }
        if (!currentPassword) {
            setToast({ message: "Please enter your current password.", type: 'error' });
            return;
        }
        console.log("Changing password...", { currentPassword, newPassword });
        try {
            // Simulate API call to change password
            // In a real app, you'd send currentPassword and newPassword to your backend for verification and update
            await new Promise(resolve => setTimeout(resolve, 1500));
            setToast({ message: "Password changed successfully!", type: 'success' });
            setCurrentPassword('');
            setNewPassword('');
            setConfirmNewPassword('');
            setShowPasswordChange(false);
        } catch (error) {
            setToast({ message: "Failed to change password. Please check your current password.", type: 'error' });
            console.error("Password change failed:", error);
        }
    };

    const handleProfilePictureUpload = async (e) => {
        const file = e.target.files[0];
        if (file) {
            console.log("Uploading profile picture:", file.name);
            // In a real app, you'd upload this file to a server (e.g., Cloudinary, S3)
            // and then update the user's profilePicture URL in your DB.
            try {
                // Simulate upload with FileReader for instant preview
                const reader = new FileReader();
                reader.onloadend = async () => {
                    setNewProfilePicture(reader.result); // Set preview (base64 string)
                    // In a real application, you would send 'file' to your backend,
                    // and the backend would return a public URL.
                    // For this example, we're just simulating success and updating the local store directly with the base64 preview.
                    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay
                    updateAuthUser({ ...authUser, profilePicture: reader.result }); // Update authUser's profilePicture in store
                    setToast({ message: "Profile picture updated!", type: 'success' });
                };
                reader.readAsDataURL(file); // Reads the file as a Base64 encoded string
            } catch (error) {
                setToast({ message: "Failed to upload profile picture.", type: 'error' });
                console.error("Profile picture upload failed:", error);
            }
        }
    };

    const handleDeleteAccount = async () => {
        clearToast();
        console.log("Deleting account...");
        try {
            // Simulate API call to delete account
            await new Promise(resolve => setTimeout(resolve, 2000));
            // After successful deletion, log out and redirect
            logout(); // Clear auth state in Zustand
            navigate('/register'); // Redirect to a registration/login page
            setToast({ message: "Your account has been successfully deleted.", type: 'success' });
        } catch (error) {
            setToast({ message: "Failed to delete account. Please try again.", type: 'error' });
            console.error("Account deletion failed:", error);
        } finally {
            setShowDeleteAccountConfirm(false);
        }
    };

    const settingsSections = [
        { id: 'general', name: 'General', icon: User, description: 'Basic account information' },
        { id: 'appearance', name: 'Appearance', icon: Palette, description: 'Customize your theme' },
        { id: 'notifications', name: 'Notifications', icon: Bell, description: 'Manage alerts and sounds' },
        { id: 'privacy', name: 'Privacy', icon: Shield, description: 'Control your data visibility' },
        { id: 'security', name: 'Security', icon: Lock, description: 'Manage password and 2FA' },
        { id: 'integrations', name: 'Integrations', icon: Link, description: 'Connect third-party services' },
        { id: 'data', name: 'Data & Storage', icon: Download, description: 'Manage chat data' },
        { id: 'about', name: 'About', icon: Info, description: 'App version and legal info' },
    ];

    // Main background gradient for the page
    const pageBgStyle = {
        background: `linear-gradient(135deg, ${themes[selectedTheme]?.accent || 'rgba(51, 51, 51, 0.15)'}, rgba(15, 23, 42, 0.8) 70%)`,
        backgroundSize: 'cover',
        backgroundPosition: 'center center',
        backgroundRepeat: 'no-repeat',
    };

    return (
        <div
            className="flex h-screen w-full text-gray-200"
            style={pageBgStyle}
        >
            {/* Sidebar for Navigation */}
            <div className="w-64 bg-gray-900/80 backdrop-blur-md border-r border-gray-700/50 p-6 flex flex-col">
                <button
                    onClick={() => navigate(-1)} // Go back to previous page
                    className="flex items-center text-gray-300 hover:text-white transition-colors mb-8 p-2 rounded-lg hover:bg-gray-700/50"
                    style={{ color: themeStyles.buttonText }}
                >
                    <ChevronLeft size={20} className="mr-2" />
                    Back to Chat
                </button>

                <h2 className="text-2xl font-bold mb-6" style={{ color: themeStyles.primaryColor }}>Settings</h2>

                <nav className="flex-1 space-y-2">
                    {settingsSections.map((section) => (
                        <button
                            key={section.id}
                            onClick={() => setActiveSection(section.id)}
                            className={`flex items-center w-full text-left p-3 rounded-lg transition-all duration-200 group
                                ${activeSection === section.id
                                    ? `bg-gray-700/70 border border-gray-600/50 shadow-md` // Removed themeStyles.buttonText as it can override dynamic text color
                                    : `hover:bg-gray-800/50 border border-transparent hover:border-gray-700/30 text-gray-400 hover:text-white`
                                }
                            `}
                        >
                            {/* Adjusted color application for icons */}
                            <section.icon size={20} className="mr-3 group-hover:scale-105 transition-transform" style={{ color: activeSection === section.id ? themeStyles.primaryColor : 'rgb(156 163 175)' /* default gray-400 */ }} />
                            <div>
                                {/* Ensure text color changes based on active state, not directly from themeStyles.buttonText, which might be too bright */}
                                <span className={`block font-medium ${activeSection === section.id ? 'text-white' : 'text-gray-200'}`}>{section.name}</span>
                                <span className="block text-xs text-gray-500">{section.description}</span>
                            </div>
                        </button>
                    ))}
                </nav>

                <button
                    onClick={() => {
                        logout();
                        navigate('/login'); // Or home page
                        setToast({ message: "Logged out successfully!", type: 'info' });
                    }}
                    className="flex items-center justify-center gap-2 mt-8 py-3 px-4 rounded-lg text-red-400 bg-red-500/20 hover:bg-red-500/30 transition-colors"
                >
                    <LogOut size={20} />
                    Logout
                </button>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                {/* General Settings */}
                {activeSection === 'general' && (
                    <div className="bg-gray-800/60 backdrop-blur-sm rounded-xl p-8 shadow-xl border border-gray-700/50">
                        <h3 className="text-3xl font-bold mb-6" style={{ color: themeStyles.textColor }}>General Settings</h3>
                        <p className="text-gray-400 mb-8">Manage your profile information and basic account details.</p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Profile Picture */}
                            <div className="flex flex-col items-center">
                                <div className="relative w-32 h-32 rounded-full mb-4 group overflow-hidden">
                                    <img
                                        src={newProfilePicture || authUser?.profilePicture || defaultUserAvatar}
                                        alt="Profile"
                                        className="w-full h-full object-cover rounded-full border-2 border-gray-600 group-hover:border-blue-400 transition-colors"
                                    />
                                    <label htmlFor="profile-picture-upload" className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer rounded-full">
                                        <Upload size={28} className="text-white" />
                                    </label>
                                    <input
                                        id="profile-picture-upload"
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={handleProfilePictureUpload}
                                    />
                                </div>
                                <span className="text-gray-400 text-sm">Click to change profile picture</span>
                            </div>

                            {/* Username */}
                            <div>
                                <label htmlFor="username" className="block text-gray-300 text-sm font-semibold mb-2">Username</label>
                                <input
                                    type="text"
                                    id="username"
                                    value={newUsername}
                                    onChange={(e) => setNewUsername(e.target.value)}
                                    className="w-full p-3 rounded-lg bg-gray-700/50 border border-gray-600 focus:border-blue-500 focus:ring focus:ring-blue-500/30 outline-none transition-all"
                                    style={{ color: themeStyles.textColor }}
                                />
                                <p className="text-gray-500 text-sm mt-1">This will be your display name in chats.</p>
                            </div>

                            {/* Email (Read-only for now) */}
                            <div>
                                <label htmlFor="email" className="block text-gray-300 text-sm font-semibold mb-2">Email</label>
                                <input
                                    type="email"
                                    id="email"
                                    value={authUser?.email || 'N/A'}
                                    readOnly
                                    className="w-full p-3 rounded-lg bg-gray-700/30 border border-gray-600 cursor-not-allowed"
                                    style={{ color: themeStyles.textColor }}
                                />
                                <p className="text-gray-500 text-sm mt-1">Contact support to change your email.</p>
                            </div>
                        </div>

                        <div className="flex justify-end mt-10">
                            <button
                                onClick={() => handleSaveSettings('profile')}
                                className="flex items-center gap-2 py-3 px-6 rounded-lg font-semibold transition-all duration-200 shadow-md"
                                style={{ backgroundColor: themeStyles.buttonBg, color: themeStyles.buttonText, '--tw-ring-color': themeStyles.primaryColor }} // Add ring color for focus
                            >
                                <Save size={18} /> Save Changes
                            </button>
                        </div>
                    </div>
                )}

                {/* Appearance Settings */}
                {activeSection === 'appearance' && (
                    <div className="bg-gray-800/60 backdrop-blur-sm rounded-xl p-8 shadow-xl border border-gray-700/50">
                        <h3 className="text-3xl font-bold mb-6" style={{ color: themeStyles.textColor }}>Appearance</h3>
                        <p className="text-gray-400 mb-8">Personalize your chat experience with different themes.</p>

                        <div className="space-y-6">
                            <h4 className="text-xl font-semibold text-gray-300">Choose Theme</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {Object.entries(themes).map(([key, theme]) => (
                                    <button
                                        key={key}
                                        onClick={() => setSelectedTheme(key)}
                                        className={`w-full text-left p-5 rounded-xl transition-all flex flex-col gap-3 items-center justify-center border
                                            ${selectedTheme === key
                                                ? `bg-gray-800/80 border-gray-500/50 shadow-lg ring-2` // Tailwind ring color requires it to be directly in class
                                                : 'bg-gray-800/40 hover:bg-gray-700/60 border-gray-700/30 hover:border-gray-600/50'
                                            }`}
                                        // Dynamic ring color needs to be applied here or via a custom Tailwind plugin
                                        // For simplicity, we will use inline style for ring color if needed, but direct Tailwind classes are preferred.
                                        style={selectedTheme === key ? { '--tw-ring-color': getThemeStyles(key).primaryColor } : {}}
                                    >
                                        <div className={`w-12 h-12 rounded-full border-2 border-gray-600 flex items-center justify-center`}
                                            style={{ backgroundColor: (themes[key].primary.startsWith('#') || themes[key].primary.startsWith('rgba') || themes[key].primary.startsWith('rgb')) ? themes[key].primary : themes[key].primary + '-400' }}
                                        >
                                            {selectedTheme === key && <CheckCircle size={24} className="text-white" />}
                                        </div>
                                        <span className={`text-lg font-medium ${selectedTheme === key ? 'text-white' : 'text-gray-200'}`}>
                                            {theme.name}
                                        </span>
                                        <span className="text-sm text-gray-500">{theme.primary.charAt(0).toUpperCase() + theme.primary.slice(1)}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="flex justify-end mt-10">
                            <button
                                onClick={() => handleSaveSettings('appearance')}
                                className="flex items-center gap-2 py-3 px-6 rounded-lg font-semibold transition-all duration-200 shadow-md"
                                style={{ backgroundColor: themeStyles.buttonBg, color: themeStyles.buttonText, '--tw-ring-color': themeStyles.primaryColor }}
                            >
                                <Save size={18} /> Apply Theme
                            </button>
                        </div>
                    </div>
                )}

                {/* Notifications Settings */}
                {activeSection === 'notifications' && (
                    <div className="bg-gray-800/60 backdrop-blur-sm rounded-xl p-8 shadow-xl border border-gray-700/50">
                        <h3 className="text-3xl font-bold mb-6" style={{ color: themeStyles.textColor }}>Notification Settings</h3>
                        <p className="text-gray-400 mb-8">Control how and when you receive notifications.</p>

                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <Bell size={24} className="mr-3 text-gray-400" />
                                    <label htmlFor="notifications-toggle" className="text-lg text-gray-300 cursor-pointer">Enable all notifications</label>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        id="notifications-toggle"
                                        className="sr-only peer"
                                        checked={notificationsEnabled}
                                        onChange={() => setNotificationsEnabled(!notificationsEnabled)}
                                    />
                                    <div className={`w-11 h-6 bg-gray-600 rounded-full peer peer-focus:ring-2 peer-focus:ring-blue-500/50 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:border-gray-300 after:rounded-full after:h-5 after:w-5 after:transition-all`}
                                        style={{ backgroundColor: notificationsEnabled ? themeStyles.primaryColor : undefined }} // Apply theme color dynamically
                                    ></div>
                                </label>
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <Volume2 size={24} className="mr-3 text-gray-400" />
                                    <label htmlFor="sound-notifications-toggle" className="text-lg text-gray-300 cursor-pointer">Play sound for new messages</label>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        id="sound-notifications-toggle"
                                        className="sr-only peer"
                                        checked={soundNotificationsEnabled}
                                        onChange={() => setSoundNotificationsEnabled(!soundNotificationsEnabled)}
                                        disabled={!notificationsEnabled}
                                    />
                                    <div className={`w-11 h-6 bg-gray-600 rounded-full peer peer-focus:ring-2 peer-focus:ring-blue-500/50 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:border-gray-300 after:rounded-full after:h-5 after:w-5 after:transition-all ${!notificationsEnabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                                        style={{ backgroundColor: (soundNotificationsEnabled && notificationsEnabled) ? themeStyles.primaryColor : undefined }}
                                    ></div>
                                </label>
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <MessageSquare size={24} className="mr-3 text-gray-400" />
                                    <label htmlFor="message-preview-toggle" className="text-lg text-gray-300 cursor-pointer">Show message previews</label>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        id="message-preview-toggle"
                                        className="sr-only peer"
                                        checked={messagePreviewsEnabled}
                                        onChange={() => setMessagePreviewsEnabled(!messagePreviewsEnabled)}
                                        disabled={!notificationsEnabled}
                                    />
                                    <div className={`w-11 h-6 bg-gray-600 rounded-full peer peer-focus:ring-2 peer-focus:ring-blue-500/50 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:border-gray-300 after:rounded-full after:h-5 after:w-5 after:transition-all ${!notificationsEnabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                                        style={{ backgroundColor: (messagePreviewsEnabled && notificationsEnabled) ? themeStyles.primaryColor : undefined }}
                                    ></div>
                                </label>
                            </div>
                        </div>

                        <div className="flex justify-end mt-10">
                            <button
                                onClick={() => handleSaveSettings('notifications')}
                                className="flex items-center gap-2 py-3 px-6 rounded-lg font-semibold transition-all duration-200 shadow-md"
                                style={{ backgroundColor: themeStyles.buttonBg, color: themeStyles.buttonText, '--tw-ring-color': themeStyles.primaryColor }}
                            >
                                <Save size={18} /> Save Notification Settings
                            </button>
                        </div>
                    </div>
                )}

                {/* Privacy Settings */}
                {activeSection === 'privacy' && (
                    <div className="bg-gray-800/60 backdrop-blur-sm rounded-xl p-8 shadow-xl border border-gray-700/50">
                        <h3 className="text-3xl font-bold mb-6" style={{ color: themeStyles.textColor }}>Privacy Settings</h3>
                        <p className="text-gray-400 mb-8">Control who can see your profile and activity.</p>

                        <div className="space-y-6">
                            <div>
                                <label className="block text-gray-300 text-lg font-semibold mb-3">Who can see my profile?</label>
                                <div className="flex flex-col space-y-3">
                                    <label className="inline-flex items-center cursor-pointer">
                                        <input
                                            type="radio"
                                            name="profileVisibility"
                                            value="everyone"
                                            checked={privacyProfileVisibility === 'everyone'}
                                            onChange={() => setPrivacyProfileVisibility('everyone')}
                                            className={`form-radio h-5 w-5 transition-colors duration-200`}
                                            style={{ accentColor: themeStyles.primaryColor }}
                                        />
                                        <span className="ml-3 text-gray-300">Everyone (Recommended for public chats)</span>
                                    </label>
                                    <label className="inline-flex items-center cursor-pointer">
                                        <input
                                            type="radio"
                                            name="profileVisibility"
                                            value="friends"
                                            checked={privacyProfileVisibility === 'friends'}
                                            onChange={() => setPrivacyProfileVisibility('friends')}
                                            className={`form-radio h-5 w-5 transition-colors duration-200`}
                                            style={{ accentColor: themeStyles.primaryColor }}
                                        />
                                        <span className="ml-3 text-gray-300">Only Friends (People you've chatted with)</span>
                                    </label>
                                    <label className="inline-flex items-center cursor-pointer">
                                        <input
                                            type="radio"
                                            name="profileVisibility"
                                            value="nobody"
                                            checked={privacyProfileVisibility === 'nobody'}
                                            onChange={() => setPrivacyProfileVisibility('nobody')}
                                            className={`form-radio h-5 w-5 transition-colors duration-200`}
                                            style={{ accentColor: themeStyles.primaryColor }}
                                        />
                                        <span className="ml-3 text-gray-300">Nobody (Your profile will be private)</span>
                                    </label>
                                </div>
                                <p className="text-gray-500 text-sm mt-2">This affects who can see your online status and profile picture.</p>
                            </div>
                            {/* More privacy options could go here, e.g., Read receipts, Last seen status */}
                        </div>

                        <div className="flex justify-end mt-10">
                            <button
                                onClick={() => handleSaveSettings('privacy')}
                                className="flex items-center gap-2 py-3 px-6 rounded-lg font-semibold transition-all duration-200 shadow-md"
                                style={{ backgroundColor: themeStyles.buttonBg, color: themeStyles.buttonText, '--tw-ring-color': themeStyles.primaryColor }}
                            >
                                <Save size={18} /> Save Privacy Settings
                            </button>
                        </div>
                    </div>
                )}

                {/* Security Settings */}
                {activeSection === 'security' && (
                    <div className="bg-gray-800/60 backdrop-blur-sm rounded-xl p-8 shadow-xl border border-gray-700/50">
                        <h3 className="text-3xl font-bold mb-6" style={{ color: themeStyles.textColor }}>Security Settings</h3>
                        <p className="text-gray-400 mb-8">Protect your account with strong security measures.</p>

                        <div className="space-y-6">
                            {/* Password Change */}
                            <div className="border border-gray-700/50 rounded-lg p-5">
                                <div className="flex items-center justify-between mb-4">
                                    <h4 className="text-xl font-semibold text-gray-300 flex items-center gap-2"><Key size={20} /> Change Password</h4>
                                    <button
                                        onClick={() => setShowPasswordChange(!showPasswordChange)}
                                        className="text-gray-400 hover:text-white transition-colors"
                                    >
                                        {showPasswordChange ? <ChevronLeft size={20} /> : <Edit size={20} />}
                                    </button>
                                </div>

                                {showPasswordChange && (
                                    <div className="space-y-4 mt-4">
                                        <div>
                                            <label htmlFor="current-password" className="block text-gray-400 text-sm font-medium mb-2">Current Password</label>
                                            <input
                                                type="password"
                                                id="current-password"
                                                value={currentPassword}
                                                onChange={(e) => setCurrentPassword(e.target.value)}
                                                className="w-full p-3 rounded-lg bg-gray-700/50 border border-gray-600 focus:border-blue-500 focus:ring focus:ring-blue-500/30 outline-none transition-all"
                                                style={{ color: themeStyles.textColor }}
                                            />
                                        </div>
                                        <div>
                                            <label htmlFor="new-password" className="block text-gray-400 text-sm font-medium mb-2">New Password</label>
                                            <input
                                                type="password"
                                                id="new-password"
                                                value={newPassword}
                                                onChange={(e) => setNewPassword(e.target.value)}
                                                className="w-full p-3 rounded-lg bg-gray-700/50 border border-gray-600 focus:border-blue-500 focus:ring focus:ring-blue-500/30 outline-none transition-all"
                                                style={{ color: themeStyles.textColor }}
                                            />
                                        </div>
                                        <div>
                                            <label htmlFor="confirm-new-password" className="block text-gray-400 text-sm font-medium mb-2">Confirm New Password</label>
                                            <input
                                                type="password"
                                                id="confirm-new-password"
                                                value={confirmNewPassword}
                                                onChange={(e) => setConfirmNewPassword(e.target.value)}
                                                className="w-full p-3 rounded-lg bg-gray-700/50 border border-gray-600 focus:border-blue-500 focus:ring focus:ring-blue-500/30 outline-none transition-all"
                                                style={{ color: themeStyles.textColor }}
                                            />
                                        </div>
                                        <button
                                            onClick={handleChangePassword}
                                            className="w-full flex items-center justify-center gap-2 py-3 px-6 rounded-lg font-semibold transition-all duration-200 shadow-md mt-4"
                                            style={{ backgroundColor: themeStyles.buttonBg, color: themeStyles.buttonText, '--tw-ring-color': themeStyles.primaryColor }}
                                        >
                                            <Save size={18} /> Set New Password
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Two-Factor Authentication */}
                            <div className="flex items-center justify-between border border-gray-700/50 rounded-lg p-5">
                                <div className="flex items-center">
                                    <Shield size={24} className="mr-3 text-gray-400" />
                                    <label htmlFor="2fa-toggle" className="text-lg text-gray-300 cursor-pointer">Two-Factor Authentication (2FA)</label>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        id="2fa-toggle"
                                        className="sr-only peer"
                                        checked={twoFactorAuthEnabled}
                                        onChange={() => setTwoFactorAuthEnabled(!twoFactorAuthEnabled)}
                                    />
                                    <div className={`w-11 h-6 bg-gray-600 rounded-full peer peer-focus:ring-2 peer-focus:ring-blue-500/50 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:border-gray-300 after:rounded-full after:h-5 after:w-5 after:transition-all`}
                                        style={{ backgroundColor: twoFactorAuthEnabled ? themeStyles.primaryColor : undefined }}
                                    ></div>
                                </label>
                            </div>
                            <p className="text-gray-500 text-sm mt-1">2FA adds an extra layer of security to your account.</p>
                        </div>

                        <div className="flex justify-end mt-10">
                            <button
                                onClick={() => handleSaveSettings('security')}
                                className="flex items-center gap-2 py-3 px-6 rounded-lg font-semibold transition-all duration-200 shadow-md"
                                style={{ backgroundColor: themeStyles.buttonBg, color: themeStyles.buttonText, '--tw-ring-color': themeStyles.primaryColor }}
                            >
                                <Save size={18} /> Save Security Settings
                            </button>
                        </div>
                    </div>
                )}

                {/* Integrations Settings (Placeholder) */}
                {activeSection === 'integrations' && (
                    <div className="bg-gray-800/60 backdrop-blur-sm rounded-xl p-8 shadow-xl border border-gray-700/50">
                        <h3 className="text-3xl font-bold mb-6" style={{ color: themeStyles.textColor }}>Integrations</h3>
                        <p className="text-gray-400 mb-8">Connect your chat app with other services (e.g., Google Drive, Spotify).</p>
                        <div className="text-center text-gray-500 py-10">
                            <Link size={48} className="mx-auto mb-4" />
                            <p className="text-xl">No integrations configured yet.</p>
                            <p className="text-sm">Stay tuned for exciting new connections!</p>
                        </div>
                    </div>
                )}

                {/* Data & Storage Settings (Placeholder) */}
                {activeSection === 'data' && (
                    <div className="bg-gray-800/60 backdrop-blur-sm rounded-xl p-8 shadow-xl border border-gray-700/50">
                        <h3 className="text-3xl font-bold mb-6" style={{ color: themeStyles.textColor }}>Data & Storage</h3>
                        <p className="text-gray-400 mb-8">Manage your chat data and media.</p>
                        <div className="space-y-6">
                            <div className="flex items-center justify-between border border-gray-700/50 rounded-lg p-5">
                                <div className="flex items-center">
                                    <Trash2 size={24} className="mr-3 text-red-400" />
                                    <span className="text-lg text-gray-300">Delete all chat history</span>
                                </div>
                                <button
                                    onClick={() => setToast({ message: "Feature not implemented yet.", type: 'info' })} // Replace with actual logic
                                    className="py-2 px-4 rounded-lg text-red-400 bg-red-500/20 hover:bg-red-500/30 transition-colors"
                                >
                                    Delete All
                                </button>
                            </div>
                            <div className="flex items-center justify-between border border-gray-700/50 rounded-lg p-5">
                                <div className="flex items-center">
                                    <Download size={24} className="mr-3 text-gray-400" />
                                    <span className="text-lg text-gray-300">Download your chat data</span>
                                </div>
                                <button
                                    onClick={() => setToast({ message: "Feature not implemented yet.", type: 'info' })} // Replace with actual logic
                                    className="py-2 px-4 rounded-lg text-gray-300 bg-gray-700/50 hover:bg-gray-600/50 transition-colors"
                                >
                                    Download Data
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* About Settings (Placeholder) */}
                {activeSection === 'about' && (
                    <div className="bg-gray-800/60 backdrop-blur-sm rounded-xl p-8 shadow-xl border border-gray-700/50">
                        <h3 className="text-3xl font-bold mb-6" style={{ color: themeStyles.textColor }}>About Chat-App</h3>
                        <p className="text-gray-400 mb-8">Information about the application.</p>
                        <div className="space-y-4 text-gray-300">
                            <p><strong>Version:</strong> 1.0.0</p>
                            <p><strong>Developed by:</strong> Lokesh G. & Saksham G.</p>
                            <p className="text-sm text-gray-500">
                                This chat application provides a seamless and secure messaging experience.
                                We are continuously working to improve features and user experience.
                            </p>
                            <p className="text-sm text-gray-500 mt-6">
                                For support or inquiries, please visit our <a href="#" className="text-blue-400 hover:underline">support page</a>.
                            </p>
                        </div>
                    </div>
                )}

                {/* Delete Account Button (Always visible at the bottom of the main content) */}
                <div className="flex justify-start mt-12">
                    <button
                        onClick={() => setShowDeleteAccountConfirm(true)}
                        className="flex items-center gap-2 py-3 px-6 rounded-lg font-semibold transition-all duration-200 shadow-md text-red-400 bg-red-500/20 hover:bg-red-500/30"
                    >
                        <XCircle size={18} /> Delete Account
                    </button>
                </div>

                {/* Delete Account Confirmation Modal */}
                {showDeleteAccountConfirm && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 backdrop-blur-sm">
                        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 shadow-xl text-center max-w-sm mx-auto">
                            <h3 className="text-lg font-semibold text-white mb-4">Confirm Account Deletion?</h3>
                            <p className="text-gray-300 mb-6">Are you sure you want to permanently delete your account? All your data will be lost and this action cannot be undone.</p>
                            <div className="flex justify-center gap-4">
                                <button
                                    onClick={() => setShowDeleteAccountConfirm(false)}
                                    className="px-5 py-2 rounded-md text-gray-300 bg-gray-700 hover:bg-gray-600 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleDeleteAccount}
                                    className="px-5 py-2 rounded-md text-white bg-red-600 hover:bg-red-700 transition-colors"
                                >
                                    Delete My Account
                                </button>
                            </div>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
};

export default SettingsPage;