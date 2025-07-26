import React, { useEffect } from 'react';
import { useChatStore } from '../store/useChatStore.js';

import Sidebar from '../components/Sidebar.jsx';
import SidebarSkeleton from '../components/skeletons/sidebarSkeleton.jsx';

import ChatContainer from '../components/chatContainer.jsx';
import NoChatSelected from '../components/noChatSelected.jsx';

const HomePage = () => {
  // Get all necessary states and actions from useChatStore
  // ADDED 'selectedUser' to destructuring here
  const { selectedChat, users, isUsersLoading, fetchUsers, selectedUser } = useChatStore();

  // Fetch users ONLY ONCE when HomePage mounts
  // This is the ONLY place fetchUsers should be called for initial load
  useEffect(() => {
    console.log("HomePage: Fetching users on mount.");
    fetchUsers();
  }, [fetchUsers]); // fetchUsers is a stable function from Zustand, so this runs once.

  return (
    <>
      <script src="https://cdn.tailwindcss.com"></script>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      <style>{`
        body {
            font-family: 'Inter', sans-serif;
        }
        .main-layout {
            display: flex;
            min-height: 100vh;
            background: linear-gradient(135deg, #0f172a 0%, #1e293b 25%, #374151 50%, #1f2937 75%, #111827 100%);
            color: #e2e8f0;
        }
        .sidebar-area {
            width: 20%;
            min-width: 250px;
            max-width: 350px;
            background-color: #1e293b;
            border-right: 1px solid #334155;
            box-shadow: 2px 0 10px rgba(0,0,0,0.3);
            padding: 1rem;
        }
        .chat-area {
            flex-grow: 1;
            background-color: #0f172a;
            display: flex;
            flex-direction: column;
        }
        @media (max-width: 768px) {
            .main-layout {
                flex-direction: column;
            }
            .sidebar-area {
                width: 100%;
                min-width: unset;
                max-width: unset;
                border-right: none;
                border-bottom: 1px solid #334155;
                padding: 0.5rem;
            }
        }
      `}</style>

      <div className="main-layout">
        <aside className="sidebar-area">
          {/* Pass users, selectedUser, and setSelectedUser as props to Sidebar */}
          {isUsersLoading ? (
            <SidebarSkeleton />
          ) : (
            <Sidebar users={users} selectedUser={selectedUser} setSelectedUser={useChatStore.getState().setSelectedUser} />
            // Note: useChatStore.getState().setSelectedUser is used to pass a stable function reference.
          )}
        </aside>

        <main className="chat-area">
          {selectedChat ? (
            <ChatContainer />
          ) : (
            <NoChatSelected />
          )}
        </main>
      </div>
    </>
  );
};

export default HomePage;
