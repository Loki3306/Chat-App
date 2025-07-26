import React from 'react';

const SidebarSkeleton = () => {
  return (
    <>
      
      <script src="https://cdn.tailwindcss.com"></script>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      <style>{`
        body {
            font-family: 'Inter', sans-serif;
            background-color: #0f172a; /* Ensure a dark background for contrast */
        }
        @keyframes pulse-bg {
          0% { background-color: rgba(55, 65, 81, 0.5); } /* gray-700/50 */
          50% { background-color: rgba(71, 85, 105, 0.6); } /* gray-600/60 */
          100% { background-color: rgba(55, 65, 81, 0.5); }
        }
        @keyframes pulse-line {
          0% { background-color: rgba(75, 85, 99, 0.7); } /* gray-600/70 */
          50% { background-color: rgba(107, 114, 128, 0.8); } /* gray-500/80 */
          100% { background-color: rgba(75, 85, 99, 0.7); }
        }
        .animate-pulse-bg {
          animation: pulse-bg 2s infinite ease-in-out;
        }
        .animate-pulse-line {
          animation: pulse-line 2s infinite ease-in-out;
        }
      `}</style>
      
      <div className="w-full min-h-[calc(100vh-64px)] p-4 space-y-6 bg-gray-800/40 border-r border-gray-700/50 rounded-lg shadow-lg flex flex-col justify-between">
        <div> 
            {/* User Profile Skeleton */}
            <div className="flex items-center space-x-3 animate-pulse-bg rounded-md p-2 mb-6">
            <div className="w-10 h-10 bg-gray-700 rounded-full animate-pulse-line"></div>
            <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-700 rounded w-3/4 animate-pulse-line"></div>
                <div className="h-3 bg-gray-700 rounded w-1/2 animate-pulse-line"></div>
            </div>
            </div>

            {/* Search Bar Skeleton */}
            <div className="h-10 bg-gray-700/50 rounded-md animate-pulse-bg mb-6"></div>

            {/* Chat List Skeletons */}
            <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center space-x-3 animate-pulse-bg rounded-md p-2">
                <div className="w-8 h-8 bg-gray-700 rounded-full animate-pulse-line"></div>
                <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-700 rounded w-4/5 animate-pulse-line"></div>
                    <div className="h-3 bg-gray-700 rounded w-2/3 animate-pulse-line"></div>
                </div>
                </div>
            ))}
            </div>
        </div>

   
        <div className="pt-4 border-t border-gray-700/50 space-y-3 mt-auto"> {/* mt-auto pushes it to the bottom */}
          <div className="h-10 bg-gray-700/50 rounded-md animate-pulse-bg"></div>
          <div className="h-10 bg-gray-700/50 rounded-md animate-pulse-bg"></div>
        </div>
      </div>
    </>
  );
};

export default SidebarSkeleton;
