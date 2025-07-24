import {create} from 'zustand';
import {axiosInstance} from '../lib/axios.js';


export const useAuthStore = create((set) => ({
    authUser:null,
    isLogingIn: false,
    isLoggingOut: false,
    isSigningUp:false,

    isCheckingAuth: true,

    checkAuth: async () => {
        try {
            const response= await axiosInstance.get('/auth/check');
            set({authUser: response.data});

        }catch (error) {
            console.error("Error checking authentication:", error); 
            set({authUser: null});
        }finally{
            set({isCheckingAuth: false});
        }
    },

    signup: async (data) => {
        set({isSigningUp: true});
        try {
            const response = await axiosInstance.post('/auth/signup', data);
            set({authUser: response.data});
        } catch (error) {
            console.error("Error signing up:", error);
        } finally {
            set({isSigningUp: false});
        }
    },
}));