import React, { useEffect, useRef, useState } from 'react';
import { MessageSquare, PlusCircle, Search, Sparkles } from 'lucide-react';

// --- Reusable Components (for this immersive) ---

// GlobalGlowEffect component (reused from your previous code)
const GlobalGlowEffect = () => {
    const glowRef = useRef(null);
    useEffect(() => {
        const handleMouseMove = (e) => {
            if (!glowRef.current) return;
            const x = e.clientX;
            const y = e.clientY;
            requestAnimationFrame(() => {
                glowRef.current.style.setProperty('--mouse-x', `${x}px`);
                glowRef.current.style.setProperty('--mouse-y', `${y}px`);
            });
        };
        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);
    return <div ref={glowRef} className="global-glow-effect" />;
};

const NoChatSelected = () => {
    const [dots, setDots] = useState('');

    // Simulate typing animation for the placeholder text
    useEffect(() => {
        const interval = setInterval(() => {
            setDots(prevDots => {
                if (prevDots.length < 3) {
                    return prevDots + '.';
                } else {
                    return '';
                }
            });
        }, 500); // Add a dot every 500ms
        return () => clearInterval(interval);
    }, []);

    // Placeholder functions for button clicks
    const handleNewChat = () => {
        console.log("Start New Chat clicked!");
        // In a real app, you would navigate or open a new chat composer
    };

    const handleBrowseChats = () => {
        console.log("Browse Existing Chats clicked!");
        // In a real app, you would navigate to a chat list or archive
    };

    return (
        <>
            <style>{`
                /* Font import for Inter */
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

                body {
                    font-family: 'Inter', sans-serif;
                }

                /* Tailwind CSS CDN */
                @tailwind base;
                @tailwind components;
                @tailwind utilities;

                /* Background styles */
                .main-background {
                    background: linear-gradient(135deg, #0f172a 0%, #1e293b 25%, #374151 50%, #1f2937 75%, #111827 100%);
                    position: relative;
                    overflow: hidden;
                    z-index: 2;
                }
                
                .main-background::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: 
                        radial-gradient(circle at 20% 50%, rgba(252, 211, 77, 0.1) 0%, transparent 50%),
                        radial-gradient(circle at 80% 20%, rgba(139, 92, 246, 0.1) 0%, transparent 50%),
                        radial-gradient(circle at 40% 80%, rgba(34, 197, 94, 0.05) 0%, transparent 50%);
                    pointer-events: none;
                }
                .main-background::after {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23374151' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
                    pointer-events: none;
                }
            
                /* Animations */
                @keyframes fade-in-up {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in-up { animation: fade-in-up 0.8s ease-out forwards; }

                @keyframes pulse-subtle {
                    0%, 100% { transform: scale(1); opacity: 1; }
                    50% { transform: scale(1.05); opacity: 0.8; }
                }
                .animate-pulse-subtle { animation: pulse-subtle 2s ease-in-out infinite; }

                .global-glow-effect {
                    content: '';
                    position: fixed;
                    inset: 0;
                    pointer-events: none;
                    background: radial-gradient(
                        600px circle at var(--mouse-x, -1000px) var(--mouse-y, -1000px),
                        rgba(252, 211, 77,.08),
                        transparent 70%
                    );
                    z-index: 0;
                    transition: background .2s ease-out;
                }
            `}</style>

            <GlobalGlowEffect />

            {/* Changed min-h-screen to h-full */}
            <div className="h-full flex items-center justify-center text-gray-300 main-background p-4 sm:p-6">
                <div className="relative z-10 w-full max-w-2xl">
                    <div className="p-8 sm:p-12 space-y-8 bg-gray-800/40 border border-gray-700/50 rounded-3xl shadow-2xl backdrop-blur-md transition-all duration-300 hover:border-amber-400/40 hover:shadow-amber-500/10 animate-fade-in-up">
                        
                        <div className="text-center">
                            <div className="mb-6">
                                <MessageSquare className="size-20 text-amber-300 mx-auto animate-pulse-subtle" />
                            </div>
                            <h1 className="text-4xl sm:text-5xl font-bold text-amber-200 tracking-tight">
                                No Chat Selected
                            </h1>
                            <p className="mt-4 text-lg sm:text-xl text-gray-400 max-w-prose mx-auto">
                                It looks like you haven't selected a conversation yet.
                                <br />
                                Start a new one or browse your existing chats.
                            </p>
                            <p className="mt-6 text-xl text-gray-500 font-medium">
                                Waiting for your next message{dots}
                            </p>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-10">
                            <button
                                onClick={handleNewChat}
                                className="flex items-center justify-center gap-3 px-8 py-4 rounded-full font-semibold border border-gray-600 text-black hover:border-amber-400 hover:text-amber-300 hover:bg-gray-700/30 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-amber-400 transition-all duration-300 transform hover:scale-105 active:scale-100 shadow-md hover:shadow-lg"
                            >
                                <PlusCircle size={24} />
                                Start New Chat
                            </button>
                            <button
                                onClick={handleBrowseChats}
                                className="flex items-center justify-center gap-3 px-8 py-4 rounded-full font-semibold border border-gray-600 text-black hover:border-amber-400 hover:text-amber-300 hover:bg-gray-700/30 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-amber-400 transition-all duration-300 transform hover:scale-105 active:scale-100 shadow-md hover:shadow-lg"
                            >
                                <Search size={24} />
                                Browse Existing Chats
                            </button>
                        </div>

                    </div>
                </div>
            </div>
        </>
    );
};

export default NoChatSelected;
