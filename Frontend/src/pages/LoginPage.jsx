import React from 'react';
import { useAuthStore } from '../store/useAuthStore.js';
import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useRef } from 'react';
import { axiosInstance } from '../lib/axios.js';
import { useState } from 'react';
import { MessageSquare, Eye, EyeOff, User, Mail, KeyRound, Users, Settings, Code, PenTool, Heart, Compass, Shield, AlertTriangle, CheckCircle } from 'lucide-react';

// --- Reusable Components (These can be moved to their own files) ---

const SuccessToast = ({ message, onDismiss }) => {
    if (!message) return null;
    return (
        <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50 animate-toast-in">
            <div
                className="flex items-center gap-4 p-4 rounded-xl shadow-2xl bg-green-900/60 border border-green-500/50 backdrop-blur-lg"
                onClick={onDismiss}
            >
                <CheckCircle className="size-6 text-green-400" />
                <p className="font-medium text-green-300">{message}</p>
            </div>
        </div>
    );
};

const InputError = ({ message }) => {
    if (!message) return null;
    return (
        <div className="flex items-center gap-2 mt-2 text-red-400 animate-fade-in-fast">
            <AlertTriangle size={16} />
            <p className="text-xs font-medium">{message}</p>
        </div>
    );
};

// Fixed CyclingIcon Component
const CyclingIcon = React.memo(() => {
    const icons = [
        <MessageSquare key="msg" className="size-10 text-amber-300" />,
        <Users key="users" className="size-10 text-amber-300" />,
        <Heart key="heart" className="size-10 text-amber-300" />,
        <Compass key="compass" className="size-10 text-amber-300" />,
        <Code key="code" className="size-10 text-amber-300" />,
        <Shield key="shield" className="size-10 text-amber-300" />,
        <PenTool key="pen" className="size-10 text-amber-300" />,
        <Settings key="settings" className="size-10 text-amber-300" />,
    ];
    const [currentIndex, setCurrentIndex] = useState(0);
    const timerRef = useRef(null);

    const nextIcon = () => {
        setCurrentIndex(prevIndex => (prevIndex + 1) % icons.length);
    };

    const startTimer = () => {
        clearTimeout(timerRef.current);
        timerRef.current = setTimeout(nextIcon, 3000);
    };

    const handleClick = () => {
        nextIcon();
        startTimer(); // Restart timer after manual click
    };

    // Only start the timer once on mount
    useEffect(() => {
        startTimer();
        return () => clearTimeout(timerRef.current);
    }, []); // Empty dependency array - only run once on mount

    // Start new timer after each automatic transition
    useEffect(() => {
        if (currentIndex > 0) { // Skip the initial render
            startTimer();
        }
    }, [currentIndex]);

    return (
        <div onClick={handleClick} className="cursor-pointer group relative w-10 h-10 flex items-center justify-center">
            {icons.map((icon, index) => (
                <div key={index} className={`absolute transition-all duration-500 ${index === currentIndex ? 'opacity-100 transform scale-100 rotate-0' : 'opacity-0 transform scale-75 -rotate-12'}`}>
                    {icon}
                </div>
            ))}
        </div>
    );
});

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

// Fixed ElegantLoginHeader Component
const ElegantLoginHeader = React.memo(() => {
    return (
        <div className="relative z-10 flex flex-col items-center text-center px-8 animate-fade-in">
            <div className="mb-8 p-5 bg-gray-800/50 border border-amber-300/20 rounded-2xl shadow-lg backdrop-blur-sm transition-all duration-300 hover:border-amber-300/40 hover:scale-105">
                <CyclingIcon />
            </div>
            <h1 className="text-5xl font-bold text-amber-200 tracking-tight">
                Welcome Back
            </h1>
            <p className="mt-4 text-lg text-gray-400 max-w-sm">
                Sign in to continue your journey with Chat-App.
            </p>
            <div className="mt-12 w-24 h-px bg-gradient-to-r from-transparent via-amber-300/50 to-transparent" />
        </div>
    );
});


