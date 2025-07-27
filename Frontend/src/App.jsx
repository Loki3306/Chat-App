import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/useAuthStore.js';
import { Toast } from './components/toast.jsx';
import { Loader } from 'lucide-react';

// Import your pages and components
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import SignUpPage from './pages/SignUpPage';
import SettingsPage from './pages/SettingsPage';
import ProfilePage from './pages/ProfilePage';
import './index.css'; 
import {ThemeProvider} from './context/ThemeContext.jsx'; 

const App = () => {
  const { authUser, isCheckingAuth, checkAuth, toast, clearToast } = useAuthStore();
  const [isToastVisible, setIsToastVisible] = useState(false);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (toast.message) {
      setIsToastVisible(true);
      const timer = setTimeout(() => {
        setIsToastVisible(false);
        setTimeout(() => clearToast(), 500);
      }, 4000); // 4 seconds visible
      return () => clearTimeout(timer);
    }
  }, [toast, clearToast]);

  if (isCheckingAuth) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900">
        <Loader className="size-16 animate-spin text-amber-400" />
      </div>
    );
  }

  return (
    <ThemeProvider>
      {/* THIS IS THE MAIN CHANGE: Make this div a flex column that takes full screen height */}
      <div className="flex flex-col h-screen bg-gray-900"> {/* Changed min-h-screen to h-screen and added flex flex-col */}

        <Toast
          message={toast.message}
          type={toast.type}
          onDismiss={() => setIsToastVisible(false)}
          show={isToastVisible}
        />

        <Navbar /> {/* Navbar will take its natural height */}

        {/* This main area should now take all remaining vertical space */}
        {/* We also keep p-6 for overall padding around content, and add overflow-auto in case routes render very tall content */}
        <main className="flex-1 p-6 overflow-auto"> {/* flex-1 makes it grow, overflow-auto handles its own content overflow */}
          <Routes>
            <Route path='/' element={authUser ? <Navigate to='/home' /> : <Navigate to='/login' />} />
            <Route path="/home" element={authUser ? <HomePage /> : <Navigate to='/login' />} />
            <Route path="/profile" element={authUser ? <ProfilePage /> : <Navigate to='/login' />} />
            <Route path="/settings" element={authUser ? <SettingsPage /> : <Navigate to='/login' />} />
            <Route path="/signup" element={!authUser ? <SignUpPage /> : <Navigate to='/home' />} />
            <Route path="/login" element={!authUser ? <LoginPage /> : <Navigate to='/home' />} />
            <Route path="*" element={<Navigate to={authUser ? '/home' : '/login'} />} />
          </Routes>
        </main>
      </div>
    </ThemeProvider>
  );
};

export default App;