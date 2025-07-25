import React from 'react';
import { useAuthStore } from '../store/useAuthStore.js';
import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useRef } from 'react';
import { axiosInstance } from '../lib/axios.js';
import { useState } from 'react';
import { MessageSquare, Eye, EyeOff, User, Mail, KeyRound, Users, Settings, Code, PenTool, Heart, Compass, Shield, AlertTriangle, CheckCircle } from 'lucide-react';


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

// New Cycling Icon Component
const CyclingIcon = () => {
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
    const resetTimer = () => {
        clearTimeout(timerRef.current);
        timerRef.current = setTimeout(nextIcon, 3000);
    };
    const handleClick = () => {
        nextIcon();
        resetTimer();
    };
    useEffect(() => {
        resetTimer();
        return () => clearTimeout(timerRef.current);
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
};

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


const SignUpPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  
  // ✅ **FIX 1: Changed 'username' to 'fullName' to match the backend**
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
  });
  
  const [errors, setErrors] = useState({ email: '', fullName: '', password: '' });
  const [successToast, setSuccessToast] = useState('');

  const { signup, isSigningUp } = useAuthStore();
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
  };

  const validateForm = () => {
    // ✅ **FIX 2: Validating 'fullName' instead of 'username'**
    const { fullName, email, password } = formData;
    const newErrors = { email: '', fullName: '', password: '' };
    let isValid = true;

    if (!email) {
        newErrors.email = "Email address is required.";
        isValid = false;
    }
    if (!fullName) {
        newErrors.fullName = "Full Name is required.";
        isValid = false;
    }
    if (!password) {
        newErrors.password = "Password is required.";
        isValid = false;
    } else if (password.length < 8) {
        newErrors.password = "Password must be at least 8 characters long.";
        isValid = false;
    }
    
    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    try {
      await signup(formData);
      setSuccessToast("Signup successful! Redirecting...");
      setTimeout(() => {
          navigate('/home');
      }, 2000);
    } catch (err) {
      const errorMessage = err.response?.data?.error || "Sign-up failed. Please try again.";
      setErrors(prev => ({...prev, password: errorMessage}));
      console.error("Signup error:", err);
    }
  };

  const ElegantAccountHeader = () => {
    return (
        <div className="relative z-10 flex flex-col items-center text-center px-8 animate-fade-in">
            <div className="mb-8 p-5 bg-gray-800/50 border border-amber-300/20 rounded-2xl shadow-lg backdrop-blur-sm transition-all duration-300 hover:border-amber-300/40 hover:scale-105">
              <CyclingIcon />
            </div>
            <h1 className="text-5xl font-bold text-amber-200 tracking-tight">
              Create Your Account
            </h1>
            <p className="mt-4 text-lg text-gray-400 max-w-sm">
              Join a community of creators and innovators. Your journey starts here- with Chat-App.
            </p>
            <div className="mt-12 w-24 h-px bg-gradient-to-r from-transparent via-amber-300/50 to-transparent" />
        </div>
    );
  };

  return (
    <>
      <style>{`
        /* ... All your existing styles remain the same ... */
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

      <div className="min-h-screen flex w-full text-gray-300">
        <div className="relative hidden lg:flex w-1/2 flex-col items-center justify-center bg-transparent">
          <ElegantAccountHeader />
        </div>
        <div className="w-full lg:w-1/2 flex flex-col items-center justify-center bg-transparent p-6">
          <div className="relative z-10 w-full max-w-md">
              <div className="group p-8 space-y-6 bg-gray-800/40 border border-gray-700/50 rounded-2xl shadow-2xl backdrop-blur-md transition-all duration-300 hover:border-amber-400/40 hover:shadow-amber-500/10 animate-form-slide-up">
                <div className="text-center">
                  <h2 className="text-3xl font-bold text-amber-300 animate-subtle-float">Get Started</h2>
                  <p className="mt-2 text-gray-400">Enter your details to sign up.</p>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <div className="relative group/input">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500 transition-colors duration-300 group-focus-within/input:text-amber-300" />
                      <input id="email" name="email" type="email" onChange={handleInputChange} value={formData.email} className={`w-full pl-10 pr-3 py-3 bg-gray-800/60 border rounded-lg focus:outline-none focus:ring-1 focus:shadow-[0_0_15px_rgba(252,211,77,0.1)] hover:border-gray-600 transition-all ${errors.email ? 'border-red-500/50 focus:ring-red-500/80 focus:border-red-500' : 'border-gray-700 focus:ring-amber-400/80 focus:border-amber-400'}`} placeholder="you@example.com" />
                    </div>
                    <InputError message={errors.email} />
                  </div>
                  <div>
                    <div className="relative group/input">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500 transition-colors duration-300 group-focus-within/input:text-amber-300" />
                      {/* ✅ **FIX 3: Changed name and value to 'fullName'** */}
                      <input id="fullName" name="fullName" type="text" onChange={handleInputChange} value={formData.fullName} className={`w-full pl-10 pr-3 py-3 bg-gray-800/60 border rounded-lg focus:outline-none focus:ring-1 focus:shadow-[0_0_15px_rgba(252,211,77,0.1)] hover:border-gray-600 transition-all ${errors.fullName ? 'border-red-500/50 focus:ring-red-500/80 focus:border-red-500' : 'border-gray-700 focus:ring-amber-400/80 focus:border-amber-400'}`} placeholder="e.g., Jane Doe" />
                    </div>
                    <InputError message={errors.fullName} />
                  </div>
                  <div>
                    <div className="relative group/input">
                      <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500 transition-colors duration-300 group-focus-within/input:text-amber-300" />
                      <input id="password" name="password" type={showPassword ? "text" : "password"} onChange={handleInputChange} value={formData.password} className={`w-full pl-10 pr-10 py-3 bg-gray-800/60 border rounded-lg focus:outline-none focus:ring-1 focus:shadow-[0_0_15px_rgba(252,211,77,0.1)] hover:border-gray-600 transition-all ${errors.password ? 'border-red-500/50 focus:ring-red-500/80 focus:border-red-500' : 'border-gray-700 focus:ring-amber-400/80 focus:border-amber-400'}`} placeholder="••••••••" />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-amber-300 transition-colors">
                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                    <InputError message={errors.password} />
                  </div>
                  <div>
                      <button type="submit" disabled={isSigningUp} className="w-full p-3 font-semibold text-gray-900 bg-amber-300 rounded-lg hover:bg-amber-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-amber-400 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 active:scale-100">
                        {isSigningUp ? "Creating Account..." : "Sign Up"}
                      </button>
                  </div>
                </form>
                <div className="text-center pt-4">
                  <p className="text-sm text-gray-400">
                    Already have an account?{' '}
                    <Link to="/login" className="font-semibold text-amber-300 hover:text-amber-200 hover:underline underline-offset-4 transition-colors">
                      Sign In
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

export default SignUpPage;
