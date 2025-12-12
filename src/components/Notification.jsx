import React, { useState, useEffect } from 'react';
import { CheckCircle, AlertTriangle, Info, X } from 'lucide-react';

const Notification = ({ message, type = 'info', duration = 5000, onClose }) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsExiting(true);
      setTimeout(() => {
        setIsVisible(false);
        if (onClose) onClose();
      }, 300); // Match this with the CSS transition duration
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  if (!isVisible) return null;

  // Determine notification styles based on type
  const getNotificationStyles = () => {
    switch (type) {
      case 'success':
        return {
          icon: <CheckCircle className="h-5 w-5 text-green-400" />,
          bgColor: 'bg-green-900/30',
          borderColor: 'border-green-500/20',
          textColor: 'text-green-400'
        };
      case 'error':
        return {
          icon: <AlertTriangle className="h-5 w-5 text-red-400" />,
          bgColor: 'bg-red-900/30',
          borderColor: 'border-red-500/20',
          textColor: 'text-red-400'
        };
      case 'warning':
        return {
          icon: <AlertTriangle className="h-5 w-5 text-yellow-400" />,
          bgColor: 'bg-yellow-900/30',
          borderColor: 'border-yellow-500/20',
          textColor: 'text-yellow-400'
        };
      case 'info':
      default:
        return {
          icon: <Info className="h-5 w-5 text-blue-400" />,
          bgColor: 'bg-blue-900/30',
          borderColor: 'border-blue-500/20',
          textColor: 'text-blue-400'
        };
    }
  };

  const styles = getNotificationStyles();

  return (
    <div role="status" aria-live="polite" className={`w-80 ${isExiting ? 'translate-x-full opacity-0' : 'translate-x-0 opacity-100'} transition-all duration-300`}>
      <div className={`${styles.bgColor} ${styles.borderColor} p-4 rounded-lg shadow-lg border flex items-start gap-3`}>
        <div className="flex-shrink-0">
          {styles.icon}
        </div>
        <div className="flex-1">
          <p className={`${styles.textColor} text-sm font-medium`}>{message}</p>
        </div>
        <button
          onClick={() => {
            setIsExiting(true);
            setTimeout(() => {
              setIsVisible(false);
              if (onClose) onClose();
            }, 300);
          }}
          className={`${styles.textColor} hover:text-white transition-colors`}
          aria-label="Close notification"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

// Notification provider to manage multiple notifications
const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  const addNotification = (message, type = 'info', duration = 5000) => {
    const id = Date.now();
    // Prepend new notifications so they appear at the top and push older ones down
    setNotifications(prev => [{ id, message, type, duration }, ...prev]);
    
    // Auto-remove after duration + exit animation
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, duration + 300);
  };

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  return (
    <NotificationContext.Provider value={{ addNotification }}>
      {children}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 items-end">
        {notifications.map(notification => (
          <Notification
            key={notification.id}
            message={notification.message}
            type={notification.type}
            duration={notification.duration}
            onClose={() => removeNotification(notification.id)}
          />
        ))}
      </div>
    </NotificationContext.Provider>
  );
};

// Create context for notifications
const NotificationContext = React.createContext();

// Custom hook for using notifications
const useNotification = () => {
  const context = React.useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

export { NotificationProvider, useNotification, Notification };