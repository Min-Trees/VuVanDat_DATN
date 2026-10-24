import React, { createContext, useContext, useState, useCallback } from 'react';
import { IconCheck, IconAlertTriangle, IconAlertCircle, IconClose } from '../../icons';
import './Toast.css';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastItem {
  id: string;
  type: ToastType;
  message: string;
  durationMs?: number;
}

interface ToastContextType {
  addToast: (message: string, type?: ToastType, durationMs?: number) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback((message: string, type: ToastType = 'info', durationMs = 3500) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, type, message, durationMs }]);

    if (durationMs > 0) {
      setTimeout(() => {
        removeToast(id);
      }, durationMs);
    }
  }, [removeToast]);

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      <div className="vdbus-toast-container" aria-live="polite">
        {toasts.map((toast) => {
          let IconComponent = IconCheck;
          if (toast.type === 'error') IconComponent = IconAlertCircle;
          if (toast.type === 'warning') IconComponent = IconAlertTriangle;

          return (
            <div key={toast.id} className={`vdbus-toast vdbus-toast--${toast.type}`} role="alert">
              <span className="vdbus-toast__icon">
                <IconComponent size={16} />
              </span>
              <span className="vdbus-toast__message">{toast.message}</span>
              <button
                className="vdbus-toast__close"
                onClick={() => removeToast(toast.id)}
                aria-label="Đóng thông báo"
              >
                <IconClose size={14} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = (): ToastContextType => {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return ctx;
};
