import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';

const Notification = ({ 
  type = 'info', 
  title, 
  message, 
  isVisible = false, 
  onClose, 
  autoClose = true, 
  duration = 5000 
}) => {
  const [show, setShow] = useState(isVisible);

  useEffect(() => {
    setShow(isVisible);
  }, [isVisible]);

  useEffect(() => {
    if (show && autoClose) {
      const timer = setTimeout(() => {
        setShow(false);
        onClose && onClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [show, autoClose, duration, onClose]);

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      default:
        return <Info className="h-5 w-5 text-blue-500" />;
    }
  };

  const getStyles = () => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'error':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      default:
        return 'bg-blue-50 border-blue-200 text-blue-800';
    }
  };

  const handleClose = () => {
    setShow(false);
    onClose && onClose();
  };

  if (!show) return null;

  return (
    <div className={`fixed top-4 right-4 z-50 max-w-md w-full transform transition-all duration-300 ${
      show ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
    }`}>
      <div className={`border rounded-lg shadow-lg p-4 ${getStyles()}`}>
        <div className="flex items-start">
          <div className="flex-shrink-0">
            {getIcon()}
          </div>
          <div className="ml-3 flex-1">
            {title && (
              <h3 className="text-sm font-medium">
                {title}
              </h3>
            )}
            <p className={`text-sm ${title ? 'mt-1' : ''}`}>
              {message}
            </p>
          </div>
          <div className="ml-4 flex-shrink-0">
            <button
              onClick={handleClose}
              className="inline-flex text-gray-400 hover:text-gray-600 focus:outline-none"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Hook para usar notificações
export const useNotification = () => {
  const [notification, setNotification] = useState(null);

  const showNotification = (type, message, title, options = {}) => {
    setNotification({
      type,
      title,
      message,
      isVisible: true,
      ...options
    });
  };

  const hideNotification = () => {
    setNotification(prev => prev ? { ...prev, isVisible: false } : null);
  };

  const NotificationComponent = notification ? (
    <Notification
      {...notification}
      onClose={hideNotification}
    />
  ) : null;

  return {
    showSuccess: (message, title, options) => showNotification('success', message, title, options),
    showError: (message, title, options) => showNotification('error', message, title, options),
    showWarning: (message, title, options) => showNotification('warning', message, title, options),
    showInfo: (message, title, options) => showNotification('info', message, title, options),
    hideNotification,
    NotificationComponent
  };
};

export default Notification;
