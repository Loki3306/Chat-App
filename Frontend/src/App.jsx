import React from 'react';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import SignUpPage from './pages/SignUpPage';
import SettingsPage from './pages/SettingsPage';
import ProfilePage from './pages/ProfilePage';

import { Routes, Route, Navigate } from 'react-router-dom';

import { useAuthStore } from './store/useAuthStore.js';
import { useEffect } from 'react';

import {Loader} from 'lucide-react'

const App = () => {
  const { authUser, checkAuth, isCheckingAuth } = useAuthStore();

  useEffect(() => {
    checkAuth()
  }, [checkAuth]);

  if (isCheckingAuth && !authUser) 
    return (
      <div className="flex items-center justify-center h-screen">
        <span className="loading loading-infinity loading-xl size-24"></span>
      </div>
    );
  


  return (
    <div>


      <Navbar />

      <Routes>
        <Route path="/home" element={authUser ?  <HomePage /> : <Navigate to='/login' /> } />
        <Route path="/signup" element={!authUser ? <SignUpPage /> : <Navigate to='/home' />} />
        <Route path="/login" element={!authUser ? <LoginPage /> : <Navigate to='/home' />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/profile" element={authUser ? <ProfilePage /> : <Navigate to='/login' />} />

      </Routes>


    </div>
  )
}

export default App
