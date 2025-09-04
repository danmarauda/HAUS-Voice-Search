import React, { useEffect, useState } from 'react';

interface ToastProps {
  message: string;
  type: 'success' | 'info';
  onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ message, type, onClose }) => {
    const [isExiting, setIsExiting] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsExiting(true);
            // Wait for fade-out animation to complete before calling onClose
            setTimeout(onClose, 300); 
        }, 3000); // 3 seconds visible

        return () => clearTimeout(timer);
    }, [onClose]);

    const styles = {
        success: 'bg-green-600/90 border-green-500/50 text-white',
        info: 'bg-neutral-800/90 border-white/20 text-neutral-200',
    };

    const animationClass = isExiting ? 'animate-fade-out' : 'animate-fade-in';

    return (
        <div 
            className={`px-4 py-2 rounded-lg backdrop-blur-sm border shadow-lg ${styles[type]} ${animationClass}`}
            style={{ animationDuration: '300ms' }}
        >
            <p className="text-sm font-medium font-geist">{message}</p>
        </div>
    );
};

export default Toast;
