import React from 'react'
import { useChatStore } from '../store/useChatStore.js';
import { useEffect } from 'react';
import SidebarSkeleton from './skeletons/sidebarSkeleton.jsx';


const Sidebar = () => {
  const { users, fetchUsers, isUsersLoading, setSelectedUser, selectedUser } = useChatStore();

  const onlineUsers = [];

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  if (isUsersLoading) {
    return <SidebarSkeleton />
  }


  return (
    <div className="w-full min-h-[calc(100vh-64px)] p-4 space-y-6 bg-gray-800/40 border-r border-gray-700/50 rounded-lg shadow-lg flex flex-col justify-between">
      <div>
        {/* User Profile Skeleton */}
        <div className="flex items-center space-x-3 animate-pulse-bg rounded-md p-2 mb-6">
          <div className="w-10 h-10 bg-gray-700 rounded-full animate-pulse-line"></div>
          <div className="flex flex-col space-y-1">
            <div className="w-24 h-4 bg-gray-700 animate-pulse-line"></div>
            <div className="w-16 h-3 bg-gray-700 animate-pulse-line"></div>
          </div>
        </div>

        {/* User List */}
        <div className="space-y-2">
          {users.map(user => (
            <button
              key={user.id}
              onClick={() => setSelectedUser(user)}
              className={`flex items-center space-x-3 p-2 rounded-md hover:bg-gray-700 transition-colors ${selectedUser?.id === user.id ? 'bg-gray-600' : ''}`}
            >
              <div className={`w-8 h-8 rounded-full ${user.isOnline ? 'bg-green-500' : 'bg-gray-600'}`}></div>
              <span className="text-sm">{user.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="pt-4 border-t border-gray-700/50 space-y-3 mt-auto">
        <button className="w-full h-10 bg-blue-600 hover:bg-blue-500 rounded-md text-white flex items-center justify-center space-x-2">
          <PlusCircle size={16} />
          <span>New Chat</span>
        </button>
        <button className="w-full h-10 bg-gray-700 hover:bg-gray-600 rounded-md text-white flex items-center justify-center space-x-2">
          <Search size={16} />
          <span>Browse Chats</span>
        </button>
      </div>

      {/* Global Glow Effect */}
      <GlobalGlowEffect />
    </div>
  );
}

export default Sidebar
