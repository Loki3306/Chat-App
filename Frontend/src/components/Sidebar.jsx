import React from 'react';
// Removed useChatStore import as this component now receives data via props
import { useAuthStore } from '../store/useAuthStore.js';
// Removed SidebarSkeleton import as it's handled by parent (HomePage)
import { PlusCircle, Search } from 'lucide-react'; // Import icons for buttons

// Sidebar now accepts users, selectedUser, and setSelectedUser as props
const Sidebar = ({ users, selectedUser, setSelectedUser }) => {
  const { authUser } = useAuthStore();

  // Default avatar for when no profile picture is available or image fails to load
  const defaultUserAvatar = `data:image/svg+xml;base64,${btoa(`
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 5C13.66 5 15 6.34 15 8C15 9.66 13.66 11 12 11C10.34 11 9 9.66 9 8C9 6.34 10.34 5 12 5ZM12 19.2C9.5 19.2 7.29 17.92 6 15.96C6.03 14.07 10 12.9 12 12.9C13.99 12.9 17.97 14.07 18 15.96C16.71 17.92 14.5 19.2 12 19.2Z" fill="#9CA3AF"/>
      </svg>
  `)}`;

  // Console logs for debugging purposes, can be removed in production
  console.log("Sidebar: Current selectedUser prop:", selectedUser);
  console.log("Sidebar: Users prop array:", users);

  return (
    // The main container for the sidebar, filling its parent's height
    <div className="w-full min-h-[calc(80vh-64px)]   p-4 space-y-6 bg-gray-800/40 border-r border-gray-700/50 rounded-lg shadow-lg flex flex-col justify-between text-gray-300">
      <div> {/* Container for top section: user profile and chat list */}
        {/* Actual User Profile Display */}
        <div className="flex items-center space-x-3 rounded-md p-2 mb-6">
          <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
            {/* Using authUser.profilePicture for consistency with your backend */}
            {authUser?.profilePicture ? (
              <img
                src={authUser.profilePicture}
                alt="User Profile"
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = defaultUserAvatar; // Fallback to default SVG
                }}
              />
            ) : (
              <img src={defaultUserAvatar} alt="Default User" className="w-full h-full object-cover" />
            )}
          </div>
          <div className="flex flex-col">
            <span className="font-semibold text-amber-200 text-lg">{authUser?.fullName || 'Guest User'}</span>
            <span className="text-sm text-gray-400">{authUser?.email || 'No email'}</span>
          </div>
        </div>

        {/* Search Bar (Placeholder for now, can be implemented later) */}
        <div className="h-10 bg-gray-700/50 rounded-md mb-6 flex items-center px-3 text-gray-400">
            <Search size={18} className="mr-2" />
            <span>Search chats...</span>
        </div>

        {/* User List (or Chat List) */}
        <div className="space-y-2 overflow-y-auto max-h-[calc(100vh-300px)] custom-scrollbar">
          {users.length > 0 ? (
            users.map(user => {
              // Console log to inspect each user object from the 'users' prop
              console.log("Sidebar: Mapping user object:", user);
              return (
                <button
                  key={user._id} // Use user._id as the key
                  onClick={() => {
                    console.log("Sidebar: Button clicked for user:", user);
                    setSelectedUser(user); // This calls the prop function from HomePage
                    console.log("Sidebar: Calling setSelectedUser with:", user);
                  }}
                  // Refined selected state styling for better visibility
                  // Changed default background to a darker gray, and default text to gray-400
                  // Selected state background is now bg-amber-600/40 for a darker amber
                  className={`flex items-center w-full text-left space-x-3 p-2 rounded-md transition-all duration-200 
                             ${(selectedUser?._id === user._id) 
                                ? 'bg-amber-600/40 text-amber-100 border border-amber-400/50 shadow-md' // Selected state
                                : 'bg-gray-700/30 text-gray-400 hover:bg-gray-600/50'}`} 
                >
                  <div className={`w-8 h-8 rounded-full flex-shrink-0 ${user.isOnline ? 'bg-green-500' : 'bg-gray-600'}`}>
                      {/* Using user.profilePicture for consistency with your backend */}
                      <img
                          src={user.profilePicture || defaultUserAvatar} // Assuming users also have profilePicture
                          alt={user.fullName ? user.fullName.charAt(0) : 'U'} // Use fullName for alt text
                          className="w-full h-full object-cover rounded-full"
                          onError={(e) => { e.target.onerror = null; e.target.src = defaultUserAvatar; }}
                      />
                  </div>
                  {/* Ensure text color is visible and flex-grow allows it to take space */}
                  <span className="text-sm font-medium flex-grow">{user.fullName || 'Unknown User'}</span> {/* Removed text-gray-300 here, as it's set on the button */}
                  {user.isOnline && <span className="w-2 h-2 bg-green-400 rounded-full ml-auto"></span>} {/* Online indicator */}
                </button>
              );
            })
          ) : (
            <div className="text-center py-8 text-gray-500">No users found.</div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="pt-4 border-t border-gray-700/50 space-y-3 mt-auto">
        <button className="w-full p-3 font-semibold text-gray-900 bg-amber-300 rounded-lg hover:bg-amber-400 transition-all flex items-center justify-center gap-2 transform hover:scale-105">
          <PlusCircle size={18} />
          <span>New Chat</span>
        </button>
        <button className="w-full p-3 font-semibold border border-gray-600 text-amber-300 bg-gray-700/30 rounded-lg hover:border-amber-400 hover:text-amber-200 hover:bg-gray-700/50 transition-all flex items-center justify-center gap-2 transform hover:scale-105">
          <Search size={18} />
          <span>Browse Chats</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
