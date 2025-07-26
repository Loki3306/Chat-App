import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore.js';
import { User, Settings, LogOut, MessageSquare, Home } from 'lucide-react';

const Navbar = () => {
  const { authUser, logout } = useAuthStore();
  const location = useLocation();

  const handleLogout = () => {
    logout();
  };

  // Default avatar for when no profile picture is available or image fails to load
  const defaultUserAvatar = `data:image/svg+xml;base64,${btoa(`
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 5C13.66 5 15 6.34 15 8C15 9.66 13.66 11 12 11C10.34 11 9 9.66 9 8C9 6.34 10.34 5 12 5ZM12 19.2C9.5 19.2 7.29 17.92 6 15.96C6.03 14.07 10 12.9 12 12.9C13.99 12.9 17.97 14.07 18 15.96C16.71 17.92 14.5 19.2 12 19.2Z" fill="#9CA3AF"/>
      </svg>
  `)}`;


  return (
    <>
      <script src="https://cdn.tailwindcss.com"></script>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      <style>{`
        body {
            font-family: 'Inter', sans-serif;
        }
        @keyframes shimmer {
          0% { background-position: -500%; }
          100% { background-position: 500%; }
        }
        .animate-shimmer {
          background: linear-gradient(90deg, transparent, rgba(252, 211, 77, 0.5), transparent);
          background-size: 200% 100%;
          animation: shimmer 8s infinite linear;
        }
      `}</style>
      <header className='flex items-center justify-between px-6 py-4 bg-gray-900/50 border-b border-gray-700/50 backdrop-blur-lg'>
        {/* App Title */}
        <Link to="/" className="flex items-center gap-3 group">
          <MessageSquare className="size-8 text-amber-300 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12" />
          <h1 className="text-2xl font-bold text-amber-200 tracking-wider relative">
            Chat-App
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-amber-300 transition-all duration-500 group-hover:w-full"></span>
          </h1>
        </Link>

        {/* Navigation for Authenticated Users */}
        {authUser && (
          <nav className="flex items-center gap-4">
            {/* Home Button - Appears if not on homepage */}
            {location.pathname !== '/' && (
              <Link
                to="/"
                className="p-2 rounded-full text-gray-400 hover:text-amber-300 hover:bg-gray-700/50 transition-all duration-300 transform hover:scale-110"
                aria-label="Home"
              >
                <Home size={22} />
              </Link>
            )}
            {/* Profile Button - Conditionally renders PFP or default User icon */}
            <Link
              to="/profile"
              className="p-1.5 rounded-full text-gray-400 hover:text-amber-300 hover:bg-gray-700/50 transition-all duration-300 transform hover:scale-110 flex items-center justify-center"
              aria-label="Profile"
            >
              {/* CHANGED: authUser.profilePicUrl to authUser.profilePicture */}
              {authUser.profilePicture ? (
                <img
                  src={authUser.profilePicture} // Use profilePicture from backend
                  alt="Profile"
                  className="size-7 rounded-full object-cover border border-gray-600 group-hover:border-amber-400 transition-all duration-300"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = defaultUserAvatar;
                  }}
                />
              ) : (
                <User size={22} />
              )}
            </Link>
            <Link
              to="/settings"
              className="p-2 rounded-full text-gray-400 hover:text-amber-300 hover:bg-gray-700/50 transition-all duration-300 transform hover:scale-110"
              aria-label="Settings"
            >
              <Settings size={22} />
            </Link>
            <button
              onClick={handleLogout}
              className="p-2 rounded-full text-gray-400 hover:text-red-400 hover:bg-red-900/50 transition-all duration-300 transform hover:scale-110"
              aria-label="Logout"
            >
              <LogOut size={22} />
            </button>
          </nav>
        )}
      </header>
    </>
  );
};

export default Navbar;
