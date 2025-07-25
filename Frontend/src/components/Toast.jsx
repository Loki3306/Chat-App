import React from 'react';
import { AlertTriangle, CheckCircle } from 'lucide-react';

export const Toast = ({ message, type, onDismiss, show }) => {
    if (!message) return null;

    const isError = type === 'error';
    const bgColor = isError ? 'bg-red-900/60' : 'bg-green-900/60';
    const borderColor = isError ? 'border-red-500/50' : 'border-green-500/50';
    const iconColor = isError ? 'text-red-400' : 'text-green-400';
    const textColor = isError ? 'text-red-300' : 'text-green-300';
    const Icon = isError ? AlertTriangle : CheckCircle;

    return (
        <div className={`fixed bottom-5 left-1/2 -translate-x-1/2 z-50 ${show ? 'animate-toast-in' : 'animate-toast-out'}`}>
            <div 
                className={`flex items-center gap-4 p-4 rounded-xl shadow-2xl backdrop-blur-lg ${bgColor} ${borderColor} border`}
                onClick={onDismiss}
            >
                <Icon className={`size-6 ${iconColor}`} />
                <p className={`font-medium ${textColor}`}>{message}</p>
            </div>
        </div>
    );
};
