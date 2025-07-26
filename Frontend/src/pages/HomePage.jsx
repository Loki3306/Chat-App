import React from 'react';
import { useChatStore } from '../store/useChatStore.js';


import SidebarSkeleton from '../components/skeletons/sidebarSkeleton.jsx'; // Import the new skeleton

import ChatContainer from '../components/chatContainer.jsx';
import NoChatSelected from '../components/noChatSelected.jsx';

const HomePage = () => {
  const { selectedChat } = useChatStore();

  return (
    <>
      <script src="https://cdn.tailwindcss.com"></script>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      <style>{`
        body {
            font-family: 'Inter', sans-serif;
        }
        /* Basic styling for the overall layout */
        .main-layout {
            display: flex;
            min-height: 100vh;
            background: linear-gradient(135deg, #0f172a 0%, #1e293b 25%, #374151 50%, #1f2937 75%, #111827 100%);
            color: #e2e8f0; /* text-gray-200 */
        }
        /* Add any specific styles for the sidebar or chat area if needed */
        .sidebar-area {
            width: 20%; /* Example width, adjust as needed */
            min-width: 250px; /* Minimum width for sidebar */
            max-width: 350px; /* Maximum width for sidebar */
            background-color: #1e293b; /* slate-800 */
            border-right: 1px solid #334155; /* slate-700 */
            box-shadow: 2px 0 10px rgba(0,0,0,0.3);
            padding: 1rem;
        }
        .chat-area {
            flex-grow: 1;
            background-color: #0f172a; /* slate-900 */
            display: flex;
            flex-direction: column;
        }

        /* Responsive adjustments */
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
                padding: 0.5rem; /* Smaller padding for mobile */
            }
        }
      `}</style>

      <div className="main-layout">
        <aside className="sidebar-area">
          {/* Replaced Sidebar with SidebarSkeleton */}
          <SidebarSkeleton />
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