const LoginPage = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [errors, setErrors] = useState({ email: '', password: '' });
    const [loginError, setLoginError] = useState('');
    const [successToast, setSuccessToast] = useState('');

    const { login, isLoggingIn } = useAuthStore();
    const navigate = useNavigate();

    useEffect(() => {
        if (successToast) {
            const timer = setTimeout(() => {
                setSuccessToast('');
            }, 4000);
            return () => clearTimeout(timer);
        }
    }, [successToast]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
        if (loginError) {
            setLoginError('');
        }
    };

    const validateForm = () => {
        const { email, password } = formData;
        const newErrors = { email: '', password: '' };
        let isValid = true;

        if (!email) {
            newErrors.email = "Email address is required.";
            isValid = false;
        }
        if (!password) {
            newErrors.password = "Password is required.";
            isValid = false;
        }

        setErrors(newErrors);
        return isValid;
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        const success = await login(formData);

        if (success) {
            setSuccessToast("Login successful! Redirecting...");
            setTimeout(() => {
                navigate('/home');
            }, 2000);
        }
    };

    return (
        <>
            <style>{`
                /* Reset any global input styles that might interfere */
                input[type="email"], input[type="text"], input[type="password"] {
                  text-indent: 0 !important;
                }
                button:focus {
                  outline: none !important;
                  box-shadow: none !important;
                }


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
        @keyframes fade-in { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in { animation: fade-in 1s ease-out forwards; }
        @keyframes fade-in-fast { from { opacity: 0; } to { opacity: 1; } }
        .animate-fade-in-fast { animation: fade-in-fast 0.3s ease-out forwards; }
        @keyframes form-slide-up { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .animate-form-slide-up { animation: form-slide-up 0.7s ease-out forwards; }
        @keyframes subtle-float { 0% { transform: translateY(0px) scale(1); } 50% { transform: translateY(-4px) scale(1.02); } 100% { transform: translateY(0px) scale(1); } }
        .animate-subtle-float { animation: subtle-float 6s ease-in-out infinite; }
        .global-glow-effect { content: ''; position: fixed; inset: 0; pointer-events: none; background: radial-gradient( 600px circle at var(--mouse-x, -1000px) var(--mouse-y, -1000px), rgba(252, 211, 77,.08), transparent 70% ); z-index: 0; transition: background .2s ease-out; }
        @keyframes toast-in { from { opacity: 0; transform: translate(-50%, 20px) scale(.9); } to { opacity: 1; transform: translate(-50%, 0) scale(1); } }
        .animate-toast-in { animation: toast-in .5s cubic-bezier(.21, 1.02, .73, 1) forwards; }
            `}</style>

            <GlobalGlowEffect />
            <SuccessToast message={successToast} onDismiss={() => setSuccessToast('')} />

            <div className="min-h-screen flex w-full text-gray-300 main-background">
                <div className="relative hidden lg:flex w-1/2 flex-col items-center justify-center bg-transparent">
                    <ElegantLoginHeader />
                </div>
                <div className="w-full lg:w-1/2 flex flex-col items-center justify-center bg-transparent p-6">
                    <div className="relative z-10 w-full max-w-md">
                        <div className="group p-8 space-y-6 bg-gray-800/40 border border-gray-700/50 rounded-2xl shadow-2xl backdrop-blur-md transition-all duration-300 hover:border-amber-400/40 hover:shadow-amber-500/10 animate-form-slide-up">
                            <div className="text-center">
                                <h2 className="text-3xl font-bold text-amber-300 animate-subtle-float">Sign In</h2>
                                <p className="mt-2 text-gray-400">Enter your credentials to continue.</p>
                            </div>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <div className="relative group/input">
                                        <div className="absolute left-3 top-1/2 -translate-y-1/2 z-10 pointer-events-none">
                                            <Mail className="h-4 w-4 text-gray-500 transition-colors duration-300 group-focus-within/input:text-amber-300" />
                                        </div>
                                        <input
                                            id="email"
                                            name="email"
                                            type="email"
                                            onChange={handleInputChange}
                                            value={formData.email}
                                            className={`w-full py-3 bg-gray-800/60 border rounded-lg focus:outline-none focus:ring-1 focus:shadow-[0_0_15px_rgba(252,211,77,0.1)] hover:border-gray-600 transition-all ${errors.email ? 'border-red-500/50 focus:ring-red-500/80 focus:border-red-500' : 'border-gray-700 focus:ring-amber-400/80 focus:border-amber-400'}`}
                                            placeholder="you@example.com"
                                            style={{ paddingLeft: '2.75rem', paddingRight: '0.75rem', textIndent: '0' }}
                                        />
                                    </div>
                                    <InputError message={errors.email} />
                                </div>

                                <div>
                                    <div className="relative group/input">
                                        <div className="absolute left-3 top-1/2 -translate-y-1/2 z-10 pointer-events-none">
                                            <KeyRound className="h-4 w-4 text-gray-500 transition-colors duration-300 group-focus-within/input:text-amber-300" />
                                        </div>
                                        <input
                                            id="password"
                                            name="password"
                                            type={showPassword ? "text" : "password"}
                                            onChange={handleInputChange}
                                            value={formData.password}
                                            className={`w-full py-3 bg-gray-800/60 border rounded-lg focus:outline-none focus:ring-1 focus:shadow-[0_0_15px_rgba(252,211,77,0.1)] hover:border-gray-600 transition-all ${errors.password || loginError ? 'border-red-500/50 focus:ring-red-500/80 focus:border-red-500' : 'border-gray-700 focus:ring-amber-400/80 focus:border-amber-400'}`}
                                            placeholder="••••••••"
                                            style={{ paddingLeft: '2.75rem', paddingRight: '3rem', textIndent: '0' }}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-amber-300 transition-colors"
                                            style={{ outline: 'none', border: 'none', background: 'transparent' }}
                                        >
                                            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                        </button>
                                    </div>
                                    <InputError message={errors.password} />
                                </div>
                                <div>
                                    <button type="submit" disabled={isLoggingIn} className="w-full p-3 font-semibold text-gray-900 bg-amber-300 rounded-lg hover:bg-amber-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-amber-400 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 active:scale-100">
                                        {isLoggingIn ? "Signing In..." : "Sign In"}
                                    </button>
                                </div>
                                <InputError message={loginError} />
                            </form>

                            <div className="text-center pt-4">
                                <p className="text-sm text-gray-400">
                                    Don't have an account?{' '}
                                    <Link to="/signup" className="font-semibold text-amber-300 hover:text-amber-200 hover:underline underline-offset-4 transition-colors">
                                        Sign Up
                                    </Link>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default LoginPage;