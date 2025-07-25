import { create } from 'zustand';
import { axiosInstance } from '../lib/axios.js';


export const useAuthStore = create((set) => ({
    authUser: null,
    isLogingIn: false,
    isLoggingOut: false,
    isSigningUp: false,
    isUpdatingProfile: false,
    isCheckingAuth: true,

    toast: { message: null, type: null },
    clearToast: () => set({ toast: { message: null, type: null } }),

    checkAuth: async () => {
        try {
            const response = await axiosInstance.get('/auth/check');
            set({ authUser: response.data.user });

        } catch (error) {
            console.error("Error checking authentication:", error);
            set({ authUser: null });
        } finally {
            set({ isCheckingAuth: false });
        }
    },

    signup: async (data) => {
        set({ isSigningUp: true });
        try {
            const response = await axiosInstance.post('/auth/signup', data);
            set({ authUser: response.data });
        } catch (error) {
            console.error("Error signing up:", error);
        } finally {
            set({ isSigningUp: false });
        }
    },
      login: async (data) => {
        set({ isLoggingIn: true });
        try {
            const response = await axiosInstance.post('/auth/login', data);
            set({ authUser: response.data.user }); // Make sure to set the user object
            return true; // Return true on success
        } catch (error) {
            const errorMessage = error.response?.data?.message || "Login failed.";
            set({ toast: { message: errorMessage, type: 'error' } });
            console.error("Error logging in:", error);
            return false; // Return false on failure
        } finally {
            set({ isLoggingIn: false });
        }
    },

    logout: async () => {
        set({ isLoggingOut: true });
        try {
            await axiosInstance.post('/auth/logout');
            set({
                authUser: null,
                toast: { message: "Logged out successfully", type: 'success' }
            });
        } catch (error) {
            console.error("Error logging out:", error);
            // Even if the server fails, log the user out on the client
            set({
                authUser: null,
                toast: { message: "Logout completed", type: 'success' }
            });
        } finally {
            set({ isLoggingOut: false });
        }
    },

    updateProfile: async (data) => {
        set ({ isUpdatingProfile: true });
        try {
            const response = await axiosInstance.put('/auth/update-profile', data);
            set({ authUser: response.data.user, toast: { message: "Profile updated successfully", type: 'success' } });   
        } catch (error) {
            const errorMessage = error.response?.data?.message || "Failed to update profile.";
            set({ toast: { message: errorMessage, type: 'error' } });
            console.error("Error updating profile:", error);
        }finally {
            set({ isUpdatingProfile: false });
        }
    }
}));