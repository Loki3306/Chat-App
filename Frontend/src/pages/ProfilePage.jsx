import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useAuthStore } from '../store/useAuthStore.js';
import { Link } from 'react-router-dom';
import { Camera, Loader, User, Mail, ShieldCheck, CalendarDays, Sparkles, Gamepad2, Users, Heart, Compass, Code, Shield, PenTool, Settings, Puzzle, Home, LogOut } from 'lucide-react';

// =======================================================================
// NEW COMPONENT: Circuit Grid Puzzle Game
// =======================================================================
const CircuitGrid = () => {
    const [grid, setGrid] = useState([]);
    const [isWon, setIsWon] = useState(false);
    const size = 4; // 4x4 grid

    const createSolvableGrid = () => {
        let newGrid = Array(size * size).fill(false);
        // Simulate a number of random presses from a solved state to guarantee it's solvable
        const presses = Math.floor(Math.random() * 5) + 3; // 3 to 7 presses
        for (let i = 0; i < presses; i++) {
            const randIndex = Math.floor(Math.random() * (size * size));
            newGrid = toggleLights(newGrid, Math.floor(randIndex / size), randIndex % size);
        }
        return newGrid;
    };

    useEffect(() => {
        setGrid(createSolvableGrid());
    }, []);

    const toggleLights = (currentGrid, row, col) => {
        const newGrid = [...currentGrid];
        const indicesToToggle = [
            [row, col], // The clicked tile
            [row - 1, col], // Top
            [row + 1, col], // Bottom
            [row, col - 1], // Left
            [row, col + 1]  // Right
        ];

        indicesToToggle.forEach(([r, c]) => {
            if (r >= 0 && r < size && c >= 0 && c < size) {
                const index = r * size + c;
                newGrid[index] = !newGrid[index];
            }
        });
        return newGrid;
    };

    const handleTileClick = (row, col) => {
        if (isWon) return;
        const newGrid = toggleLights(grid, row, col);
        setGrid(newGrid);

        if (newGrid.every(tile => !tile)) {
            setIsWon(true);
        }
    };

    const resetGame = () => {
        setIsWon(false);
        setGrid(createSolvableGrid());
    };
    
    const Celebration = () => {
        const emojis = ['🎉', '🎊', '✨', '💥', '🥳', '🏆'];
        return (
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                {[...Array(20)].map((_, i) => (
                    <div
                        key={i}
                        className="absolute text-2xl animate-confetti"
                        style={{
                            left: `${Math.random() * 100}%`,
                            top: `-20px`, // Start above the view
                            animationDelay: `${Math.random() * 2}s`, // Varied delays
                            transform: `translateX(${Math.random() * 200 - 100}px) rotate(${Math.random() * 720}deg)`, // Random horizontal movement and rotation
                        }}
                    >
                        {emojis[i % emojis.length]}
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div className="p-8 bg-gray-800/40 border border-gray-700/50 rounded-2xl shadow-2xl backdrop-blur-md card-hover-effect animate-slide-up" style={{ animationDelay: '0.6s' }}>
            <div className="flex items-center gap-4 mb-3">
                <Puzzle className="size-8 text-amber-300 animate-spin" />
                <h2 className="text-xl font-bold text-amber-200">Circuit Grid</h2>
            </div>
            <span className="text-sm text-gray-400 mb-6 block">Turn off all lights! Clicking a tile toggles its state and its direct neighbors (up, down, left, right).</span>
            <div className="relative h-64 flex items-center justify-center">
                {!isWon ? (
                    <div className="grid grid-cols-4 gap-3">
                        {grid.map((isLit, index) => (
                            <button
                                key={index}
                                onClick={() => handleTileClick(Math.floor(index / size), index % size)}
                                className={`w-14 h-14 rounded-lg transition-all duration-300 relative overflow-hidden ${isLit ? 'bg-amber-400/80 shadow-[0_0_15px_rgba(251,191,36,0.5)]' : 'bg-gray-900/50'}`}
                            >
                                <div className={`absolute inset-0 transition-opacity duration-300 ${isLit ? 'opacity-100' : 'opacity-0'}`} style={{background: 'radial-gradient(circle, rgba(251,191,36,0.5) 0%, rgba(251,191,36,0) 70%)'}} />
                            </button>
                        ))}
                    </div>
                ) : (
                    <div className="text-center space-y-4 animate-fade-in">
                        <Celebration />
                        <h3 className="text-2xl font-bold text-green-400 z-10 relative">
                            You Solved It!
                        </h3>
                        <button onClick={resetGame} className="w-full p-3 font-semibold text-gray-900 bg-amber-300 rounded-lg hover:bg-amber-400 transition-all duration-300 transform hover:scale-105 z-10 relative">
                            Play Again
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};


// =======================================================================
// Interactive Memory Matrix Game Component (Modified)
// =======================================================================
const MemoryMatrix = () => {
    const [gameState, setGameState] = useState('idle'); // 'idle', 'playing', 'won'
    const [grid, setGrid] = useState([]);
    const [flipped, setFlipped] = useState([]);
    const [matched, setMatched] = useState([]);

    const icons = [
        <Users key="users" className="size-8 text-amber-300" />, <Heart key="heart" className="size-8 text-amber-300" />,
        <Compass key="compass" className="size-8 text-amber-300" />, <Code key="code" className="size-8 text-amber-300" />,
        <Shield key="shield" className="size-8 text-amber-300" />, <PenTool key="pen" className="size-8 text-amber-300" />
    ];

    const setupGame = () => {
        const doubledIcons = [...icons, ...icons];
        const shuffled = doubledIcons.sort(() => 0.5 - Math.random());
        setGrid(shuffled);
        setFlipped([]);
        setMatched([]);
        setGameState('playing');
    };

    const handleTileClick = (index) => {
        if (flipped.length === 2 || flipped.includes(index) || matched.includes(index)) {
            return;
        }

        const newFlipped = [...flipped, index];
        setFlipped(newFlipped);

        if (newFlipped.length === 2) {
            const [firstIndex, secondIndex] = newFlipped;
            if (grid[firstIndex].key === grid[secondIndex].key) {
                setMatched([...matched, firstIndex, secondIndex]);
                setFlipped([]);
                if (matched.length + 2 === grid.length) {
                    setTimeout(() => setGameState('won'), 500);
                }
            } else {
                setTimeout(() => setFlipped([]), 1000);
            }
        }
    };

    // Celebration component re-used
    const Celebration = () => {
        const emojis = ['🎉', '🎊', '✨', '💥', '🥳', '🏆'];
        return (
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                {[...Array(20)].map((_, i) => (
                    <div
                        key={i}
                        className="absolute text-2xl animate-confetti"
                        style={{
                            left: `${Math.random() * 100}%`,
                            top: `-20px`, // Start above the view
                            animationDelay: `${Math.random() * 2}s`, // Varied delays
                            transform: `translateX(${Math.random() * 200 - 100}px) rotate(${Math.random() * 720}deg)`, // Random horizontal movement and rotation
                        }}
                    >
                        {emojis[i % emojis.length]}
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div className="p-8 bg-gray-800/40 border border-gray-700/50 rounded-2xl shadow-2xl backdrop-blur-md card-hover-effect animate-slide-up h-full" style={{ animationDelay: '0.4s' }}>
            <div className="flex items-center gap-4 mb-6">
                <Gamepad2 className="size-8 text-amber-300 animate-spin" />
                <h2 className="text-xl font-bold text-amber-200">Memory Matrix</h2>
            </div>

            <div className="relative h-64 flex items-center justify-center">
                {gameState === 'idle' && (
                    <div className="text-center space-y-4 animate-fade-in">
                           <button 
                            onClick={setupGame} 
                            className="group relative w-24 h-24 bg-amber-400/10 rounded-full border-2 border-amber-400/30 flex items-center justify-center transition-all duration-300 hover:border-amber-400/80 hover:scale-110"
                        >
                            <div className="absolute inset-0 rounded-full bg-amber-400/20 blur-xl animate-pulse group-hover:blur-2xl" />
                            <p className="z-10 text-amber-200 font-semibold">Start</p>
                        </button>
                    </div>
                )}

                {gameState === 'playing' && (
                    <div className="grid grid-cols-4 gap-3">
                        {grid.map((icon, index) => (
                            <div key={index} className="perspective-container" onClick={() => handleTileClick(index)}>
                                <div className={`tile ${flipped.includes(index) || matched.includes(index) ? 'is-flipped' : ''}`}>
                                    <div className="tile-face tile-front">
                                        <Sparkles className="size-6 text-amber-400/50" />
                                    </div>
                                    <div className="tile-face tile-back">
                                        {icon}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {gameState === 'won' && (
                     <div className="text-center space-y-4 animate-fade-in">
                        <Celebration />
                        <h3 className="text-2xl font-bold text-green-400 z-10 relative">You Won!</h3>
                        <button onClick={setupGame} className="w-full p-3 font-semibold text-gray-900 bg-amber-300 rounded-lg hover:bg-amber-400 transition-all duration-300 transform hover:scale-105 z-10 relative">
                            Play Again
                        </button>
                    </div>
                )}
            </div>
            {/* Placing CircuitGrid directly below Memory Matrix's content */}
            <div className="mt-8">
                <CircuitGrid />
            </div>
        </div>
    );
};


// =======================================================================
// Main Profile Page Component
// =======================================================================
const ProfilePage = () => {
    const { authUser, isUpdatingProfile, updateProfile, logout } = useAuthStore();
    const [selectedImage, setSelectedImage] = useState(null);
    const [error, setError] = useState('');
    const fileInputRef = useRef(null);

    // State to hold mouse coordinates for the interactive background
    const [mousePosition, setMousePosition] = useState({ x: '50%', y: '50%' });
    const animationFrameRef = useRef(0); // To optimize mousemove event

    // Effect hook to track mouse movement and update state efficiently
    useEffect(() => {
        const handleMouseMove = (e) => {
            // Use requestAnimationFrame to smooth out updates and prevent performance issues
            cancelAnimationFrame(animationFrameRef.current);
            animationFrameRef.current = requestAnimationFrame(() => {
                setMousePosition({
                    x: `${e.clientX}px`,
                    y: `${e.clientY}px`
                });
            });
        };

        window.addEventListener('mousemove', handleMouseMove);

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            cancelAnimationFrame(animationFrameRef.current); // Clean up any pending animation frames
        };
    }, []); // Empty dependency array means this effect runs once on mount and cleans up on unmount


    const defaultAvatar = `data:image/svg+xml;base64,${btoa(`
        <svg width="128" height="128" viewBox="0 0 128 128" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="64" cy="64" r="64" fill="#2D3748"/>
            <circle cx="64" cy="50" r="24" fill="#A0AEC0"/>
            <path d="M104 128C104 105.908 85.9081 88 64 88C42.0919 88 24 105.908 24 128H104Z" fill="#A0AEC0"/>
        </svg>
    `)}`;

    const handleImageUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) return;
        if (!file.type.startsWith('image/')) {
            setError('Please select an image file.');
            return;
        }

        const reader = new FileReader();
        reader.readAsDataURL(file);

        reader.onload = async () => {
            const base64Image = reader.result;
            setSelectedImage(base64Image);
            try {
                await updateProfile({ profilePicture: base64Image });
            } catch (err) {
                setError('Upload failed. Please try again.');
                setSelectedImage(null);
            }
        }
    };

    const memberSince = authUser?.createdAt ? new Date(authUser.createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    }) : 'N/A';

    return (
        <>
            <style>{`
                /* Ensure html and body take full height and width */
                html, body, #root {
                    height: 100%;
                    margin: 0;
                    padding: 0;
                    overflow-x: hidden; /* Prevent horizontal scroll bar */
                }

                @keyframes fade-in-slow { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
                .animate-fade-in-slow { animation: fade-in-slow 0.8s ease-out forwards; }
                
                .profile-pic-overlay { opacity: 0; transition: all 0.3s ease-in-out; }
                .group:hover .profile-pic-overlay { opacity: 1; }
                
                .card-hover-effect { transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); position: relative; overflow: hidden; }
                .card-hover-effect:hover { transform: translateY(-5px) scale(1.02); box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3); }
                
                @keyframes slide-up { from { transform: translateY(30px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
                .animate-slide-up { animation: slide-up 0.6s ease-out forwards; }
                
                @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
                .animate-fade-in { animation: fade-in 0.5s ease-out forwards; }

                /* Animated Logos */
                @keyframes spin { 
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
                @keyframes pulse-shadow {
                    0% { text-shadow: 0 0 5px rgba(251, 191, 36, 0.3), 0 0 10px rgba(251, 191, 36, 0.1); }
                    50% { text-shadow: 0 0 15px rgba(251, 191, 36, 0.7), 0 0 30px rgba(251, 191, 36, 0.4); }
                    100% { text-shadow: 0 0 5px rgba(251, 191, 36, 0.3), 0 0 10px rgba(251, 191, 36, 0.1); }
                }
                @keyframes pulse-icon {
                    0%, 100% { transform: scale(1); }
                    50% { transform: scale(1.08); }
                }

                .animate-spin { animation: spin 4s linear infinite; } 
                .animate-pulse-shadow { animation: pulse-shadow 2s ease-in-out infinite; }
                .animate-pulse-icon:hover { animation: pulse-icon 0.5s ease-in-out forwards; } 


                /* Memory Game Styles */
                .perspective-container {
                    perspective: 1000px;
                }
                .tile {
                    width: 4rem; /* 64px */
                    height: 4rem; /* 64px */
                    position: relative;
                    transform-style: preserve-3d;
                    transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
                    cursor: pointer;
                }
                .tile.is-flipped {
                    transform: rotateY(180deg);
                }
                .tile-face {
                    position: absolute;
                    width: 100%;
                    height: 100%;
                    backface-visibility: hidden;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 0.75rem; /* rounded-xl */
                    border: 1px solid rgba(251, 191, 36, 0.2);
                }
                .tile-front {
                    background: rgba(42, 53, 71, 0.5);
                }
                .tile-back {
                    background: rgba(74, 85, 104, 0.3);
                    transform: rotateY(180deg);
                }

                /* Celebration Animation */
                @keyframes confetti {
                    0% { opacity: 1; transform: translateY(-10vh) rotate(0deg) scale(1); }
                    100% { opacity: 0; transform: translateY(100vh) rotate(720deg) scale(0.5); } 
                }
                .animate-confetti {
                    animation: confetti 2s ease-out forwards;
                }
            `}</style>

            {/* Dedicated background div with inline style based on mouse position state */}
            <div 
                className="fixed inset-0"
                style={{
                    zIndex: -1, // Ensure it's behind content but above html/body base color
                    backgroundColor: '#0A0D14', // Base dark color for this div
                    // Layered gradients for a richer, glowing effect
                    backgroundImage: `
                        radial-gradient(1200px at ${mousePosition.x} ${mousePosition.y}, rgba(251, 191, 36, 0.1) 0%, transparent 80%), /* Main glow, less intense, larger */
                        radial-gradient(800px at ${mousePosition.x} ${mousePosition.y}, rgba(251, 191, 36, 0.05) 0%, transparent 60%), /* Inner, softer glow */
                        radial-gradient(circle at 10% 90%, rgba(139, 92, 246, 0.05) 0%, transparent 50%), /* Fixed purple accent */
                        radial-gradient(circle at 90% 10%, rgba(59, 130, 246, 0.05) 0%, transparent 50%) /* Fixed blue accent */
                    `,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center center',
                    backgroundRepeat: 'no-repeat',
                    backgroundAttachment: 'fixed', // Keep this background fixed even if content scrolls
                    transition: 'background-image 0.05s ease-out', // Smoother transition
                }}
            ></div>

            {/* Main content wrapper, ensure it has a z-index higher than the background div */}
            {/* The existing 'relative z-10' on this div should be sufficient to layer above the background div. */}
            <div className="relative z-10 flex justify-center items-start p-4 md:p-8 animate-fade-in-slow min-h-screen">
                <div className="w-full max-w-6xl space-y-8">
                    <div className="text-center">
                        <h1 className="text-5xl md:text-6xl font-bold text-amber-300 tracking-tight animate-pulse-shadow">
                            Profile
                        </h1>
                        <p className="mt-4 text-lg text-gray-300">
                            Your personal information and account status.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                        {/* Main Profile Card (Left Side) */}
                        <div className="lg:col-span-3 flex flex-col gap-8">
                            <div className="p-8 bg-gray-800/40 border border-gray-700/50 rounded-2xl shadow-2xl backdrop-blur-md card-hover-effect animate-slide-up">
                                <div className="flex flex-col items-center space-y-6">
                                    <div
                                        className="relative group cursor-pointer"
                                        onClick={() => fileInputRef.current.click()}
                                    >
                                        <img
                                            src={selectedImage || authUser?.profilePicture || defaultAvatar}
                                            alt="Profile"
                                            className={`w-32 h-32 rounded-full object-cover border-4 border-gray-600/50 transition-all duration-300 ${isUpdatingProfile ? 'opacity-50 animate-pulse' : 'group-hover:opacity-70 group-hover:border-amber-400/50'}`}
                                        />
                                        <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center profile-pic-overlay">
                                            {isUpdatingProfile ? (
                                                <Loader className="animate-spin text-amber-400" />
                                            ) : (
                                                <Camera className="size-8 text-white/80" />
                                            )}
                                        </div>
                                    </div>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        ref={fileInputRef}
                                        className="hidden"
                                        onChange={handleImageUpload}
                                        disabled={isUpdatingProfile}
                                    />
                                    <div className="text-center space-y-2">
                                        <p className="text-sm text-gray-500">Click the camera icon to update your photo</p>
                                        {error && <p className="text-sm text-red-400">{error}</p>}
                                    </div>
                                </div>

                                <div className="mt-8 space-y-4">
                                    <div className="flex items-center gap-4 p-4 bg-gray-700/30 rounded-lg">
                                        <User className="size-5 text-amber-400 animate-pulse-icon" />
                                        <input
                                            type="text"
                                            value={authUser?.fullName || 'N/A'}
                                            readOnly
                                            className="w-full bg-transparent text-gray-300 focus:outline-none"
                                        />
                                    </div>
                                    <div className="flex items-center gap-4 p-4 bg-gray-700/30 rounded-lg">
                                        <Mail className="size-5 text-amber-400 animate-pulse-icon" />
                                        <input
                                            type="email"
                                            value={authUser?.email || 'N/A'}
                                            readOnly
                                            className="w-full bg-transparent text-gray-300 focus:outline-none"
                                        />
                                    </div>
                                </div>

                                <div className="mt-8 pt-6 border-t border-gray-700/50">
                                    <h2 className="text-lg font-semibold text-amber-200 mb-4">Account Information</h2>
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-gray-400 flex items-center gap-2"><CalendarDays size={16} className="animate-pulse-icon" /> Member Since</span>
                                            <span className="font-medium text-gray-200">{memberSince}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-gray-400 flex items-center gap-2"><ShieldCheck size={16} className="animate-pulse-icon" /> Account Status</span>
                                            <span className="font-medium text-green-400 bg-green-900/50 px-2 py-1 rounded-full">Active</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            {/* Action Buttons */}
                            <div className="flex items-center gap-4 animate-slide-up" style={{ animationDelay: '0.2s' }}>
                                <Link to="/home" className="flex-1 text-center p-3 font-semibold text-amber-300 bg-gray-700/50 rounded-lg hover:bg-gray-700 hover:text-amber-200 transition-all flex items-center justify-center gap-2 transform hover:scale-105">
                                    <Home size={18} />
                                    <span>Home</span>
                                </Link>
                                <button onClick={logout} className="flex-1 text-center p-3 font-semibold text-red-400 bg-red-900/20 rounded-lg hover:bg-red-900/40 transition-all flex items-center justify-center gap-2 transform hover:scale-105">
                                    <LogOut size={18} />
                                    <span>Logout</span>
                                </button>
                            </div>
                        </div>

                        {/* Game Section (Right Side) */}
                        <div className="lg:col-span-2 flex flex-col gap-8">
                            <MemoryMatrix /> 
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default ProfilePage;