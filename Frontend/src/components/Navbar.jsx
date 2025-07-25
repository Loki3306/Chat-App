import React from 'react';
import { Link, useLocation } from 'react-router-dom'; // Import useLocation
import { useAuthStore } from '../store/useAuthStore.js';
import { User, Settings, LogOut, MessageSquare, Home } from 'lucide-react'; // Import Home icon

const Navbar = () => {
  const { authUser, logout } = useAuthStore();
  const location = useLocation(); // Get the current location

  const handleLogout = () => {
    logout();
    // No need to navigate here, the App.jsx router will handle the redirect
  };

  return (
    <>
      <style>{`
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
            <Link
              to="/profile"
              className="p-2 rounded-full text-gray-400 hover:text-amber-300 hover:bg-gray-700/50 transition-all duration-300 transform hover:scale-110"
              aria-label="Profile"
            >
              <User size={22} />
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
