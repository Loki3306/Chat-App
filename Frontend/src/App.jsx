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
      <div className="bg-gray-900 min-h-screen ">

        <Toast
          message={toast.message}
          type={toast.type}
          onDismiss={() => setIsToastVisible(false)}
          show={isToastVisible}
        />

        <Navbar />
        <main className="p-6">
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
